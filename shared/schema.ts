import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Organizations table (Multi-tenant support)
// Cada organização representa um cliente que comprou o sistema
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(), // URL-friendly identifier
  cnpj: varchar("cnpj", { length: 18 }),
  contactName: varchar("contact_name", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  address: text("address"),
  logo: varchar("logo"),
  isActive: boolean("is_active").default(true),
  maxUsers: integer("max_users").default(50), // Limite de usuários por plano
  planType: varchar("plan_type", { length: 50 }).default("basic"), // basic, professional, enterprise
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).default("0"), // Valor mensal do plano
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices table (Faturas/Boletos)
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).unique(), // Número da fatura
  description: text("description"), // Descrição da fatura
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Valor
  dueDate: timestamp("due_date").notNull(), // Data de vencimento
  paidDate: timestamp("paid_date"), // Data de pagamento (null = não pago)
  status: varchar("status", { length: 20 }).default("pending"), // pending, paid, overdue, cancelled
  paymentMethod: varchar("payment_method", { length: 50 }), // boleto, pix, credit_card
  boletoUrl: text("boleto_url"), // URL do boleto PDF
  boletoBarcode: varchar("boleto_barcode", { length: 100 }), // Código de barras
  boletoDigitableLine: varchar("boleto_digitable_line", { length: 100 }), // Linha digitável
  pixQrCode: text("pix_qr_code"), // QR Code Pix
  pixQrCodeText: text("pix_qr_code_text"), // Texto Pix Copia e Cola
  externalId: varchar("external_id", { length: 255 }), // ID externo da API (Asaas, Pagar.me, etc)
  notes: text("notes"), // Observações
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment History table (Histórico de pagamentos)
export const paymentHistory = pgTable("payment_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  transactionId: varchar("transaction_id", { length: 255 }), // ID da transação
  status: varchar("status", { length: 20 }).notNull(), // confirmed, pending, failed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Plans table (Planos de venda)
export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  yearlyPrice: decimal("yearly_price", { precision: 10, scale: 2 }), // Preço anual (opcional)
  maxUsers: integer("max_users").default(10), // Limite de usuários
  maxJobs: integer("max_jobs"), // Limite de vagas (null = ilimitado)
  features: jsonb("features").notNull(), // Funcionalidades do sistema habilitadas
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0), // Ordem de exibição
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id), // null = super_admin (sem organização)
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash"), // For local authentication
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, admin, recruiter
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id), // Multi-tenant: null = visível para todos
  name: varchar("name", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  industryType: varchar("industry_type", { length: 100 }),
  description: text("description"),
  website: varchar("website"),
  logo: varchar("logo"),
  color: varchar("color", { length: 7 }).default("#10b981"), // Cor para gráficos
  jobCounter: integer("job_counter").default(0), // Contador para IDs de vagas
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cost centers table
export const costCenters = pgTable("cost_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  companyId: varchar("company_id").references(() => companies.id),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients table
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id), // Multi-tenant: null = visível para todos
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  notes: text("notes"),
  contractFileName: varchar("contract_file_name", { length: 255 }),
  contractFilePath: varchar("contract_file_path", { length: 500 }),
  maxJobs: integer("max_jobs"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Client profession limits - limites de vagas por profissão para cada cliente
export const clientProfessionLimits = pgTable("client_profession_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
  professionId: varchar("profession_id").notNull(), // ID da profissão (não usamos FK porque professions é dinâmico)
  maxJobs: integer("max_jobs").notNull(), // Número máximo de vagas permitidas para esta profissão
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Client dashboard permissions - controla quais dashboards cada cliente pode acessar
export const clientDashboardPermissions = pgTable("client_dashboard_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
  dashboardKey: varchar("dashboard_key", { length: 100 }).notNull(), // Ex: "realtime", "analytics", "reports"
  isEnabled: boolean("is_enabled").default(true), // Se o dashboard está habilitado para este cliente
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Client employee status enum
export const clientEmployeeStatusEnum = pgEnum("client_employee_status", [
  "ativo",
  "desligado",
  "ferias",
  "afastamento"
]);

// Client employees table (funcionários alocados no contrato do cliente)
export const clientEmployees = pgTable("client_employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  costCenterId: varchar("cost_center_id").references(() => costCenters.id),
  name: varchar("name", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }), // Cargo
  status: clientEmployeeStatusEnum("status").default("ativo").notNull(),
  admissionDate: timestamp("admission_date"), // Data de admissão
  terminationDate: timestamp("termination_date"), // Data de desligamento (se aplicável)
  notes: text("notes"), // Observações
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employees table (funcionários ativos nas empresas)
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeCode: varchar("employee_code", { length: 50 }).notNull().unique(), // Matrícula
  name: varchar("name", { length: 255 }).notNull(),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 255 }), // Cargo
  isActive: boolean("is_active").default(true), // Se está ativo na empresa
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job status enum
export const jobStatusEnum = pgEnum("job_status", [
  "active", 
  "closed",
  "expired",
  "aberto",
  "aprovada",
  "em_recrutamento",
  "em_documentacao",
  "dp",
  "em_mobilizacao",
  "cancelada",
  "concluida"
]);

// Contract type enum
export const contractTypeEnum = pgEnum("contract_type", [
  "clt",
  "pj", 
  "freelancer",
  "estagio",
  "temporario"
]);

// Job opening reason enum
export const jobReasonEnum = pgEnum("job_reason", [
  "substituicao",
  "aumento_quadro"
]);

// Gender enum
export const genderEnum = pgEnum("gender", [
  "masculino",
  "feminino",
  "indiferente"
]);

// Work scale enum
export const workScaleEnum = pgEnum("work_scale", [
  "5x1",
  "5x2",
  "6x1",
  "12x36",
  "outro"
]);

// Unhealthiness level enum
export const unhealthinessEnum = pgEnum("unhealthiness_level", [
  "nao",
  "10",
  "20",
  "40"
]);

// Job type enum
export const jobTypeEnum = pgEnum("job_type", [
  "produtiva",
  "improdutiva"
]);

// Permission system enums
export const roleTypeEnum = pgEnum("role_type", [
  "super_admin", // Nível mais alto - dono do sistema, acesso a todas organizações
  "admin",
  "hr_manager", 
  "recruiter",
  "interviewer",
  "viewer",
  "approver",
  "manager"
]);

export const permissionTypeEnum = pgEnum("permission_type", [
  "create_jobs",
  "edit_jobs", 
  "delete_jobs",
  "view_jobs",
  "approve_jobs",
  "assign_to_jobs",
  "create_companies",
  "edit_companies",
  "delete_companies",
  "view_companies",
  "manage_cost_centers",
  "view_applications",
  "manage_applications",
  "interview_candidates",
  "hire_candidates",
  "view_reports",
  "export_data",
  "manage_users",
  "manage_permissions"
]);

// Approval workflow enums
export const approvalWorkflowStepTypeEnum = pgEnum("approval_workflow_step_type", [
  "dual", // Dupla alçada - requer aprovação de dois usuários diferentes
  "user", // Aprovação por usuário específico
  "role", // Aprovação por qualquer usuário com a role especificada
  "permission", // Aprovação por qualquer usuário com a permissão especificada
]);

export const dualApprovalSubtypeEnum = pgEnum("dual_approval_subtype", [
  "user", // Dupla alçada com usuários específicos
  "permission", // Dupla alçada com tipo de permissão
]);

export const approvalWorkflowStepStatusEnum = pgEnum("approval_workflow_step_status", [
  "pending", // Aguardando aprovação
  "approved", // Aprovado
  "rejected", // Rejeitado
  "skipped", // Pulado (quando step anterior foi rejeitado)
]);

// Professions table
export const professions = pgTable("professions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // e.g., "Tecnologia", "Marketing", "Vendas"
  union: varchar("union", { length: 255 }), // Sindicato
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Work Scales table - Parametrized work scales
export const workScales = pgTable("work_scales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(), // e.g., "5x1", "5x2", "6x1", "12x36"
  description: text("description"), // Optional description
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Benefits table - Parametrized benefits
export const benefits = pgTable("benefits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(), // e.g., "Vale Alimentação", "Plano de Saúde"
  description: text("description"), // Optional description
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job Statuses table - Parametrized job statuses
export const jobStatuses = pgTable("job_statuses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 50 }).notNull().unique(), // e.g., "aberto", "em_recrutamento", "closed"
  label: varchar("label", { length: 100 }).notNull(), // e.g., "Aberto", "Em Recrutamento"
  variant: varchar("variant", { length: 20 }).notNull().default("default"), // "default", "secondary", "destructive", "outline"
  color: varchar("color", { length: 7 }), // Hex color code, e.g., "#3B82F6"
  description: text("description"), // Optional description
  displayOrder: integer("display_order").default(0), // Order for display in lists
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Status notification settings - configura se deve notificar por email/WhatsApp quando status mudar
export const statusNotificationSettings = pgTable("status_notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  statusId: varchar("status_id").references(() => jobStatuses.id, { onDelete: "cascade" }).notNull().unique(),
  emailNotificationEnabled: boolean("email_notification_enabled").default(false), // Se deve notificar por email ao mudar para este status
  whatsappNotificationEnabled: boolean("whatsapp_notification_enabled").default(false), // Se deve notificar por WhatsApp ao mudar para este status
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Integration settings - armazena configurações de integrações (Email SMTP, WhatsApp API, etc)
export const integrationSettings = pgTable("integration_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationType: varchar("integration_type", { length: 50 }).notNull(), // "email" ou "whatsapp"
  configKey: varchar("config_key", { length: 100 }).notNull(), // "smtp_host", "smtp_port", "whatsapp_api_key", etc
  configValue: text("config_value"), // Valor da configuração
  isEncrypted: boolean("is_encrypted").default(false), // Se o valor está criptografado
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Approval workflows - Define workflows de aprovação de vagas
export const approvalWorkflows = pgTable("approval_workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(), // Nome do workflow (ex: "Aprovação Dupla Alçada")
  description: text("description"), // Descrição do workflow
  isActive: boolean("is_active").default(true), // Se o workflow está ativo
  isDefault: boolean("is_default").default(false), // Se é o workflow padrão para novas vagas
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workflow Job Status Rules - Vincula workflows a status de vagas específicos
export const workflowJobStatusRules = pgTable("workflow_job_status_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").references(() => approvalWorkflows.id, { onDelete: "cascade" }).notNull(),
  jobStatusId: varchar("job_status_id").references(() => jobStatuses.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Approval workflow steps - Etapas de cada workflow
export const approvalWorkflowSteps = pgTable("approval_workflow_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").references(() => approvalWorkflows.id, { onDelete: "cascade" }).notNull(),
  stepOrder: integer("step_order").notNull(), // Ordem da etapa (1, 2, 3...)
  stepName: varchar("step_name", { length: 255 }).notNull(), // Nome da etapa (ex: "Primeira Alçada", "Segunda Alçada")
  stepType: approvalWorkflowStepTypeEnum("step_type").notNull(), // Tipo: dual, user, role, ou permission
  dualApprovalSubtype: dualApprovalSubtypeEnum("dual_approval_subtype"), // Subtipo quando stepType = "dual" (user ou permission)
  userId: varchar("user_id").references(() => users.id), // Primeiro usuário específico (quando type = "user" ou dual+user)
  userId2: varchar("user_id2").references(() => users.id), // Segundo usuário específico (quando dual+user)
  role: roleTypeEnum("role"), // Primeiro cargo necessário (quando type = "role" ou dual+role)
  role2: roleTypeEnum("role2"), // Segundo cargo necessário (quando dual+role)
  permission: permissionTypeEnum("permission"), // Permissão necessária (quando type = "permission" ou dual+permission)
  isRequired: boolean("is_required").default(true), // Se a etapa é obrigatória
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ApprovalWorkflow = typeof approvalWorkflows.$inferSelect;
export type InsertApprovalWorkflow = z.infer<typeof insertApprovalWorkflowSchema>;

export const insertApprovalWorkflowSchema = createInsertSchema(approvalWorkflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ApprovalWorkflowStep = typeof approvalWorkflowSteps.$inferSelect;
export type InsertApprovalWorkflowStep = z.infer<typeof insertApprovalWorkflowStepSchema>;

export const insertApprovalWorkflowStepSchema = createInsertSchema(approvalWorkflowSteps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type WorkflowJobStatusRule = typeof workflowJobStatusRules.$inferSelect;
export type InsertWorkflowJobStatusRule = z.infer<typeof insertWorkflowJobStatusRuleSchema>;

export const insertWorkflowJobStatusRuleSchema = createInsertSchema(workflowJobStatusRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Jobs table - temporarily keeping both title and professionId for migration
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobCode: varchar("job_code", { length: 50 }).unique(), // ID legível da vaga (ex: OPUS001, TELOS001)
  title: varchar("title", { length: 255 }), // Keep existing field temporarily
  professionId: varchar("profession_id").references(() => professions.id), // Add new field as optional
  description: text("description"),
  requirements: text("requirements"),
  companyId: varchar("company_id").references(() => companies.id),
  costCenterId: varchar("cost_center_id").references(() => costCenters.id),
  costCenterDescription: text("cost_center_description"), // Descrição específica do centro de custo para esta vaga
  workPosition: varchar("work_position", { length: 255 }), // Posto de trabalho
  recruiterId: varchar("recruiter_id").references(() => users.id),
  department: varchar("department"),
  location: varchar("location"),
  contractType: contractTypeEnum("contract_type").default("clt"),
  jobType: jobTypeEnum("job_type"), // Tipo de vaga: produtiva (faturar) ou improdutiva (sem faturar)
  
  // Novos campos detalhados da vaga
  openingDate: timestamp("opening_date"), // Data de abertura da vaga
  startDate: timestamp("start_date"), // Data de início
  openingReason: jobReasonEnum("opening_reason"), // Motivo: substituição ou aumento de quadro
  replacementEmployeeName: varchar("replacement_employee_name", { length: 255 }), // Nome do colaborador a ser substituído (quando motivo = substituição)
  ageRangeMin: integer("age_range_min"), // Idade mínima
  ageRangeMax: integer("age_range_max"), // Idade máxima
  specifications: text("specifications"), // Especificações detalhadas
  clientId: varchar("client_id").references(() => clients.id).notNull(), // Cliente (obrigatório)
  vacancyQuantity: integer("vacancy_quantity").default(1), // Quantidade de vagas
  gender: genderEnum("gender").default("indiferente"), // Sexo
  workScaleId: varchar("work_scale_id").references(() => workScales.id), // Escala de trabalho (parametrizada)
  workHours: varchar("work_hours", { length: 100 }), // Horário de trabalho
  
  // Remuneração e benefícios
  salaryMin: decimal("salary_min", { precision: 10, scale: 2 }),
  bonus: decimal("bonus", { precision: 10, scale: 2 }), // Gratificação
  hasHazardPay: boolean("has_hazard_pay").default(false), // Periculosidade
  unhealthinessLevel: unhealthinessEnum("unhealthiness_level").default("nao"), // Insalubridade
  
  kanbanBoardId: varchar("kanban_board_id").references(() => kanbanBoards.id), // Kanban board para esta vaga
  status: varchar("status", { length: 50 }).default("nova_vaga"), // Status dinâmico baseado na tabela job_statuses
  createdBy: varchar("created_by").references(() => users.id),
  expiresAt: timestamp("expires_at"),
  slaDeadline: timestamp("sla_deadline"), // SLA de 14 dias para fechamento da vaga
  notes: text("notes"), // Notas/observações sobre a vaga
  completedAt: timestamp("completed_at"), // Data de conclusão da vaga
  admissionDate: timestamp("admission_date"), // Data de admissão do candidato contratado
  hiredCandidateId: varchar("hired_candidate_id").references(() => candidates.id), // Candidato contratado
  approvalWorkflowId: varchar("approval_workflow_id").references(() => approvalWorkflows.id), // Workflow de aprovação associado à vaga
  approvalStatus: varchar("approval_status", { length: 50 }).default("pending"), // Status da aprovação: pending, approved, rejected
  currentApprovalStep: integer("current_approval_step"), // Etapa atual de aprovação
  approvedBy: varchar("approved_by").references(() => users.id), // Usuário que aprovou a vaga
  approvedAt: timestamp("approved_at"), // Data de aprovação da vaga
  createdWithIrregularity: boolean("created_with_irregularity").default(false), // Vaga criada com irregularidade conhecida (excedendo limite de vagas do cliente)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job-Benefits relationship table (many-to-many)
export const jobBenefits = pgTable("job_benefits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  benefitId: varchar("benefit_id").references(() => benefits.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job approval history - Histórico de aprovações de vagas
export const jobApprovalHistory = pgTable("job_approval_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  workflowStepId: varchar("workflow_step_id").references(() => approvalWorkflowSteps.id).notNull(),
  stepName: varchar("step_name", { length: 255 }).notNull(), // Nome da etapa no momento da aprovação
  stepOrder: integer("step_order").notNull(), // Ordem da etapa
  status: approvalWorkflowStepStatusEnum("status").notNull(), // Status: pending, approved, rejected, skipped
  approvedBy: varchar("approved_by").references(() => users.id), // Usuário que aprovou/rejeitou
  comments: text("comments"), // Comentários do aprovador
  approvedAt: timestamp("approved_at"), // Data/hora da aprovação/rejeição
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type JobApprovalHistory = typeof jobApprovalHistory.$inferSelect;
export type InsertJobApprovalHistory = z.infer<typeof insertJobApprovalHistorySchema>;

export const insertJobApprovalHistorySchema = createInsertSchema(jobApprovalHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User-Company-Role assignments table
export const userCompanyRoles = pgTable("user_company_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  companyId: varchar("company_id").references(() => companies.id),
  role: roleTypeEnum("role").notNull(),
  costCenterId: varchar("cost_center_id").references(() => costCenters.id), // Optional: restrict to specific cost center
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role permissions mapping table
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: roleTypeEnum("role").notNull(),
  permission: permissionTypeEnum("permission").notNull(),
  isGranted: boolean("is_granted").default(true),
});

// User menu permissions table - controls which menu items each user can access
export const userMenuPermissions = pgTable("user_menu_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  menuPath: varchar("menu_path", { length: 255 }).notNull(), // e.g., "/dashboard", "/jobs", "/companies"
  menuName: varchar("menu_name", { length: 255 }).notNull(), // e.g., "Dashboard", "Vagas", "Empresas"
  canAccess: boolean("can_access").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role job status permissions table - controls which roles can view/edit jobs by status
export const roleJobStatusPermissions = pgTable("role_job_status_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: roleTypeEnum("role").notNull(),
  jobStatusId: varchar("job_status_id").references(() => jobStatuses.id, { onDelete: "cascade" }).notNull(),
  canView: boolean("can_view").default(false).notNull(),
  canEdit: boolean("can_edit").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Selection process status enum
export const selectionStatusEnum = pgEnum("selection_status", [
  "applied",
  "under_review", 
  "phone_screening",
  "technical_test",
  "interview_scheduled",
  "interview_completed", 
  "final_review",
  "approved",
  "rejected",
  "hired"
]);

// Interview types enum
export const interviewTypeEnum = pgEnum("interview_type", [
  "phone_screening",
  "technical",
  "behavioral", 
  "final",
  "panel"
]);

// Kanban stages enum (legacy - mantido para compatibilidade)
export const kanbanStageEnum = pgEnum("kanban_stage", [
  "entrevista_inicial",
  "teste_tecnico",
  "entrevista_gestor",
  "proposta",
  "contratado"
]);

// Kanban Boards table (allows multiple custom kanban boards)
export const kanbanBoards = pgTable("kanban_boards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Kanban Stages table (stages/columns for each kanban board)
export const kanbanStages = pgTable("kanban_stages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  kanbanBoardId: varchar("kanban_board_id").references(() => kanbanBoards.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  order: integer("order").notNull(), // Ordem de exibição das colunas
  color: varchar("color", { length: 50 }).default("bg-blue-500"), // Cor da coluna
  createdAt: timestamp("created_at").defaultNow(),
});

// Candidates table (global pool of candidates)
export const candidates = pgTable("candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  document: varchar("document", { length: 20 }), // CPF ou RG
  birthDate: timestamp("birth_date"), // Data de nascimento
  resume: varchar("resume"), // URL to resume file
  skills: text("skills"),
  experience: text("experience"),
  education: text("education"),
  linkedinUrl: varchar("linkedin_url"),
  portfolioUrl: varchar("portfolio_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Applications table (links candidates to specific jobs)
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id).notNull(),
  candidateId: varchar("candidate_id").references(() => candidates.id).notNull(),
  coverLetter: text("cover_letter"),
  status: selectionStatusEnum("status").default("applied"),
  currentStage: varchar("current_stage").default("application_received"),
  kanbanStageId: varchar("kanban_stage_id").references(() => kanbanStages.id), // Referência ao ID do stage customizável
  overallScore: integer("overall_score").default(0), // Score out of 100
  rejectionReason: text("rejection_reason"),
  notes: text("notes"), // Internal notes about candidate
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Selection process stages table
export const selectionStages = pgTable("selection_stages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id),
  name: varchar("name", { length: 255 }).notNull(), // "Application Review", "Phone Screen", etc.
  description: text("description"),
  order: integer("order").notNull(), // Stage order (1, 2, 3...)
  isRequired: boolean("is_required").default(true),
  passingScore: integer("passing_score").default(70), // Minimum score to advance
  createdAt: timestamp("created_at").defaultNow(),
});

// Interviews table
export const interviews = pgTable("interviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").references(() => applications.id),
  interviewerId: varchar("interviewer_id").references(() => users.id),
  stageId: varchar("stage_id").references(() => selectionStages.id),
  type: interviewTypeEnum("type").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  duration: integer("duration").default(60), // Duration in minutes
  location: varchar("location"), // Room/link
  status: varchar("status").default("scheduled"), // scheduled, completed, cancelled, rescheduled
  score: integer("score"), // Interview score out of 100
  feedback: text("feedback"),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interview evaluation criteria table
export const interviewCriteria = pgTable("interview_criteria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interviewId: varchar("interview_id").references(() => interviews.id),
  criterion: varchar("criterion", { length: 255 }).notNull(), // "Technical Skills", "Communication", etc.
  score: integer("score").notNull(), // Score out of 10
  notes: text("notes"),
});

// Application stage progress tracking
export const applicationStageProgress = pgTable("application_stage_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").references(() => applications.id),
  stageId: varchar("stage_id").references(() => selectionStages.id),
  status: varchar("status").default("pending"), // pending, in_progress, completed, failed
  score: integer("score"), // Score for this stage
  feedback: text("feedback"),
  completedAt: timestamp("completed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const professionsRelations = relations(professions, ({ many }) => ({
  jobs: many(jobs),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  costCenters: many(costCenters),
  jobs: many(jobs),
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one }) => ({
  company: one(companies, {
    fields: [employees.companyId],
    references: [companies.id],
  }),
}));

export const costCentersRelations = relations(costCenters, ({ one, many }) => ({
  company: one(companies, {
    fields: [costCenters.companyId],
    references: [companies.id],
  }),
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  profession: one(professions, {
    fields: [jobs.professionId],
    references: [professions.id],
  }),
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  costCenter: one(costCenters, {
    fields: [jobs.costCenterId],
    references: [costCenters.id],
  }),
  createdBy: one(users, {
    fields: [jobs.createdBy],
    references: [users.id],
  }),
  applications: many(applications),
}));

export const candidatesRelations = relations(candidates, ({ many }) => ({
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  candidate: one(candidates, {
    fields: [applications.candidateId],
    references: [candidates.id],
  }),
  interviews: many(interviews),
  stageProgress: many(applicationStageProgress),
}));

export const userCompanyRolesRelations = relations(userCompanyRoles, ({ one }) => ({
  user: one(users, {
    fields: [userCompanyRoles.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [userCompanyRoles.companyId],
    references: [companies.id],
  }),
  costCenter: one(costCenters, {
    fields: [userCompanyRoles.costCenterId],
    references: [costCenters.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  companyRoles: many(userCompanyRoles),
  createdJobs: many(jobs),
  interviews: many(interviews),
}));

export const selectionStagesRelations = relations(selectionStages, ({ one, many }) => ({
  job: one(jobs, {
    fields: [selectionStages.jobId],
    references: [jobs.id],
  }),
  interviews: many(interviews),
  stageProgress: many(applicationStageProgress),
}));

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  application: one(applications, {
    fields: [interviews.applicationId],
    references: [applications.id],
  }),
  interviewer: one(users, {
    fields: [interviews.interviewerId],
    references: [users.id],
  }),
  stage: one(selectionStages, {
    fields: [interviews.stageId],
    references: [selectionStages.id],
  }),
  criteria: many(interviewCriteria),
}));

export const interviewCriteriaRelations = relations(interviewCriteria, ({ one }) => ({
  interview: one(interviews, {
    fields: [interviewCriteria.interviewId],
    references: [interviews.id],
  }),
}));

export const applicationStageProgressRelations = relations(applicationStageProgress, ({ one }) => ({
  application: one(applications, {
    fields: [applicationStageProgress.applicationId],
    references: [applications.id],
  }),
  stage: one(selectionStages, {
    fields: [applicationStageProgress.stageId],
    references: [selectionStages.id],
  }),
  reviewer: one(users, {
    fields: [applicationStageProgress.reviewedBy],
    references: [users.id],
  }),
}));

export const kanbanBoardsRelations = relations(kanbanBoards, ({ many }) => ({
  stages: many(kanbanStages),
  jobs: many(jobs),
}));

export const kanbanStagesRelations = relations(kanbanStages, ({ one }) => ({
  kanbanBoard: one(kanbanBoards, {
    fields: [kanbanStages.kanbanBoardId],
    references: [kanbanBoards.id],
  }),
}));

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema estendido para criação de organização com usuário admin
export const insertOrganizationWithAdminSchema = insertOrganizationSchema.extend({
  adminEmail: z.string().email({ message: "Email inválido" }),
  adminPassword: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
  adminFirstName: z.string().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }).optional(),
  adminLastName: z.string().optional(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCostCenterSchema = createInsertSchema(costCenters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientProfessionLimitSchema = createInsertSchema(clientProfessionLimits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertClientProfessionLimit = z.infer<typeof insertClientProfessionLimitSchema>;
export type SelectClientProfessionLimit = typeof clientProfessionLimits.$inferSelect;

export const insertClientDashboardPermissionSchema = createInsertSchema(clientDashboardPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertClientDashboardPermission = z.infer<typeof insertClientDashboardPermissionSchema>;
export type SelectClientDashboardPermission = typeof clientDashboardPermissions.$inferSelect;

export const insertClientEmployeeSchema = createInsertSchema(clientEmployees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  admissionDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  terminationDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkScaleSchema = createInsertSchema(workScales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBenefitSchema = createInsertSchema(benefits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobStatusSchema = createInsertSchema(jobStatuses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobBenefitSchema = createInsertSchema(jobBenefits).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = z.object({
  professionId: z.string().min(1, "Profissão é obrigatória"),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  description: z.string().optional(),
  costCenterId: z.string().optional(),
  recruiterId: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  contractType: z.enum(["clt", "pj", "freelancer", "estagio", "temporario"]).default("clt"),
  jobType: z.enum(["produtiva", "improdutiva"]).optional(),
  salaryMin: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "closed", "expired", "aberto", "aprovada", "em_recrutamento", "em_documentacao"]).default("draft"),
  createdBy: z.string().optional(),
  expiresAt: z.string().optional(),
  slaDeadline: z.string().optional(),
  admissionDate: z.string().optional(),
  hiredCandidateId: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  
  // Novos campos detalhados
  openingDate: z.string().optional(),
  startDate: z.string().optional(),
  openingReason: z.enum(["substituicao", "aumento_quadro"]).optional(),
  replacementEmployeeName: z.string().optional(),
  ageRangeMin: z.number().optional(),
  ageRangeMax: z.number().optional(),
  specifications: z.string().optional(),
  clientId: z.string().min(1, "Cliente é obrigatório"),
  vacancyQuantity: z.number().optional(),
  gender: z.enum(["masculino", "feminino", "indiferente"]).optional(),
  workScaleId: z.string().optional(),
  workHours: z.string().optional(),
  
  // Remuneração e benefícios
  bonus: z.string().optional(),
  hasHazardPay: z.boolean().optional(),
  unhealthinessLevel: z.enum(["nao", "10", "20", "40"]).optional(),
  
  // Benefícios (array of benefit IDs)
  benefitIds: z.array(z.string()).optional(),
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  updatedAt: true,
});

export const insertSelectionStageSchema = createInsertSchema(selectionStages).omit({
  id: true,
  createdAt: true,
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInterviewCriteriaSchema = createInsertSchema(interviewCriteria).omit({
  id: true,
});

export const insertApplicationStageProgressSchema = createInsertSchema(applicationStageProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKanbanBoardSchema = createInsertSchema(kanbanBoards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKanbanStageSchema = createInsertSchema(kanbanStages).omit({
  id: true,
  createdAt: true,
});

export const insertUserCompanyRoleSchema = createInsertSchema(userCompanyRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
});

export const insertUserMenuPermissionSchema = createInsertSchema(userMenuPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoleJobStatusPermissionSchema = createInsertSchema(roleJobStatusPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfessionSchema = createInsertSchema(professions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dueDate: z.string().transform(val => new Date(val)),
  paidDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

export const insertPaymentHistorySchema = createInsertSchema(paymentHistory).omit({
  id: true,
  createdAt: true,
}).extend({
  paymentDate: z.string().transform(val => new Date(val)),
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type InsertOrganizationWithAdmin = z.infer<typeof insertOrganizationWithAdminSchema>;

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type CostCenter = typeof costCenters.$inferSelect;
export type InsertCostCenter = z.infer<typeof insertCostCenterSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type ClientEmployee = typeof clientEmployees.$inferSelect;
export type InsertClientEmployee = z.infer<typeof insertClientEmployeeSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type SelectionStage = typeof selectionStages.$inferSelect;
export type InsertSelectionStage = z.infer<typeof insertSelectionStageSchema>;

export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

export type InterviewCriteria = typeof interviewCriteria.$inferSelect;
export type InsertInterviewCriteria = z.infer<typeof insertInterviewCriteriaSchema>;

export type ApplicationStageProgress = typeof applicationStageProgress.$inferSelect;
export type InsertApplicationStageProgress = z.infer<typeof insertApplicationStageProgressSchema>;

export type UserCompanyRole = typeof userCompanyRoles.$inferSelect;
export type InsertUserCompanyRole = z.infer<typeof insertUserCompanyRoleSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

export type UserMenuPermission = typeof userMenuPermissions.$inferSelect;
export type InsertUserMenuPermission = z.infer<typeof insertUserMenuPermissionSchema>;

export type RoleJobStatusPermission = typeof roleJobStatusPermissions.$inferSelect;
export type InsertRoleJobStatusPermission = z.infer<typeof insertRoleJobStatusPermissionSchema>;

export type Profession = typeof professions.$inferSelect;
export type InsertProfession = z.infer<typeof insertProfessionSchema>;

export type WorkScale = typeof workScales.$inferSelect;
export type InsertWorkScale = z.infer<typeof insertWorkScaleSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = z.infer<typeof insertPaymentHistorySchema>;

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type Benefit = typeof benefits.$inferSelect;
export type InsertBenefit = z.infer<typeof insertBenefitSchema>;

export type JobStatus = typeof jobStatuses.$inferSelect;
export type InsertJobStatus = z.infer<typeof insertJobStatusSchema>;

export const insertStatusNotificationSettingSchema = createInsertSchema(statusNotificationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type StatusNotificationSetting = typeof statusNotificationSettings.$inferSelect;
export type InsertStatusNotificationSetting = z.infer<typeof insertStatusNotificationSettingSchema>;

export const insertIntegrationSettingSchema = createInsertSchema(integrationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type IntegrationSetting = typeof integrationSettings.$inferSelect;
export type InsertIntegrationSetting = z.infer<typeof insertIntegrationSettingSchema>;

export type JobBenefit = typeof jobBenefits.$inferSelect;
export type InsertJobBenefit = z.infer<typeof insertJobBenefitSchema>;

// Extended types for joined queries
export type JobWithDetails = Job & {
  profession?: Profession;
  company?: Company;
  costCenter?: CostCenter;
  createdByUser?: User;
  applications?: Application[];
  applicationsCount?: number;
  selectionStages?: SelectionStage[];
  hasDpCandidate?: boolean;
};

export type ApplicationWithDetails = Application & {
  job?: Job;
  candidate?: Candidate;
  interviews?: Interview[];
  stageProgress?: ApplicationStageProgress[];
  currentStageInfo?: SelectionStage;
};

export type InterviewWithDetails = Interview & {
  application?: Application;
  interviewer?: User;
  stage?: SelectionStage;
  criteria?: InterviewCriteria[];
  candidate?: {
    name: string;
    email: string;
    jobTitle: string;
  };
};

export type CompanyWithCostCenters = Company & {
  costCenters?: CostCenter[];
  jobsCount?: number;
};

// API Response types
export type DashboardMetrics = {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalCompanies: number;
  openJobsCurrentMonth: number;
};

export type JobsByStatusResponse = Array<{ status: string; count: number }>;

export type ApplicationsByMonthResponse = Array<{ month: string; count: number }>;

export type JobsListResponse = JobWithDetails[];

export type CompaniesListResponse = CompanyWithCostCenters[];

// Selection process response types
export type SelectionProcessMetrics = {
  totalApplications: number;
  byStatus: Array<{ status: string; count: number }>;
  averageTimeToHire: number; // in days
  conversionRates: {
    applicationToInterview: number;
    interviewToOffer: number;
    offerToHire: number;
  };
};

export type InterviewCalendarResponse = {
  upcomingInterviews: InterviewWithDetails[];
  todayInterviews: InterviewWithDetails[];
  overdueInterviews: InterviewWithDetails[];
};

export type JobClosureReportItem = {
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
  closedJobsCount: number;
  averageDaysToClose: number;
  averageSalary: number;
};

export type ClosedJobsByRecruiterItem = {
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
  jobId: string;
  jobCode: string;
  professionName: string;
  companyName: string;
  closedDate: string;
  daysToClose: number;
  salary: number;
};

export type OpenJobsByMonthResponse = Array<{ month: string; count: number }>;

export type JobsByCreatorResponse = Array<{ 
  creatorId: string;
  creatorName: string; 
  count: number 
}>;

export type JobsByCompanyResponse = Array<{ 
  companyId: string;
  companyName: string; 
  companyColor: string;
  count: number 
}>;

export type JobsSLAResponse = {
  withinSLA: number;
  outsideSLA: number;
};

// Job status history table - tracks all status changes
export const jobStatusHistory = pgTable("job_status_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  previousStatus: varchar("previous_status", { length: 50 }),
  newStatus: varchar("new_status", { length: 50 }).notNull(),
  changedBy: varchar("changed_by").references(() => users.id),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});

export type JobStatusHistory = typeof jobStatusHistory.$inferSelect;
export type InsertJobStatusHistory = z.infer<typeof insertJobStatusHistorySchema>;

export const insertJobStatusHistorySchema = createInsertSchema(jobStatusHistory).omit({
  id: true,
  changedAt: true,
});

// System settings table
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: varchar("value", { length: 255 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  minValue: integer("min_value"),
  maxValue: integer("max_value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

// Blacklist Candidates table
export const blacklistCandidates = pgTable("blacklist_candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull(), // Format: 000.000.000-00
  reason: text("reason").notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type BlacklistCandidate = typeof blacklistCandidates.$inferSelect;
export type InsertBlacklistCandidate = z.infer<typeof insertBlacklistCandidateSchema>;

export const insertBlacklistCandidateSchema = createInsertSchema(blacklistCandidates, {
  fullName: z.string().min(3, "Nome completo deve ter no mínimo 3 caracteres"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato 000.000.000-00"),
  reason: z.string().min(10, "Motivo deve ter no mínimo 10 caracteres"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Senior HCM Integration Settings table
export const seniorIntegrationSettings = pgTable("senior_integration_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull().unique(), // Uma configuração por organização
  apiUrl: varchar("api_url", { length: 255 }).notNull().default("https://senior-sql.acelera-it.io"),
  apiKey: varchar("api_key", { length: 255 }).notNull(), // API Key for authentication
  isActive: boolean("is_active").default(true),
  autoSync: boolean("auto_sync").default(false), // Sincronização automática
  syncInterval: integer("sync_interval").default(60), // Intervalo em minutos
  lastSyncAt: timestamp("last_sync_at"),
  lastSyncStatus: varchar("last_sync_status", { length: 50 }), // success, error, in_progress
  lastSyncError: text("last_sync_error"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SeniorIntegrationSetting = typeof seniorIntegrationSettings.$inferSelect;
export type InsertSeniorIntegrationSetting = z.infer<typeof insertSeniorIntegrationSettingSchema>;

export const insertSeniorIntegrationSettingSchema = createInsertSchema(seniorIntegrationSettings, {
  apiUrl: z.string().url("URL da API deve ser válida"),
  apiKey: z.string().min(10, "API Key deve ter no mínimo 10 caracteres"),
  syncInterval: z.number().min(5, "Intervalo mínimo é de 5 minutos").max(1440, "Intervalo máximo é de 24 horas"),
}).omit({
  id: true,
  lastSyncAt: true,
  lastSyncStatus: true,
  lastSyncError: true,
  createdAt: true,
  updatedAt: true,
});
