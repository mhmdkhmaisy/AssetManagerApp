# Settlement & Revenue Split Tracker

A full-stack web application for recording weekly income, tracking expenses, and automatically calculating three-party revenue splits based on date-dependent contract rules.

## Features

- **Weekly Settlement Tracking**: Record gross income, PayPal fees (manual or percentage-based), and expenses.
- **Automated Revenue Splits**: Automatically calculates shares for three parties (A, B, and C) based on the settlement date.
- **Expense Management**: Detailed expense tracking with descriptions, payee emails, and notes.
- **Export Reports**: Generate and download settlement reports in PDF and Excel formats.
- **Dashboard Overview**: Visual statistics and a searchable history of all settlements.

## Technical Architecture

### Frontend
- **React 18** with **TypeScript** and **Vite**.
- **Tailwind CSS** & **shadcn/ui** for a modern, responsive interface.
- **TanStack React Query** for efficient data fetching and state management.
- **Wouter** for lightweight client-side routing.

### Backend
- **Node.js** with **Express**.
- **Drizzle ORM** for type-safe database interactions.
- **better-sqlite3** for a fast, zero-configuration SQLite database.
- **jspdf** & **exceljs** for report generation.

### Shared Layer
- **Zod** schemas used for both frontend validation and backend API contracts.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database**:
   ```bash
   npm run db:push
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Split Calculation Rules

The application uses a cutoff date (**February 8, 2026**) to determine revenue distribution:

- **Before Cutoff**: Party A (30%), Party B (65%), Party C (5%).
- **After Cutoff**: Party A (33%), Party B (62%), Party C (5%).

Net income is calculated as: `Gross Income - PayPal Fees - Total Expenses`.

## Deployment

The application is optimized for Replit deployment. The build script bundles both the client and server into the `dist/` directory.
