import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { CreateCustomerDto, UpdateCustomerDto, CustomerFilterDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: CustomerFilterDto) {
    const where: any = { companyId, isActive: true };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { erpReference: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.country) where.country = query.country;
    if (query.status) where.status = query.status;
    if (query.segment) where.segment = query.segment;
    if (query.collectorId) where.collectorId = query.collectorId;
    if (query.riskLevel) {
      where.riskScores = { some: { level: query.riskLevel } };
    }

    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        include: {
          collector: { select: { id: true, firstName: true, lastName: true } },
          riskScores: { orderBy: { computedAt: 'desc' }, take: 1 },
          invoices: {
            where: { status: { in: ['OVERDUE', 'PARTIALLY_PAID', 'PENDING', 'DISPUTED', 'LEGAL'] } },
            select: { amountDue: true, status: true, dueDate: true },
          },
          _count: { select: { invoices: true, tasks: true, disputes: true } },
        },
        orderBy,
        skip: query.skip,
        take: query.limit || 20,
      }),
      this.prisma.customer.count({ where }),
    ]);

    // Compute live stats
    const enriched = data.map((c) => ({
      ...c,
      outstandingBalance: c.invoices.reduce((s: number, i: any) => s + Number(i.amountDue), 0),
      overdueBalance: c.invoices
        .filter((i: any) => ['OVERDUE', 'LEGAL'].includes(i.status))
        .reduce((s: number, i: any) => s + Number(i.amountDue), 0),
      latestRisk: c.riskScores[0] || null,
    }));

    return paginate(enriched, total, query);
  }

  async findOne(companyId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
      include: {
        contacts: { where: { isActive: true } },
        collector: { select: { id: true, firstName: true, lastName: true, email: true } },
        riskScores: { orderBy: { computedAt: 'desc' }, take: 5 },
        creditInsurance: true,
        invoices: {
          orderBy: { issueDate: 'desc' },
          take: 20,
          include: { payments: { select: { amount: true, paidAt: true } } },
        },
        payments: { orderBy: { paidAt: 'desc' }, take: 10 },
        disputes: { where: { status: { not: 'RESOLVED' } } },
        tasks: { where: { status: { not: 'COMPLETED' } }, include: { assignee: { select: { firstName: true, lastName: true } } }, take: 10 },
        communications: { orderBy: { createdAt: 'desc' }, take: 20 },
        _count: { select: { invoices: true, tasks: true, disputes: true, communications: true } },
      },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    // Compute DSO
    const paidInvoices = customer.invoices.filter((i) => i.status === 'PAID');
    const dso = paidInvoices.length > 0
      ? paidInvoices.reduce((sum, i) => {
          const days = Math.max(0, (new Date(i.paidAt || i.dueDate).getTime() - new Date(i.issueDate).getTime()) / 86400000);
          return sum + days;
        }, 0) / paidInvoices.length
      : 0;

    const allInvoices = customer.invoices;
    const outstandingBalance = allInvoices.filter(i => ['PENDING','OVERDUE','PARTIALLY_PAID','DISPUTED','LEGAL'].includes(i.status)).reduce((s, i) => s + Number(i.amountDue), 0);
    const overdueBalance = allInvoices.filter(i => ['OVERDUE','LEGAL'].includes(i.status)).reduce((s, i) => s + Number(i.amountDue), 0);
    const totalInvoiced = allInvoices.reduce((s, i) => s + Number(i.amount), 0);
    const totalPaid = allInvoices.reduce((s, i) => s + Number(i.amountPaid), 0);

    return {
      ...customer,
      stats: {
        dso: Math.round(dso),
        outstandingBalance,
        overdueBalance,
        totalInvoiced,
        totalPaid,
        creditUtilization: Number(customer.creditLimit) > 0 ? outstandingBalance / Number(customer.creditLimit) : 0,
      },
    };
  }

  async create(companyId: string, dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findFirst({ where: { companyId, code: dto.code } });
    if (existing) throw new ConflictException(`Customer code '${dto.code}' already exists`);

    return this.prisma.customer.create({
      data: { ...dto, companyId },
      include: { collector: true },
    });
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(companyId, id);
    return this.prisma.customer.update({
      where: { id },
      data: dto,
      include: { collector: true },
    });
  }

  async delete(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.customer.update({ where: { id }, data: { isActive: false } });
  }

  async getAging(companyId: string, customerId?: string) {
    const now = new Date();
    const where: any = { companyId, status: { in: ['PENDING', 'OVERDUE', 'PARTIALLY_PAID', 'DISPUTED', 'LEGAL'] } };
    if (customerId) where.customerId = customerId;

    const invoices = await this.prisma.invoice.findMany({ where, select: { amountDue: true, dueDate: true } });

    const buckets = { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, over90: 0 };
    for (const inv of invoices) {
      const days = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000);
      const amt = Number(inv.amountDue);
      if (days <= 0) buckets.current += amt;
      else if (days <= 30) buckets['1-30'] += amt;
      else if (days <= 60) buckets['31-60'] += amt;
      else if (days <= 90) buckets['61-90'] += amt;
      else buckets.over90 += amt;
    }
    return buckets;
  }
}
