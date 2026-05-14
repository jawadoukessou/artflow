# ArFlow — Enterprise AR & Credit Management Platform

A production-ready B2B accounts receivable, collections, and credit management SaaS inspired by MyDSO Manager.

## Tech Stack
- **Frontend**: Next.js 15, TypeScript, TailwindCSS, React Query, Zustand, Recharts, Framer Motion
- **Backend**: NestJS, PostgreSQL, Prisma ORM, Redis, BullMQ, JWT Auth
- **Infrastructure**: Docker Compose, AWS S3 ready, Vercel/Railway deploy-ready

## Quick Start

### 1. Prerequisites
- Node.js 20+
- Docker & Docker Compose

### 2. Start infrastructure
```bash
docker-compose up -d postgres redis
```

### 3. Backend setup
```bash
cd backend
npm install
cp .env .env.local  # Edit DATABASE_URL etc
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### 4. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env.local  # Set NEXT_PUBLIC_API_URL
npm run dev
```

Open http://localhost:3000

## Default Login
- **Admin**: admin@acmecorp.com / ArFlow2026!
- **Collector**: s.martin@acmecorp.com / ArFlow2026!

## API Documentation
Swagger: http://localhost:3001/api/v1/docs

## Modules
| Module | Description |
|--------|-------------|
| Dashboard | KPIs, DSO charts, aging balance, activity feed |
| Customers | 360° profiles, risk scoring, collector assignment |
| Invoices | Open items, overdue tracking, bulk reminders |
| Payments | Receipt tracking, invoice matching |
| Agenda | Collection tasks, email/call scheduling |
| Scenarios | Automated escalation workflows |
| Disputes | Dispute management and resolution |
| Risk | Risk scoring A-E, credit limit monitoring |
| Analytics | DSO, aging, collector performance, cash forecasting |
| AI Insights | Late payment prediction, AI email generation |
| ERP | SAP, Oracle, Dynamics, Sage, Odoo, CSV connectors |
| Admin | Users, RBAC, settings, API keys |

## Docker Deploy
```bash
docker-compose up -d
```

## Environment Variables
See `backend/.env` and `frontend/.env.local.example`
