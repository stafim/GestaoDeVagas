# Overview

VagasPro is a job management system built with React and Express, designed to streamline recruitment workflows for companies. It facilitates the management of job postings and applications, offers a comprehensive dashboard for tracking hiring metrics, and enables the analysis of recruitment performance through various reports and visualizations. The system includes robust role-based permission management, detailed job status tracking, admission data management, and integration capabilities with external HCM Senior databases.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React with TypeScript and Vite.
- **UI/Styling**: shadcn/ui (Radix UI), Tailwind CSS.
- **State Management**: TanStack Query.
- **Routing**: Wouter.
- **Forms**: React Hook Form with Zod validation.

## Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript (ES modules).
- **API Pattern**: RESTful API (JSON).
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM.

## Authentication & Authorization
- **Multi-Tenant Architecture**: Supports multiple client organizations with data isolation.
- **Super Admin Role**: Global access across all organizations.
- **Role-Based Permissions**: 8 predefined roles and 17 granular permissions, including user-specific menu access and job status permissions.
- **Organization Isolation**: Data access is restricted by `organizationId`.

## Data Layer
- **Pattern**: Repository pattern (IStorage interface).
- **Validation**: Zod schemas for API input.
- **Relationships**: Well-defined foreign key relationships.
- **Parametrization**: Configurable work scales, benefits, and job statuses.

## UI/UX
- **Design System**: Consistent component library using shadcn/ui.
- **Responsiveness**: Mobile-first design.
- **Charts & Visualization**: Recharts for dashboard analytics.
- **Sidebar Navigation**: Organized in two sections - "Cliente" (standard features) and "Administrador" (Organizations and Financial - super admin only).
- **Key Features**: Tabbed job details modal, enhanced employee search, comprehensive job status change tracking, client contract management, comprehensive PDF generation (admission dossier, candidate reports), unified Kanban board creation, and organized settings.
- **Client Dashboard Permissions**: Granular control over client access to various dashboard types (Tempo Real, Análises, Relatórios).
- **Real-Time Client Dashboard**: Dedicated client-specific dashboards with key metrics, status distribution, recent jobs, and Kanban visualization.

## Notifications System
- **Multi-Channel**: Email and WhatsApp notifications for job status changes.
- **Configurability**: Independent toggles for Email/WhatsApp per status, smart recipient logic.
- **Integrations Management**: User-friendly interface for configuring SMTP and WhatsApp API settings.

## Organization Management
- **Entity**: `Organization` with attributes like name, slug, CNPJ, contact, logo, plan type, and user limits.
- **Functionality**: CRUD operations, automated admin creation, active/inactive status, plan-based limits.

## Kanban Management
- **Unified Creation**: Create Kanban boards with multiple stages in one form.
- **Flexibility**: Per-job Kanban selection, with fallback to default.
- **Visuals**: Color-coded stages, deletion protection for boards in use.

## Sales Plan Management
- **Plans**: CRUD for managing subscription plans with configurable features.
- **Feature Toggles**: 12 system features that can be enabled/disabled per plan (Dashboard, Real-time, Jobs, Kanban, Companies, Clients, Users, Permissions, Job Closure, Advanced Reports, Integrations, Notifications).
- **Pricing**: Monthly and yearly pricing options.
- **Limits**: Configurable user and job limits per plan.
- **Access**: Super Admin only.

## Financial Management
- **Invoices**: CRUD for managing invoices with status tracking (pending, paid, overdue, cancelled).
- **Payment History**: Tracks payment records.
- **Billing**: Links invoices to specific organizations.
- **Access**: Super Admin only.

## Development Workflow
- **Build**: Separate client (Vite) and server (esbuild) builds.
- **Code Quality**: TypeScript strict mode, ESLint.

## Known Technical Issues & Solutions

### Role Job Status Permissions Query (Nov 2025)
- **Issue**: Drizzle ORM enum type handling causes empty results when querying `role_job_status_permissions` table despite data existing in database.
- **Solution**: Implemented direct SQL execution using `db.execute()` with raw SQL queries in `getRoleJobStatusPermissions()` method (`server/storage.ts`).
- **Technical Details**: ORM was unable to properly match enum values in WHERE clauses. Direct SQL with column aliasing (snake_case → camelCase) provides reliable results.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting.

## Authentication Services
- **Replit Auth**: OpenID Connect provider.

## UI & Styling Libraries
- **Radix UI**: Headless UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide Icons**: Icon library.
- **Font Awesome**: Additional icon library.
- **Google Fonts**: Inter font family.

## Development & Build Tools
- **Vite**: Frontend build tool.
- **TypeScript**: Type checking and compilation.
- **PostCSS**: CSS processing.
- **ESBuild**: Fast JavaScript bundler for server-side.

## Data Visualization
- **Recharts**: React charting library.

## Utility Libraries
- **date-fns**: Date manipulation.
- **clsx**: Conditional CSS class utilities.
- **class-variance-authority**: Component variant management.
- **cmdk**: Command palette functionality.
- **pdfkit**: Server-side PDF generation.