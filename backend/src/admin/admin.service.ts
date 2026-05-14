import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getRoles() { return this.prisma.role.findMany({ include: { permissions: true } }); }

  async getAuditLogs(companyId: string, query: any) {
    return this.prisma.auditLog.findMany({
      where: { companyId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: query.limit || 50,
    });
  }

  async getCompanyStats(companyId: string) {
    const [customers, invoices, users, tasks] = await this.prisma.$transaction([
      this.prisma.customer.count({ where: { companyId } }),
      this.prisma.invoice.count({ where: { companyId } }),
      this.prisma.user.count({ where: { companyId } }),
      this.prisma.task.count({ where: { companyId, status: { not: 'COMPLETED' } } }),
    ]);
    return { customers, invoices, users, openTasks: tasks };
  }
}
