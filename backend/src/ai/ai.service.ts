import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async getPredictions(companyId: string) {
    const customers = await this.prisma.customer.findMany({
      where: { companyId },
      include: {
        riskScores: {
          orderBy: { computedAt: 'desc' },
          take: 1,
        },
        invoices: {
          where: {
            status: {
              in: ['OVERDUE', 'PARTIALLY_PAID'],
            },
          },
        },
      },
      take: 20,
    });

    return customers
      .map((c) => ({
        customerId: c.id,
        name: c.name,
        outstanding: c.invoices.reduce(
          (s, i) => s + Number(i.amountDue),
          0,
        ),
        riskScore: c.riskScores[0]?.score || 0,
        riskLevel: c.riskScores[0]?.level || 'LOW',
        lateProbability: Math.min(
          95,
          (c.riskScores[0]?.score || 0) * 0.9 + Math.random() * 10,
        ),
        recommendation: this.getRecommendation(
          c.riskScores[0]?.level,
        ),
      }))
      .filter((p) => p.outstanding > 0)
      .sort((a, b) => b.lateProbability - a.lateProbability);
  }

  private getRecommendation(level?: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'Suspend credit, escalate legal immediately',
      HIGH: 'Schedule urgent call, request payment plan',
      MEDIUM: 'Send personalized email, monitor closely',
      LOW: 'Standard reminder, no immediate action needed',
    };

    return map[level || 'LOW'];
  }

  generateEmail(
    customerName: string,
    invoiceNumber: string,
    amount: number,
    daysOverdue: number,
  ): string {
    return `
Subject: Important: Invoice ${invoiceNumber} - Immediate Action Required

Dear ${customerName},

We are writing regarding invoice ${invoiceNumber} (€${amount.toLocaleString()}) which is now ${daysOverdue} days past due.

Despite our previous reminders, no payment has been received.

Please arrange full payment or contact us within 5 business days to avoid further escalation including potential credit suspension and legal proceedings.

Best regards,
Credit Management Team
`;
  }
}
