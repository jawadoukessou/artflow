import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RiskService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: any) {
    return this.prisma.riskScore.findMany({
      where: { customer: { companyId } },
      orderBy: { score: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, country: true, creditLimit: true,
            collector: { select: { firstName: true, lastName: true } },
            invoices: { where: { status: { in: ['OVERDUE','LEGAL'] } }, select: { amountDue: true } },
          },
        },
      },
      take: query.limit || 50,
    });
  }

  async computeScore(customerId: string) {
    const invoices = await this.prisma.invoice.findMany({ where: { customerId } });
    const total = invoices.reduce((s,i) => s + Number(i.amount), 0);
    const overdue = invoices.filter(i => ['OVERDUE','LEGAL'].includes(i.status)).reduce((s,i) => s + Number(i.amountDue), 0);
    const overdueRatio = total > 0 ? overdue / total : 0;
    const score = Math.min(100, Math.round(overdueRatio * 100 + (overdue > 50000 ? 20 : 0)));
    const level = score >= 70 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';
    return this.prisma.riskScore.create({
      data: { customerId, score, level: level as any, overdueRatio, factors: { overdueRatio, total, overdue } },
    });
  }
}
