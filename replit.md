# Overview

VagasPro is a job management system built with React and Express, designed to streamline recruitment workflows for companies. It facilitates the management of job postings and applications, offers a comprehensive dashboard for tracking hiring metrics, and enables the analysis of recruitment performance through various reports and visualizations. The system includes robust role-based permission management, detailed job status tracking, admission data management, and integration capabilities with external HCM Senior databases. Its purpose is to enhance recruitment efficiency, provide actionable insights, and ensure compliance with hiring policies.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React with TypeScript and Vite.
- **UI/Styling**: shadcn/ui (Radix UI), Tailwind CSS.
- **State Management**: TanStack Query.
- **Routing**: Wouter.
- **Forms**: React Hook Form with Zod validation.
- **UI/UX Decisions**: Consistent design system using shadcn/ui, mobile-first responsiveness, Recharts for data visualization, tabbed modals, enhanced search components (e.g., searchable Combobox for large datasets), comprehensive PDF generation, and unified Kanban board creation.

## Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript (ES modules).
- **API Pattern**: RESTful API (JSON).
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM.
- **System Design Choices**: Repository pattern for data access, Zod for API input validation, well-defined foreign key relationships, and configurable parameters for work scales, benefits, and job statuses.

## Authentication & Authorization
- **Multi-Tenant Architecture**: Supports multiple client organizations with data isolation.
- **Role-Based Permissions**: Granular permissions across 8 predefined roles, including super admin, and organization-specific data access via `organizationId`.

## Core Features & Implementations
- **Employee Replacement Workflow**: Smart filtering of employees by work position and cost center from imported Senior data.
- **Senior HCM Integration**: Synchronization of client data, cost centers, professions, work positions, and employee data (with status correction) from Senior HCM API.
- **Job Quota System**: Profession-based quotas for clients, managed via `client_profession_limits` table, with comprehensive validation during job creation.
- **Notifications System**: Multi-channel (Email, WhatsApp) for job status changes, with configurable settings and smart recipient logic.
- **Organization Management**: CRUD operations for organizations, with admin creation, active/inactive status, and plan-based limits.
- **Kanban Management**: Unified creation of Kanban boards with multiple stages, selectable per job.
- **Workflow Approval System**: Multi-step approval workflows for job vacancies, supporting dual authorization, specific user/permission approval, and quota validation.
- **Sales Plan Management**: CRUD for subscription plans with configurable features, pricing options, and user/job limits.
- **Financial Management**: CRUD for invoices with status tracking and payment history.
- **Candidate Blacklist Management**: CRUD and batch import for blacklisting candidates by organization.
- **Job Deletion with Reason Logging**: Allows deletion of jobs with mandatory reason logging for audit trails.
- **Dynamic Job Status Filter**: Job status filter loads dynamically from the database, allowing customization.
- **Work Scales Management**: Full CRUD interface for managing work scales with start/end times and break intervals.
- **Division-Based Workflow and Cost Center Filtering**: Enables association of workflows and cost centers with specific organizational divisions, filtering options in job creation forms based on selected division, and auto-filling of company based on cost center selection.
- **Dashboard Charts**: Includes charts for "Vagas por Posto de Trabalho" and "Vagas por Centro de Custos" with filtering capabilities.
- **ClientModal Employee List Enhancements**: Adds status filter and a 100-item limit with a results counter for employee lists.
- **Employee Replacement Field**: Simplified to a free-text input for direct entry of employee names to be replaced.
- **Job Type Filter**: Dashboard filtering by job type (Produtiva/Improdutiva) across all metrics and charts, with backend support for jobType parameter in all dashboard endpoints.
- **Opening Reason Filter**: Dashboard filtering by hiring type (Substituição/Aumento de quadro) across all metrics and charts, with backend support for openingReason parameter in all dashboard endpoints.
- **Dynamic Approvals Badge**: Notification bell icon dynamically displays count of pending approvals from /api/approvals/pending endpoint, with click navigation to approvals page.

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

## Data Visualization
- **Recharts**: React charting library.

## Utility Libraries
- **date-fns**: Date manipulation.
- **clsx**: Conditional CSS class utilities.
- **class-variance-authority**: Component variant management.
- **cmdk**: Command palette functionality.
- **pdfkit**: Server-side PDF generation.