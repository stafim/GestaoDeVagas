# Overview

VagasPro is a job management system built with React and Express, designed to streamline recruitment workflows for companies. It facilitates the management of job postings and applications, offers a comprehensive dashboard for tracking hiring metrics, and enables the analysis of recruitment performance through various reports and visualizations. The system includes robust role-based permission management, detailed job status tracking, admission data management, and integration capabilities with external HCM Senior databases.

## Recent Updates (Nov 11, 2025)

### Senior HCM Client Synchronization (LATEST)
- **Objective**: Import client data from Senior HCM API into VagasPro
- **Database Schema**:
  - Added `importedFromSenior` (boolean) - Tracks imported clients
  - Added `seniorId` (varchar) - Senior system ID for duplicate prevention
  - Added `lastSyncedAt` (timestamp) - Last synchronization timestamp
- **Backend Implementation**:
  - `getClients()` method in `seniorIntegration.ts` - Queries Senior E085CLI table
  - `POST /api/senior/sync-clients` endpoint - Handles batch import with duplicate detection
  - Smart sync: Creates new clients or updates existing ones based on `seniorId`
- **Frontend Features**:
  - "Importar da Senior" button on Clients page with loading state
  - Success/error toasts showing import statistics (imported, updated, errors)
  - Automatic client list refresh after import
- **Technical Notes**:
  - Uses Senior E085CLI table (main client registry)
  - SQL query: `SELECT CODCLI, NOMCLI, ENDCLI, CEPCLI, CGCCPF FROM E085CLI`
  - Temporary mock data (8 clients) while API query format is resolved with Senior support
  - Infrastructure ready for real data integration

### Cost Center Integration
- **Backend**: Added `GET /api/cost-centers` endpoint to fetch all cost centers
- **Storage**: Implemented `getCostCenters()` method for retrieving all cost centers across companies
- **Frontend**: Added cost center selection field in job creation form
  - Automatically filters cost centers based on selected company
  - Displays cost centers in format: "CODE - Name" (e.g., "ADM001 - Administrativo")
  - Field is disabled until a company is selected
- **Database**: 7 sample cost centers created across 3 companies for testing

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
- **Key Features**: Tabbed job details modal, enhanced employee search, comprehensive job status change tracking, client contract management, comprehensive PDF generation (admission dossier, candidate reports), unified Kanban board creation, and organized settings.
- **Client Dashboard Permissions**: Granular control over client access to various dashboard types.
- **Real-Time Client Dashboard**: Dedicated client-specific dashboards with key metrics.

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

## Workflow Approval System
- **Purpose**: Approves new job vacancies (transition from "Nova Vaga" to "Aprovada").
- **Approval Types**: Supports dual authorization, approval by specific users, and approval by permission types.
- **Multi-Step Workflows**: Configure sequential approval steps for job approval.
- **Status Management**: Active/inactive workflows with default workflow designation.
- **Integration**: Seamlessly integrates with job vacancy creation and quota validation.

## Sales Plan Management
- **Plans**: CRUD for managing subscription plans with configurable features.
- **Feature Toggles**: 12 system features that can be enabled/disabled per plan.
- **Pricing**: Monthly and yearly pricing options.
- **Limits**: Configurable user and job limits per plan.
- **Access**: Super Admin only.

## Financial Management
- **Invoices**: CRUD for managing invoices with status tracking (pending, paid, overdue, cancelled).
- **Payment History**: Tracks payment records.
- **Billing**: Links invoices to specific organizations.
- **Access**: Super Admin only.

## Candidate Blacklist Management
- **Purpose**: Manage candidates who cannot be hired by the organization.
- **Entry Methods**: Manual entry and batch import via CSV or Excel files.
- **Data Fields**: Full name, CPF, and reason for blacklisting.
- **CRUD Operations**: Full create, read, update, and delete capabilities.
- **Multi-Tenant**: Blacklist entries are isolated by organization.
- **Location**: Accessible via Settings page, Blacklist tab.

## Development Workflow
- **Build**: Separate client (Vite) and server (esbuild) builds.
- **Code Quality**: TypeScript strict mode, ESLint.

## Job Quota System
- **Migration**: From total job quota per client to profession-based quotas.
- **New System**: `client_profession_limits` table stores max jobs per client per profession, allowing fine-grained control.
- **Implementation**: Full CRUD operations in backend, updated frontend logic for quota checking and management.

## Job Creation Validation System
- **Feature**: Comprehensive validation system for job creation enforcing quota policies and profession-based limits.
- **Validation Flow**: Policy check, profession limit lookup, active jobs count, and policy application (block, require approval, allow).
- **Impact**: Enforces contract compliance and prevents quota violations.

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