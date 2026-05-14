import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: any) {
    const where: any = { companyId };
    if (query.search) where.OR = [
      { number: { contains: query.search, mode: 'insensitive' } },
      { erpReference: { contains: query.search, mode: 'insensitive' } },
    ];
    if (query.status) where.status = query.status;
    if (query.customerId) where.customerId = query.customerId;

    const orderBy: any = {};
    orderBy[query.sortBy || 'dueDate'] = query.sortOrder || 'asc';

    const [data, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where, orderBy,
        include: { customer: { select: { id: true, name: true, code: true } } },
        skip: query.skip || 0,
        take: query.limit || 20,
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return paginate(data, total, query);
  }

  async findOne(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        payments: true,
        disputes: true,
        communications: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(companyId: string, dto: any) {
    return this.prisma.invoice.create({
      data: { ...dto, companyId, amountDue: dto.amount - (dto.amountPaid || 0) },
    });
  }

  async update(companyId: string, id: string, dto: any) {
    await this.findOne(companyId, id);
    return this.prisma.invoice.update({ where: { id }, data: dto });
  }

  async sendReminder(companyId: string, id: string) {
    const invoice = await this.findOne(companyId, id);
    await this.prisma.invoice.update({ where: { id }, data: { reminderCount: { increment: 1 }, lastReminderAt: new Date() } });
    await this.prisma.communication.create({
      data: {
        companyId, customerId: invoice.customerId, invoiceId: id,
        type: 'EMAIL', direction: 'OUTBOUND', status: 'SENT',
        subject: `Payment reminder — ${invoice.number}`,
        sentAt: new Date(),
      },
    });
    return { message: 'Reminder sent' };
  }
}
