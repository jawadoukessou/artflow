import { PrismaClient, Plan, CustomerStatus, CustomerSegment, InvoiceStatus, RiskLevel, TaskType, TaskPriority, TaskStatus, PaymentMethod, PaymentStatus, ERPType, ConnStatus, CommunicationType, Direction, CommStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ArFlow database...');

  // ── Roles & Permissions ──────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Full system access',
      permissions: {
        create: [
          { action: 'manage', subject: 'all' },
        ],
      },
    },
  });

  const collectorRole = await prisma.role.upsert({
    where: { name: 'collector' },
    update: {},
    create: {
      name: 'collector',
      description: 'Collections team member',
      permissions: {
        create: [
          { action: 'read', subject: 'Customer' },
          { action: 'read', subject: 'Invoice' },
          { action: 'write', subject: 'Task' },
          { action: 'write', subject: 'Communication' },
        ],
      },
    },
  });

  const analystRole = await prisma.role.upsert({
    where: { name: 'analyst' },
    update: {},
    create: {
      name: 'analyst',
      description: 'Risk and analytics analyst',
      permissions: {
        create: [
          { action: 'read', subject: 'Customer' },
          { action: 'read', subject: 'Invoice' },
          { action: 'read', subject: 'Report' },
        ],
      },
    },
  });

  // ── Company ─────────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      domain: 'acmecorp.com',
      plan: Plan.ENTERPRISE,
      currency: 'EUR',
      timezone: 'Europe/Paris',
      country: 'FR',
      settings: {
        reminderDays: [7, 14, 30, 60],
        escalationDays: 90,
        aiEnabled: true,
        mfaRequired: false,
      },
    },
  });

  // ── Users ────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('ArFlow2026!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acmecorp.com' },
    update: {},
    create: {
      email: 'admin@acmecorp.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      companyId: company.id,
      roleId: adminRole.id,
    },
  });

  const sarahUser = await prisma.user.upsert({
    where: { email: 's.martin@acmecorp.com' },
    update: {},
    create: {
      email: 's.martin@acmecorp.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Martin',
      phone: '+33 1 23 45 67 89',
      companyId: company.id,
      roleId: collectorRole.id,
    },
  });

  const marcUser = await prisma.user.upsert({
    where: { email: 'm.dupont@acmecorp.com' },
    update: {},
    create: {
      email: 'm.dupont@acmecorp.com',
      password: hashedPassword,
      firstName: 'Marc',
      lastName: 'Dupont',
      companyId: company.id,
      roleId: collectorRole.id,
    },
  });

  const anneUser = await prisma.user.upsert({
    where: { email: 'a.noel@acmecorp.com' },
    update: {},
    create: {
      email: 'a.noel@acmecorp.com',
      password: hashedPassword,
      firstName: 'Anne',
      lastName: 'Noel',
      companyId: company.id,
      roleId: analystRole.id,
    },
  });

  // ── Customers ────────────────────────────────────────────────
  const customersData = [
    { code: 'OMG-001', name: 'Omega Group SAS', legalName: 'Omega Group SAS', country: 'FR', city: 'Paris', creditLimit: 500000, paymentTerms: 30, segment: CustomerSegment.KEY_ACCOUNT, status: CustomerStatus.ACTIVE, collectorId: sarahUser.id, erpRef: 'SAP-C004821', vatNumber: 'FR12345678901' },
    { code: 'VTX-044', name: 'Vertex Inc', legalName: 'Vertex Incorporated', country: 'DE', city: 'Berlin', creditLimit: 300000, paymentTerms: 45, segment: CustomerSegment.KEY_ACCOUNT, status: CustomerStatus.ACTIVE, collectorId: marcUser.id, erpRef: 'ORC-4421', vatNumber: 'DE987654321' },
    { code: 'KST-012', name: 'Kestrel Ltd', legalName: 'Kestrel Limited', country: 'GB', city: 'London', creditLimit: 750000, paymentTerms: 30, segment: CustomerSegment.KEY_ACCOUNT, status: CustomerStatus.ACTIVE, collectorId: anneUser.id, erpRef: 'SAP-C003812', vatNumber: 'GB123456789' },
    { code: 'BLS-088', name: 'BlueStar Ltd', legalName: 'BlueStar Limited', country: 'ES', city: 'Madrid', creditLimit: 200000, paymentTerms: 30, segment: CustomerSegment.SMB, status: CustomerStatus.ACTIVE, collectorId: sarahUser.id, erpRef: 'SAP-C005012', vatNumber: 'ES12345678A' },
    { code: 'NXS-061', name: 'Nexus Corp', legalName: 'Nexus Corporation SA', country: 'IT', city: 'Milan', creditLimit: 400000, paymentTerms: 60, segment: CustomerSegment.SMB, status: CustomerStatus.ACTIVE, collectorId: marcUser.id, erpRef: 'DYN-3301', vatNumber: 'IT12345678901' },
    { code: 'APX-033', name: 'Apex Trading', legalName: 'Apex Trading SARL', country: 'FR', city: 'Lyon', creditLimit: 150000, paymentTerms: 30, segment: CustomerSegment.SMB, status: CustomerStatus.ACTIVE, collectorId: anneUser.id, erpRef: 'SAP-C004123', vatNumber: 'FR98765432109' },
    { code: 'SLR-099', name: 'Solaris SA', legalName: 'Solaris Société Anonyme', country: 'DE', city: 'Munich', creditLimit: 600000, paymentTerms: 30, segment: CustomerSegment.KEY_ACCOUNT, status: CustomerStatus.ACTIVE, collectorId: sarahUser.id, erpRef: 'SAP-C002901', vatNumber: 'DE123987456' },
    { code: 'TTN-007', name: 'Titan Pharma', legalName: 'Titan Pharmaceuticals Ltd', country: 'GB', city: 'Manchester', creditLimit: 1000000, paymentTerms: 45, segment: CustomerSegment.KEY_ACCOUNT, status: CustomerStatus.ACTIVE, collectorId: marcUser.id, erpRef: 'SAP-C001002', vatNumber: 'GB987654321' },
    { code: 'HLS-022', name: 'Helios SRL', legalName: 'Helios Società a Responsabilità Limitata', country: 'IT', city: 'Rome', creditLimit: 180000, paymentTerms: 30, segment: CustomerSegment.SMB, status: CustomerStatus.ACTIVE, collectorId: anneUser.id, erpRef: 'SAP-C006001', vatNumber: 'IT98765432101' },
    { code: 'ORB-055', name: 'Orbital GmbH', legalName: 'Orbital Gesellschaft mbH', country: 'DE', city: 'Hamburg', creditLimit: 250000, paymentTerms: 30, segment: CustomerSegment.SMB, status: CustomerStatus.ACTIVE, collectorId: marcUser.id, erpRef: 'DYN-4421', vatNumber: 'DE456123789' },
  ];

  const customers: any[] = [];
  for (const c of customersData) {
    const existing = await prisma.customer.findFirst({ where: { companyId: company.id, code: c.code } });
    if (!existing) {
      const cust = await prisma.customer.create({
        data: {
          companyId: company.id,
          code: c.code,
          name: c.name,
          legalName: c.legalName,
          country: c.country,
          city: c.city,
          creditLimit: c.creditLimit,
          paymentTerms: c.paymentTerms,
          segment: c.segment,
          status: c.status,
          collectorId: c.collectorId,
          erpReference: c.erpRef,
          vatNumber: c.vatNumber,
          currency: 'EUR',
        },
      });
      customers.push(cust);

      // Contacts
      await prisma.contact.create({
        data: {
          customerId: cust.id,
          firstName: 'Jean',
          lastName: 'Durand',
          email: `finance@${c.name.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: '+33 1 00 00 00 00',
          role: 'Finance Director',
          isPrimary: true,
        },
      });
    } else {
      customers.push(existing);
    }
  }

  // ── Invoices ─────────────────────────────────────────────────
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);

  const invoicesData = [
    // Omega Group - critical
    { num: 'INV-2041', custIdx: 0, amount: 84200, paid: 0, status: InvoiceStatus.OVERDUE, issue: daysAgo(60), due: daysAgo(30), reminders: 3, erpRef: 'SAP-8821' },
    { num: 'INV-2028', custIdx: 0, amount: 160000, paid: 0, status: InvoiceStatus.PENDING, issue: daysAgo(37), due: daysFromNow(23), reminders: 0, erpRef: 'SAP-8790' },
    { num: 'INV-2010', custIdx: 0, amount: 72400, paid: 40000, status: InvoiceStatus.PARTIALLY_PAID, issue: daysAgo(52), due: daysAgo(22), reminders: 2, erpRef: 'SAP-8712' },
    { num: 'INV-1988', custIdx: 0, amount: 95000, paid: 95000, status: InvoiceStatus.PAID, issue: daysAgo(67), due: daysAgo(37), reminders: 0, erpRef: 'SAP-8634' },
    { num: 'INV-1942', custIdx: 0, amount: 40000, paid: 0, status: InvoiceStatus.LEGAL, issue: daysAgo(128), due: daysAgo(98), reminders: 8, erpRef: 'SAP-8612' },
    // Vertex Inc - high risk
    { num: 'INV-2038', custIdx: 1, amount: 62100, paid: 20000, status: InvoiceStatus.PARTIALLY_PAID, issue: daysAgo(55), due: daysAgo(25), reminders: 2, erpRef: 'ORC-4421' },
    { num: 'INV-2021', custIdx: 1, amount: 98000, paid: 0, status: InvoiceStatus.OVERDUE, issue: daysAgo(72), due: daysAgo(42), reminders: 3, erpRef: 'ORC-4389' },
    // Kestrel Ltd - good payer
    { num: 'INV-2033', custIdx: 2, amount: 12400, paid: 12400, status: InvoiceStatus.PAID, issue: daysAgo(38), due: daysAgo(8), reminders: 0, erpRef: 'SAP-8801' },
    { num: 'INV-2045', custIdx: 2, amount: 88000, paid: 0, status: InvoiceStatus.PENDING, issue: daysAgo(15), due: daysFromNow(15), reminders: 0, erpRef: 'SAP-8844' },
    // BlueStar - disputed
    { num: 'INV-2024', custIdx: 3, amount: 38000, paid: 0, status: InvoiceStatus.DISPUTED, issue: daysAgo(48), due: daysAgo(18), reminders: 1, erpRef: 'SAP-8745' },
    // Nexus - partial
    { num: 'INV-2029', custIdx: 4, amount: 22000, paid: 10000, status: InvoiceStatus.PARTIALLY_PAID, issue: daysAgo(54), due: daysFromNow(6), reminders: 1, erpRef: 'DYN-3301' },
    // Apex - disputed
    { num: 'INV-2018', custIdx: 5, amount: 7850, paid: 0, status: InvoiceStatus.DISPUTED, issue: daysAgo(78), due: daysAgo(48), reminders: 1, erpRef: 'SAP-8744' },
    // Solaris - paid
    { num: 'INV-2039', custIdx: 6, amount: 98000, paid: 98000, status: InvoiceStatus.PAID, issue: daysAgo(42), due: daysAgo(12), reminders: 0, erpRef: 'SAP-8822' },
    { num: 'INV-2048', custIdx: 6, amount: 145000, paid: 0, status: InvoiceStatus.PENDING, issue: daysAgo(5), due: daysFromNow(25), reminders: 0, erpRef: 'SAP-8851' },
    // Titan Pharma - good
    { num: 'INV-2040', custIdx: 7, amount: 220000, paid: 220000, status: InvoiceStatus.PAID, issue: daysAgo(50), due: daysAgo(5), reminders: 0, erpRef: 'SAP-8823' },
  ];

  const invoices: any[] = [];
  for (const inv of invoicesData) {
    const existing = await prisma.invoice.findFirst({ where: { companyId: company.id, number: inv.num } });
    if (!existing) {
      const created = await prisma.invoice.create({
        data: {
          companyId: company.id,
          customerId: customers[inv.custIdx]?.id,
          number: inv.num,
          erpReference: inv.erpRef,
          status: inv.status,
          amount: inv.amount,
          amountPaid: inv.paid,
          amountDue: inv.amount - inv.paid,
          issueDate: inv.issue,
          dueDate: inv.due,
          paidAt: inv.status === InvoiceStatus.PAID ? inv.due : null,
          reminderCount: inv.reminders,
          currency: 'EUR',
        },
      });
      invoices.push(created);
    } else {
      invoices.push(existing);
    }
  }

  // ── Risk Scores ──────────────────────────────────────────────
  const riskData = [
    { custIdx: 0, score: 87, level: RiskLevel.CRITICAL, dso: 78, delay: 45, overdueRatio: 0.42 },
    { custIdx: 1, score: 72, level: RiskLevel.HIGH, dso: 65, delay: 32, overdueRatio: 0.31 },
    { custIdx: 2, score: 18, level: RiskLevel.LOW, dso: 31, delay: 2, overdueRatio: 0 },
    { custIdx: 3, score: 68, level: RiskLevel.HIGH, dso: 58, delay: 28, overdueRatio: 0.26 },
    { custIdx: 4, score: 44, level: RiskLevel.MEDIUM, dso: 44, delay: 14, overdueRatio: 0.1 },
    { custIdx: 5, score: 41, level: RiskLevel.MEDIUM, dso: 38, delay: 8, overdueRatio: 0.05 },
    { custIdx: 6, score: 12, level: RiskLevel.LOW, dso: 28, delay: -3, overdueRatio: 0 },
    { custIdx: 7, score: 8, level: RiskLevel.LOW, dso: 22, delay: -8, overdueRatio: 0 },
    { custIdx: 8, score: 35, level: RiskLevel.MEDIUM, dso: 40, delay: 10, overdueRatio: 0.08 },
    { custIdx: 9, score: 29, level: RiskLevel.MEDIUM, dso: 36, delay: 6, overdueRatio: 0.04 },
  ];

  for (const r of riskData) {
    if (customers[r.custIdx]) {
      await prisma.riskScore.create({
        data: {
          customerId: customers[r.custIdx].id,
          score: r.score,
          level: r.level,
          dso: r.dso,
          avgPaymentDelay: r.delay,
          overdueRatio: r.overdueRatio,
          creditUtilization: Math.random() * 0.8,
          latePaymentFreq: r.overdueRatio,
          factors: {
            paymentHistory: r.score > 60 ? 'poor' : 'good',
            creditUtilization: 'medium',
            invoiceVolume: 'high',
          },
        },
      });
    }
  }

  // ── Tasks ────────────────────────────────────────────────────
  const tasksData = [
    { title: 'Call Omega Group — overdue €84,200', type: TaskType.CALL, priority: TaskPriority.CRITICAL, status: TaskStatus.PENDING, custIdx: 0, assignee: sarahUser.id, due: now },
    { title: 'Send final reminder — Vertex INV-2038', type: TaskType.EMAIL, priority: TaskPriority.HIGH, status: TaskStatus.PENDING, custIdx: 1, assignee: marcUser.id, due: now },
    { title: 'Review dispute — Apex Trading €7,850', type: TaskType.DISPUTE, priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, custIdx: 5, assignee: anneUser.id, due: daysFromNow(1) },
    { title: 'Export monthly KPI report', type: TaskType.REPORT, priority: TaskPriority.LOW, status: TaskStatus.PENDING, custIdx: null, assignee: sarahUser.id, due: daysFromNow(1) },
    { title: 'Negotiate payment plan — Nexus Corp', type: TaskType.MEETING, priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, custIdx: 4, assignee: marcUser.id, due: daysFromNow(3) },
    { title: 'Legal escalation review — Omega INV-1942', type: TaskType.LEGAL, priority: TaskPriority.CRITICAL, status: TaskStatus.IN_PROGRESS, custIdx: 0, assignee: adminUser.id, due: daysFromNow(2) },
    { title: 'Follow up Helios SRL promise to pay', type: TaskType.FOLLOW_UP, priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, custIdx: 8, assignee: anneUser.id, due: daysFromNow(5) },
  ];

  for (const t of tasksData) {
    await prisma.task.create({
      data: {
        companyId: company.id,
        title: t.title,
        type: t.type,
        priority: t.priority,
        status: t.status,
        customerId: t.custIdx !== null ? customers[t.custIdx]?.id : null,
        assigneeId: t.assignee,
        createdById: adminUser.id,
        dueAt: t.due,
      },
    });
  }

  // ── Workflows ─────────────────────────────────────────────────
  const escalationWf = await prisma.workflow.create({
    data: {
      companyId: company.id,
      name: 'Overdue Escalation Engine',
      description: 'Automatically escalate overdue invoices through reminder → collector → legal pipeline',
      trigger: 'invoice.overdue',
      isActive: true,
      execCount: 1240,
      conditions: [{ field: 'daysOverdue', operator: 'gte', value: 1 }],
      steps: {
        create: [
          { order: 1, type: 'send_email', delayDays: 7, config: { template: 'reminder_1', subject: 'Invoice payment reminder' } },
          { order: 2, type: 'send_email', delayDays: 14, config: { template: 'reminder_2', subject: 'Second payment reminder' } },
          { order: 3, type: 'assign_collector', delayDays: 14, config: { priority: 'high' } },
          { order: 4, type: 'send_sms', delayDays: 30, config: { template: 'sms_urgent' } },
          { order: 5, type: 'create_task', delayDays: 30, config: { type: 'CALL', priority: 'HIGH' } },
          { order: 6, type: 'send_email', delayDays: 45, config: { template: 'formal_notice', subject: 'Formal Notice of Overdue Payment' } },
          { order: 7, type: 'escalate', delayDays: 60, config: { level: 'management' } },
          { order: 8, type: 'escalate', delayDays: 90, config: { level: 'legal' } },
        ],
      },
    },
  });

  await prisma.workflow.create({
    data: {
      companyId: company.id,
      name: 'Payment Confirmation',
      description: 'Thank customer and update records on payment receipt',
      trigger: 'payment.received',
      isActive: true,
      execCount: 421,
      conditions: [],
      steps: {
        create: [
          { order: 1, type: 'send_email', delayDays: 0, config: { template: 'payment_thanks' } },
          { order: 2, type: 'update_risk_score', delayDays: 0, config: {} },
          { order: 3, type: 'close_tasks', delayDays: 0, config: {} },
        ],
      },
    },
  });

  await prisma.workflow.create({
    data: {
      companyId: company.id,
      name: 'High Risk Alert',
      description: 'Alert collectors when customer risk score exceeds threshold',
      trigger: 'risk.score_updated',
      isActive: true,
      execCount: 156,
      conditions: [{ field: 'score', operator: 'gte', value: 70 }],
      steps: {
        create: [
          { order: 1, type: 'notify_collector', delayDays: 0, config: { urgency: 'high' } },
          { order: 2, type: 'create_task', delayDays: 0, config: { type: 'FOLLOW_UP', priority: 'HIGH' } },
          { order: 3, type: 'reduce_credit_limit', delayDays: 1, config: { reduction: 0.2 } },
        ],
      },
    },
  });

  // ── ERP Connections ───────────────────────────────────────────
  await prisma.eRPConnection.create({
    data: {
      companyId: company.id,
      name: 'SAP S/4HANA Production',
      type: ERPType.SAP,
      status: ConnStatus.CONNECTED,
      apiEndpoint: 'https://sap.acmecorp.com/api/v1',
      syncSchedule: '0 */4 * * *', // every 4 hours
      isActive: true,
      fieldMapping: {
        invoice: { number: 'BELNR', amount: 'WRBTR', dueDate: 'ZFBDT', customerId: 'KUNNR' },
        customer: { code: 'KUNNR', name: 'NAME1', creditLimit: 'KLIMK' },
      },
    },
  });

  await prisma.eRPConnection.create({
    data: {
      companyId: company.id,
      name: 'Oracle ERP Cloud',
      type: ERPType.ORACLE,
      status: ConnStatus.ERROR,
      apiEndpoint: 'https://oracle.acmecorp.com/api',
      syncSchedule: '0 9 * * *',
      isActive: true,
      fieldMapping: {},
    },
  });

  await prisma.eRPConnection.create({
    data: {
      companyId: company.id,
      name: 'Microsoft Dynamics 365',
      type: ERPType.DYNAMICS,
      status: ConnStatus.CONNECTED,
      apiEndpoint: 'https://acmecorp.crm.dynamics.com/api',
      syncSchedule: '0 23 * * *',
      isActive: true,
      fieldMapping: {},
    },
  });

  // ── Sync Logs ─────────────────────────────────────────────────
  const erpConn = await prisma.eRPConnection.findFirst({ where: { companyId: company.id, type: ERPType.SAP } });
  if (erpConn) {
    await prisma.syncLog.createMany({
      data: [
        { companyId: company.id, erpConnectionId: erpConn.id, type: 'invoices', status: 'SUCCESS', recordsTotal: 248, recordsOk: 248, recordsFail: 0, durationMs: 4200, startedAt: new Date(now.getTime() - 2 * 3600000), finishedAt: new Date(now.getTime() - 2 * 3600000 + 4200) },
        { companyId: company.id, erpConnectionId: erpConn.id, type: 'payments', status: 'SUCCESS', recordsTotal: 32, recordsOk: 32, recordsFail: 0, durationMs: 1800, startedAt: new Date(now.getTime() - 6 * 3600000), finishedAt: new Date(now.getTime() - 6 * 3600000 + 1800) },
        { companyId: company.id, erpConnectionId: erpConn.id, type: 'customers', status: 'SUCCESS', recordsTotal: 14, recordsOk: 14, recordsFail: 0, durationMs: 900, startedAt: new Date(now.getTime() - 30 * 3600000), finishedAt: new Date(now.getTime() - 30 * 3600000 + 900) },
        { companyId: company.id, erpConnectionId: erpConn.id, type: 'invoices', status: 'FAILED', recordsTotal: 3, recordsOk: 0, recordsFail: 3, errors: [{ record: 'INV-2051', error: "Mapping error: field 'currency_code' missing" }], startedAt: new Date(now.getTime() - 10 * 3600000) },
      ],
    });
  }

  // ── Communications ────────────────────────────────────────────
  if (customers[0] && invoices[0]) {
    await prisma.communication.createMany({
      data: [
        { companyId: company.id, customerId: customers[0].id, invoiceId: invoices[0].id, userId: sarahUser.id, type: CommunicationType.EMAIL, direction: Direction.OUTBOUND, subject: 'Payment Reminder — INV-2041', body: 'Dear Mr. Durand, This is a reminder that invoice INV-2041...', status: CommStatus.OPENED, sentAt: daysAgo(30) },
        { companyId: company.id, customerId: customers[0].id, invoiceId: invoices[0].id, userId: sarahUser.id, type: CommunicationType.EMAIL, direction: Direction.OUTBOUND, subject: 'Second Reminder — INV-2041', body: 'Dear Mr. Durand, Despite our previous reminder...', status: CommStatus.DELIVERED, sentAt: daysAgo(16) },
        { companyId: company.id, customerId: customers[0].id, invoiceId: invoices[0].id, userId: sarahUser.id, type: CommunicationType.PHONE, direction: Direction.OUTBOUND, subject: 'Phone call — discussed payment plan', body: 'Called Mr. Durand. He promised payment by end of month.', status: CommStatus.SENT, sentAt: daysAgo(5) },
        { companyId: company.id, customerId: customers[0].id, invoiceId: invoices[0].id, type: CommunicationType.EMAIL, direction: Direction.INBOUND, subject: 'RE: Second Reminder — INV-2041', body: 'Thank you for your message. We are processing the payment.', status: CommStatus.DELIVERED, sentAt: daysAgo(15) },
      ],
    });
  }

  // ── Notifications ─────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { companyId: company.id, type: 'invoice.overdue', title: 'Invoice Overdue', message: 'Omega Group — INV-2041 is 45 days overdue (€84,200)', data: { customerId: customers[0]?.id }, isRead: false },
      { companyId: company.id, type: 'payment.received', title: 'Payment Received', message: 'Kestrel Ltd paid €12,400 — INV-2033', data: { customerId: customers[2]?.id }, isRead: false },
      { companyId: company.id, type: 'erp.sync', title: 'SAP Sync Completed', message: '248 invoices synced, 14 new customers', data: {}, isRead: false },
      { companyId: company.id, type: 'risk.alert', title: 'AI Risk Alert', message: 'Vertex Inc risk score increased to 72/100', data: { customerId: customers[1]?.id }, isRead: false },
    ],
  });

  // ── Disputes ──────────────────────────────────────────────────
  if (customers[3] && invoices[9]) {
    await prisma.dispute.create({
      data: {
        companyId: company.id,
        customerId: customers[3].id,
        invoiceId: invoices[9].id,
        reference: 'DIS-2024-041',
        type: 'QUALITY',
        status: 'IN_REVIEW',
        reason: 'Delivered goods do not match specification',
        description: 'Customer claims 40% of delivered batch does not meet agreed quality standards.',
        amount: 38000,
      },
    });
  }
  if (customers[5] && invoices[11]) {
    await prisma.dispute.create({
      data: {
        companyId: company.id,
        customerId: customers[5].id,
        invoiceId: invoices[11].id,
        reference: 'DIS-2024-042',
        type: 'AMOUNT',
        status: 'OPEN',
        reason: 'Incorrect invoice amount — pricing discrepancy',
        description: 'Customer claims agreed price was €6,800, not €7,850.',
        amount: 7850,
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin:     admin@acmecorp.com / ArFlow2026!');
  console.log('  Collector: s.martin@acmecorp.com / ArFlow2026!');
  console.log('  Collector: m.dupont@acmecorp.com / ArFlow2026!');
  console.log('  Analyst:   a.noel@acmecorp.com / ArFlow2026!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
