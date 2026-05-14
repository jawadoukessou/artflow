import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/dto/pagination.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: any) {
    const where: any = { companyId };
    if (query.assigneeId) where.assigneeId = query.assigneeId;
    if (query.status) where.status = query.status;
    if (query.customerId) where.customerId = query.customerId;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where, orderBy: { dueAt: 'asc' },
        include: {
          customer: { select: { id: true, name: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
        },
        skip: query.skip || 0, take: query.limit || 50,
      }),
      this.prisma.task.count({ where }),
    ]);
    return paginate(data, total, query);
  }

  async create(companyId: string, userId: string, dto: any) {
    return this.prisma.task.create({ data: { ...dto, companyId, createdById: userId } });
  }

  async update(companyId: string, id: string, dto: any) {
    return this.prisma.task.update({ where: { id }, data: dto });
  }
}
