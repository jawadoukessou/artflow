import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ErpService {
  constructor(private prisma: PrismaService) {}

  async getConnections(companyId: string) {
    return this.prisma.eRPConnection.findMany({ where: { companyId }, include: { syncLogs: { orderBy: { startedAt: 'desc' }, take: 1 } } });
  }

  async createConnection(companyId: string, dto: any) {
    return this.prisma.eRPConnection.create({ data: { ...dto, companyId } });
  }

  async syncNow(companyId: string, connectionId: string) {
    const conn = await this.prisma.eRPConnection.findFirst({ where: { id: connectionId, companyId } });
    if (!conn) throw new Error('Connection not found');
    const log = await this.prisma.syncLog.create({
      data: { companyId, erpConnectionId: connectionId, type: 'manual', status: 'RUNNING', startedAt: new Date() },
    });
    // Simulate sync
    await new Promise(r => setTimeout(r, 500));
    return this.prisma.syncLog.update({
      where: { id: log.id },
      data: { status: 'SUCCESS', recordsTotal: 50, recordsOk: 50, finishedAt: new Date(), durationMs: 500 },
    });
  }

  async getLogs(companyId: string, connectionId: string) {
    return this.prisma.syncLog.findMany({
      where: { companyId, erpConnectionId: connectionId },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }
}
