import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/dto/pagination.dto';

@Injectable()
export class DisputesService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: any) {
    const where: any = { companyId };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.dispute.findMany({
        where, orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          invoice: { select: { id: true, number: true } },
        },
        skip: query.skip || 0, take: query.limit || 20,
      }),
      this.prisma.dispute.count({ where }),
    ]);
    return paginate(data, total, query);
  }

  async create(companyId: string, dto: any) {
    const dispute = await this.prisma.dispute.create({ data: { ...dto, companyId } });
    // Flag the invoice as disputed
    if (dto.invoiceId) await this.prisma.invoice.update({ where: { id: dto.invoiceId }, data: { status: 'DISPUTED' } });
    return dispute;
  }

  async update(companyId: string, id: string, dto: any) {
    return this.prisma.dispute.update({ where: { id }, data: dto });
  }
}
