import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.workflow.findMany({
      where: { companyId },
      include: { steps: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(companyId: string, dto: any) {
    const { steps, ...wf } = dto;
    return this.prisma.workflow.create({
      data: { ...wf, companyId, steps: steps ? { create: steps } : undefined },
      include: { steps: true },
    });
  }

  async toggle(id: string) {
    const wf = await this.prisma.workflow.findUnique({ where: { id } });
    return this.prisma.workflow.update({ where: { id }, data: { isActive: !wf?.isActive } });
  }
}
