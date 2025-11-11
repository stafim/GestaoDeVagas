# Overview

VagasPro is a job management system built with React and Express, designed to streamline recruitment workflows for companies. It facilitates the management of job postings and applications, offers a comprehensive dashboard for tracking hiring metrics, and enables the analysis of recruitment performance through various reports and visualizations. The system includes robust role-based permission management, detailed job status tracking, admission data management, and integration capabilities with external HCM Senior databases. Its purpose is to enhance recruitment efficiency, provide actionable insights, and ensure compliance with hiring policies.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Updates (Nov 11, 2025)

### ClientModal Employee List - Status Filter & Pagination (LATEST)
- **Features Added**:
  - **Status Filter**: Dropdown to filter employees by status (Todos, Ativo, Desligado, Férias, Afastamento)
  - **100-Item Limit**: Shows only first 100 employees to improve performance
  - **Search Bar**: Retained for finding specific employees within filtered results
  - **Results Counter**: Displays "Mostrando X de Y funcionários" with limit notification
- **Implementation**:
  - Grid layout: Status filter (1 column) + Search bar (2 columns) on desktop
  - Filter applies before 100-item limit for better results
  - Status filter state: `employeeStatusFilter` (default: "todos")
  - Combined filtering logic: status → search → limit (100)
- **User Experience**:
  - Select status → See up to 100 matching employees
  - Use search bar → Further refine results within status filter
  - Clear visual feedback on filter state and result count
- **Technical Impact**:
  - Modified `filteredEmployees` logic to include status filter
  - Added `.slice(0, 100)` to limit results
  - Responsive grid layout for filters

### Employee Replacement Field - Free Text Input
- **Change**: "Colaborador a Substituir" field converted from searchable dropdown to free text input
- **Implementation**: Simple text Input component for manual entry of employee name to be replaced
- **Reason**: Simplified workflow - users can type employee names directly without navigating complex filters
- **Impact**: Removed employee list queries, filtering logic, and popover state management for better performance

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