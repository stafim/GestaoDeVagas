# Overview

VagasPro is a job management system built with React and Express, designed to streamline recruitment workflows for companies. It facilitates the management of job postings and applications, offers a comprehensive dashboard for tracking hiring metrics, and enables the analysis of recruitment performance through various reports and visualizations. The system includes robust role-based permission management, detailed job status tracking, admission data management, and integration capabilities with external HCM Senior databases. Its purpose is to enhance recruitment efficiency, provide actionable insights, and ensure compliance with hiring policies.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Updates (Nov 11, 2025)

### Division-Based Workflow and Cost Center Filtering (LATEST)
- **Database Structure**:
  - **divisions table**: Stores organizational divisions from Senior (`usu_tdivare.usu_coddiv`, `usu_desdiv`)
  - **7 divisions imported**: ADMINISTRATIVO (1), FACILITIES (2), INDUSTRIAL (3), LOGISTICA (4), MANUTENCAO (5), ENGENHARIA (6), MOBILIDADE (7)
  - **approvalWorkflows.divisionId**: Required foreign key to divisions table (NOT NULL)
  - **costCenters.divisionId**: Foreign key to divisions table - associates cost centers with specific divisions from `r018ccu.usu_coddiv`
- **Backend Implementation**:
  - Division import: `server/scripts/import-divisions.ts` syncs from `usu_tdivare` table
  - Cost center import: `server/scripts/import-cost-centers.ts` syncs from `r018ccu` table WITH division relationship via `usu_coddiv` field
  - API endpoint: `GET /api/divisions` returns all active divisions
  - Storage method: `getDivisions()` queries divisions ordered by name
  - **166 cost centers** have division assigned in Senior, **2,427** without division
- **Frontend Features - Workflow Creation**:
  - Division selector in workflow creation form (required field)
  - Dropdown with 7 divisions: ADMINISTRATIVO, FACILITIES, INDUSTRIAL, LOGISTICA, MANUTENCAO, ENGENHARIA, MOBILIDADE
  - Validation: User must select a division before creating workflow
  - Description: "Este workflow será aplicado apenas para vagas desta divisão"
- **Frontend Features - Job Creation**:
  - Division selector in job creation form dynamically loaded from divisions API
  - Replaces hardcoded division list with data from `usu_tdivare` table via divisions API
  - Ensures consistency between job divisions and workflow divisions
  - Division field positioned immediately after Client field in "Informações Básicas" section
  - **Workflow filtering**: Approval workflow dropdown shows only workflows matching the selected division
  - **Cost Center filtering - STRICT MODE**: When division is selected, cost center dropdown shows ONLY cost centers that belong to that specific division (strict filtering)
  - Workflow field disabled until division is selected
  - Cost center field enabled after company is selected
  - Auto-clears workflow and cost center selections if division is changed to prevent mismatches
  - Informative placeholders guide users through the cascading selection process
- **Use Case**:
  - Each workflow must be associated with a specific division
  - Each cost center can optionally be associated with a specific division
  - Create division-specific workflows (e.g., "Aprovação FACILITIES" only for FACILITIES division)
  - When creating a job for a division, only cost centers of that division are available
  - Ensures organizational alignment between divisions, workflows, and cost centers
  - Enables customized approval processes per organizational area
  - To cover all divisions, create separate workflows for each
  - **Example**: Selecting ENGENHARIA division shows only ENGENHARIA workflows and ENGENHARIA cost centers

### Dashboard Charts - Work Positions & Cost Centers
- **New Charts Added**:
  - **Vagas por Posto de Trabalho**: Horizontal bar chart showing top 10 work positions with most open jobs
  - **Vagas por Centro de Custos**: Horizontal bar chart showing top 10 cost centers with most open jobs
- **Backend Implementation**:
  - New API endpoints: `/api/dashboard/jobs-by-work-position` and `/api/dashboard/jobs-by-cost-center`
  - Storage methods: `getJobsByWorkPosition()` and `getJobsByCostCenter()`
  - Both support filtering by month, company, division, and recruiter
  - Excludes completed/canceled jobs, shows only active open positions
  - Top 10 results sorted by count (descending)
- **Frontend Features**:
  - Responsive charts using Recharts library
  - Loading skeletons during data fetch
  - Empty state messages when no data available
  - Consistent styling with existing dashboard charts
  - Full filter integration (respects month/company/division/recruiter selections)
- **Data Types**:
  - `JobsByWorkPositionResponse`: Array of { workPosition: string, count: number }
  - `JobsByCostCenterResponse`: Array of { costCenterId: string, costCenterName: string, count: number }

### ClientModal Employee List - Status Filter & Pagination
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