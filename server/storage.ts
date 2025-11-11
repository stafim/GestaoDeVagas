import {
  users,
  organizations,
  invoices,
  paymentHistory,
  plans,
  companies,
  costCenters,
  clients,
  clientEmployees,
  clientDashboardPermissions,
  clientProfessionLimits,
  employees,
  jobs,
  candidates,
  applications,
  selectionStages,
  interviews,
  interviewCriteria,
  applicationStageProgress,
  userCompanyRoles,
  rolePermissions,
  userMenuPermissions,
  roleJobStatusPermissions,
  professions,
  workScales,
  benefits,
  jobStatuses,
  statusNotificationSettings,
  integrationSettings,
  jobBenefits,
  kanbanBoards,
  kanbanStages,
  systemSettings,
  jobStatusHistory,
  approvalWorkflows,
  approvalWorkflowSteps,
  workflowJobStatusRules,
  jobApprovalHistory,
  blacklistCandidates,
  seniorIntegrationSettings,
  type Organization,
  type InsertOrganization,
  type Invoice,
  type InsertInvoice,
  type PaymentHistory,
  type InsertPaymentHistory,
  type Plan,
  type InsertPlan,
  type User,
  type UpsertUser,
  type InsertUser,
  type Company,
  type InsertCompany,
  type CostCenter,
  type InsertCostCenter,
  type Client,
  type InsertClient,
  type ClientEmployee,
  type InsertClientEmployee,
  type SelectClientDashboardPermission,
  type InsertClientDashboardPermission,
  type SelectClientProfessionLimit,
  type InsertClientProfessionLimit,
  type Employee,
  type InsertEmployee,
  type Job,
  type InsertJob,
  type JobWithDetails,
  type CompanyWithCostCenters,
  type Candidate,
  type InsertCandidate,
  type Application,
  type InsertApplication,
  type ApplicationWithDetails,
  type SelectionStage,
  type InsertSelectionStage,
  type Interview,
  type InsertInterview,
  type InterviewWithDetails,
  type InterviewCriteria,
  type InsertInterviewCriteria,
  type ApplicationStageProgress,
  type InsertApplicationStageProgress,
  type UserCompanyRole,
  type InsertUserCompanyRole,
  type RolePermission,
  type InsertRolePermission,
  type UserMenuPermission,
  type InsertUserMenuPermission,
  type RoleJobStatusPermission,
  type InsertRoleJobStatusPermission,
  type Profession,
  type InsertProfession,
  type SelectionProcessMetrics,
  type InterviewCalendarResponse,
  type SystemSetting,
  type InsertSystemSetting,
  type IntegrationSetting,
  type InsertIntegrationSetting,
  type ApprovalWorkflow,
  type InsertApprovalWorkflow,
  type ApprovalWorkflowStep,
  type InsertApprovalWorkflowStep,
  type WorkflowJobStatusRule,
  type InsertWorkflowJobStatusRule,
  type JobApprovalHistory,
  type InsertJobApprovalHistory,
  type BlacklistCandidate,
  type InsertBlacklistCandidate,
  type SeniorIntegrationSetting,
  type InsertSeniorIntegrationSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, or, ilike, sql, inArray, isNull } from "drizzle-orm";
