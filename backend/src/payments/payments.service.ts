import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/dto/pagination.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: any) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where: { companyId },
        include: {
          customer: { select: { id: true, name: true } },
          invoice: { select: { id: true, number: true } },
        },
        orderBy: { paidAt: 'desc' },
        skip: query.skip || 0, take: query.limit || 20,
      }),
      this.prisma.payment.count({ where: { companyId } }),
    ]);
    return paginate(data, total, query);
  }

  async create(companyId: string, dto: any) {
    const payment = await this.prisma.payment.create({ data: { ...dto, companyId } });
    if (dto.invoiceId && dto.amount) {
      const inv = await this.prisma.invoice.findUnique({ where: { id: dto.invoiceId } });
      if (inv) {
        const newPaid = Number(inv.amountPaid) + Number(dto.amount);
        const newDue = Math.max(0, Number(inv.amount) - newPaid);
        const status = newDue <= 0 ? 'PAID' : 'PARTIALLY_PAID';
        await this.prisma.invoice.update({ where: { id: dto.invoiceId }, data: { amountPaid: newPaid, amountDue: newDue, status: status as any, paidAt: newDue <= 0 ? new Date() : null } });
      }
    }
    return payment;
  }
}