import { createSeniorIntegrationService } from "./services/seniorIntegration";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Authentication operations (for local auth)
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: { email: string; passwordHash: string; firstName?: string; lastName?: string; role?: string }): Promise<User>;
  updateUser(id: string, user: { email?: string; firstName?: string; lastName?: string; role?: string }): Promise<User>;
  updateUserPassword(id: string, passwordHash: string): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getRecruiters(): Promise<User[]>;
  
  // Company operations
  getCompanies(): Promise<CompanyWithCostCenters[]>;
  getCompany(id: string): Promise<CompanyWithCostCenters | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: string): Promise<void>;
  
  // Cost Center operations
  getCostCentersByCompany(companyId: string): Promise<CostCenter[]>;
  createCostCenter(costCenter: InsertCostCenter): Promise<CostCenter>;
  updateCostCenter(id: string, costCenter: Partial<InsertCostCenter>): Promise<CostCenter>;
  deleteCostCenter(id: string): Promise<void>;
  
  // Employee operations
  getEmployeesByCompany(companyId: string): Promise<Employee[]>;
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  
  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;
  
  // Client Employee operations
  getClientEmployees(clientId: string): Promise<ClientEmployee[]>;
  getClientEmployee(id: string): Promise<ClientEmployee | undefined>;
  createClientEmployee(employee: InsertClientEmployee): Promise<ClientEmployee>;
  updateClientEmployee(id: string, employee: Partial<InsertClientEmployee>): Promise<ClientEmployee>;
  deleteClientEmployee(id: string): Promise<void>;
  
  // Client Dashboard Permissions operations
  getClientDashboardPermissions(clientId: string): Promise<SelectClientDashboardPermission[]>;
  getAllClientDashboardPermissions(): Promise<SelectClientDashboardPermission[]>;
  upsertClientDashboardPermission(permission: InsertClientDashboardPermission): Promise<SelectClientDashboardPermission>;
  deleteClientDashboardPermission(id: string): Promise<void>;
  
  // Client Profession Limits operations
  getClientProfessionLimits(clientId: string): Promise<SelectClientProfessionLimit[]>;
  getClientProfessionLimit(clientId: string, professionId: string): Promise<SelectClientProfessionLimit | undefined>;
  upsertClientProfessionLimit(limit: InsertClientProfessionLimit): Promise<SelectClientProfessionLimit>;
  deleteClientProfessionLimit(id: string): Promise<void>;
  deleteAllClientProfessionLimits(clientId: string): Promise<void>;
  countActiveJobsByClientAndProfession(clientId: string, professionId: string): Promise<number>;
  
  // Profession operations
  getProfessions(): Promise<Profession[]>;
  getProfessionsByCategory(category: string): Promise<Profession[]>;
  getProfession(id: string): Promise<Profession | undefined>;
  createProfession(profession: InsertProfession): Promise<Profession>;
  updateProfession(id: string, profession: Partial<InsertProfession>): Promise<Profession>;
  deleteProfession(id: string): Promise<void>;

  // Work Scale operations
  getWorkScales(includeInactive?: boolean): Promise<any[]>;
  getWorkScale(id: string): Promise<any | undefined>;
  createWorkScale(workScale: any): Promise<any>;
  updateWorkScale(id: string, workScale: Partial<any>): Promise<any>;
  deleteWorkScale(id: string): Promise<void>;

  // Job Status operations
  getJobStatuses(includeInactive?: boolean): Promise<any[]>;
  getJobStatus(id: string): Promise<any | undefined>;
  createJobStatus(jobStatus: any): Promise<any>;
  updateJobStatus(id: string, jobStatus: Partial<any>): Promise<any>;
  deleteJobStatus(id: string): Promise<void>;

  // Status Notification Settings operations
  getStatusNotificationSettings(): Promise<any[]>;
  upsertStatusNotificationSetting(statusId: string, emailNotificationEnabled?: boolean, whatsappNotificationEnabled?: boolean): Promise<any>;

  // Integration Settings operations
  getIntegrationSettings(integrationType?: string): Promise<IntegrationSetting[]>;
  upsertIntegrationSetting(integrationType: string, configKey: string, configValue: string): Promise<IntegrationSetting>;
  deleteIntegrationSetting(id: string): Promise<void>;

  // Benefit operations
  getBenefits(includeInactive?: boolean): Promise<any[]>;
  getBenefit(id: string): Promise<any | undefined>;
  createBenefit(benefit: any): Promise<any>;
  updateBenefit(id: string, benefit: Partial<any>): Promise<any>;
  deleteBenefit(id: string): Promise<void>;

  // Candidate operations
  getCandidates(): Promise<Candidate[]>;
  getCandidate(id: string): Promise<Candidate | undefined>;
  getCandidateByEmail(email: string): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: string, candidate: Partial<InsertCandidate>): Promise<Candidate>;
  deleteCandidate(id: string): Promise<void>;

  // Job operations
  getJobs(limit?: number, offset?: number, search?: string, status?: string, companyId?: string, professionId?: string, recruiterId?: string): Promise<JobWithDetails[]>;
  getJob(id: string): Promise<JobWithDetails | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: string): Promise<void>;
  completeJob(id: string): Promise<Job>;
  
  // Job status history operations
  createJobStatusHistory(history: { jobId: string; previousStatus?: string; newStatus: string; changedBy?: string }): Promise<void>;
  getJobStatusHistory(jobId: string): Promise<Array<{ id: string; previousStatus: string | null; newStatus: string; changedBy: string | null; changedAt: Date; changerName: string | null; changerEmail: string | null }>>;
  
  // Application operations
  getApplicationsByJob(jobId: string): Promise<Application[]>;
  getApplicationWithDetails(id: string): Promise<ApplicationWithDetails | undefined>;
  getApplicationsWithJobDetails(): Promise<any[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: string, status: string): Promise<Application>;
  updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application>;
  
  // Selection Stages operations
  getSelectionStagesByJob(jobId: string): Promise<SelectionStage[]>;
  createSelectionStage(stage: InsertSelectionStage): Promise<SelectionStage>;
  updateSelectionStage(id: string, stage: Partial<InsertSelectionStage>): Promise<SelectionStage>;
  deleteSelectionStage(id: string): Promise<void>;
  setupDefaultSelectionStages(jobId: string): Promise<void>;
  
  // Interview operations
  getInterviewsByApplication(applicationId: string): Promise<InterviewWithDetails[]>;
  getInterviewWithDetails(id: string): Promise<InterviewWithDetails | undefined>;
  getUpcomingInterviews(interviewerId?: string): Promise<InterviewWithDetails[]>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: string, interview: Partial<InsertInterview>): Promise<Interview>;
  deleteInterview(id: string): Promise<void>;
  
  // System Settings operations
  getSystemSettings(): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  upsertSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  updateSystemSettingValue(key: string, value: string): Promise<SystemSetting>;
  
  // Approval Workflow operations
  getApprovalWorkflows(): Promise<ApprovalWorkflow[]>;
  getApprovalWorkflow(id: string): Promise<ApprovalWorkflow | undefined>;
  createApprovalWorkflow(workflow: InsertApprovalWorkflow): Promise<ApprovalWorkflow>;
  updateApprovalWorkflow(id: string, workflow: Partial<InsertApprovalWorkflow>): Promise<ApprovalWorkflow>;
  deleteApprovalWorkflow(id: string): Promise<void>;
  
  // Approval Workflow Steps operations
  getWorkflowSteps(workflowId: string): Promise<ApprovalWorkflowStep[]>;
  createWorkflowStep(step: InsertApprovalWorkflowStep): Promise<ApprovalWorkflowStep>;
  updateWorkflowStep(id: string, step: Partial<InsertApprovalWorkflowStep>): Promise<ApprovalWorkflowStep>;
  deleteWorkflowStep(id: string): Promise<void>;
  
  // Workflow Job Status Rules operations
  getWorkflowJobStatusRules(workflowId: string): Promise<WorkflowJobStatusRule[]>;
  createWorkflowJobStatusRule(ruleData: InsertWorkflowJobStatusRule): Promise<WorkflowJobStatusRule>;
  deleteWorkflowJobStatusRule(id: string): Promise<void>;
  deleteWorkflowJobStatusRulesByWorkflow(workflowId: string): Promise<void>;
  
  // Job Approval History operations
  getJobApprovalHistory(jobId: string): Promise<JobApprovalHistory[]>;
  createJobApprovalHistory(history: InsertJobApprovalHistory): Promise<JobApprovalHistory>;
  updateJobApprovalHistory(id: string, history: Partial<InsertJobApprovalHistory>): Promise<JobApprovalHistory>;
  
  // Approvals operations (for Approvals menu)
  getPendingApprovalsForUser(userId: string): Promise<any[]>;
  approveJob(jobId: string, userId: string, comments?: string): Promise<any>;
  rejectJob(jobId: string, userId: string, reason: string): Promise<any>;
  getAllApprovalHistory(): Promise<any[]>;
  
  // Interview Criteria operations
  getInterviewCriteria(interviewId: string): Promise<InterviewCriteria[]>;
  createInterviewCriteria(criteria: InsertInterviewCriteria): Promise<InterviewCriteria>;
  updateInterviewCriteria(id: string, criteria: Partial<InsertInterviewCriteria>): Promise<InterviewCriteria>;
  
  // Application Stage Progress operations
  getApplicationProgress(applicationId: string): Promise<ApplicationStageProgress[]>;
  createStageProgress(progress: InsertApplicationStageProgress): Promise<ApplicationStageProgress>;
  updateStageProgress(id: string, progress: Partial<InsertApplicationStageProgress>): Promise<ApplicationStageProgress>;
  advanceApplicationStage(applicationId: string, stageId: string, score: number, feedback?: string): Promise<void>;
  
  // Analytics operations
  getDashboardMetrics(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<{
    totalJobs: number;
    activeJobs: number;
    closedJobs: number;
    totalApplications: number;
    totalCompanies: number;
    openJobsCurrentMonth: number;
  }>;
  
  getJobsByStatus(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<Array<{ status: string; count: number }>>;
  getApplicationsByMonth(): Promise<Array<{ month: string; count: number }>>;
  getOpenJobsByMonth(): Promise<Array<{ month: string; count: number }>>;
  getJobsByCreator(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<Array<{ creatorId: string; creatorName: string; count: number }>>;
  getAllJobsByCreator(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<Array<{ creatorId: string; creatorName: string; count: number }>>;
  getJobsByCompany(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<Array<{ companyId: string; companyName: string; count: number }>>;
  getJobsByClient(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<Array<{ clientId: string; clientName: string; count: number }>>;
  getJobsSLA(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<{ withinSLA: number; outsideSLA: number }>;
  getJobsProductivity(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<{ productive: number; unproductive: number }>;
  getJobsStatusSummary(month?: string): Promise<Array<{ status: string; count: number }>>;
  
  // Selection process analytics
  getSelectionProcessMetrics(companyId?: string, timeframe?: string): Promise<SelectionProcessMetrics>;
  getInterviewCalendar(interviewerId?: string): Promise<InterviewCalendarResponse>;
  getApplicationStatusDistribution(): Promise<Array<{ status: string; count: number }>>;
  getAverageTimeToHire(companyId?: string): Promise<number>;
  getConversionRates(companyId?: string): Promise<{
    applicationToInterview: number;
    interviewToOffer: number;
    offerToHire: number;
  }>;
  
  // Permission operations
  getUserCompanyRoles(userId: string): Promise<UserCompanyRole[]>;
  getUserCompanyRoleById(id: string): Promise<UserCompanyRole | undefined>;
  getUserPermissions(userId: string, companyId: string): Promise<string[]>;
  assignUserToCompany(assignment: InsertUserCompanyRole): Promise<UserCompanyRole>;
  updateUserCompanyRole(id: string, role: string): Promise<UserCompanyRole>;
  removeUserFromCompany(userId: string, companyId: string): Promise<void>;
  getRolePermissions(): Promise<RolePermission[]>;
  setupDefaultRolePermissions(): Promise<void>;
  checkUserPermission(userId: string, companyId: string, permission: string): Promise<boolean>;
  addRolePermission(role: string, permission: string): Promise<RolePermission>;
  removeRolePermission(role: string, permission: string): Promise<void>;
  toggleRolePermission(role: string, permission: string, isGranted: boolean): Promise<RolePermission>;
  
  // Menu permission operations
  getUserMenuPermissions(userId: string): Promise<UserMenuPermission[]>;
  getUserAccessibleMenus(userId: string): Promise<string[] | null>;
  createUserMenuPermission(permission: InsertUserMenuPermission): Promise<UserMenuPermission>;
  updateUserMenuPermission(id: string, canAccess: boolean): Promise<UserMenuPermission>;
  deleteUserMenuPermission(id: string): Promise<void>;
  setDefaultMenuPermissions(userId: string): Promise<void>;
  bulkUpdateUserMenuPermissions(userId: string, menuPermissions: Array<{ menuPath: string; menuName: string; canAccess: boolean }>): Promise<void>;
  
  // Role job status permission operations
  getRoleJobStatusPermissions(role?: string): Promise<RoleJobStatusPermission[]>;
  createRoleJobStatusPermission(permission: InsertRoleJobStatusPermission): Promise<RoleJobStatusPermission>;
  updateRoleJobStatusPermission(id: string, permission: Partial<InsertRoleJobStatusPermission>): Promise<RoleJobStatusPermission>;
  deleteRoleJobStatusPermission(id: string): Promise<void>;
  bulkUpdateRoleJobStatusPermissions(role: string, permissions: Array<{ jobStatusId: string; canView: boolean; canEdit: boolean }>): Promise<void>;
  
  // Job closure report
  getJobClosureReport(): Promise<any[]>;
  getClosedJobsByRecruiter(): Promise<any[]>;
  
  // Kanban Board operations
  getKanbanBoards(): Promise<any[]>;
  getKanbanBoard(id: string): Promise<any | undefined>;
  createKanbanBoard(board: any): Promise<any>;
  updateKanbanBoard(id: string, board: Partial<any>): Promise<any>;
  deleteKanbanBoard(id: string): Promise<void>;
  getKanbanStages(kanbanBoardId: string): Promise<any[]>;
  createKanbanStage(stage: any): Promise<any>;
  updateKanbanStage(id: string, stage: Partial<any>): Promise<any>;
  deleteKanbanStage(id: string): Promise<void>;
  reorderKanbanStages(stageUpdates: Array<{ id: string; order: number }>): Promise<void>;
  
  // Real-time dashboard operations
  getClientRealtimeData(clientId: string): Promise<any>;
  
  // Organization operations (Multi-tenant support)
  getOrganizations(): Promise<Organization[]>;
  getOrganization(id: string): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  updateOrganization(id: string, organization: Partial<InsertOrganization>): Promise<Organization>;
  deleteOrganization(id: string): Promise<void>;
  
  // Financial operations (Invoices and Payments)
  getInvoices(): Promise<Invoice[]>;
  getInvoicesByOrganization(organizationId: string): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<void>;
  markInvoiceAsPaid(id: string, paidDate: Date, paymentMethod: string): Promise<Invoice>;
  
  // Payment History operations
  getPaymentsByInvoice(invoiceId: string): Promise<PaymentHistory[]>;
  createPayment(payment: InsertPaymentHistory): Promise<PaymentHistory>;
  
  // Plan operations
  getPlans(): Promise<Plan[]>;
  getPlan(id: string): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: string, plan: Partial<InsertPlan>): Promise<Plan>;
  deletePlan(id: string): Promise<void>;
  
  // Blacklist Candidates operations
  getBlacklistCandidates(): Promise<BlacklistCandidate[]>;
  getBlacklistCandidate(id: string): Promise<BlacklistCandidate | undefined>;
  getBlacklistCandidateByCPF(cpf: string): Promise<BlacklistCandidate | undefined>;
  createBlacklistCandidate(candidate: InsertBlacklistCandidate): Promise<BlacklistCandidate>;
  updateBlacklistCandidate(id: string, candidate: Partial<InsertBlacklistCandidate>): Promise<BlacklistCandidate>;
  deleteBlacklistCandidate(id: string): Promise<void>;
  
  // Senior HCM Integration operations
  getSeniorIntegrationSettings(organizationId: string): Promise<SeniorIntegrationSetting | undefined>;
  createOrUpdateSeniorIntegrationSettings(organizationId: string, settings: InsertSeniorIntegrationSetting): Promise<SeniorIntegrationSetting>;
  updateSeniorIntegrationSyncStatus(organizationId: string, status: string, message: string | null, error: string | null): Promise<void>;
  testSeniorConnection(organizationId: string): Promise<{ success: boolean; health: boolean; tablesCount: number; employeesCount: number; error?: string }>;
  getSeniorEmployees(organizationId: string): Promise<any[]>;
  getSeniorDepartments(organizationId: string): Promise<any[]>;
  getSeniorPositions(organizationId: string): Promise<any[]>;
  executeSeniorQuery(organizationId: string, sqlText: string): Promise<any[]>;
  syncSeniorData(organizationId: string): Promise<{ success: boolean; message: string; syncedAt?: Date; error?: string }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return allUsers;
  }

  // Authentication operations (for local auth)
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: { email: string; passwordHash: string; firstName?: string; lastName?: string; role?: string }): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async updateUser(id: string, user: { email?: string; firstName?: string; lastName?: string; role?: string }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserPassword(id: string, passwordHash: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Get users that can be assigned as recruiters
  async getRecruiters(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Company operations
  async getCompanies(): Promise<CompanyWithCostCenters[]> {
    const companiesWithCounts = await db
      .select({
        id: companies.id,
        name: companies.name,
        description: companies.description,
        website: companies.website,
        logo: companies.logo,
        createdAt: companies.createdAt,
        updatedAt: companies.updatedAt,
        jobsCount: count(jobs.id),
      })
      .from(companies)
      .leftJoin(jobs, eq(companies.id, jobs.companyId))
      .groupBy(companies.id)
      .orderBy(desc(companies.createdAt));

    const companiesWithCostCenters = await Promise.all(
      companiesWithCounts.map(async (company) => {
        const costCentersList = await this.getCostCentersByCompany(company.id);
        return {
          ...company,
          costCenters: costCentersList,
        };
      })
    );

    return companiesWithCostCenters;
  }

  async getCompany(id: string): Promise<CompanyWithCostCenters | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    if (!company) return undefined;

    const costCentersList = await this.getCostCentersByCompany(id);
    const [jobsCount] = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.companyId, id));

    return {
      ...company,
      costCenters: costCentersList,
      jobsCount: jobsCount.count,
    };
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company> {
    const [updatedCompany] = await db
      .update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async deleteCompany(id: string): Promise<void> {
    await db.delete(companies).where(eq(companies.id, id));
  }

  // Cost Center operations
  async getCostCentersByCompany(companyId: string): Promise<CostCenter[]> {
    return await db
      .select()
      .from(costCenters)
      .where(eq(costCenters.companyId, companyId))
      .orderBy(costCenters.name);
  }

  async createCostCenter(costCenter: InsertCostCenter): Promise<CostCenter> {
    const [newCostCenter] = await db.insert(costCenters).values(costCenter).returning();
    return newCostCenter;
  }

  async updateCostCenter(id: string, costCenter: Partial<InsertCostCenter>): Promise<CostCenter> {
    const [updatedCostCenter] = await db
      .update(costCenters)
      .set({ ...costCenter, updatedAt: new Date() })
      .where(eq(costCenters.id, id))
      .returning();
    return updatedCostCenter;
  }

  async deleteCostCenter(id: string): Promise<void> {
    await db.delete(costCenters).where(eq(costCenters.id, id));
  }

  // Employee operations
  async getEmployeesByCompany(companyId: string): Promise<Employee[]> {
    return await db
      .select()
      .from(employees)
      .where(and(eq(employees.companyId, companyId), eq(employees.isActive, true)))
      .orderBy(employees.name);
  }

  async getEmployees(): Promise<Employee[]> {
    return await db
      .select()
      .from(employees)
      .where(eq(employees.isActive, true))
      .orderBy(employees.name);
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  // Client operations
  async getClients(): Promise<Client[]> {
    const clientsData = await db
      .select()
      .from(clients)
      .where(eq(clients.isActive, true))
      .orderBy(clients.name);
    
    // Get job count for each client
    const clientsWithJobCount = await Promise.all(
      clientsData.map(async (client) => {
        const jobsCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(jobs)
          .where(eq(jobs.clientId, client.id));
        
        return {
          ...client,
          jobsCount: Number(jobsCount[0]?.count || 0),
        };
      })
    );
    
    return clientsWithJobCount;
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set({ ...client, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: string): Promise<void> {
    // Soft delete
    await db
      .update(clients)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(clients.id, id));
  }

  // Client Employee operations
  async getClientEmployees(clientId: string): Promise<ClientEmployee[]> {
    return await db
      .select()
      .from(clientEmployees)
      .where(eq(clientEmployees.clientId, clientId))
      .orderBy(clientEmployees.name);
  }

  async getClientEmployee(id: string): Promise<ClientEmployee | undefined> {
    const [employee] = await db.select().from(clientEmployees).where(eq(clientEmployees.id, id));
    return employee;
  }

  async createClientEmployee(employee: InsertClientEmployee): Promise<ClientEmployee> {
    const [newEmployee] = await db.insert(clientEmployees).values(employee).returning();
    return newEmployee;
  }

  async updateClientEmployee(id: string, employee: Partial<InsertClientEmployee>): Promise<ClientEmployee> {
    const [updatedEmployee] = await db
      .update(clientEmployees)
      .set({ ...employee, updatedAt: new Date() })
      .where(eq(clientEmployees.id, id))
      .returning();
    return updatedEmployee;
  }

  async deleteClientEmployee(id: string): Promise<void> {
    await db.delete(clientEmployees).where(eq(clientEmployees.id, id));
  }

  // Client Dashboard Permissions operations
  async getClientDashboardPermissions(clientId: string): Promise<SelectClientDashboardPermission[]> {
    return await db
      .select()
      .from(clientDashboardPermissions)
      .where(eq(clientDashboardPermissions.clientId, clientId))
      .orderBy(clientDashboardPermissions.dashboardKey);
  }

  async getAllClientDashboardPermissions(): Promise<SelectClientDashboardPermission[]> {
    return await db
      .select()
      .from(clientDashboardPermissions)
      .orderBy(clientDashboardPermissions.clientId, clientDashboardPermissions.dashboardKey);
  }

  async upsertClientDashboardPermission(permission: InsertClientDashboardPermission): Promise<SelectClientDashboardPermission> {
    // Check if permission already exists
    const [existing] = await db
      .select()
      .from(clientDashboardPermissions)
      .where(
        and(
          eq(clientDashboardPermissions.clientId, permission.clientId),
          eq(clientDashboardPermissions.dashboardKey, permission.dashboardKey)
        )
      );

    if (existing) {
      // Update existing permission
      const [updated] = await db
        .update(clientDashboardPermissions)
        .set({ ...permission, updatedAt: new Date() })
        .where(eq(clientDashboardPermissions.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new permission
      const [created] = await db
        .insert(clientDashboardPermissions)
        .values(permission)
        .returning();
      return created;
    }
  }

  async deleteClientDashboardPermission(id: string): Promise<void> {
    await db.delete(clientDashboardPermissions).where(eq(clientDashboardPermissions.id, id));
  }

  // Client Profession Limits operations
  async getClientProfessionLimits(clientId: string): Promise<SelectClientProfessionLimit[]> {
    return await db
      .select()
      .from(clientProfessionLimits)
      .where(eq(clientProfessionLimits.clientId, clientId))
      .orderBy(clientProfessionLimits.professionId);
  }

  async getClientProfessionLimit(clientId: string, professionId: string): Promise<SelectClientProfessionLimit | undefined> {
    const [limit] = await db
      .select()
      .from(clientProfessionLimits)
      .where(
        and(
          eq(clientProfessionLimits.clientId, clientId),
          eq(clientProfessionLimits.professionId, professionId)
        )
      );
    return limit;
  }

  async upsertClientProfessionLimit(limit: InsertClientProfessionLimit): Promise<SelectClientProfessionLimit> {
    // Check if limit already exists
    const [existing] = await db
      .select()
      .from(clientProfessionLimits)
      .where(
        and(
          eq(clientProfessionLimits.clientId, limit.clientId),
          eq(clientProfessionLimits.professionId, limit.professionId)
        )
      );

    if (existing) {
      // Update existing limit
      const [updated] = await db
        .update(clientProfessionLimits)
        .set({ maxJobs: limit.maxJobs, updatedAt: new Date() })
        .where(eq(clientProfessionLimits.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new limit
      const [created] = await db
        .insert(clientProfessionLimits)
        .values(limit)
        .returning();
      return created;
    }
  }

  async deleteClientProfessionLimit(id: string): Promise<void> {
    await db.delete(clientProfessionLimits).where(eq(clientProfessionLimits.id, id));
  }

  async deleteAllClientProfessionLimits(clientId: string): Promise<void> {
    await db.delete(clientProfessionLimits).where(eq(clientProfessionLimits.clientId, clientId));
  }

  async countActiveJobsByClientAndProfession(clientId: string, professionId: string): Promise<number> {
    // Status que consideram a vaga como "ativa" (não concluída/cancelada)
    const activeStatuses = [
      'nova_vaga',
      'aprovada', 
      'em_recrutamento',
      'em_dp',
      'em_admissao'
    ];
    
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(
        and(
          eq(jobs.clientId, clientId),
          eq(jobs.professionId, professionId),
          inArray(jobs.status, activeStatuses)
        )
      );
    
    return Number(result[0]?.count || 0);
  }

  // Profession operations
  async getProfessions(): Promise<Profession[]> {
    return await db.select().from(professions).where(eq(professions.isActive, true)).orderBy(professions.name);
  }

  async getProfessionsByCategory(category: string): Promise<Profession[]> {
    return await db.select().from(professions)
      .where(and(eq(professions.category, category), eq(professions.isActive, true)))
      .orderBy(professions.name);
  }

  async getProfession(id: string): Promise<Profession | undefined> {
    const [profession] = await db.select().from(professions).where(eq(professions.id, id));
    return profession;
  }

  async createProfession(profession: InsertProfession): Promise<Profession> {
    const [newProfession] = await db.insert(professions).values(profession).returning();
    return newProfession;
  }

  async updateProfession(id: string, profession: Partial<InsertProfession>): Promise<Profession> {
    const [updatedProfession] = await db
      .update(professions)
      .set({ ...profession, updatedAt: new Date() })
      .where(eq(professions.id, id))
      .returning();
    return updatedProfession;
  }

  async deleteProfession(id: string): Promise<void> {
    await db.delete(professions).where(eq(professions.id, id));
  }

  // Work Scale operations
  async getWorkScales(includeInactive = false): Promise<any[]> {
    if (includeInactive) {
      return await db.select().from(workScales).orderBy(workScales.name);
    }
    return await db.select().from(workScales).where(eq(workScales.isActive, true)).orderBy(workScales.name);
  }

  async getWorkScale(id: string): Promise<any | undefined> {
    const [workScale] = await db.select().from(workScales).where(eq(workScales.id, id));
    return workScale;
  }

  async createWorkScale(workScale: any): Promise<any> {
    const [newWorkScale] = await db.insert(workScales).values(workScale).returning();
    return newWorkScale;
  }

  async updateWorkScale(id: string, workScale: Partial<any>): Promise<any> {
    const [updatedWorkScale] = await db
      .update(workScales)
      .set({ ...workScale, updatedAt: new Date() })
      .where(eq(workScales.id, id))
      .returning();
    return updatedWorkScale;
  }

  async deleteWorkScale(id: string): Promise<void> {
    await db.update(workScales)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(workScales.id, id));
  }

  // Job Status operations
  async getJobStatuses(includeInactive = false): Promise<any[]> {
    if (includeInactive) {
      return await db.select().from(jobStatuses).orderBy(jobStatuses.displayOrder, jobStatuses.label);
    }
    return await db.select().from(jobStatuses).where(eq(jobStatuses.isActive, true)).orderBy(jobStatuses.displayOrder, jobStatuses.label);
  }

  async getJobStatus(id: string): Promise<any | undefined> {
    const [jobStatus] = await db.select().from(jobStatuses).where(eq(jobStatuses.id, id));
    return jobStatus;
  }

  async createJobStatus(jobStatus: any): Promise<any> {
    const [newJobStatus] = await db.insert(jobStatuses).values(jobStatus).returning();
    
    // Automatically create permissions for all roles when a new status is created
    const allRoles: ('admin' | 'hr_manager' | 'recruiter' | 'interviewer' | 'viewer' | 'approver' | 'manager')[] = 
      ['admin', 'hr_manager', 'recruiter', 'interviewer', 'viewer', 'approver', 'manager'];
    
    // Create permissions for each role
    // Admin gets full access (view + edit), others get view-only by default
    const permissionsToCreate = allRoles.map(role => ({
      role,
      jobStatusId: newJobStatus.id,
      canView: true, // All roles can view by default
      canEdit: role === 'admin', // Only admin can edit by default
    }));
    
    await db.insert(roleJobStatusPermissions).values(permissionsToCreate);
    
    console.log(`✅ Auto-created ${allRoles.length} role permissions for new job status: ${newJobStatus.label}`);
    
    return newJobStatus;
  }

  async updateJobStatus(id: string, jobStatus: Partial<any>): Promise<any> {
    const [updatedJobStatus] = await db
      .update(jobStatuses)
      .set({ ...jobStatus, updatedAt: new Date() })
      .where(eq(jobStatuses.id, id))
      .returning();
    return updatedJobStatus;
  }

  async deleteJobStatus(id: string): Promise<void> {
    await db.update(jobStatuses)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(jobStatuses.id, id));
  }

  // Status Notification Settings operations
  async getStatusNotificationSettings(): Promise<any[]> {
    const statuses = await db.select().from(jobStatuses).where(eq(jobStatuses.isActive, true)).orderBy(jobStatuses.displayOrder, jobStatuses.label);
    const settings = await db.select().from(statusNotificationSettings);
    
    // Map each status with its notification setting (or default if not found)
    return statuses.map(status => {
      const setting = settings.find(s => s.statusId === status.id);
      return {
        ...status,
        emailNotificationEnabled: setting?.emailNotificationEnabled || false,
        whatsappNotificationEnabled: setting?.whatsappNotificationEnabled || false,
        notificationSettingId: setting?.id || null,
      };
    });
  }

  async upsertStatusNotificationSetting(statusId: string, emailNotificationEnabled?: boolean, whatsappNotificationEnabled?: boolean): Promise<any> {
    // Check if setting already exists
    const [existing] = await db
      .select()
      .from(statusNotificationSettings)
      .where(eq(statusNotificationSettings.statusId, statusId));

    const updateData: any = { updatedAt: new Date() };
    if (emailNotificationEnabled !== undefined) {
      updateData.emailNotificationEnabled = emailNotificationEnabled;
    }
    if (whatsappNotificationEnabled !== undefined) {
      updateData.whatsappNotificationEnabled = whatsappNotificationEnabled;
    }

    if (existing) {
      // Update existing setting
      const [updated] = await db
        .update(statusNotificationSettings)
        .set(updateData)
        .where(eq(statusNotificationSettings.statusId, statusId))
        .returning();
      return updated;
    } else {
      // Create new setting
      const [created] = await db
        .insert(statusNotificationSettings)
        .values({ 
          statusId, 
          emailNotificationEnabled: emailNotificationEnabled || false,
          whatsappNotificationEnabled: whatsappNotificationEnabled || false
        })
        .returning();
      return created;
    }
  }

  // Integration Settings operations
  async getIntegrationSettings(integrationType?: string): Promise<IntegrationSetting[]> {
    if (integrationType) {
      return await db
        .select()
        .from(integrationSettings)
        .where(eq(integrationSettings.integrationType, integrationType))
        .orderBy(integrationSettings.configKey);
    }
    return await db.select().from(integrationSettings).orderBy(integrationSettings.integrationType, integrationSettings.configKey);
  }

  async upsertIntegrationSetting(integrationType: string, configKey: string, configValue: string): Promise<IntegrationSetting> {
    // Check if setting already exists
    const [existing] = await db
      .select()
      .from(integrationSettings)
      .where(
        and(
          eq(integrationSettings.integrationType, integrationType),
          eq(integrationSettings.configKey, configKey)
        )
      );

    if (existing) {
      // Update existing setting
      const [updated] = await db
        .update(integrationSettings)
        .set({ configValue, updatedAt: new Date() })
        .where(eq(integrationSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new setting
      const [created] = await db
        .insert(integrationSettings)
        .values({ integrationType, configKey, configValue })
        .returning();
      return created;
    }
  }

  async deleteIntegrationSetting(id: string): Promise<void> {
    await db.delete(integrationSettings).where(eq(integrationSettings.id, id));
  }

  // Benefit operations
  async getBenefits(includeInactive = false): Promise<any[]> {
    if (includeInactive) {
      return await db.select().from(benefits).orderBy(benefits.name);
    }
    return await db.select().from(benefits).where(eq(benefits.isActive, true)).orderBy(benefits.name);
  }

  async getBenefit(id: string): Promise<any | undefined> {
    const [benefit] = await db.select().from(benefits).where(eq(benefits.id, id));
    return benefit;
  }

  async createBenefit(benefit: any): Promise<any> {
    const [newBenefit] = await db.insert(benefits).values(benefit).returning();
    return newBenefit;
  }

  async updateBenefit(id: string, benefit: Partial<any>): Promise<any> {
    const [updatedBenefit] = await db
      .update(benefits)
      .set({ ...benefit, updatedAt: new Date() })
      .where(eq(benefits.id, id))
      .returning();
    return updatedBenefit;
  }

  async deleteBenefit(id: string): Promise<void> {
    await db.update(benefits)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(benefits.id, id));
  }

  // Candidate operations
  async getCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates).orderBy(desc(candidates.createdAt));
  }

  async getCandidate(id: string): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate;
  }

  async getCandidateByEmail(email: string): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.email, email));
    return candidate;
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [newCandidate] = await db.insert(candidates).values(candidate).returning();
    return newCandidate;
  }

  async updateCandidate(id: string, candidate: Partial<InsertCandidate>): Promise<Candidate> {
    const [updatedCandidate] = await db
      .update(candidates)
      .set(candidate)
      .where(eq(candidates.id, id))
      .returning();
    return updatedCandidate;
  }

  async deleteCandidate(id: string): Promise<void> {
    await db.delete(candidates).where(eq(candidates.id, id));
  }

  // Job operations
  async getJobs(limit = 50, offset = 0, search?: string, status?: string, companyId?: string, professionId?: string, recruiterId?: string): Promise<JobWithDetails[]> {
    let baseQuery = db
      .select({
        id: jobs.id,
        jobCode: jobs.jobCode,
        title: jobs.title,
        professionId: jobs.professionId,
        description: jobs.description,
        requirements: jobs.requirements,
        companyId: jobs.companyId,
        costCenterId: jobs.costCenterId,
        recruiterId: jobs.recruiterId,
        department: jobs.department,
        location: jobs.location,
        contractType: jobs.contractType,
        salaryMin: jobs.salaryMin,

        status: jobs.status,
        createdBy: jobs.createdBy,
        expiresAt: jobs.expiresAt,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        completedAt: jobs.completedAt,
        startDate: jobs.startDate,
        admissionDate: jobs.admissionDate,
        hiredCandidateId: jobs.hiredCandidateId,
        createdWithIrregularity: jobs.createdWithIrregularity,
        profession: {
          id: professions.id,
          name: professions.name,
          description: professions.description,
          category: professions.category,
          isActive: professions.isActive,
          createdAt: professions.createdAt,
          updatedAt: professions.updatedAt,
        },
        company: {
          id: companies.id,
          name: companies.name,
          description: companies.description,
          website: companies.website,
          logo: companies.logo,
          createdAt: companies.createdAt,
          updatedAt: companies.updatedAt,
        },
        recruiter: {
          id: sql<string>`recruiter_users.id`,
          firstName: sql<string>`recruiter_users.first_name`,
          lastName: sql<string>`recruiter_users.last_name`,
          email: sql<string>`recruiter_users.email`,
        },
        creator: {
          id: sql<string>`creator_users.id`,
          firstName: sql<string>`creator_users.first_name`,
          lastName: sql<string>`creator_users.last_name`,
          email: sql<string>`creator_users.email`,
        },
        applicationsCount: count(applications.id),
        hasDpCandidate: sql<boolean>`COALESCE(SUM(CASE WHEN kanban_stages.name = 'DP' OR kanban_stages.name = 'Departamento Pessoal' THEN 1 ELSE 0 END), 0) > 0`,
      })
      .from(jobs)
      .leftJoin(professions, eq(jobs.professionId, professions.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(sql`users as recruiter_users`, eq(jobs.recruiterId, sql`recruiter_users.id`))
      .leftJoin(sql`users as creator_users`, eq(jobs.createdBy, sql`creator_users.id`))
      .leftJoin(applications, eq(jobs.id, applications.jobId))
      .leftJoin(kanbanStages, eq(applications.kanbanStageId, kanbanStages.id))
      .groupBy(
        jobs.id, 
        professions.id, 
        companies.id, 
        sql`recruiter_users.id`,
        sql`recruiter_users.first_name`,
        sql`recruiter_users.last_name`,
        sql`recruiter_users.email`,
        sql`creator_users.id`,
        sql`creator_users.first_name`,
        sql`creator_users.last_name`,
        sql`creator_users.email`
      );

    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          ilike(jobs.jobCode, `%${search}%`),
          ilike(jobs.title, `%${search}%`),
          ilike(professions.name, `%${search}%`),
          ilike(professions.category, `%${search}%`),
          ilike(companies.name, `%${search}%`)
        )
      );
    }

    if (status) {
      whereConditions.push(eq(jobs.status, status));
    }

    if (companyId) {
      whereConditions.push(eq(jobs.companyId, companyId));
    }

    if (professionId) {
      whereConditions.push(eq(jobs.professionId, professionId));
    }

    if (recruiterId) {
      whereConditions.push(eq(jobs.recruiterId, recruiterId));
    }

    if (whereConditions.length > 0) {
      baseQuery = baseQuery.where(and(...whereConditions));
    }

    const result = await baseQuery
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row,
      company: row.company?.id ? row.company : undefined,
      recruiter: row.recruiter?.id ? row.recruiter : undefined,
      creator: row.creator?.id ? row.creator : undefined,
    }));
  }

  async getJob(id: string): Promise<JobWithDetails | undefined> {
    const [job] = await db
      .select({
        id: jobs.id,
        jobCode: jobs.jobCode,
        title: jobs.title,
        professionId: jobs.professionId,
        description: jobs.description,
        requirements: jobs.requirements,
        companyId: jobs.companyId,
        costCenterId: jobs.costCenterId,
        recruiterId: jobs.recruiterId,
        department: jobs.department,
        location: jobs.location,
        contractType: jobs.contractType,
        salaryMin: jobs.salaryMin,
        admissionDate: jobs.admissionDate,
        hiredCandidateId: jobs.hiredCandidateId,
        status: jobs.status,
        createdBy: jobs.createdBy,
        expiresAt: jobs.expiresAt,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        completedAt: jobs.completedAt,
        profession: {
          id: professions.id,
          name: professions.name,
          description: professions.description,
          category: professions.category,
          isActive: professions.isActive,
          createdAt: professions.createdAt,
          updatedAt: professions.updatedAt,
        },
        company: {
          id: companies.id,
          name: companies.name,
          description: companies.description,
          website: companies.website,
          logo: companies.logo,
          createdAt: companies.createdAt,
          updatedAt: companies.updatedAt,
        },
        recruiter: {
          id: sql<string>`recruiter_users.id`,
          firstName: sql<string>`recruiter_users.first_name`,
          lastName: sql<string>`recruiter_users.last_name`,
          email: sql<string>`recruiter_users.email`,
        },
        creator: {
          id: sql<string>`creator_users.id`,
          firstName: sql<string>`creator_users.first_name`,
          lastName: sql<string>`creator_users.last_name`,
          email: sql<string>`creator_users.email`,
        },
        costCenter: {
          id: costCenters.id,
          name: costCenters.name,
          code: costCenters.code,
          companyId: costCenters.companyId,
          budget: costCenters.budget,
          createdAt: costCenters.createdAt,
          updatedAt: costCenters.updatedAt,
        },
      })
      .from(jobs)
      .leftJoin(professions, eq(jobs.professionId, professions.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(sql`users as recruiter_users`, eq(jobs.recruiterId, sql`recruiter_users.id`))
      .leftJoin(sql`users as creator_users`, eq(jobs.createdBy, sql`creator_users.id`))
      .leftJoin(costCenters, eq(jobs.costCenterId, costCenters.id))
      .where(eq(jobs.id, id));

    if (!job) return undefined;

    const jobApplications = await this.getApplicationsByJob(id);

    return {
      ...job,
      profession: job.profession?.id ? job.profession : undefined,
      company: job.company?.id ? job.company : undefined,
      recruiter: job.recruiter?.id ? job.recruiter : undefined,
      creator: job.creator?.id ? job.creator : undefined,
      costCenter: job.costCenter?.id ? job.costCenter : undefined,
      applications: jobApplications,
      applicationsCount: jobApplications.length,
    };
  }

  async createJob(job: InsertJob): Promise<Job> {
    // Generate job code based on client name
    let jobCode = job.jobCode;
    
    if (!jobCode && job.clientId) {
      // Get client to extract first 3 letters of name
      const [client] = await db
        .select()
        .from(clients)
        .where(eq(clients.id, job.clientId))
        .limit(1);
      
      if (client) {
        // Extract first 3 letters from client name, uppercase, remove special chars
        const clientPrefix = client.name
          .replace(/[^a-zA-Z]/g, '') // Remove special characters
          .substring(0, 3)
          .toUpperCase();
        
        // Find the highest job code for this client prefix
        const existingJobs = await db
          .select({ jobCode: jobs.jobCode })
          .from(jobs)
          .where(sql`${jobs.jobCode} LIKE ${clientPrefix + '%'}`)
          .orderBy(sql`${jobs.jobCode} DESC`)
          .limit(1);
        
        let counter = 1;
        if (existingJobs.length > 0 && existingJobs[0].jobCode) {
          // Extract the number from the last job code (e.g., "AER005" -> 5)
          const lastNumber = parseInt(existingJobs[0].jobCode.substring(3), 10);
          if (!isNaN(lastNumber)) {
            counter = lastNumber + 1;
          }
        }
        
        // Format: CLIENT_PREFIX + 3-digit number (e.g., "AER001", "AER002")
        jobCode = `${clientPrefix}${String(counter).padStart(3, '0')}`;
      }
    }
    
    // Fallback to old format if no client
    if (!jobCode) {
      const result = await db.execute(sql`SELECT nextval('job_code_seq') as code`);
      const counter = (result.rows[0] as any).code;
      jobCode = `VG${String(counter).padStart(3, '0')}`;
    }
    
    const [newJob] = await db.insert(jobs).values({ ...job, jobCode }).returning();
    return newJob;
  }

  async updateJob(id: string, job: Partial<InsertJob>): Promise<Job> {
    const [updatedJob] = await db
      .update(jobs)
      .set({ ...job, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob;
  }

  async deleteJob(id: string): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async completeJob(id: string): Promise<Job> {
    const [completed] = await db
      .update(jobs)
      .set({ 
        completedAt: new Date(),
        status: 'concluida',
        updatedAt: new Date()
      })
      .where(eq(jobs.id, id))
      .returning();
    return completed;
  }

  // Job status history operations
  async createJobStatusHistory(history: { jobId: string; previousStatus?: string; newStatus: string; changedBy?: string }): Promise<void> {
    // Only set changedBy if the user exists in the database
    let validChangedBy = null;
    if (history.changedBy) {
      const user = await db.select().from(users).where(eq(users.id, history.changedBy)).limit(1);
      if (user.length > 0) {
        validChangedBy = history.changedBy;
      }
    }
    
    await db.insert(jobStatusHistory).values({
      jobId: history.jobId,
      previousStatus: history.previousStatus || null,
      newStatus: history.newStatus,
      changedBy: validChangedBy,
    });
  }

  async getJobStatusHistory(jobId: string): Promise<Array<{ id: string; previousStatus: string | null; newStatus: string; changedBy: string | null; changedAt: Date; changerName: string | null; changerEmail: string | null }>> {
    const history = await db
      .select({
        id: jobStatusHistory.id,
        previousStatus: jobStatusHistory.previousStatus,
        newStatus: jobStatusHistory.newStatus,
        changedBy: jobStatusHistory.changedBy,
        changedAt: jobStatusHistory.changedAt,
        changerName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.email})`.as('changerName'),
        changerEmail: users.email,
      })
      .from(jobStatusHistory)
      .leftJoin(users, eq(jobStatusHistory.changedBy, users.id))
      .where(eq(jobStatusHistory.jobId, jobId))
      .orderBy(desc(jobStatusHistory.changedAt));

    return history;
  }

  // Application operations
  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.appliedAt));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }

  async getApplicationWithDetails(id: string): Promise<ApplicationWithDetails | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id));
    
    if (!application) return undefined;

    // Get job details
    const job = await this.getJob(application.jobId!);
    
    // Get interviews
    const applicationInterviews = await this.getInterviewsByApplication(id);
    
    // Get stage progress
    const stageProgress = await this.getApplicationProgress(id);
    
    return {
      ...application,
      job,
      interviews: applicationInterviews,
      stageProgress,
    };
  }

  async updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }

  async getApplicationsWithJobDetails(): Promise<any[]> {
    const result = await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        candidateId: applications.candidateId,
        coverLetter: applications.coverLetter,
        status: applications.status,
        currentStage: applications.currentStage,
        kanbanStageId: applications.kanbanStageId,
        appliedAt: applications.appliedAt,
        candidate: {
          id: candidates.id,
          name: candidates.name,
          email: candidates.email,
          phone: candidates.phone,
        },
        job: {
          id: jobs.id,
          professionId: jobs.professionId,
          profession: {
            id: professions.id,
            name: professions.name,
          },
          company: {
            id: companies.id,
            name: companies.name,
          },
        },
      })
      .from(applications)
      .leftJoin(candidates, eq(applications.candidateId, candidates.id))
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(professions, eq(jobs.professionId, professions.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .orderBy(desc(applications.appliedAt));

    return result.map(row => ({
      ...row,
      candidate: row.candidate?.id ? row.candidate : undefined,
      job: row.job?.id ? {
        ...row.job,
        profession: row.job.profession?.id ? row.job.profession : undefined,
        company: row.job.company?.id ? row.job.company : undefined,
      } : undefined,
    }));
  }

  // Selection Stages operations
  async getSelectionStagesByJob(jobId: string): Promise<SelectionStage[]> {
    return await db
      .select()
      .from(selectionStages)
      .where(eq(selectionStages.jobId, jobId))
      .orderBy(selectionStages.order);
  }

  async createSelectionStage(stage: InsertSelectionStage): Promise<SelectionStage> {
    const [newStage] = await db.insert(selectionStages).values(stage).returning();
    return newStage;
  }

  async updateSelectionStage(id: string, stage: Partial<InsertSelectionStage>): Promise<SelectionStage> {
    const [updatedStage] = await db
      .update(selectionStages)
      .set(stage)
      .where(eq(selectionStages.id, id))
      .returning();
    return updatedStage;
  }

  async deleteSelectionStage(id: string): Promise<void> {
    await db.delete(selectionStages).where(eq(selectionStages.id, id));
  }

  async setupDefaultSelectionStages(jobId: string): Promise<void> {
    const defaultStages = [
      {
        jobId,
        name: "Application Review",
        description: "Initial screening of application documents",
        order: 1,
        isRequired: true,
        passingScore: 60,
      },
      {
        jobId,
        name: "Phone Screening",
        description: "Brief phone interview to assess basic fit",
        order: 2,
        isRequired: true,
        passingScore: 70,
      },
      {
        jobId,
        name: "Technical Interview",
        description: "Technical skills assessment",
        order: 3,
        isRequired: true,
        passingScore: 75,
      },
      {
        jobId,
        name: "Final Interview",
        description: "Final interview with hiring manager",
        order: 4,
        isRequired: true,
        passingScore: 80,
      },
    ];

    // Only create if no stages exist
    const existingStages = await this.getSelectionStagesByJob(jobId);
    if (existingStages.length === 0) {
      for (const stage of defaultStages) {
        await this.createSelectionStage(stage);
      }
    }
  }

  // Interview operations
  async getInterviewsByApplication(applicationId: string): Promise<InterviewWithDetails[]> {
    const result = await db
      .select({
        interview: interviews,
        interviewer: users,
        stage: selectionStages,
        application: applications,
        candidate: candidates,
      })
      .from(interviews)
      .leftJoin(users, eq(interviews.interviewerId, users.id))
      .leftJoin(selectionStages, eq(interviews.stageId, selectionStages.id))
      .leftJoin(applications, eq(interviews.applicationId, applications.id))
      .leftJoin(candidates, eq(applications.candidateId, candidates.id))
      .where(eq(interviews.applicationId, applicationId))
      .orderBy(interviews.scheduledAt);

    return result.map(row => ({
      ...row.interview,
      interviewer: row.interviewer || undefined,
      stage: row.stage || undefined,
      application: row.application || undefined,
      candidate: row.candidate ? {
        name: row.candidate.name,
        email: row.candidate.email,
        jobTitle: "Candidate",
      } : undefined,
    }));
  }

  async getInterviewWithDetails(id: string): Promise<InterviewWithDetails | undefined> {
    const result = await db
      .select({
        interview: interviews,
        interviewer: users,
        stage: selectionStages,
        application: applications,
        candidate: candidates,
      })
      .from(interviews)
      .leftJoin(users, eq(interviews.interviewerId, users.id))
      .leftJoin(selectionStages, eq(interviews.stageId, selectionStages.id))
      .leftJoin(applications, eq(interviews.applicationId, applications.id))
      .leftJoin(candidates, eq(applications.candidateId, candidates.id))
      .where(eq(interviews.id, id));

    if (result.length === 0) return undefined;

    const row = result[0];
    const criteria = await this.getInterviewCriteria(id);

    return {
      ...row.interview,
      interviewer: row.interviewer || undefined,
      stage: row.stage || undefined,
      application: row.application || undefined,
      criteria,
      candidate: row.candidate ? {
        name: row.candidate.name,
        email: row.candidate.email,
        jobTitle: "Candidate",
      } : undefined,
    };
  }

  async getUpcomingInterviews(interviewerId?: string): Promise<InterviewWithDetails[]> {
    let query = db
      .select({
        interview: interviews,
        interviewer: users,
        stage: selectionStages,
        application: applications,
        candidate: candidates,
      })
      .from(interviews)
      .leftJoin(users, eq(interviews.interviewerId, users.id))
      .leftJoin(selectionStages, eq(interviews.stageId, selectionStages.id))
      .leftJoin(applications, eq(interviews.applicationId, applications.id))
      .leftJoin(candidates, eq(applications.candidateId, candidates.id))
      .where(and(
        sql`${interviews.scheduledAt} >= NOW()`,
        eq(interviews.status, "scheduled")
      ));

    if (interviewerId) {
      query = query.where(and(
        sql`${interviews.scheduledAt} >= NOW()`,
        eq(interviews.status, "scheduled"),
        eq(interviews.interviewerId, interviewerId)
      ));
    }

    const result = await query.orderBy(interviews.scheduledAt);

    return result.map(row => ({
      ...row.interview,
      interviewer: row.interviewer || undefined,
      stage: row.stage || undefined,
      application: row.application || undefined,
      candidate: row.candidate ? {
        name: row.candidate.name,
        email: row.candidate.email,
        jobTitle: "Candidate",
      } : undefined,
    }));
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const [newInterview] = await db.insert(interviews).values(interview).returning();
    return newInterview;
  }

  async updateInterview(id: string, interview: Partial<InsertInterview>): Promise<Interview> {
    const [updatedInterview] = await db
      .update(interviews)
      .set({ ...interview, updatedAt: new Date() })
      .where(eq(interviews.id, id))
      .returning();
    return updatedInterview;
  }

  async deleteInterview(id: string): Promise<void> {
    await db.delete(interviews).where(eq(interviews.id, id));
  }

  // Interview Criteria operations
  async getInterviewCriteria(interviewId: string): Promise<InterviewCriteria[]> {
    return await db
      .select()
      .from(interviewCriteria)
      .where(eq(interviewCriteria.interviewId, interviewId));
  }

  async createInterviewCriteria(criteria: InsertInterviewCriteria): Promise<InterviewCriteria> {
    const [newCriteria] = await db.insert(interviewCriteria).values(criteria).returning();
    return newCriteria;
  }

  async updateInterviewCriteria(id: string, criteria: Partial<InsertInterviewCriteria>): Promise<InterviewCriteria> {
    const [updatedCriteria] = await db
      .update(interviewCriteria)
      .set(criteria)
      .where(eq(interviewCriteria.id, id))
      .returning();
    return updatedCriteria;
  }

  // Application Stage Progress operations
  async getApplicationProgress(applicationId: string): Promise<ApplicationStageProgress[]> {
    return await db
      .select()
      .from(applicationStageProgress)
      .where(eq(applicationStageProgress.applicationId, applicationId))
      .orderBy(applicationStageProgress.createdAt);
  }

  async createStageProgress(progress: InsertApplicationStageProgress): Promise<ApplicationStageProgress> {
    const [newProgress] = await db.insert(applicationStageProgress).values(progress).returning();
    return newProgress;
  }

  async updateStageProgress(id: string, progress: Partial<InsertApplicationStageProgress>): Promise<ApplicationStageProgress> {
    const [updatedProgress] = await db
      .update(applicationStageProgress)
      .set({ ...progress, updatedAt: new Date() })
      .where(eq(applicationStageProgress.id, id))
      .returning();
    return updatedProgress;
  }

  async advanceApplicationStage(applicationId: string, stageId: string, score: number, feedback?: string): Promise<void> {
    // Update current stage progress
    await this.createStageProgress({
      applicationId,
      stageId,
      status: "completed",
      score,
      feedback,
      completedAt: new Date(),
    });

    // Update application's current stage and overall score
    await this.updateApplication(applicationId, {
      currentStage: stageId,
      overallScore: score,
      updatedAt: new Date(),
    });
  }

  // Analytics operations
  async getDashboardMetrics(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<{
    totalJobs: number;
    activeJobs: number;
    closedJobs: number;
    totalApplications: number;
    totalCompanies: number;
    openJobsCurrentMonth: number;
  }> {
    const conditions = [];
    if (months && months.length > 0) {
      conditions.push(inArray(sql`TO_CHAR(${jobs.createdAt}, 'YYYY-MM')`, months));
    }
    if (companyIds && companyIds.length > 0) {
      conditions.push(inArray(jobs.companyId, companyIds));
    }
    if (divisions && divisions.length > 0) {
      conditions.push(inArray(jobs.division, divisions));
    }
    if (recruiterIds && recruiterIds.length > 0) {
      conditions.push(inArray(jobs.recruiterId, recruiterIds));
    }

    let totalJobsQuery = db.select({ count: count() }).from(jobs);
    if (conditions.length > 0) {
      totalJobsQuery = totalJobsQuery.where(and(...conditions));
    }

    // Vagas ativas: todos os status exceto admitido e cancelada
    const activeStatuses = ["nova_vaga", "aprovada", "em_recrutamento", "em_dp", "em_admissao"];
    let activeJobsQuery = db.select({ count: count() }).from(jobs).where(inArray(jobs.status, activeStatuses));
    if (conditions.length > 0) {
      activeJobsQuery = activeJobsQuery.where(and(inArray(jobs.status, activeStatuses), ...conditions));
    }

    // Vagas fechadas: admitido e cancelada
    const closedStatuses = ["admitido", "cancelada"];
    let closedJobsQuery = db.select({ count: count() }).from(jobs).where(inArray(jobs.status, closedStatuses));
    if (conditions.length > 0) {
      closedJobsQuery = closedJobsQuery.where(and(inArray(jobs.status, closedStatuses), ...conditions));
    }
    
    // Count open jobs (jobs without admission date)
    const openJobsConditions = [
      isNull(jobs.admissionDate) // Vagas em aberto = sem data de admissão
    ];
    if (companyIds && companyIds.length > 0) {
      openJobsConditions.push(inArray(jobs.companyId, companyIds));
    }
    if (divisions && divisions.length > 0) {
      openJobsConditions.push(inArray(jobs.division, divisions));
    }
    if (recruiterIds && recruiterIds.length > 0) {
      openJobsConditions.push(inArray(jobs.recruiterId, recruiterIds));
    }
    
    const [openJobsCurrentMonthResult] = await db
      .select({ count: count() })
      .from(jobs)
      .where(and(...openJobsConditions));
    
    const [totalJobsResult] = await totalJobsQuery;
    const [activeJobsResult] = await activeJobsQuery;
    const [closedJobsResult] = await closedJobsQuery;
    const [totalApplicationsResult] = await db.select({ count: count() }).from(applications);
    const [totalCompaniesResult] = await db.select({ count: count() }).from(companies);

    return {
      totalJobs: totalJobsResult.count,
      activeJobs: activeJobsResult.count,
      closedJobs: closedJobsResult.count,
      totalApplications: totalApplicationsResult.count,
      totalCompanies: totalCompaniesResult.count,
      openJobsCurrentMonth: openJobsCurrentMonthResult.count,
    };
  }

  async getJobsByStatus(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<Array<{ status: string; count: number }>> {
    const conditions = [];
    if (months && months.length > 0) {
      conditions.push(inArray(sql`TO_CHAR(${jobs.createdAt}, 'YYYY-MM')`, months));
    }
    if (companyIds && companyIds.length > 0) {
      conditions.push(inArray(jobs.companyId, companyIds));
    }
    if (divisions && divisions.length > 0) {
      conditions.push(inArray(jobs.division, divisions));
    }
    if (recruiterIds && recruiterIds.length > 0) {
      conditions.push(inArray(jobs.recruiterId, recruiterIds));
    }

    let query = db
      .select({
        status: jobStatuses.label,
        count: count(),
      })
      .from(jobs)
      .leftJoin(jobStatuses, eq(jobs.status, jobStatuses.key));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const result = await query.groupBy(jobStatuses.label);
    
    return result.map(row => ({
      status: row.status || 'Sem Status',
      count: row.count
    }));
  }

  async getApplicationsByMonth(): Promise<Array<{ month: string; count: number }>> {
    return await db
      .select({
        month: sql<string>`TO_CHAR(${applications.appliedAt}, 'YYYY-MM')`,
        count: count(),
      })
      .from(applications)
      .where(sql`${applications.appliedAt} >= NOW() - INTERVAL '12 months'`)
      .groupBy(sql`TO_CHAR(${applications.appliedAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${applications.appliedAt}, 'YYYY-MM')`);
  }

  async getOpenJobsByMonth(): Promise<Array<{ month: string; count: number }>> {
    return await db
      .select({
        month: sql<string>`TO_CHAR(${jobs.createdAt}, 'YYYY-MM')`,
        count: count(),
      })
      .from(jobs)
      .where(sql`${jobs.createdAt} >= NOW() - INTERVAL '12 months'`)
      .groupBy(sql`TO_CHAR(${jobs.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${jobs.createdAt}, 'YYYY-MM')`);
  }

  async getJobsByCreator(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<Array<{ creatorId: string; creatorName: string; count: number }>> {
    const conditions = [eq(jobs.status, '6c1a97ba-cfcc-463e-82bc-01f8e0aa6be1')];
    
    if (months && months.length > 0) {
      conditions.push(inArray(sql`TO_CHAR(${jobs.createdAt}, 'YYYY-MM')`, months));
    }
    if (companyIds && companyIds.length > 0) {
      conditions.push(inArray(jobs.companyId, companyIds));
    }
    if (divisions && divisions.length > 0) {
      conditions.push(inArray(jobs.division, divisions));
    }
    if (recruiterIds && recruiterIds.length > 0) {
      conditions.push(inArray(jobs.recruiterId, recruiterIds));
    }
    
    const result = await db
      .select({
        creatorId: jobs.createdBy,
        creatorName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.email})`,
        count: count(),
      })
      .from(jobs)
      .leftJoin(users, eq(jobs.createdBy, users.id))
      .where(and(...conditions))
      .groupBy(jobs.createdBy, users.firstName, users.lastName, users.email)
      .orderBy(desc(count()));
    
    return result.map(row => ({
      creatorId: row.creatorId || '',
      creatorName: row.creatorName || 'Sem criador',
      count: row.count
    }));
  }

  async getAllJobsByCreator(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<Array<{ creatorId: string; creatorName: string; count: number }>> {
    const conditions = [];
    
    if (months && months.length > 0) {
      conditions.push(inArray(sql`TO_CHAR(${jobs.createdAt}, 'YYYY-MM')`, months));
    }
    if (companyIds && companyIds.length > 0) {
      conditions.push(inArray(jobs.companyId, companyIds));
    }
    if (divisions && divisions.length > 0) {
      conditions.push(inArray(jobs.division, divisions));
    }
    if (recruiterIds && recruiterIds.length > 0) {
      conditions.push(inArray(jobs.recruiterId, recruiterIds));
    }
    
    const result = await db
      .select({
        creatorId: jobs.createdBy,
        creatorName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.email})`,
        count: count(),
      })
      .from(jobs)
      .leftJoin(users, eq(jobs.createdBy, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(jobs.createdBy, users.firstName, users.lastName, users.email)
      .orderBy(desc(count()));
    
    return result.map(row => ({
      creatorId: row.creatorId || '',
      creatorName: row.creatorName || 'Sem criador',
      count: row.count
    }));
  }

  async getJobsByCompany(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<Array<{ companyId: string; companyName: string; companyColor: string; count: number }>> {
    // Exclude completed and canceled jobs (only show open jobs)
    const conditions = [
      sql`${jobs.status} NOT IN ('6ef1106a-a027-4424-9e10-63d6f9f2910c', '17ea0666-f253-415d-8a0c-0be57295c209')`
    ];
    
    if (months && months.length > 0) {
      conditions.push(inArray(sql`TO_CHAR(${jobs.createdAt}, 'YYYY-MM')`, months));
    }
    if (companyIds && companyIds.length > 0) {
      conditions.push(inArray(jobs.companyId, companyIds));
    }
    if (divisions && divisions.length > 0) {
      conditions.push(inArray(jobs.division, divisions));
    }
    if (recruiterIds && recruiterIds.length > 0) {
      conditions.push(inArray(jobs.recruiterId, recruiterIds));
    }
    
    const result = await db
      .select({
        companyId: jobs.companyId,
        companyName: companies.name,
        companyColor: companies.color,
        count: count(),
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(and(...conditions))
      .groupBy(jobs.companyId, companies.name, companies.color)
      .orderBy(desc(count()));
    
    return result.map(row => ({
      companyId: row.companyId || '',
      companyName: row.companyName || 'Sem empresa',
      companyColor: row.companyColor || '#10b981',
      count: row.count
    }));
  }

  async getJobsByClient(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<Array<{ clientId: string; clientName: string; count: number }>> {
    const conditions: any[] = [sql`${jobs.clientId} IS NOT NULL`];
    
    if (months && months.length > 0) {
      conditions.push(inArray(sql`TO_CHAR(${jobs.createdAt}, 'YYYY-MM')`, months));
    }
    if (companyIds && companyIds.length > 0) {
      conditions.push(inArray(jobs.companyId, companyIds));
    }
    if (divisions && divisions.length > 0) {
      conditions.push(inArray(jobs.division, divisions));
    }
    if (recruiterIds && recruiterIds.length > 0) {
      conditions.push(inArray(jobs.recruiterId, recruiterIds));
    }
    
    const result = await db
      .select({
        clientId: jobs.clientId,
        clientName: clients.name,
        count: count(),
      })
      .from(jobs)
      .leftJoin(clients, eq(jobs.clientId, clients.id))
      .where(and(...conditions))
      .groupBy(jobs.clientId, clients.name)
      .orderBy(desc(count()));
    
    return result.map(row => ({
      clientId: row.clientId || '',
      clientName: row.clientName || 'Sem cliente',
      count: row.count
    }));
  }

  async getJobsSLA(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<{ withinSLA: number; outsideSLA: number }> {
    const now = new Date();
    
    const conditions: any[] = [sql`${jobs.slaDeadline} IS NOT NULL`];
    if (months && months.length > 0) {
      conditions.push(inArray(sql`TO_CHAR(${jobs.createdAt}, 'YYYY-MM')`, months));
    }
    if (companyIds && companyIds.length > 0) {
      conditions.push(inArray(jobs.companyId, companyIds));
    }
    if (divisions && divisions.length > 0) {
      conditions.push(inArray(jobs.division, divisions));
    }
    if (recruiterIds && recruiterIds.length > 0) {
      conditions.push(inArray(jobs.recruiterId, recruiterIds));
    }
    
    const query = db
      .select({
        slaDeadline: jobs.slaDeadline,
      })
      .from(jobs)
      .where(and(...conditions));
    
    const allJobs = await query;
    
    let withinSLA = 0;
    let outsideSLA = 0;
    
    allJobs.forEach(job => {
      if (job.slaDeadline) {
        const deadline = new Date(job.slaDeadline);
        if (now <= deadline) {
          withinSLA++;
        } else {
          outsideSLA++;
        }
      }
    });
    
    return { withinSLA, outsideSLA };
  }

  async getJobsProductivity(months?: string[], companyIds?: string[], divisions?: string[], recruiterIds?: string[]): Promise<{ productive: number; unproductive: number }> {
    const conditions: any[] = [];
    if (months && months.length > 0) {
      conditions.push(inArray(sql`TO_CHAR(${jobs.createdAt}, 'YYYY-MM')`, months));
    }
    if (companyIds && companyIds.length > 0) {
      conditions.push(inArray(jobs.companyId, companyIds));
    }
    if (divisions && divisions.length > 0) {
      conditions.push(inArray(jobs.division, divisions));
    }
    if (recruiterIds && recruiterIds.length > 0) {
      conditions.push(inArray(jobs.recruiterId, recruiterIds));
    }
    
    const query = db
      .select({
        admissionDate: jobs.admissionDate,
      })
      .from(jobs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const allJobs = await query;
    
    let productive = 0;
    let unproductive = 0;
    
    allJobs.forEach(job => {
      if (job.admissionDate) {
        productive++;
      } else {
        unproductive++;
      }
    });
    
    return { productive, unproductive };
  }

  async getJobsStatusSummary(month?: string): Promise<Array<{ status: string; count: number }>> {
    const targetStatuses = ['aprovada', 'em_recrutamento', 'em_documentacao', 'closed'];
    
    const conditions = [sql`${jobs.status} IN ('aprovada', 'em_recrutamento', 'em_documentacao', 'closed')`];
    
    if (month) {
      conditions.push(sql`TO_CHAR(${jobs.createdAt}, 'YYYY-MM') = ${month}`);
    }
    
    const result = await db
      .select({
        status: jobs.status,
        count: count(),
      })
      .from(jobs)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .groupBy(jobs.status);
    
    return result.map(row => ({
      status: row.status,
      count: row.count
    }));
  }

  // Selection process analytics
  async getSelectionProcessMetrics(companyId?: string, timeframe?: string): Promise<SelectionProcessMetrics> {
    let baseQuery = db.select().from(applications);
    
    if (companyId) {
      baseQuery = baseQuery.leftJoin(jobs, eq(applications.jobId, jobs.id))
        .where(eq(jobs.companyId, companyId)) as any;
    }

    const [totalAppsResult] = await db.select({ count: count() }).from(applications);
    const statusDistribution = await this.getApplicationStatusDistribution();
    const avgTimeToHire = await this.getAverageTimeToHire(companyId);
    const conversionRates = await this.getConversionRates(companyId);

    return {
      totalApplications: totalAppsResult.count,
      byStatus: statusDistribution,
      averageTimeToHire: avgTimeToHire,
      conversionRates,
    };
  }

  async getInterviewCalendar(interviewerId?: string): Promise<InterviewCalendarResponse> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Upcoming interviews (future)
    const upcomingInterviews = await this.getUpcomingInterviews(interviewerId);

    // Today's interviews
    let todayQuery = db
      .select({
        interview: interviews,
        interviewer: users,
        stage: selectionStages,
        application: applications,
      })
      .from(interviews)
      .leftJoin(users, eq(interviews.interviewerId, users.id))
      .leftJoin(selectionStages, eq(interviews.stageId, selectionStages.id))
      .leftJoin(applications, eq(interviews.applicationId, applications.id))
      .where(and(
        sql`${interviews.scheduledAt} >= ${todayStart}`,
        sql`${interviews.scheduledAt} < ${todayEnd}`,
        eq(interviews.status, "scheduled")
      ));

    if (interviewerId) {
      todayQuery = todayQuery.where(and(
        sql`${interviews.scheduledAt} >= ${todayStart}`,
        sql`${interviews.scheduledAt} < ${todayEnd}`,
        eq(interviews.status, "scheduled"),
        eq(interviews.interviewerId, interviewerId)
      ));
    }

    const todayResult = await todayQuery.orderBy(interviews.scheduledAt);

    // Overdue interviews (past scheduled but still marked as scheduled)
    let overdueQuery = db
      .select({
        interview: interviews,
        interviewer: users,
        stage: selectionStages,
        application: applications,
      })
      .from(interviews)
      .leftJoin(users, eq(interviews.interviewerId, users.id))
      .leftJoin(selectionStages, eq(interviews.stageId, selectionStages.id))
      .leftJoin(applications, eq(interviews.applicationId, applications.id))
      .where(and(
        sql`${interviews.scheduledAt} < NOW()`,
        eq(interviews.status, "scheduled")
      ));

    if (interviewerId) {
      overdueQuery = overdueQuery.where(and(
        sql`${interviews.scheduledAt} < NOW()`,
        eq(interviews.status, "scheduled"),
        eq(interviews.interviewerId, interviewerId)
      ));
    }

    const overdueResult = await overdueQuery.orderBy(interviews.scheduledAt);

    const mapToDetails = (rows: any[]) => rows.map(row => ({
      ...row.interview,
      interviewer: row.interviewer,
      stage: row.stage,
      application: row.application,
      candidate: row.application ? {
        name: row.application.candidateName,
        email: row.application.candidateEmail,
        jobTitle: "Candidate",
      } : undefined,
    }));

    return {
      upcomingInterviews,
      todayInterviews: mapToDetails(todayResult),
      overdueInterviews: mapToDetails(overdueResult),
    };
  }

  async getApplicationStatusDistribution(): Promise<Array<{ status: string; count: number }>> {
    const result = await db
      .select({
        status: applications.status,
        count: count(),
      })
      .from(applications)
      .groupBy(applications.status);
    
    return result.map(row => ({
      status: row.status || '',
      count: row.count
    }));
  }

  async getAverageTimeToHire(companyId?: string): Promise<number> {
    let query = db
      .select({
        appliedAt: applications.appliedAt,
        updatedAt: applications.updatedAt,
      })
      .from(applications);

    if (companyId) {
      query = query
        .leftJoin(jobs, eq(applications.jobId, jobs.id))
        .where(and(
          eq(applications.status, "hired"),
          eq(jobs.companyId, companyId)
        )) as any;
    } else {
      query = query.where(eq(applications.status, "hired"));
    }

    const hiredApplications = await query;
    
    if (hiredApplications.length === 0) return 0;

    const totalDays = hiredApplications.reduce((sum, app) => {
      const daysDiff = Math.floor((app.updatedAt!.getTime() - app.appliedAt!.getTime()) / (1000 * 60 * 60 * 24));
      return sum + daysDiff;
    }, 0);

    return Math.round(totalDays / hiredApplications.length);
  }

  async getConversionRates(companyId?: string): Promise<{
    applicationToInterview: number;
    interviewToOffer: number;
    offerToHire: number;
  }> {
    let baseQuery = db.select({ count: count() }).from(applications);
    
    if (companyId) {
      baseQuery = baseQuery
        .leftJoin(jobs, eq(applications.jobId, jobs.id))
        .where(eq(jobs.companyId, companyId)) as any;
    }

    const [totalApps] = await baseQuery;
    
    let interviewsQuery = db.select({ count: count() }).from(applications);
    if (companyId) {
      interviewsQuery = interviewsQuery
        .leftJoin(jobs, eq(applications.jobId, jobs.id))
        .where(and(
          sql`${applications.status} IN ('interview_scheduled', 'interview_completed', 'final_review', 'approved', 'hired')`,
          eq(jobs.companyId, companyId)
        )) as any;
    } else {
      interviewsQuery = interviewsQuery
        .where(sql`${applications.status} IN ('interview_scheduled', 'interview_completed', 'final_review', 'approved', 'hired')`);
    }

    const [appsWithInterviews] = await interviewsQuery;

    let offersQuery = db.select({ count: count() }).from(applications);
    if (companyId) {
      offersQuery = offersQuery
        .leftJoin(jobs, eq(applications.jobId, jobs.id))
        .where(and(
          sql`${applications.status} IN ('approved', 'hired')`,
          eq(jobs.companyId, companyId)
        )) as any;
    } else {
      offersQuery = offersQuery
        .where(sql`${applications.status} IN ('approved', 'hired')`);
    }

    const [appsWithOffers] = await offersQuery;

    let hiredQuery = db.select({ count: count() }).from(applications);
    if (companyId) {
      hiredQuery = hiredQuery
        .leftJoin(jobs, eq(applications.jobId, jobs.id))
        .where(and(
          eq(applications.status, "hired"),
          eq(jobs.companyId, companyId)
        )) as any;
    } else {
      hiredQuery = hiredQuery.where(eq(applications.status, "hired"));
    }

    const [hiredApps] = await hiredQuery;

    const applicationToInterview = totalApps.count > 0 ? (appsWithInterviews.count / totalApps.count) * 100 : 0;
    const interviewToOffer = appsWithInterviews.count > 0 ? (appsWithOffers.count / appsWithInterviews.count) * 100 : 0;
    const offerToHire = appsWithOffers.count > 0 ? (hiredApps.count / appsWithOffers.count) * 100 : 0;

    return {
      applicationToInterview: Math.round(applicationToInterview * 100) / 100,
      interviewToOffer: Math.round(interviewToOffer * 100) / 100,
      offerToHire: Math.round(offerToHire * 100) / 100,
    };
  }

  // Permission operations
  async getUserCompanyRoles(userId: string): Promise<UserCompanyRole[]> {
    return await db
      .select()
      .from(userCompanyRoles)
      .where(and(eq(userCompanyRoles.userId, userId), eq(userCompanyRoles.isActive, true)))
      .orderBy(userCompanyRoles.createdAt);
  }

  async getUserCompanyRoleById(id: string): Promise<UserCompanyRole | undefined> {
    const [role] = await db
      .select()
      .from(userCompanyRoles)
      .where(eq(userCompanyRoles.id, id));
    return role;
  }

  async getUserPermissions(userId: string, companyId: string): Promise<string[]> {
    // Get user's roles in the company
    const userRoles = await db
      .select()
      .from(userCompanyRoles)
      .where(
        and(
          eq(userCompanyRoles.userId, userId),
          eq(userCompanyRoles.companyId, companyId),
          eq(userCompanyRoles.isActive, true)
        )
      );

    if (userRoles.length === 0) return [];

    // Get permissions for all user's roles and aggregate them
    const allPermissions = new Set<string>();
    
    for (const userRole of userRoles) {
      const permissions = await db
        .select({ permission: rolePermissions.permission })
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.role, userRole.role),
            eq(rolePermissions.isGranted, true)
          )
        );
      
      permissions.forEach(p => allPermissions.add(p.permission));
    }

    return Array.from(allPermissions);
  }

  async assignUserToCompany(assignment: InsertUserCompanyRole): Promise<UserCompanyRole> {
    const [newAssignment] = await db
      .insert(userCompanyRoles)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async updateUserCompanyRole(id: string, role: string): Promise<UserCompanyRole> {
    const [updatedRole] = await db
      .update(userCompanyRoles)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(userCompanyRoles.id, id))
      .returning();
    return updatedRole;
  }

  async removeUserFromCompany(userId: string, companyId: string): Promise<void> {
    await db
      .update(userCompanyRoles)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(userCompanyRoles.userId, userId),
          eq(userCompanyRoles.companyId, companyId)
        )
      );
  }

  async getRolePermissions(): Promise<RolePermission[]> {
    return await db.select().from(rolePermissions).orderBy(rolePermissions.role);
  }

  async setupDefaultRolePermissions(): Promise<void> {
    // Clear existing permissions first to ensure idempotency
    await db.delete(rolePermissions);
    
    // Setup default permissions for different roles
    const defaultPermissions = [
      // Admin permissions - full access
      { role: "admin", permission: "create_jobs", isGranted: true },
      { role: "admin", permission: "edit_jobs", isGranted: true },
      { role: "admin", permission: "delete_jobs", isGranted: true },
      { role: "admin", permission: "view_jobs", isGranted: true },
      { role: "admin", permission: "create_companies", isGranted: true },
      { role: "admin", permission: "edit_companies", isGranted: true },
      { role: "admin", permission: "delete_companies", isGranted: true },
      { role: "admin", permission: "view_companies", isGranted: true },
      { role: "admin", permission: "manage_cost_centers", isGranted: true },
      { role: "admin", permission: "view_applications", isGranted: true },
      { role: "admin", permission: "manage_applications", isGranted: true },
      { role: "admin", permission: "interview_candidates", isGranted: true },
      { role: "admin", permission: "hire_candidates", isGranted: true },
      { role: "admin", permission: "view_reports", isGranted: true },
      { role: "admin", permission: "export_data", isGranted: true },
      { role: "admin", permission: "manage_users", isGranted: true },
      { role: "admin", permission: "manage_permissions", isGranted: true },

      // HR Manager permissions
      { role: "hr_manager", permission: "create_jobs", isGranted: true },
      { role: "hr_manager", permission: "edit_jobs", isGranted: true },
      { role: "hr_manager", permission: "delete_jobs", isGranted: true },
      { role: "hr_manager", permission: "view_jobs", isGranted: true },
      { role: "hr_manager", permission: "view_companies", isGranted: true },
      { role: "hr_manager", permission: "manage_cost_centers", isGranted: true },
      { role: "hr_manager", permission: "view_applications", isGranted: true },
      { role: "hr_manager", permission: "manage_applications", isGranted: true },
      { role: "hr_manager", permission: "interview_candidates", isGranted: true },
      { role: "hr_manager", permission: "hire_candidates", isGranted: true },
      { role: "hr_manager", permission: "view_reports", isGranted: true },
      { role: "hr_manager", permission: "export_data", isGranted: true },

      // Recruiter permissions
      { role: "recruiter", permission: "create_jobs", isGranted: true },
      { role: "recruiter", permission: "edit_jobs", isGranted: true },
      { role: "recruiter", permission: "view_jobs", isGranted: true },
      { role: "recruiter", permission: "view_companies", isGranted: true },
      { role: "recruiter", permission: "view_applications", isGranted: true },
      { role: "recruiter", permission: "manage_applications", isGranted: true },
      { role: "recruiter", permission: "interview_candidates", isGranted: true },
      { role: "recruiter", permission: "view_reports", isGranted: true },

      // Interviewer permissions
      { role: "interviewer", permission: "view_jobs", isGranted: true },
      { role: "interviewer", permission: "view_companies", isGranted: true },
      { role: "interviewer", permission: "view_applications", isGranted: true },
      { role: "interviewer", permission: "interview_candidates", isGranted: true },

      // Viewer permissions - read only
      { role: "viewer", permission: "view_jobs", isGranted: true },
      { role: "viewer", permission: "view_companies", isGranted: true },
      { role: "viewer", permission: "view_applications", isGranted: true },
      { role: "viewer", permission: "view_reports", isGranted: true },
    ];

    // Insert permissions in batch
    if (defaultPermissions.length > 0) {
      await db
        .insert(rolePermissions)
        .values(defaultPermissions as any);
    }
  }

  async checkUserPermission(userId: string, companyId: string, permission: string): Promise<boolean> {
    // If AUTH_BYPASS is enabled, allow all permissions
    if (process.env.AUTH_BYPASS === 'true') {
      return true;
    }
    
    const userPermissions = await this.getUserPermissions(userId, companyId);
    return userPermissions.includes(permission);
  }

  async addRolePermission(role: string, permission: string): Promise<RolePermission> {
    // Check if permission already exists
    const existing = await db
      .select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.role, role as any),
          eq(rolePermissions.permission, permission as any)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update to granted if it exists but is not granted
      const [updated] = await db
        .update(rolePermissions)
        .set({ isGranted: true })
        .where(eq(rolePermissions.id, existing[0].id))
        .returning();
      return updated;
    }

    // Create new permission
    const [newPermission] = await db
      .insert(rolePermissions)
      .values({
        role: role as any,
        permission: permission as any,
        isGranted: true,
      })
      .returning();
    return newPermission;
  }

  async removeRolePermission(role: string, permission: string): Promise<void> {
    await db
      .delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.role, role as any),
          eq(rolePermissions.permission, permission as any)
        )
      );
  }

  async toggleRolePermission(role: string, permission: string, isGranted: boolean): Promise<RolePermission> {
    // Check if permission exists
    const existing = await db
      .select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.role, role as any),
          eq(rolePermissions.permission, permission as any)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      if (!isGranted) {
        // Delete if not granted
        await this.removeRolePermission(role, permission);
        return existing[0];
      } else {
        // Update to granted
        const [updated] = await db
          .update(rolePermissions)
          .set({ isGranted: true })
          .where(eq(rolePermissions.id, existing[0].id))
          .returning();
        return updated;
      }
    } else if (isGranted) {
      // Create new permission if granted
      return await this.addRolePermission(role, permission);
    }
    
    // If trying to revoke a non-existent permission, just return a dummy object
    // This is not an error - it just means the permission was never granted
    return {
      id: '',
      role: role as any,
      permission: permission as any,
      isGranted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async getJobClosureReport(month?: string): Promise<any[]> {
    let query = sql`
      SELECT 
        u.id as recruiter_id,
        u.first_name as recruiter_first_name,
        u.last_name as recruiter_last_name,
        u.email as recruiter_email,
        COUNT(j.id) as closed_jobs_count,
        COALESCE(AVG(EXTRACT(EPOCH FROM (j.updated_at - j.created_at)) / 86400), 0) as avg_days_to_close,
        COALESCE(AVG(j.salary_min), 0) as avg_salary
      FROM jobs j
      INNER JOIN users u ON j.recruiter_id = u.id
      WHERE j.status = 'closed'
    `;

    if (month) {
      query = sql`${query} AND TO_CHAR(j.updated_at, 'YYYY-MM') = ${month}`;
    }

    query = sql`${query}
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY COUNT(j.id) DESC
    `;

    const queryResult = await db.execute(query);

    return queryResult.rows.map((row: any) => ({
      recruiterId: row.recruiter_id,
      recruiterName: row.recruiter_first_name && row.recruiter_last_name 
        ? `${row.recruiter_first_name} ${row.recruiter_last_name}` 
        : row.recruiter_email || '',
      recruiterEmail: row.recruiter_email || '',
      closedJobsCount: Number(row.closed_jobs_count),
      averageDaysToClose: Math.round(Number(row.avg_days_to_close)),
      averageSalary: Math.round(Number(row.avg_salary)),
    }));
  }

  async getClosedJobsByRecruiter(month?: string): Promise<any[]> {
    let query = sql`
      SELECT 
        u.id as recruiter_id,
        COALESCE(CONCAT(u.first_name, ' ', u.last_name), u.email) as recruiter_name,
        u.email as recruiter_email,
        j.id as job_id,
        j.job_code,
        p.name as profession_name,
        c.name as company_name,
        j.updated_at as closed_date,
        j.created_at as created_date,
        EXTRACT(EPOCH FROM (j.updated_at - j.created_at)) / 86400 as days_to_close,
        j.salary_min
      FROM jobs j
      INNER JOIN users u ON j.recruiter_id = u.id
      LEFT JOIN professions p ON j.profession_id = p.id
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.status = 'closed'
    `;

    if (month) {
      query = sql`${query} AND TO_CHAR(j.updated_at, 'YYYY-MM') = ${month}`;
    }

    query = sql`${query}
      ORDER BY j.updated_at DESC
    `;

    const queryResult = await db.execute(query);

    return queryResult.rows.map((row: any) => ({
      recruiterId: row.recruiter_id,
      recruiterName: row.recruiter_name || '',
      recruiterEmail: row.recruiter_email || '',
      jobId: row.job_id,
      jobCode: row.job_code || '',
      professionName: row.profession_name || 'N/A',
      companyName: row.company_name || 'N/A',
      closedDate: row.closed_date ? new Date(row.closed_date).toISOString() : '',
      daysToClose: Math.round(Number(row.days_to_close || 0)),
      salary: Math.round(Number(row.salary_min || 0)),
    }));
  }

  // Menu permission operations
  async getUserMenuPermissions(userId: string): Promise<UserMenuPermission[]> {
    return await db
      .select()
      .from(userMenuPermissions)
      .where(eq(userMenuPermissions.userId, userId))
      .orderBy(userMenuPermissions.menuName);
  }

  async getUserAccessibleMenus(userId: string): Promise<string[] | null> {
    // First check if user has any menu permissions configured
    const allPermissions = await db
      .select()
      .from(userMenuPermissions)
      .where(eq(userMenuPermissions.userId, userId));
    
    // If no permissions are configured, return null (meaning use default: show all)
    if (allPermissions.length === 0) {
      return null;
    }
    
    // If permissions exist, return only the accessible ones
    const accessiblePermissions = allPermissions.filter(p => p.canAccess);
    return accessiblePermissions.map(p => p.menuPath);
  }

  async createUserMenuPermission(permission: InsertUserMenuPermission): Promise<UserMenuPermission> {
    const [newPermission] = await db
      .insert(userMenuPermissions)
      .values(permission)
      .returning();
    return newPermission;
  }

  async updateUserMenuPermission(id: string, canAccess: boolean): Promise<UserMenuPermission> {
    const [updated] = await db
      .update(userMenuPermissions)
      .set({ canAccess, updatedAt: new Date() })
      .where(eq(userMenuPermissions.id, id))
      .returning();
    return updated;
  }

  async deleteUserMenuPermission(id: string): Promise<void> {
    await db
      .delete(userMenuPermissions)
      .where(eq(userMenuPermissions.id, id));
  }

  async setDefaultMenuPermissions(userId: string): Promise<void> {
    const defaultMenus = [
      { menuPath: "/dashboard", menuName: "Dashboard" },
      { menuPath: "/jobs", menuName: "Vagas" },
      { menuPath: "/kanban", menuName: "Kanban" },
      { menuPath: "/companies", menuName: "Empresas" },
      { menuPath: "/clients", menuName: "Clientes" },
      { menuPath: "/users", menuName: "Usuários" },
      { menuPath: "/permissions", menuName: "Permissões" },
      { menuPath: "/reports/job-closure", menuName: "Fechamento de Vagas" },
      { menuPath: "/settings", menuName: "Configurações" },
      { menuPath: "/help", menuName: "Ajuda" },
    ];

    const permissionsToInsert = defaultMenus.map(menu => ({
      userId,
      menuPath: menu.menuPath,
      menuName: menu.menuName,
      canAccess: true,
    }));

    await db.insert(userMenuPermissions).values(permissionsToInsert);
  }

  async bulkUpdateUserMenuPermissions(
    userId: string,
    menuPermissions: Array<{ menuPath: string; menuName: string; canAccess: boolean }>
  ): Promise<void> {
    await db.delete(userMenuPermissions).where(eq(userMenuPermissions.userId, userId));

    const permissionsToInsert = menuPermissions.map(menu => ({
      userId,
      menuPath: menu.menuPath,
      menuName: menu.menuName,
      canAccess: menu.canAccess,
    }));

    if (permissionsToInsert.length > 0) {
      await db.insert(userMenuPermissions).values(permissionsToInsert);
    }
  }

  // Role job status permission operations
  async getRoleJobStatusPermissions(role?: string): Promise<RoleJobStatusPermission[]> {
    // Using direct SQL due to ORM type coercion issues with enum
    let query;
    if (role) {
      query = await db.execute<RoleJobStatusPermission>(
        sql`SELECT id, role, job_status_id as "jobStatusId", can_view as "canView", can_edit as "canEdit", created_at as "createdAt", updated_at as "updatedAt" 
        FROM role_job_status_permissions 
        WHERE role = ${role}
        ORDER BY created_at`
      );
    } else {
      query = await db.execute<RoleJobStatusPermission>(
        sql`SELECT id, role, job_status_id as "jobStatusId", can_view as "canView", can_edit as "canEdit", created_at as "createdAt", updated_at as "updatedAt" 
        FROM role_job_status_permissions 
        ORDER BY role, created_at`
      );
    }
    return query.rows;
  }

  async createRoleJobStatusPermission(permission: InsertRoleJobStatusPermission): Promise<RoleJobStatusPermission> {
    const [newPermission] = await db
      .insert(roleJobStatusPermissions)
      .values(permission)
      .returning();
    return newPermission;
  }

  async updateRoleJobStatusPermission(
    id: string,
    permission: Partial<InsertRoleJobStatusPermission>
  ): Promise<RoleJobStatusPermission> {
    const [updated] = await db
      .update(roleJobStatusPermissions)
      .set({ ...permission, updatedAt: new Date() })
      .where(eq(roleJobStatusPermissions.id, id))
      .returning();
    return updated;
  }

  async deleteRoleJobStatusPermission(id: string): Promise<void> {
    await db
      .delete(roleJobStatusPermissions)
      .where(eq(roleJobStatusPermissions.id, id));
  }

  async bulkUpdateRoleJobStatusPermissions(
    role: string,
    permissions: Array<{ jobStatusId: string; canView: boolean; canEdit: boolean }>
  ): Promise<void> {
    await db
      .delete(roleJobStatusPermissions)
      .where(eq(roleJobStatusPermissions.role, role));

    const permissionsToInsert = permissions.map(perm => ({
      role,
      jobStatusId: perm.jobStatusId,
      canView: perm.canView,
      canEdit: perm.canEdit,
    }));

    if (permissionsToInsert.length > 0) {
      await db.insert(roleJobStatusPermissions).values(permissionsToInsert);
    }
  }

  // Kanban Board operations
  async getKanbanBoards(): Promise<any[]> {
    return await db
      .select()
      .from(kanbanBoards)
      .orderBy(desc(kanbanBoards.isDefault), kanbanBoards.name);
  }

  async getKanbanBoard(id: string): Promise<any | undefined> {
    const [board] = await db
      .select()
      .from(kanbanBoards)
      .where(eq(kanbanBoards.id, id));
    return board;
  }

  async createKanbanBoard(board: any): Promise<any> {
    const [newBoard] = await db.insert(kanbanBoards).values(board).returning();
    return newBoard;
  }

  async updateKanbanBoard(id: string, board: Partial<any>): Promise<any> {
    const [updated] = await db
      .update(kanbanBoards)
      .set({ ...board, updatedAt: new Date() })
      .where(eq(kanbanBoards.id, id))
      .returning();
    return updated;
  }

  async deleteKanbanBoard(id: string): Promise<void> {
    await db.delete(kanbanBoards).where(eq(kanbanBoards.id, id));
  }

  async getKanbanStages(kanbanBoardId: string): Promise<any[]> {
    return await db
      .select()
      .from(kanbanStages)
      .where(eq(kanbanStages.kanbanBoardId, kanbanBoardId))
      .orderBy(kanbanStages.order);
  }

  async createKanbanStage(stage: any): Promise<any> {
    const [newStage] = await db.insert(kanbanStages).values(stage).returning();
    return newStage;
  }

  async updateKanbanStage(id: string, stage: Partial<any>): Promise<any> {
    const [updated] = await db
      .update(kanbanStages)
      .set(stage)
      .where(eq(kanbanStages.id, id))
      .returning();
    return updated;
  }

  async deleteKanbanStage(id: string): Promise<void> {
    await db.delete(kanbanStages).where(eq(kanbanStages.id, id));
  }

  async reorderKanbanStages(stageUpdates: Array<{ id: string; order: number }>): Promise<void> {
    for (const update of stageUpdates) {
      await db
        .update(kanbanStages)
        .set({ order: update.order })
        .where(eq(kanbanStages.id, update.id));
    }
  }

  // Real-time dashboard operations
  async getClientRealtimeData(clientId: string): Promise<any> {
    try {
      // Get client information
      const client = await this.getClient(clientId);
      if (!client) {
        throw new Error("Client not found");
      }

      // Get all jobs for this client
      const allJobs = await db
        .select()
        .from(jobs)
        .where(eq(jobs.clientId, clientId));

    // Get all status names in one query
    const allStatuses = await db.select().from(jobStatuses);
    const statusMap = new Map(allStatuses.map(s => [s.key, s.name]));
    
    // Count jobs by status name
    const statusCounts: Record<string, number> = {};
    
    for (const job of allJobs) {
      const statusName = job.status && statusMap.has(job.status) 
        ? statusMap.get(job.status)! 
        : 'Sem Status';
      statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
    }
    
    // Convert to array format
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));

    // Get jobs by Kanban stages (for jobs with Kanban boards)
    const jobsWithKanban = allJobs.filter(j => j.kanbanBoardId);
    const kanbanDistribution = [];
    
    for (const job of jobsWithKanban) {
      if (job.kanbanBoardId) {
        const stages = await this.getKanbanStages(job.kanbanBoardId);
        for (const stage of stages) {
          // Count candidates in this stage for this job
          const candidateCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(applications)
            .where(
              and(
                eq(applications.jobId, job.id),
                eq(applications.kanbanStageId, stage.id)
              )
            );
          
          kanbanDistribution.push({
            jobId: job.id,
            jobTitle: job.title,
            stageName: stage.name,
            stageColor: stage.color,
            candidateCount: Number(candidateCount[0]?.count) || 0,
          });
        }
      }
    }

    // Calculate metrics
    const totalJobs = allJobs.length;
    const openJobs = allJobs.filter(j => !j.admissionDate).length;
    const closedJobs = allJobs.filter(j => j.admissionDate).length;
    
    // Calculate average time to close (in days)
    const closedJobsWithDates = allJobs.filter(j => j.admissionDate && j.openingDate);
    let averageTimeToClose = 0;
    if (closedJobsWithDates.length > 0) {
      const totalDays = closedJobsWithDates.reduce((sum, job) => {
        const opening = new Date(job.openingDate!);
        const admission = new Date(job.admissionDate!);
        const days = Math.floor((admission.getTime() - opening.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      averageTimeToClose = Math.round(totalDays / closedJobsWithDates.length);
    }

    // Get recent jobs (last 5)
    const recentJobs = allJobs
      .sort((a, b) => new Date(b.openingDate!).getTime() - new Date(a.openingDate!).getTime())
      .slice(0, 5);

      return {
        client,
        metrics: {
          totalJobs,
          openJobs,
          closedJobs,
          averageTimeToClose,
        },
        statusDistribution,
        kanbanDistribution,
        recentJobs,
        allJobs,
      };
    } catch (error) {
      console.error("Error in getClientRealtimeData:", error);
      throw error;
    }
  }

  // System Settings operations
  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings).orderBy(systemSettings.key);
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }

  async upsertSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const existing = await this.getSystemSetting(setting.key);
    
    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set({ 
          value: setting.value,
          label: setting.label,
          description: setting.description,
          minValue: setting.minValue,
          maxValue: setting.maxValue,
          updatedAt: new Date()
        })
        .where(eq(systemSettings.key, setting.key))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(systemSettings).values(setting).returning();
      return created;
    }
  }

  async updateSystemSettingValue(key: string, value: string): Promise<SystemSetting> {
    const [updated] = await db
      .update(systemSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(systemSettings.key, key))
      .returning();
    return updated;
  }

  // Approval Workflow operations
  async getApprovalWorkflows(): Promise<ApprovalWorkflow[]> {
    const workflows = await db.select().from(approvalWorkflows).orderBy(desc(approvalWorkflows.createdAt));
    return workflows;
  }

  async getApprovalWorkflow(id: string): Promise<ApprovalWorkflow | undefined> {
    const [workflow] = await db.select().from(approvalWorkflows).where(eq(approvalWorkflows.id, id));
    return workflow;
  }

  async createApprovalWorkflow(workflowData: InsertApprovalWorkflow): Promise<ApprovalWorkflow> {
    const [workflow] = await db.insert(approvalWorkflows).values(workflowData).returning();
    return workflow;
  }

  async updateApprovalWorkflow(id: string, workflowData: Partial<InsertApprovalWorkflow>): Promise<ApprovalWorkflow> {
    const [workflow] = await db
      .update(approvalWorkflows)
      .set({ ...workflowData, updatedAt: new Date() })
      .where(eq(approvalWorkflows.id, id))
      .returning();
    return workflow;
  }

  async deleteApprovalWorkflow(id: string): Promise<void> {
    await db.delete(approvalWorkflows).where(eq(approvalWorkflows.id, id));
  }

  // Approval Workflow Steps operations
  async getWorkflowSteps(workflowId: string): Promise<ApprovalWorkflowStep[]> {
    const steps = await db
      .select()
      .from(approvalWorkflowSteps)
      .where(eq(approvalWorkflowSteps.workflowId, workflowId))
      .orderBy(approvalWorkflowSteps.stepOrder);
    return steps;
  }

  async createWorkflowStep(stepData: InsertApprovalWorkflowStep): Promise<ApprovalWorkflowStep> {
    const [step] = await db.insert(approvalWorkflowSteps).values(stepData).returning();
    return step;
  }

  async updateWorkflowStep(id: string, stepData: Partial<InsertApprovalWorkflowStep>): Promise<ApprovalWorkflowStep> {
    const [step] = await db
      .update(approvalWorkflowSteps)
      .set({ ...stepData, updatedAt: new Date() })
      .where(eq(approvalWorkflowSteps.id, id))
      .returning();
    return step;
  }

  async deleteWorkflowStep(id: string): Promise<void> {
    await db.delete(approvalWorkflowSteps).where(eq(approvalWorkflowSteps.id, id));
  }

  // Workflow Job Status Rules operations
  async getWorkflowJobStatusRules(workflowId: string): Promise<WorkflowJobStatusRule[]> {
    const rules = await db
      .select()
      .from(workflowJobStatusRules)
      .where(eq(workflowJobStatusRules.workflowId, workflowId));
    return rules;
  }

  async createWorkflowJobStatusRule(ruleData: InsertWorkflowJobStatusRule): Promise<WorkflowJobStatusRule> {
    const [rule] = await db.insert(workflowJobStatusRules).values(ruleData).returning();
    return rule;
  }

  async deleteWorkflowJobStatusRule(id: string): Promise<void> {
    await db.delete(workflowJobStatusRules).where(eq(workflowJobStatusRules.id, id));
  }

  async deleteWorkflowJobStatusRulesByWorkflow(workflowId: string): Promise<void> {
    await db.delete(workflowJobStatusRules).where(eq(workflowJobStatusRules.workflowId, workflowId));
  }

  // Job Approval History operations
  async getJobApprovalHistory(jobId: string): Promise<JobApprovalHistory[]> {
    const history = await db
      .select()
      .from(jobApprovalHistory)
      .where(eq(jobApprovalHistory.jobId, jobId))
      .orderBy(jobApprovalHistory.stepOrder);
    return history;
  }

  async createJobApprovalHistory(historyData: InsertJobApprovalHistory): Promise<JobApprovalHistory> {
    const [history] = await db.insert(jobApprovalHistory).values(historyData).returning();
    return history;
  }

  async updateJobApprovalHistory(id: string, historyData: Partial<InsertJobApprovalHistory>): Promise<JobApprovalHistory> {
    const [history] = await db
      .update(jobApprovalHistory)
      .set({ ...historyData, updatedAt: new Date() })
      .where(eq(jobApprovalHistory.id, id))
      .returning();
    return history;
  }

  // Approvals operations (for Approvals menu)
  async getPendingApprovalsForUser(userId: string): Promise<any[]> {
    // Get jobs that are pending approval and where the user is an approver
    const pendingJobs = await db
      .select({
        job: jobs,
        company: companies,
        client: clients,
        profession: professions,
        workflow: approvalWorkflows,
        currentStep: approvalWorkflowSteps,
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(clients, eq(jobs.clientId, clients.id))
      .leftJoin(professions, eq(jobs.professionId, professions.id))
      .leftJoin(approvalWorkflows, eq(jobs.approvalWorkflowId, approvalWorkflows.id))
      .leftJoin(approvalWorkflowSteps, and(
        eq(approvalWorkflowSteps.workflowId, jobs.approvalWorkflowId),
        eq(approvalWorkflowSteps.stepOrder, jobs.currentApprovalStep)
      ))
      .where(and(
        eq(jobs.approvalStatus, 'pending'),
        or(
          eq(approvalWorkflowSteps.userId, userId),
          eq(approvalWorkflowSteps.userId2, userId)
        )
      ));
    
    return pendingJobs;
  }

  async approveJob(jobId: string, userId: string, comments?: string): Promise<any> {
    // Get the job and current workflow step
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId));

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.approvalStatus !== 'pending') {
      throw new Error('Job is not pending approval');
    }

    // Get current workflow step
    const [currentStep] = await db
      .select()
      .from(approvalWorkflowSteps)
      .where(and(
        eq(approvalWorkflowSteps.workflowId, job.approvalWorkflowId!),
        eq(approvalWorkflowSteps.stepOrder, job.currentApprovalStep!)
      ));

    if (!currentStep) {
      throw new Error('Workflow step not found');
    }

    // Record approval in history
    await db.insert(jobApprovalHistory).values({
      jobId,
      workflowStepId: currentStep.id,
      stepName: `Etapa ${currentStep.stepOrder}`,
      stepOrder: currentStep.stepOrder,
      status: 'approved',
      approvedBy: userId,
      comments: comments || null,
      approvedAt: new Date(),
    });

    // Get all workflow steps for this workflow
    const allSteps = await db
      .select()
      .from(approvalWorkflowSteps)
      .where(eq(approvalWorkflowSteps.workflowId, job.approvalWorkflowId!))
      .orderBy(approvalWorkflowSteps.stepOrder);

    const isLastStep = currentStep.stepOrder === allSteps.length;

    if (isLastStep) {
      // All steps completed - approve the job and change status
      await db
        .update(jobs)
        .set({
          approvalStatus: 'approved',
          approvedBy: userId,
          approvedAt: new Date(),
          status: 'aprovada', // Change status from "Nova Vaga" to "Aprovada"
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, jobId));

      return { success: true, message: 'Job approved successfully', approved: true };
    } else {
      // Move to next step
      await db
        .update(jobs)
        .set({
          currentApprovalStep: currentStep.stepOrder + 1,
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, jobId));

      return { success: true, message: 'Approval recorded, moved to next step', approved: false };
    }
  }

  async rejectJob(jobId: string, userId: string, reason: string): Promise<any> {
    // Get the job and current workflow step
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId));

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.approvalStatus !== 'pending') {
      throw new Error('Job is not pending approval');
    }

    // Get current workflow step
    const [currentStep] = await db
      .select()
      .from(approvalWorkflowSteps)
      .where(and(
        eq(approvalWorkflowSteps.workflowId, job.approvalWorkflowId!),
        eq(approvalWorkflowSteps.stepOrder, job.currentApprovalStep!)
      ));

    if (!currentStep) {
      throw new Error('Workflow step not found');
    }

    // Record rejection in history
    await db.insert(jobApprovalHistory).values({
      jobId,
      workflowStepId: currentStep.id,
      stepName: `Etapa ${currentStep.stepOrder}`,
      stepOrder: currentStep.stepOrder,
      status: 'rejected',
      approvedBy: userId,
      comments: reason,
      approvedAt: new Date(),
    });

    // Reject the job
    await db
      .update(jobs)
      .set({
        approvalStatus: 'rejected',
        approvedBy: userId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    return { success: true, message: 'Job rejected successfully' };
  }

  async getAllApprovalHistory(): Promise<any[]> {
    const history = await db
      .select({
        history: jobApprovalHistory,
        job: jobs,
        approver: users,
        company: companies,
        client: clients,
        profession: professions,
      })
      .from(jobApprovalHistory)
      .leftJoin(jobs, eq(jobApprovalHistory.jobId, jobs.id))
      .leftJoin(users, eq(jobApprovalHistory.approvedBy, users.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(clients, eq(jobs.clientId, clients.id))
      .leftJoin(professions, eq(jobs.professionId, professions.id))
      .orderBy(desc(jobApprovalHistory.approvedAt));

    return history;
  }

  // Organization operations (Multi-tenant support)
  async getOrganizations(): Promise<Organization[]> {
    const allOrganizations = await db.select().from(organizations).orderBy(desc(organizations.createdAt));
    return allOrganizations;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
    return organization;
  }

  async createOrganization(organizationData: InsertOrganization): Promise<Organization> {
    const [organization] = await db.insert(organizations).values(organizationData).returning();
    return organization;
  }

  async updateOrganization(id: string, organizationData: Partial<InsertOrganization>): Promise<Organization> {
    const [organization] = await db
      .update(organizations)
      .set({ ...organizationData, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return organization;
  }

  async deleteOrganization(id: string): Promise<void> {
    await db.delete(organizations).where(eq(organizations.id, id));
  }

  // Financial operations (Invoices and Payments)
  async getInvoices(): Promise<Invoice[]> {
    const allInvoices = await db.select().from(invoices).orderBy(desc(invoices.createdAt));
    return allInvoices;
  }

  async getInvoicesByOrganization(organizationId: string): Promise<Invoice[]> {
    const orgInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.organizationId, organizationId))
      .orderBy(desc(invoices.createdAt));
    return orgInvoices;
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoiceData: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(invoiceData).returning();
    return invoice;
  }

  async updateInvoice(id: string, invoiceData: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({ ...invoiceData, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: string): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  async markInvoiceAsPaid(id: string, paidDate: Date, paymentMethod: string): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({ 
        status: 'paid',
        paidDate,
        paymentMethod,
        updatedAt: new Date()
      })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  // Payment History operations
  async getPaymentsByInvoice(invoiceId: string): Promise<PaymentHistory[]> {
    const payments = await db
      .select()
      .from(paymentHistory)
      .where(eq(paymentHistory.invoiceId, invoiceId))
      .orderBy(desc(paymentHistory.createdAt));
    return payments;
  }

  async createPayment(paymentData: InsertPaymentHistory): Promise<PaymentHistory> {
    const [payment] = await db.insert(paymentHistory).values(paymentData).returning();
    return payment;
  }

  // Plan operations
  async getPlans(): Promise<Plan[]> {
    const allPlans = await db
      .select()
      .from(plans)
      .orderBy(plans.displayOrder, desc(plans.createdAt));
    return allPlans;
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }

  async createPlan(planData: InsertPlan): Promise<Plan> {
    const [plan] = await db.insert(plans).values(planData).returning();
    return plan;
  }

  async updatePlan(id: string, planData: Partial<InsertPlan>): Promise<Plan> {
    const [plan] = await db
      .update(plans)
      .set({ ...planData, updatedAt: new Date() })
      .where(eq(plans.id, id))
      .returning();
    return plan;
  }

  async deletePlan(id: string): Promise<void> {
    await db.delete(plans).where(eq(plans.id, id));
  }

  // Blacklist Candidates operations
  async getBlacklistCandidates(): Promise<BlacklistCandidate[]> {
    const candidates = await db
      .select()
      .from(blacklistCandidates)
      .orderBy(desc(blacklistCandidates.createdAt));
    return candidates;
  }

  async getBlacklistCandidate(id: string): Promise<BlacklistCandidate | undefined> {
    const [candidate] = await db
      .select()
      .from(blacklistCandidates)
      .where(eq(blacklistCandidates.id, id));
    return candidate;
  }

  async getBlacklistCandidateByCPF(cpf: string): Promise<BlacklistCandidate | undefined> {
    const [candidate] = await db
      .select()
      .from(blacklistCandidates)
      .where(eq(blacklistCandidates.cpf, cpf));
    return candidate;
  }

  async createBlacklistCandidate(candidateData: InsertBlacklistCandidate): Promise<BlacklistCandidate> {
    const [candidate] = await db
      .insert(blacklistCandidates)
      .values(candidateData)
      .returning();
    return candidate;
  }

  async updateBlacklistCandidate(id: string, candidateData: Partial<InsertBlacklistCandidate>): Promise<BlacklistCandidate> {
    const [candidate] = await db
      .update(blacklistCandidates)
      .set({ ...candidateData, updatedAt: new Date() })
      .where(eq(blacklistCandidates.id, id))
      .returning();
    return candidate;
  }

  async deleteBlacklistCandidate(id: string): Promise<void> {
    await db.delete(blacklistCandidates).where(eq(blacklistCandidates.id, id));
  }

  // Senior HCM Integration operations
  async getSeniorIntegrationSettings(organizationId: string): Promise<SeniorIntegrationSetting | undefined> {
    const [settings] = await db
      .select()
      .from(seniorIntegrationSettings)
      .where(eq(seniorIntegrationSettings.organizationId, organizationId));
    return settings;
  }

  async createOrUpdateSeniorIntegrationSettings(
    organizationId: string,
    settingsData: InsertSeniorIntegrationSetting
  ): Promise<SeniorIntegrationSetting> {
    const existing = await this.getSeniorIntegrationSettings(organizationId);
    
    if (existing) {
      // Update existing settings
      const [updated] = await db
        .update(seniorIntegrationSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(seniorIntegrationSettings.organizationId, organizationId))
        .returning();
      return updated;
    } else {
      // Create new settings
      const [created] = await db
        .insert(seniorIntegrationSettings)
        .values({
          organizationId,
          ...settingsData,
        })
        .returning();
      return created;
    }
  }

  async testSeniorConnection(organizationId: string): Promise<{
    success: boolean;
    health: boolean;
    tablesCount: number;
    employeesCount: number;
    error?: string;
  }> {
    const settings = await this.getSeniorIntegrationSettings(organizationId);
    
    if (!settings) {
      return {
        success: false,
        health: false,
        tablesCount: 0,
        employeesCount: 0,
        error: "Integration settings not found",
      };
    }

    const service = createSeniorIntegrationService({
      apiUrl: settings.apiUrl,
      apiKey: settings.apiKey,
    });

    const result = await service.testConnection();

    // Update last sync status
    await db
      .update(seniorIntegrationSettings)
      .set({
        lastSyncAt: new Date(),
        lastSyncStatus: result.success ? "success" : "error",
        lastSyncError: result.error || null,
        updatedAt: new Date(),
      })
      .where(eq(seniorIntegrationSettings.organizationId, organizationId));

    return result;
  }

  async updateSeniorIntegrationSyncStatus(
    organizationId: string,
    status: string,
    message: string | null,
    error: string | null
  ): Promise<void> {
    await db
      .update(seniorIntegrationSettings)
      .set({
        lastSyncAt: new Date(),
        lastSyncStatus: status,
        lastSyncError: error,
        updatedAt: new Date(),
      })
      .where(eq(seniorIntegrationSettings.organizationId, organizationId));
  }

  async getSeniorEmployees(organizationId: string): Promise<any[]> {
    const settings = await this.getSeniorIntegrationSettings(organizationId);
    
    if (!settings || !settings.isActive) {
      throw new Error("Senior integration is not configured or not active");
    }

    const service = createSeniorIntegrationService({
      apiUrl: settings.apiUrl,
      apiKey: settings.apiKey,
    });

    return await service.getActiveEmployees();
  }

  async getSeniorDepartments(organizationId: string): Promise<any[]> {
    const settings = await this.getSeniorIntegrationSettings(organizationId);
    
    if (!settings || !settings.isActive) {
      throw new Error("Senior integration is not configured or not active");
    }

    const service = createSeniorIntegrationService({
      apiUrl: settings.apiUrl,
      apiKey: settings.apiKey,
    });

    return await service.getDepartments();
  }

  async getSeniorPositions(organizationId: string): Promise<any[]> {
    const settings = await this.getSeniorIntegrationSettings(organizationId);
    
    if (!settings || !settings.isActive) {
      throw new Error("Senior integration is not configured or not active");
    }

    const service = createSeniorIntegrationService({
      apiUrl: settings.apiUrl,
      apiKey: settings.apiKey,
    });

    return await service.getPositions();
  }

  async executeSeniorQuery(organizationId: string, sqlText: string): Promise<any[]> {
    const settings = await this.getSeniorIntegrationSettings(organizationId);
    
    if (!settings || !settings.isActive) {
      throw new Error("Senior integration is not configured or not active");
    }

    const service = createSeniorIntegrationService({
      apiUrl: settings.apiUrl,
      apiKey: settings.apiKey,
    });

    return await service.executeQuery(sqlText);
  }

  async syncSeniorData(organizationId: string): Promise<{
    success: boolean;
    message: string;
    syncedAt?: Date;
    error?: string;
  }> {
    try {
      const settings = await this.getSeniorIntegrationSettings(organizationId);
      
      if (!settings || !settings.isActive) {
        return {
          success: false,
          message: "Senior integration is not configured or not active",
          error: "Integration not configured",
        };
      }

      const service = createSeniorIntegrationService({
        apiUrl: settings.apiUrl,
        apiKey: settings.apiKey,
      });

      // Test connection first
      const testResult = await service.testConnection();
      
      if (!testResult.success) {
        await db
          .update(seniorIntegrationSettings)
          .set({
            lastSyncAt: new Date(),
            lastSyncStatus: "error",
            lastSyncError: testResult.error || "Connection test failed",
            updatedAt: new Date(),
          })
          .where(eq(seniorIntegrationSettings.organizationId, organizationId));

        return {
          success: false,
          message: "Connection test failed",
          error: testResult.error,
        };
      }

      // Fetch data from Senior
      const employees = await service.getActiveEmployees();
      const departments = await service.getDepartments();
      const positions = await service.getPositions();

      // Update last sync status
      const syncedAt = new Date();
      await db
        .update(seniorIntegrationSettings)
        .set({
          lastSyncAt: syncedAt,
          lastSyncStatus: "success",
          lastSyncError: null,
          updatedAt: new Date(),
        })
        .where(eq(seniorIntegrationSettings.organizationId, organizationId));

      return {
        success: true,
        message: `Successfully synced ${employees.length} employees, ${departments.length} departments, and ${positions.length} positions from Senior`,
        syncedAt,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      await db
        .update(seniorIntegrationSettings)
        .set({
          lastSyncAt: new Date(),
          lastSyncStatus: "error",
          lastSyncError: errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(seniorIntegrationSettings.organizationId, organizationId));

      return {
        success: false,
        message: "Failed to sync data from Senior",
        error: errorMessage,
      };
    }
  }
}

export const storage = new DatabaseStorage();
