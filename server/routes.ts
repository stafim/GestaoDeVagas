import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simpleAuth";
import { getWorkPositions } from "./hcm-connection";
import { emailService } from "./emailService";
import { 
  insertOrganizationSchema,
  insertOrganizationWithAdminSchema,
  insertCompanySchema, 
  insertCostCenterSchema,
  insertClientSchema,
  insertClientEmployeeSchema,
  insertClientDashboardPermissionSchema,
  insertJobSchema,
  insertCandidateSchema,
  insertApplicationSchema,
  insertUserCompanyRoleSchema,
  insertSelectionStageSchema,
  insertInterviewSchema,
  insertInterviewCriteriaSchema,
  insertApplicationStageProgressSchema,
  insertUserMenuPermissionSchema,
  insertRoleJobStatusPermissionSchema,
  insertInvoiceSchema,
  insertPaymentHistorySchema,
  insertPlanSchema,
  insertApprovalWorkflowSchema,
  insertApprovalWorkflowStepSchema,
  insertJobApprovalHistorySchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Validation schemas for role job status permissions
const updateRoleJobStatusPermissionSchema = z.object({
  role: z.string().optional(),
  jobStatusId: z.string().optional(),
  canView: z.boolean().optional(),
  canEdit: z.boolean().optional(),
});

const bulkRoleJobStatusPermissionsSchema = z.object({
  permissions: z.array(z.object({
    jobStatusId: z.string(),
    canView: z.boolean(),
    canEdit: z.boolean(),
  })),
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'contracts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const contractStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'contract-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadContract = multer({
  storage: contractStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF, DOC, DOCX, JPG e PNG são permitidos'));
    }
  }
});

// Authorization middleware
const requirePermission = (permission: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.session?.user?.id;
      const companyId = req.body.companyId || req.params.companyId;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID required" });
      }
      
      const hasPermission = await storage.checkUserPermission(userId, companyId, permission);
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({ message: "Authorization check failed" });
    }
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - setup Simple Auth for authentication
  setupSimpleAuth(app);

  // Auth endpoints (handled by setupSimpleAuth)

  // HCM Integration - Work Positions
  app.get('/api/hcm/work-positions', isAuthenticated, async (req, res) => {
    try {
      const workPositions = await getWorkPositions();
      res.json(workPositions);
    } catch (error) {
      console.error("Error fetching work positions from HCM:", error);
      res.status(500).json({ message: "Failed to fetch work positions from HCM" });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const months = Array.isArray(req.query.month) ? req.query.month as string[] : (req.query.month ? [req.query.month as string] : []);
      const companyIds = Array.isArray(req.query.companyId) ? req.query.companyId as string[] : (req.query.companyId ? [req.query.companyId as string] : []);
      const divisions = Array.isArray(req.query.division) ? req.query.division as string[] : (req.query.division ? [req.query.division as string] : []);
      const recruiterIds = Array.isArray(req.query.recruiterId) ? req.query.recruiterId as string[] : (req.query.recruiterId ? [req.query.recruiterId as string] : []);
      const metrics = await storage.getDashboardMetrics(months, companyIds, divisions, recruiterIds);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get('/api/dashboard/jobs-by-status', isAuthenticated, async (req, res) => {
    try {
      const months = Array.isArray(req.query.month) ? req.query.month as string[] : (req.query.month ? [req.query.month as string] : []);
      const companyIds = Array.isArray(req.query.companyId) ? req.query.companyId as string[] : (req.query.companyId ? [req.query.companyId as string] : []);
      const divisions = Array.isArray(req.query.division) ? req.query.division as string[] : (req.query.division ? [req.query.division as string] : []);
      const recruiterIds = Array.isArray(req.query.recruiterId) ? req.query.recruiterId as string[] : (req.query.recruiterId ? [req.query.recruiterId as string] : []);
      const data = await storage.getJobsByStatus(months, companyIds, divisions, recruiterIds);
      res.json(data);
    } catch (error) {
      console.error("Error fetching jobs by status:", error);
      res.status(500).json({ message: "Failed to fetch jobs by status" });
    }
  });

  app.get('/api/dashboard/applications-by-month', isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getApplicationsByMonth();
      res.json(data);
    } catch (error) {
      console.error("Error fetching applications by month:", error);
      res.status(500).json({ message: "Failed to fetch applications by month" });
    }
  });

  app.get('/api/dashboard/open-jobs-by-month', isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getOpenJobsByMonth();
      res.json(data);
    } catch (error) {
      console.error("Error fetching open jobs by month:", error);
      res.status(500).json({ message: "Failed to fetch open jobs by month" });
    }
  });

  app.get('/api/dashboard/jobs-by-creator', isAuthenticated, async (req, res) => {
    try {
      const months = Array.isArray(req.query.month) ? req.query.month as string[] : (req.query.month ? [req.query.month as string] : []);
      const companyIds = Array.isArray(req.query.companyId) ? req.query.companyId as string[] : (req.query.companyId ? [req.query.companyId as string] : []);
      const divisions = Array.isArray(req.query.division) ? req.query.division as string[] : (req.query.division ? [req.query.division as string] : []);
      const recruiterIds = Array.isArray(req.query.recruiterId) ? req.query.recruiterId as string[] : (req.query.recruiterId ? [req.query.recruiterId as string] : []);
      const data = await storage.getJobsByCreator(months, companyIds, divisions, recruiterIds);
      res.json(data);
    } catch (error) {
      console.error("Error fetching jobs by creator:", error);
      res.status(500).json({ message: "Failed to fetch jobs by creator" });
    }
  });

  app.get('/api/dashboard/all-jobs-by-creator', isAuthenticated, async (req, res) => {
    try {
      const months = Array.isArray(req.query.month) ? req.query.month as string[] : (req.query.month ? [req.query.month as string] : []);
      const companyIds = Array.isArray(req.query.companyId) ? req.query.companyId as string[] : (req.query.companyId ? [req.query.companyId as string] : []);
      const divisions = Array.isArray(req.query.division) ? req.query.division as string[] : (req.query.division ? [req.query.division as string] : []);
      const recruiterIds = Array.isArray(req.query.recruiterId) ? req.query.recruiterId as string[] : (req.query.recruiterId ? [req.query.recruiterId as string] : []);
      const data = await storage.getAllJobsByCreator(months, companyIds, divisions, recruiterIds);
      res.json(data);
    } catch (error) {
      console.error("Error fetching all jobs by creator:", error);
      res.status(500).json({ message: "Failed to fetch all jobs by creator" });
    }
  });

  app.get('/api/dashboard/jobs-by-company', isAuthenticated, async (req, res) => {
    try {
      const months = Array.isArray(req.query.month) ? req.query.month as string[] : (req.query.month ? [req.query.month as string] : []);
      const companyIds = Array.isArray(req.query.companyId) ? req.query.companyId as string[] : (req.query.companyId ? [req.query.companyId as string] : []);
      const divisions = Array.isArray(req.query.division) ? req.query.division as string[] : (req.query.division ? [req.query.division as string] : []);
      const recruiterIds = Array.isArray(req.query.recruiterId) ? req.query.recruiterId as string[] : (req.query.recruiterId ? [req.query.recruiterId as string] : []);
      const data = await storage.getJobsByCompany(months, companyIds, divisions, recruiterIds);
      res.json(data);
    } catch (error) {
      console.error("Error fetching jobs by company:", error);
      res.status(500).json({ message: "Failed to fetch jobs by company" });
    }
  });

  app.get('/api/dashboard/jobs-by-client', isAuthenticated, async (req, res) => {
    try {
      const months = Array.isArray(req.query.month) ? req.query.month as string[] : (req.query.month ? [req.query.month as string] : []);
      const companyIds = Array.isArray(req.query.companyId) ? req.query.companyId as string[] : (req.query.companyId ? [req.query.companyId as string] : []);
      const divisions = Array.isArray(req.query.division) ? req.query.division as string[] : (req.query.division ? [req.query.division as string] : []);
      const recruiterIds = Array.isArray(req.query.recruiterId) ? req.query.recruiterId as string[] : (req.query.recruiterId ? [req.query.recruiterId as string] : []);
      const data = await storage.getJobsByClient(months, companyIds, divisions, recruiterIds);
      res.json(data);
    } catch (error) {
      console.error("Error fetching jobs by client:", error);
      res.status(500).json({ message: "Failed to fetch jobs by client" });
    }
  });

  app.get('/api/dashboard/jobs-sla', isAuthenticated, async (req, res) => {
    try {
      const months = Array.isArray(req.query.month) ? req.query.month as string[] : (req.query.month ? [req.query.month as string] : []);
      const companyIds = Array.isArray(req.query.companyId) ? req.query.companyId as string[] : (req.query.companyId ? [req.query.companyId as string] : []);
      const divisions = Array.isArray(req.query.division) ? req.query.division as string[] : (req.query.division ? [req.query.division as string] : []);
      const recruiterIds = Array.isArray(req.query.recruiterId) ? req.query.recruiterId as string[] : (req.query.recruiterId ? [req.query.recruiterId as string] : []);
      const data = await storage.getJobsSLA(months, companyIds, divisions, recruiterIds);
      res.json(data);
    } catch (error) {
      console.error("Error fetching jobs SLA:", error);
      res.status(500).json({ message: "Failed to fetch jobs SLA" });
    }
  });

  app.get('/api/dashboard/jobs-productivity', isAuthenticated, async (req, res) => {
    try {
      const months = Array.isArray(req.query.month) ? req.query.month as string[] : (req.query.month ? [req.query.month as string] : []);
      const companyIds = Array.isArray(req.query.companyId) ? req.query.companyId as string[] : (req.query.companyId ? [req.query.companyId as string] : []);
      const divisions = Array.isArray(req.query.division) ? req.query.division as string[] : (req.query.division ? [req.query.division as string] : []);
      const recruiterIds = Array.isArray(req.query.recruiterId) ? req.query.recruiterId as string[] : (req.query.recruiterId ? [req.query.recruiterId as string] : []);
      const data = await storage.getJobsProductivity(months, companyIds, divisions, recruiterIds);
      res.json(data);
    } catch (error) {
      console.error("Error fetching jobs productivity:", error);
      res.status(500).json({ message: "Failed to fetch jobs productivity" });
    }
  });

  app.get('/api/dashboard/jobs-status-summary', async (req, res) => {
    try {
      const month = req.query.month as string | undefined;
      const data = await storage.getJobsStatusSummary(month);
      res.json(data);
    } catch (error) {
      console.error("Error fetching jobs status summary:", error);
      res.status(500).json({ message: "Failed to fetch jobs status summary" });
    }
  });

  app.get('/api/reports/job-closure', isAuthenticated, async (req, res) => {
    try {
      const month = req.query.month as string | undefined;
      const report = await storage.getJobClosureReport(month);
      res.json(report);
    } catch (error) {
      console.error("Error fetching job closure report:", error);
      res.status(500).json({ message: "Failed to fetch job closure report" });
    }
  });

  app.get('/api/reports/closed-jobs-by-recruiter', isAuthenticated, async (req, res) => {
    try {
      const month = req.query.month as string | undefined;
      const report = await storage.getClosedJobsByRecruiter(month);
      res.json(report);
    } catch (error) {
      console.error("Error fetching closed jobs by recruiter report:", error);
      res.status(500).json({ message: "Failed to fetch closed jobs by recruiter report" });
    }
  });

  // Real-time dashboard routes
  app.get('/api/realtime/client/:clientId', isAuthenticated, async (req, res) => {
    try {
      const { clientId } = req.params;
      const data = await storage.getClientRealtimeData(clientId);
      res.json(data);
    } catch (error) {
      console.error("Error fetching client realtime data:", error);
      res.status(500).json({ message: "Failed to fetch client realtime data" });
    }
  });

  // Profession routes
  app.get('/api/professions', isAuthenticated, async (req, res) => {
    try {
      const professions = await storage.getProfessions();
      res.json(professions);
    } catch (error) {
      console.error("Error fetching professions:", error);
      res.status(500).json({ message: "Failed to fetch professions" });
    }
  });

  // Recruiters endpoint
  app.get('/api/recruiters', isAuthenticated, async (req, res) => {
    try {
      const recruiters = await storage.getRecruiters();
      res.json(recruiters);
    } catch (error) {
      console.error("Error fetching recruiters:", error);
      res.status(500).json({ message: "Failed to fetch recruiters" });
    }
  });

  // Users routes
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', isAuthenticated, async (req, res) => {
    try {
      const userData = req.body;
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Validate password is provided
      if (!userData.password || userData.password.length < 6) {
        return res.status(400).json({ message: "Senha deve ter pelo menos 6 caracteres" });
      }
      
      // Hash the provided password
      const bcrypt = await import('bcrypt');
      const passwordHash = await bcrypt.hash(userData.password, 10);
      
      const newUser = await storage.createUser({
        email: userData.email,
        passwordHash: passwordHash,
        firstName: userData.name,
        lastName: userData.name, // Using name for both first and last
        role: userData.role || 'user'
      });
      
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // If email is being changed, check if new email is available
      if (userData.email && userData.email !== existingUser.email) {
        const emailInUse = await storage.getUserByEmail(userData.email);
        if (emailInUse) {
          return res.status(400).json({ message: "Email já está em uso" });
        }
      }
      
      // Update user (password is updated separately)
      const updatedUser = await storage.updateUser(id, {
        email: userData.email,
        firstName: userData.name,
        lastName: userData.name,
        role: userData.role
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      await storage.deleteUser(id);
      res.json({ message: "Usuário excluído com sucesso" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Erro ao excluir usuário" });
    }
  });

  app.get('/api/professions/categories/:category', isAuthenticated, async (req, res) => {
    try {
      const { category } = req.params;
      const professions = await storage.getProfessionsByCategory(category);
      res.json(professions);
    } catch (error) {
      console.error("Error fetching professions by category:", error);
      res.status(500).json({ message: "Failed to fetch professions by category" });
    }
  });

  app.get('/api/professions/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const profession = await storage.getProfession(id);
      if (!profession) {
        return res.status(404).json({ message: "Profession not found" });
      }
      res.json(profession);
    } catch (error) {
      console.error("Error fetching profession:", error);
      res.status(500).json({ message: "Failed to fetch profession" });
    }
  });

  // Work Scale routes
  app.get('/api/work-scales', isAuthenticated, async (req, res) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const workScales = await storage.getWorkScales(includeInactive);
      res.json(workScales);
    } catch (error) {
      console.error("Error fetching work scales:", error);
      res.status(500).json({ message: "Failed to fetch work scales" });
    }
  });

  app.get('/api/work-scales/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const workScale = await storage.getWorkScale(id);
      if (!workScale) {
        return res.status(404).json({ message: "Work scale not found" });
      }
      res.json(workScale);
    } catch (error) {
      console.error("Error fetching work scale:", error);
      res.status(500).json({ message: "Failed to fetch work scale" });
    }
  });

  app.post('/api/work-scales', isAuthenticated, async (req, res) => {
    try {
      const workScale = await storage.createWorkScale(req.body);
      res.status(201).json(workScale);
    } catch (error) {
      console.error("Error creating work scale:", error);
      res.status(500).json({ message: "Failed to create work scale" });
    }
  });

  app.put('/api/work-scales/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const workScale = await storage.updateWorkScale(id, req.body);
      res.json(workScale);
    } catch (error) {
      console.error("Error updating work scale:", error);
      res.status(500).json({ message: "Failed to update work scale" });
    }
  });

  app.delete('/api/work-scales/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWorkScale(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting work scale:", error);
      res.status(500).json({ message: "Failed to delete work scale" });
    }
  });

  // Job Status routes
  app.get('/api/job-statuses', isAuthenticated, async (req, res) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const jobStatuses = await storage.getJobStatuses(includeInactive);
      res.json(jobStatuses);
    } catch (error) {
      console.error("Error fetching job statuses:", error);
      res.status(500).json({ message: "Failed to fetch job statuses" });
    }
  });

  app.get('/api/job-statuses/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const jobStatus = await storage.getJobStatus(id);
      if (!jobStatus) {
        return res.status(404).json({ message: "Job status not found" });
      }
      res.json(jobStatus);
    } catch (error) {
      console.error("Error fetching job status:", error);
      res.status(500).json({ message: "Failed to fetch job status" });
    }
  });

  app.post('/api/job-statuses', isAuthenticated, async (req, res) => {
    try {
      const jobStatus = await storage.createJobStatus(req.body);
      res.status(201).json(jobStatus);
    } catch (error) {
      console.error("Error creating job status:", error);
      res.status(500).json({ message: "Failed to create job status" });
    }
  });

  app.put('/api/job-statuses/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const jobStatus = await storage.updateJobStatus(id, req.body);
      res.json(jobStatus);
    } catch (error) {
      console.error("Error updating job status:", error);
      res.status(500).json({ message: "Failed to update job status" });
    }
  });

  app.delete('/api/job-statuses/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteJobStatus(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job status:", error);
      res.status(500).json({ message: "Failed to delete job status" });
    }
  });

  // Status Notification Settings routes
  app.get('/api/status-notification-settings', isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getStatusNotificationSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching status notification settings:", error);
      res.status(500).json({ message: "Failed to fetch status notification settings" });
    }
  });

  app.put('/api/status-notification-settings/:statusId', isAuthenticated, async (req, res) => {
    try {
      const { statusId } = req.params;
      const { emailNotificationEnabled, whatsappNotificationEnabled } = req.body;
      const setting = await storage.upsertStatusNotificationSetting(
        statusId, 
        emailNotificationEnabled, 
        whatsappNotificationEnabled
      );
      res.json(setting);
    } catch (error) {
      console.error("Error updating status notification setting:", error);
      res.status(500).json({ message: "Failed to update status notification setting" });
    }
  });

  // Send test email for notification preview
  app.post('/api/test-notification-email', isAuthenticated, async (req: any, res) => {
    try {
      const { email } = req.body;
      const userId = req.user?.id || (req.session as any).user?.id;
      
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }
      
      // Get current user info
      const user = await storage.getUser(userId);
      
      await emailService.sendTestEmail(email);
      
      res.json({ 
        message: "Email de teste enviado com sucesso! Verifique o console do servidor para visualizar o conteúdo.",
        recipient: email 
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Falha ao enviar email de teste" });
    }
  });

  // Integration Settings routes
  app.get('/api/integration-settings', isAuthenticated, async (req, res) => {
    try {
      const { type } = req.query;
      const settings = await storage.getIntegrationSettings(type as string);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching integration settings:", error);
      res.status(500).json({ message: "Failed to fetch integration settings" });
    }
  });

  app.post('/api/integration-settings', isAuthenticated, async (req, res) => {
    try {
      const { integrationType, configKey, configValue } = req.body;
      const setting = await storage.upsertIntegrationSetting(integrationType, configKey, configValue);
      res.json(setting);
    } catch (error) {
      console.error("Error saving integration setting:", error);
      res.status(500).json({ message: "Failed to save integration setting" });
    }
  });

  app.delete('/api/integration-settings/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteIntegrationSetting(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting integration setting:", error);
      res.status(500).json({ message: "Failed to delete integration setting" });
    }
  });

  // System Settings routes
  app.get('/api/settings', isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.get('/api/settings/:key', isAuthenticated, async (req, res) => {
    try {
      const setting = await storage.getSystemSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching system setting:", error);
      res.status(500).json({ message: "Failed to fetch system setting" });
    }
  });

  app.post('/api/settings', isAuthenticated, async (req, res) => {
    try {
      const setting = await storage.upsertSystemSetting(req.body);
      res.json(setting);
    } catch (error) {
      console.error("Error upserting system setting:", error);
      res.status(500).json({ message: "Failed to upsert system setting" });
    }
  });

  app.patch('/api/settings/:key', isAuthenticated, async (req, res) => {
    try {
      const { value } = req.body;
      const setting = await storage.updateSystemSettingValue(req.params.key, value);
      res.json(setting);
    } catch (error) {
      console.error("Error updating system setting:", error);
      res.status(500).json({ message: "Failed to update system setting" });
    }
  });

  // Benefit routes
  app.get('/api/benefits', isAuthenticated, async (req, res) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const benefits = await storage.getBenefits(includeInactive);
      res.json(benefits);
    } catch (error) {
      console.error("Error fetching benefits:", error);
      res.status(500).json({ message: "Failed to fetch benefits" });
    }
  });

  app.get('/api/benefits/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const benefit = await storage.getBenefit(id);
      if (!benefit) {
        return res.status(404).json({ message: "Benefit not found" });
      }
      res.json(benefit);
    } catch (error) {
      console.error("Error fetching benefit:", error);
      res.status(500).json({ message: "Failed to fetch benefit" });
    }
  });

  app.post('/api/benefits', isAuthenticated, async (req, res) => {
    try {
      const benefit = await storage.createBenefit(req.body);
      res.status(201).json(benefit);
    } catch (error) {
      console.error("Error creating benefit:", error);
      res.status(500).json({ message: "Failed to create benefit" });
    }
  });

  app.put('/api/benefits/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const benefit = await storage.updateBenefit(id, req.body);
      res.json(benefit);
    } catch (error) {
      console.error("Error updating benefit:", error);
      res.status(500).json({ message: "Failed to update benefit" });
    }
  });

  app.delete('/api/benefits/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBenefit(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting benefit:", error);
      res.status(500).json({ message: "Failed to delete benefit" });
    }
  });

  // Organization routes (Multi-tenant management)
  app.get('/api/organizations', isAuthenticated, async (req, res) => {
    try {
      const organizations = await storage.getOrganizations();
      res.json(organizations);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });

  app.get('/api/organizations/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const organization = await storage.getOrganization(id);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.json(organization);
    } catch (error) {
      console.error("Error fetching organization:", error);
      res.status(500).json({ message: "Failed to fetch organization" });
    }
  });

  app.post('/api/organizations', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertOrganizationWithAdminSchema.parse(req.body);
      
      // Separar dados da organização dos dados do admin
      const { adminEmail, adminPassword, adminFirstName, adminLastName, ...organizationData } = validatedData;
      
      // Hash da senha do admin
      const bcrypt = await import('bcrypt');
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      // Criar organização
      const organization = await storage.createOrganization(organizationData);
      
      // Criar usuário admin para esta organização
      const adminUser = await storage.createUser({
        email: adminEmail,
        passwordHash,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: 'admin',
        organizationId: organization.id,
      });
      
      res.status(201).json({ organization, admin: { id: adminUser.id, email: adminUser.email } });
    } catch (error) {
      console.error("Error creating organization:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid organization data" });
      }
    }
  });

  app.put('/api/organizations/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertOrganizationSchema.partial().parse(req.body);
      const organization = await storage.updateOrganization(id, validatedData);
      res.json(organization);
    } catch (error) {
      console.error("Error updating organization:", error);
      res.status(400).json({ message: "Invalid organization data" });
    }
  });

  app.delete('/api/organizations/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteOrganization(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting organization:", error);
      res.status(500).json({ message: "Failed to delete organization" });
    }
  });

  // Company routes
  app.get('/api/companies', isAuthenticated, async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get('/api/companies/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post('/api/companies', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(400).json({ message: "Invalid company data" });
    }
  });

  app.put('/api/companies/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      // Check if user has permission to edit this company
      const hasPermission = await storage.checkUserPermission(userId, id, 'edit_companies');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const validatedData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(id, validatedData);
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(400).json({ message: "Invalid company data" });
    }
  });

  app.delete('/api/companies/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      // Check if user has permission to delete this company
      const hasPermission = await storage.checkUserPermission(userId, id, 'delete_companies');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      await storage.deleteCompany(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Cost Center routes
  app.get('/api/companies/:companyId/cost-centers', isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const costCenters = await storage.getCostCentersByCompany(companyId);
      res.json(costCenters);
    } catch (error) {
      console.error("Error fetching cost centers:", error);
      res.status(500).json({ message: "Failed to fetch cost centers" });
    }
  });

  app.post('/api/cost-centers', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCostCenterSchema.parse(req.body);
      const costCenter = await storage.createCostCenter(validatedData);
      res.status(201).json(costCenter);
    } catch (error) {
      console.error("Error creating cost center:", error);
      res.status(400).json({ message: "Invalid cost center data" });
    }
  });

  app.put('/api/cost-centers/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCostCenterSchema.partial().parse(req.body);
      const costCenter = await storage.updateCostCenter(id, validatedData);
      res.json(costCenter);
    } catch (error) {
      console.error("Error updating cost center:", error);
      res.status(400).json({ message: "Invalid cost center data" });
    }
  });

  app.delete('/api/cost-centers/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCostCenter(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting cost center:", error);
      res.status(500).json({ message: "Failed to delete cost center" });
    }
  });

  // Employee Routes
  app.get('/api/companies/:companyId/employees', isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const employees = await storage.getEmployeesByCompany(companyId);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  // Client Routes
  app.get('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      
      // Criar permissões padrão de dashboard para o novo cliente
      const defaultDashboards = ['realtime', 'analytics', 'reports'];
      for (const dashboardKey of defaultDashboards) {
        await storage.upsertClientDashboardPermission({
          clientId: client.id,
          dashboardKey,
          isEnabled: true, // Habilitado por padrão
        });
      }
      
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, validatedData);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteClient(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Upload contract for client
  app.post('/api/clients/:id/contract', isAuthenticated, uploadContract.single('contract'), async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "Nenhum arquivo foi enviado" });
      }
      
      // Get client to delete old contract if exists
      const client = await storage.getClient(id);
      if (!client) {
        // Delete uploaded file
        fs.unlinkSync(file.path);
        return res.status(404).json({ message: "Cliente não encontrado" });
      }
      
      // Delete old contract file if exists
      if (client.contractFilePath) {
        const oldFilePath = path.join(process.cwd(), client.contractFilePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Update client with new contract info
      const relativePath = path.relative(process.cwd(), file.path);
      const updatedClient = await storage.updateClient(id, {
        contractFileName: file.originalname,
        contractFilePath: relativePath,
      });
      
      res.json({
        message: "Contrato enviado com sucesso",
        fileName: file.originalname,
        client: updatedClient,
      });
    } catch (error) {
      console.error("Error uploading contract:", error);
      // Clean up uploaded file on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Falha ao enviar contrato" });
    }
  });

  // Download contract for client
  app.get('/api/clients/:id/contract', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }
      
      if (!client.contractFilePath) {
        return res.status(404).json({ message: "Cliente não possui contrato" });
      }
      
      const filePath = path.join(process.cwd(), client.contractFilePath);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Arquivo de contrato não encontrado" });
      }
      
      res.download(filePath, client.contractFileName || 'contrato.pdf');
    } catch (error) {
      console.error("Error downloading contract:", error);
      res.status(500).json({ message: "Falha ao baixar contrato" });
    }
  });

  // Delete contract for client
  app.delete('/api/clients/:id/contract', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }
      
      if (!client.contractFilePath) {
        return res.status(404).json({ message: "Cliente não possui contrato" });
      }
      
      // Delete file from filesystem
      const filePath = path.join(process.cwd(), client.contractFilePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Update client to remove contract info
      await storage.updateClient(id, {
        contractFileName: null,
        contractFilePath: null,
      });
      
      res.json({ message: "Contrato removido com sucesso" });
    } catch (error) {
      console.error("Error deleting contract:", error);
      res.status(500).json({ message: "Falha ao remover contrato" });
    }
  });

  // Client Employee routes
  app.get('/api/clients/:clientId/employees', isAuthenticated, async (req, res) => {
    try {
      const { clientId } = req.params;
      const employees = await storage.getClientEmployees(clientId);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching client employees:", error);
      res.status(500).json({ message: "Falha ao buscar funcionários" });
    }
  });

  app.get('/api/client-employees/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getClientEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Funcionário não encontrado" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error fetching client employee:", error);
      res.status(500).json({ message: "Falha ao buscar funcionário" });
    }
  });

  app.post('/api/client-employees', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertClientEmployeeSchema.parse(req.body);
      const employee = await storage.createClientEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Error creating client employee:", error);
      res.status(500).json({ message: "Falha ao criar funcionário" });
    }
  });

  app.put('/api/client-employees/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertClientEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateClientEmployee(id, validatedData);
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Error updating client employee:", error);
      res.status(500).json({ message: "Falha ao atualizar funcionário" });
    }
  });

  app.delete('/api/client-employees/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteClientEmployee(id);
      res.json({ message: "Funcionário removido com sucesso" });
    } catch (error) {
      console.error("Error deleting client employee:", error);
      res.status(500).json({ message: "Falha ao remover funcionário" });
    }
  });

  // Client Dashboard Permissions routes
  app.get('/api/clients/:clientId/dashboard-permissions', isAuthenticated, async (req, res) => {
    try {
      const { clientId } = req.params;
      const permissions = await storage.getClientDashboardPermissions(clientId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching client dashboard permissions:", error);
      res.status(500).json({ message: "Falha ao buscar permissões de dashboard" });
    }
  });

  app.get('/api/client-dashboard-permissions', isAuthenticated, async (req, res) => {
    try {
      const permissions = await storage.getAllClientDashboardPermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching all client dashboard permissions:", error);
      res.status(500).json({ message: "Falha ao buscar permissões de dashboard" });
    }
  });

  app.post('/api/client-dashboard-permissions', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertClientDashboardPermissionSchema.parse(req.body);
      const permission = await storage.upsertClientDashboardPermission(validatedData);
      res.status(201).json(permission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Error upserting client dashboard permission:", error);
      res.status(500).json({ message: "Falha ao criar/atualizar permissão de dashboard" });
    }
  });

  app.delete('/api/client-dashboard-permissions/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteClientDashboardPermission(id);
      res.json({ message: "Permissão de dashboard removida com sucesso" });
    } catch (error) {
      console.error("Error deleting client dashboard permission:", error);
      res.status(500).json({ message: "Falha ao remover permissão de dashboard" });
    }
  });

  // Job routes
  app.get('/api/jobs', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const status = req.query.status as string === 'all' ? undefined : req.query.status as string;
      const companyId = req.query.companyId as string === 'all' ? undefined : req.query.companyId as string;
      const professionId = req.query.professionId as string === 'all' ? undefined : req.query.professionId as string;
      const recruiterId = req.query.recruiterId as string === 'all' ? undefined : req.query.recruiterId as string;
      
      let jobs = await storage.getJobs(limit, offset, search, status, companyId, professionId, recruiterId);
      
      // Filter jobs based on user role
      const userId = req.user?.id || (req.session as any).user?.id;
      
      // Get user's roles to check permissions
      const userRoles = await storage.getUserCompanyRoles(userId);
      const isRecruiter = userRoles.some((r: any) => r.role === 'recruiter');
      const isManagerOrHR = userRoles.some((r: any) => r.role === 'manager' || r.role === 'hr_manager' || r.role === 'admin');
      
      // Recrutadores veem APENAS vagas com status "aprovada"
      if (isRecruiter && !isManagerOrHR) {
        jobs = jobs.filter((job: any) => job.status === 'aprovada');
      }
      
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get('/api/jobs/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  // Generate PDF with hired candidate information
  app.get('/api/jobs/:id/pdf', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Vaga não encontrada" });
      }
      
      if (!job.hiredCandidateId) {
        return res.status(400).json({ message: "Esta vaga não possui candidato aprovado" });
      }
      
      // Get hired candidate application
      const application = await storage.getApplicationWithDetails(job.hiredCandidateId);
      if (!application) {
        return res.status(404).json({ message: "Candidato aprovado não encontrado" });
      }
      
      // Get recruiter info
      let recruiterName = "Não disponível";
      if (job.createdBy) {
        const recruiter = await storage.getUser(job.createdBy);
        if (recruiter) {
          const fullName = [recruiter.firstName, recruiter.lastName].filter(Boolean).join(' ');
          recruiterName = fullName || recruiter.email || "Não disponível";
        }
      }
      
      // Import PDFKit
      const PDFKit = await import('pdfkit');
      const PDFDocument = PDFKit.default;
      const doc = new PDFDocument({ margin: 50 });
      
      const jobTitle = job.title || 'Sem título';
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=candidato-aprovado-${jobTitle.replace(/\s+/g, '-')}.pdf`);
      
      // Pipe PDF to response
      doc.pipe(res);
      
      // Add content to PDF
      doc.fontSize(20).font('Helvetica-Bold').text('Candidato Aprovado', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).font('Helvetica').text(`Vaga: ${jobTitle}`, { align: 'center' });
      doc.moveDown(2);
      
      // Candidate information
      doc.fontSize(12).font('Helvetica-Bold').text('Informações do Candidato', { underline: true });
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').text('Nome Completo: ', { continued: true });
      doc.font('Helvetica').text(application.candidate?.name || 'Não informado');
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Email: ', { continued: true });
      doc.font('Helvetica').text(application.candidate?.email || 'Não informado');
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Telefone: ', { continued: true });
      doc.font('Helvetica').text(application.candidate?.phone || 'Não informado');
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Data de Admissão: ', { continued: true });
      doc.font('Helvetica').text(job.admissionDate ? new Date(job.admissionDate).toLocaleDateString('pt-BR') : 'Não informado');
      doc.moveDown(2);
      
      // Job information
      doc.fontSize(12).font('Helvetica-Bold').text('Informações da Vaga', { underline: true });
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').text('Recrutador: ', { continued: true });
      doc.font('Helvetica').text(recruiterName);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Data de Abertura da Vaga: ', { continued: true });
      doc.font('Helvetica').text(job.openingDate ? new Date(job.openingDate).toLocaleDateString('pt-BR') : 'Não informado');
      doc.moveDown(2);
      
      // Footer
      doc.fontSize(10).font('Helvetica').text(
        `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        { align: 'center', color: 'gray' }
      );
      
      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Falha ao gerar PDF" });
    }
  });

  // Generate admission information PDF
  app.get('/api/jobs/:id/admission-pdf', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Vaga não encontrada" });
      }
      
      if (!job.admissionDate) {
        return res.status(400).json({ message: "Esta vaga não possui dados de admissão" });
      }
      
      // Get hired candidate if exists
      let candidateName = "Não informado";
      let candidateEmail = "Não informado";
      let candidateDocument = "Não informado";
      let candidatePhone = "Não informado";
      let candidateBirthDate = "Não informado";
      
      if (job.hiredCandidateId) {
        const candidate = await storage.getCandidate(job.hiredCandidateId);
        if (candidate) {
          candidateName = candidate.name || "Não informado";
          candidateEmail = candidate.email || "Não informado";
          candidateDocument = candidate.document || "Não informado";
          candidatePhone = candidate.phone || "Não informado";
          candidateBirthDate = candidate.birthDate ? new Date(candidate.birthDate).toLocaleDateString('pt-BR') : "Não informado";
        }
      }
      
      // Get recruiter name
      let recruiterName = "Não informado";
      if (job.recruiterId) {
        const recruiter = await storage.getUser(job.recruiterId);
        if (recruiter) {
          const fullName = [recruiter.firstName, recruiter.lastName].filter(Boolean).join(' ');
          recruiterName = fullName || recruiter.email || "Não informado";
        }
      }
      
      // Get cost center info
      let costCenterCode = "Não informado";
      let costCenterDescription = "Não informado";
      if (job.costCenterId) {
        const costCenters = await storage.getCostCentersByCompany(job.companyId);
        const costCenter = costCenters.find(cc => cc.id === job.costCenterId);
        if (costCenter) {
          costCenterCode = costCenter.code || "Não informado";
          costCenterDescription = costCenter.name || "Não informado";
        }
      }
      
      // Get client info
      let clientName = "Não informado";
      let clientCnpj = "Não informado";
      let clientAddress = "Não informado";
      let clientContact = "Não informado";
      let clientMaxJobs = "Não informado";
      if (job.clientId) {
        const client = await storage.getClient(job.clientId);
        if (client) {
          clientName = client.name || "Não informado";
          clientCnpj = client.cnpj || "Não informado";
          clientAddress = client.address || "Não informado";
          clientContact = client.contactPerson || "Não informado";
          clientMaxJobs = client.maxJobs ? client.maxJobs.toString() : "Não informado";
        }
      }
      
      // Get company info
      let companyName = "Não informado";
      let companyCnpj = "Não informado";
      let companyAddress = "Não informado";
      const company = await storage.getCompany(job.companyId);
      if (company) {
        companyName = company.name || "Não informado";
        companyCnpj = company.cnpj || "Não informado";
        companyAddress = company.address || "Não informado";
      }
      
      // Get work scale and benefits
      let workScaleName = "Não informado";
      let workScaleDetails = "";
      if (job.workScaleId) {
        const workScales = await storage.getWorkScales();
        const workScale = workScales.find(ws => ws.id === job.workScaleId);
        if (workScale) {
          workScaleName = workScale.name || "Não informado";
          const parts = [];
          if (workScale.weeklyHours) parts.push(`${workScale.weeklyHours}h semanais`);
          if (workScale.workDays) parts.push(workScale.workDays);
          if (workScale.breakTime) parts.push(`Intervalo: ${workScale.breakTime}`);
          workScaleDetails = parts.length > 0 ? ` (${parts.join(', ')})` : "";
        }
      }
      
      const benefitsList = job.benefits && job.benefits.length > 0 
        ? job.benefits.join(', ') 
        : "Não informado";
      
      // Import PDFKit
      const PDFKit = await import('pdfkit');
      const PDFDocument = PDFKit.default;
      const doc = new PDFDocument({ margin: 50 });
      
      const jobTitle = job.title || 'Sem título';
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=dossie-admissao-${jobTitle.replace(/\s+/g, '-')}.pdf`);
      
      // Pipe PDF to response
      doc.pipe(res);
      
      // Add content to PDF
      doc.fontSize(20).font('Helvetica-Bold').text('Dossiê de Admissão', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).font('Helvetica').text(`Vaga: ${jobTitle}`, { align: 'center' });
      doc.moveDown(2);
      
      // Admission information
      doc.fontSize(12).font('Helvetica-Bold').text('Dados do Candidato Admitido', { underline: true });
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').text('Nome Completo: ', { continued: true });
      doc.font('Helvetica').text(candidateName);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Email: ', { continued: true });
      doc.font('Helvetica').text(candidateEmail);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('CPF: ', { continued: true });
      doc.font('Helvetica').text(candidateDocument);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Telefone: ', { continued: true });
      doc.font('Helvetica').text(candidatePhone);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Data de Nascimento: ', { continued: true });
      doc.font('Helvetica').text(candidateBirthDate);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Data de Admissão: ', { continued: true });
      doc.font('Helvetica').text(new Date(job.admissionDate).toLocaleDateString('pt-BR'));
      doc.moveDown(2);
      
      // Client information
      doc.fontSize(12).font('Helvetica-Bold').text('Dados do Cliente', { underline: true });
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').text('Razão Social: ', { continued: true });
      doc.font('Helvetica').text(clientName);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('CNPJ: ', { continued: true });
      doc.font('Helvetica').text(clientCnpj);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Endereço: ', { continued: true });
      doc.font('Helvetica').text(clientAddress);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Pessoa de Contato: ', { continued: true });
      doc.font('Helvetica').text(clientContact);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Limite de Vagas: ', { continued: true });
      doc.font('Helvetica').text(clientMaxJobs);
      doc.moveDown(2);
      
      // Company information
      doc.fontSize(12).font('Helvetica-Bold').text('Dados da Empresa', { underline: true });
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').text('Razão Social: ', { continued: true });
      doc.font('Helvetica').text(companyName);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('CNPJ: ', { continued: true });
      doc.font('Helvetica').text(companyCnpj);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Endereço: ', { continued: true });
      doc.font('Helvetica').text(companyAddress);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Código Centro de Custo: ', { continued: true });
      doc.font('Helvetica').text(costCenterCode);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Descrição do Centro de Custo: ', { continued: true });
      doc.font('Helvetica').text(costCenterDescription);
      doc.moveDown(2);
      
      // Job details
      doc.fontSize(12).font('Helvetica-Bold').text('Detalhes da Vaga', { underline: true });
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').text('ID da Vaga: ', { continued: true });
      doc.font('Helvetica').text(job.jobCode || 'Não informado');
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Cargo: ', { continued: true });
      doc.font('Helvetica').text(jobTitle);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Categoria: ', { continued: true });
      doc.font('Helvetica').text(job.category || 'Não informado');
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Localização: ', { continued: true });
      doc.font('Helvetica').text(job.location || 'Não informado');
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Recrutador Responsável: ', { continued: true });
      doc.font('Helvetica').text(recruiterName);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Data de Abertura: ', { continued: true });
      doc.font('Helvetica').text(job.openingDate ? new Date(job.openingDate).toLocaleDateString('pt-BR') : 'Não informado');
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Escala de Trabalho: ', { continued: true });
      doc.font('Helvetica').text(workScaleName + workScaleDetails);
      doc.moveDown(0.3);
      
      if (job.minSalary || job.maxSalary) {
        doc.font('Helvetica-Bold').text('Faixa Salarial: ', { continued: true });
        const salaryRange = [];
        if (job.minSalary) salaryRange.push(`R$ ${job.minSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
        if (job.maxSalary) salaryRange.push(`R$ ${job.maxSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
        doc.font('Helvetica').text(salaryRange.join(' - '));
        doc.moveDown(0.3);
      }
      
      doc.font('Helvetica-Bold').text('Benefícios: ', { continued: true });
      doc.font('Helvetica').text(benefitsList);
      doc.moveDown(0.3);
      
      if (job.description) {
        doc.font('Helvetica-Bold').text('Descrição da Vaga:');
        doc.moveDown(0.2);
        doc.font('Helvetica').text(job.description, { align: 'justify' });
        doc.moveDown(0.3);
      }
      
      if (job.requirements) {
        doc.font('Helvetica-Bold').text('Requisitos:');
        doc.moveDown(0.2);
        doc.font('Helvetica').text(job.requirements, { align: 'justify' });
        doc.moveDown(0.3);
      }
      doc.moveDown(2);
      
      // Get status history
      const statusHistory = await storage.getJobStatusHistory(id);
      
      if (statusHistory && statusHistory.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('Histórico de Mudanças de Status', { underline: true });
        doc.moveDown(0.5);
        
        for (const historyItem of statusHistory) {
          doc.fontSize(10).font('Helvetica-Bold').text(`${new Date(historyItem.changedAt).toLocaleString('pt-BR')}`, { continued: true });
          doc.font('Helvetica').text(` - ${historyItem.changerName || historyItem.changerEmail || 'Sistema'}`);
          doc.moveDown(0.2);
          
          doc.fontSize(9).font('Helvetica').text(
            `   De: ${historyItem.previousStatus || 'Criação da vaga'} → Para: ${historyItem.newStatus}`
          );
          doc.moveDown(0.5);
        }
        doc.moveDown(1);
      }
      
      // Footer
      doc.fontSize(10).font('Helvetica').text(
        `Dossiê gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        { align: 'center' }
      );
      
      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error("Error generating admission PDF:", error);
      res.status(500).json({ message: "Falha ao gerar PDF de admissão" });
    }
  });

  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.session as any).user?.id;
      
      console.log("=== DEBUG JOB CREATION ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      
      // Calculate SLA deadline (14 days from now)
      const slaDeadline = new Date();
      slaDeadline.setDate(slaDeadline.getDate() + 14);
      
      // Clean the data - remove empty strings and convert to proper types
      const cleanedBody = Object.fromEntries(
        Object.entries(req.body).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
      );
      
      console.log("Cleaned body:", JSON.stringify(cleanedBody, null, 2));
      
      // Don't set createdBy in AUTH_BYPASS mode since the user doesn't exist in DB
      const dataToValidate: any = {
        ...cleanedBody,
        slaDeadline: slaDeadline.toISOString(),
      };
      
      // Only set createdBy if not in bypass mode and user exists
      if (process.env.AUTH_BYPASS !== 'true') {
        dataToValidate.createdBy = userId;
      }
      
      const validatedData = insertJobSchema.parse(dataToValidate);
      
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));
      
      // Convert ISO strings to Date objects for Drizzle timestamp columns
      const jobDataForDb: any = { ...validatedData };
      
      console.log("Before date conversion - slaDeadline type:", typeof jobDataForDb.slaDeadline, "value:", jobDataForDb.slaDeadline);
      
      if (jobDataForDb.openingDate) {
        console.log("Converting openingDate:", jobDataForDb.openingDate);
        jobDataForDb.openingDate = new Date(jobDataForDb.openingDate);
      }
      if (jobDataForDb.startDate) {
        console.log("Converting startDate:", jobDataForDb.startDate);
        jobDataForDb.startDate = new Date(jobDataForDb.startDate);
      }
      if (jobDataForDb.expiresAt) {
        console.log("Converting expiresAt:", jobDataForDb.expiresAt);
        jobDataForDb.expiresAt = new Date(jobDataForDb.expiresAt);
      }
      if (jobDataForDb.slaDeadline) {
        console.log("Converting slaDeadline:", jobDataForDb.slaDeadline);
        jobDataForDb.slaDeadline = new Date(jobDataForDb.slaDeadline);
        console.log("Converted slaDeadline to:", jobDataForDb.slaDeadline, "type:", typeof jobDataForDb.slaDeadline);
      }
      
      console.log("Date conversion complete. About to call storage.createJob");
      
      // Validate profession exists and is active  
      const profession = await storage.getProfession(validatedData.professionId);
      if (!profession || !profession.isActive) {
        return res.status(400).json({ message: "Invalid or inactive profession" });
      }
      
      // Require companyId for authorization
      if (!validatedData.companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      // Skip permission checks in AUTH_BYPASS mode
      if (process.env.AUTH_BYPASS !== 'true') {
        // Apenas GESTOR e Gerente de RH podem criar vagas
        const userRoles = await storage.getUserCompanyRoles(userId);
        const canCreateJobs = userRoles.some((r: any) => 
          (r.role === 'manager' || r.role === 'hr_manager' || r.role === 'admin') && 
          r.companyId === validatedData.companyId
        );
        
        if (!canCreateJobs) {
          return res.status(403).json({ message: "Apenas Gestores e Gerentes de RH podem criar vagas" });
        }
        
        // Check permission for the specific company
        const hasPermission = await storage.checkUserPermission(userId, validatedData.companyId, 'create_jobs');
        if (!hasPermission) {
          return res.status(403).json({ message: "Insufficient permissions" });
        }
      }
      
      // If vacancyQuantity > 1, create multiple job records
      const quantity = jobDataForDb.vacancyQuantity || 1;
      
      if (quantity > 1) {
        const createdJobs = [];
        
        for (let i = 0; i < quantity; i++) {
          // Create a copy of job data for each vacancy
          const jobCopy = { ...jobDataForDb };
          // Set vacancyQuantity to 1 for each individual job record
          jobCopy.vacancyQuantity = 1;
          
          const job = await storage.createJob(jobCopy);
          createdJobs.push(job);
        }
        
        console.log(`Created ${quantity} job records`);
        // Return the first job as response
        res.status(201).json(createdJobs[0]);
      } else {
        const job = await storage.createJob(jobDataForDb);
        res.status(201).json(job);
      }
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(400).json({ message: "Invalid job data" });
    }
  });

  app.put('/api/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || (req.session as any).user?.id;
      
      // First load the job to get its actual companyId for authorization
      const existingJob = await storage.getJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check permission using the job's actual companyId
      if (!existingJob.companyId) {
        return res.status(400).json({ message: "Job has no associated company" });
      }
      const hasPermission = await storage.checkUserPermission(userId, existingJob.companyId, 'edit_jobs');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const validatedData = insertJobSchema.partial().parse(req.body);
      
      // Validate profession exists and is active if being updated
      if (validatedData.professionId) {
        const profession = await storage.getProfession(validatedData.professionId);
        if (!profession || !profession.isActive) {
          return res.status(400).json({ message: "Invalid or inactive profession" });
        }
      }
      
      // Prevent changing companyId via update (security measure)
      delete validatedData.companyId;
      
      // If AUTH_BYPASS is enabled, don't include recruiterId if it's the demo user
      const authBypass = process.env.AUTH_BYPASS === 'true';
      if (authBypass && validatedData.recruiterId === 'demo-user-bypass') {
        delete validatedData.recruiterId;
      }
      
      // Record status change in history if status is being updated
      if (validatedData.status && validatedData.status !== existingJob.status) {
        await storage.createJobStatusHistory({
          jobId: id,
          previousStatus: existingJob.status || undefined,
          newStatus: validatedData.status,
          changedBy: userId,
        });
      }
      
      const job = await storage.updateJob(id, validatedData);
      res.json(job);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(400).json({ message: "Invalid job data" });
    }
  });

  // Job status update endpoint
  app.patch('/api/jobs/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id || (req.session as any).user?.id;
      
      // Validate status by checking if it exists in job_statuses table
      const jobStatuses = await storage.getJobStatuses();
      const validStatuses = jobStatuses.map(s => s.key);
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status provided" });
      }
      
      // First load the job to get its actual companyId for authorization
      const existingJob = await storage.getJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check permission using the job's actual companyId
      if (!existingJob.companyId) {
        return res.status(400).json({ message: "Job has no associated company" });
      }
      const hasPermission = await storage.checkUserPermission(userId, existingJob.companyId, 'edit_jobs');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      // Get the status object to check color and get status ID
      const newStatusObj = jobStatuses.find(s => s.key === status);
      const previousStatusObj = jobStatuses.find(s => s.key === existingJob.status);
      
      // Record status change in history before updating
      await storage.createJobStatusHistory({
        jobId: id,
        previousStatus: existingJob.status || undefined,
        newStatus: status,
        changedBy: userId,
      });
      
      // Update only the status
      const job = await storage.updateJob(id, { status });
      
      // Send email notification if enabled for this status
      if (newStatusObj?.id) {
        try {
          // Check if email notifications are enabled for this status
          const allNotificationSettings = await storage.getStatusNotificationSettings();
          const notificationSetting = allNotificationSettings.find(s => s.jobStatusId === newStatusObj.id);
          
          if (notificationSetting?.emailNotificationEnabled) {
            // Get user who made the change
            const changedByUser = await storage.getUser(userId);
            
            // Get company info
            const company = existingJob.companyId ? await storage.getCompany(existingJob.companyId) : null;
            
            // Get recruiter info
            let recruiterName: string | undefined;
            if (existingJob.recruiterId) {
              const recruiter = await storage.getUser(existingJob.recruiterId);
              recruiterName = recruiter ? `${recruiter.firstName || ''} ${recruiter.lastName || ''}`.trim() || recruiter.email || undefined : undefined;
            }
            
            // Get creator info
            let creatorName: string | undefined;
            if (existingJob.createdBy) {
              const creator = await storage.getUser(existingJob.createdBy);
              creatorName = creator ? `${creator.firstName || ''} ${creator.lastName || ''}`.trim() || creator.email || undefined : undefined;
            }
            
            // Build recipient list (in a real scenario, this would be configurable)
            const recipients = [];
            
            // Add recruiter email if available
            if (existingJob.recruiterId) {
              const recruiter = await storage.getUser(existingJob.recruiterId);
              if (recruiter?.email) {
                const name = `${recruiter.firstName || ''} ${recruiter.lastName || ''}`.trim() || recruiter.email;
                recipients.push({ email: recruiter.email, name });
              }
            }
            
            // Add creator email if available and different from recruiter
            if (existingJob.createdBy && existingJob.createdBy !== existingJob.recruiterId) {
              const creator = await storage.getUser(existingJob.createdBy);
              if (creator?.email) {
                const name = `${creator.firstName || ''} ${creator.lastName || ''}`.trim() || creator.email;
                recipients.push({ email: creator.email, name });
              }
            }
            
            // Send email if we have recipients
            if (recipients.length > 0) {
              await emailService.sendStatusChangeNotification({
                recipients,
                jobData: {
                  jobCode: existingJob.jobCode || 'N/A',
                  jobTitle: existingJob.title || 'N/A',
                  companyName: company?.name || 'N/A',
                  location: existingJob.location || undefined,
                  previousStatus: previousStatusObj?.label || existingJob.status || 'N/A',
                  newStatus: newStatusObj.label,
                  statusColor: newStatusObj.color || '#667eea',
                  changedBy: changedByUser ? `${changedByUser.firstName || ''} ${changedByUser.lastName || ''}`.trim() || changedByUser.email || 'Sistema' : 'Sistema',
                  changedAt: new Date(),
                  recruiterName,
                  creatorName,
                  contractType: existingJob.contractType || undefined,
                  salaryMin: existingJob.salaryMin ? parseFloat(existingJob.salaryMin) : undefined,
                  salaryMax: undefined,
                },
              });
            }
          }
        } catch (emailError) {
          // Log error but don't fail the request
          console.error("Error sending status change notification email:", emailError);
        }
      }
      
      res.json(job);
    } catch (error) {
      console.error("Error updating job status:", error);
      res.status(500).json({ message: "Failed to update job status" });
    }
  });

  // Get job status history
  app.get('/api/jobs/:id/status-history', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const history = await storage.getJobStatusHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching job status history:", error);
      res.status(500).json({ message: "Failed to fetch status history" });
    }
  });

  // Job notes update endpoint
  app.patch('/api/jobs/:id/notes', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      
      console.log("Updating job notes:", { id, notes, noteLength: notes?.length });
      
      // Update only the notes
      const job = await storage.updateJob(id, { notes });
      console.log("Updated job notes result:", { jobId: job.id, hasNotes: !!job.notes, notesLength: job.notes?.length });
      res.json(job);
    } catch (error) {
      console.error("Error updating job notes:", error);
      res.status(500).json({ message: "Failed to update job notes" });
    }
  });

  app.delete('/api/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || (req.session as any).user?.id;
      
      // First load the job to get its actual companyId for authorization
      const existingJob = await storage.getJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check permission using the job's actual companyId
      if (!existingJob.companyId) {
        return res.status(400).json({ message: "Job has no associated company" });
      }
      const hasPermission = await storage.checkUserPermission(userId, existingJob.companyId, 'delete_jobs');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      await storage.deleteJob(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  app.post('/api/jobs/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || (req.session as any).user?.id;
      
      // Get existing job to record previous status
      const existingJob = await storage.getJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Record status change in history before completing
      await storage.createJobStatusHistory({
        jobId: id,
        previousStatus: existingJob.status || undefined,
        newStatus: 'concluida',
        changedBy: userId,
      });
      
      const job = await storage.completeJob(id);
      res.json(job);
    } catch (error) {
      console.error("Error completing job:", error);
      res.status(500).json({ message: "Failed to complete job" });
    }
  });

  app.patch('/api/jobs/:id/admission', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { admissionDate, hiredCandidateId } = req.body;
      const job = await storage.updateJob(id, {
        admissionDate: admissionDate ? new Date(admissionDate) : undefined,
        hiredCandidateId,
      } as any);
      res.json(job);
    } catch (error) {
      console.error("Error updating admission data:", error);
      res.status(500).json({ message: "Failed to update admission data" });
    }
  });

  // Candidate routes
  app.get('/api/candidates', isAuthenticated, async (req, res) => {
    try {
      const candidates = await storage.getCandidates();
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  app.get('/api/candidates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const candidate = await storage.getCandidate(id);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      console.error("Error fetching candidate:", error);
      res.status(500).json({ message: "Failed to fetch candidate" });
    }
  });

  app.post('/api/candidates', async (req, res) => {
    try {
      const validatedData = insertCandidateSchema.parse(req.body);
      const candidate = await storage.createCandidate(validatedData);
      res.status(201).json(candidate);
    } catch (error) {
      console.error("Error creating candidate:", error);
      res.status(400).json({ message: "Invalid candidate data" });
    }
  });

  app.patch('/api/candidates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const candidate = await storage.updateCandidate(id, req.body);
      res.json(candidate);
    } catch (error) {
      console.error("Error updating candidate:", error);
      res.status(500).json({ message: "Failed to update candidate" });
    }
  });

  app.delete('/api/candidates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCandidate(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting candidate:", error);
      res.status(500).json({ message: "Failed to delete candidate" });
    }
  });

  // Application routes
  app.get('/api/jobs/:jobId/applications', isAuthenticated, async (req, res) => {
    try {
      const { jobId } = req.params;
      const applications = await storage.getApplicationsByJob(jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/candidates', isAuthenticated, async (req, res) => {
    try {
      const candidates = await storage.getCandidates();
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  app.get('/api/applications/job/:jobId', isAuthenticated, async (req, res) => {
    try {
      const { jobId } = req.params;
      const applications = await storage.getApplicationsByJob(jobId);
      
      // Get candidate details for each application
      const applicationsWithCandidates = await Promise.all(
        applications.map(async (app) => {
          const candidate = await storage.getCandidate(app.candidateId);
          return {
            ...app,
            candidate,
          };
        })
      );
      
      res.json(applicationsWithCandidates);
    } catch (error) {
      console.error("Error fetching applications for job:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post('/api/applications', async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(400).json({ message: "Invalid application data" });
    }
  });

  app.get('/api/applications', isAuthenticated, async (req, res) => {
    try {
      const { jobId } = req.query;
      let applications;
      
      if (jobId && typeof jobId === 'string') {
        applications = await storage.getApplicationsByJob(jobId);
        // Also get candidate and job details for each application
        const detailedApplications = await storage.getApplicationsWithJobDetails();
        applications = detailedApplications.filter(app => app.jobId === jobId);
      } else {
        applications = await storage.getApplicationsWithJobDetails();
      }
      
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.patch('/api/applications/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const application = await storage.updateApplication(id, req.body);
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  app.patch('/api/applications/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const application = await storage.updateApplicationStatus(id, status);
      res.json(application);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Expanded Application routes
  app.get('/api/applications/:id/details', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      const application = await storage.getApplicationWithDetails(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Check if user has permission to view applications for this company
      const hasPermission = await storage.checkUserPermission(userId, application.job?.companyId!, 'view_applications');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error fetching application details:", error);
      res.status(500).json({ message: "Failed to fetch application details" });
    }
  });

  app.put('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      // Get application to check company permission
      const existingApp = await storage.getApplicationWithDetails(id);
      if (!existingApp) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      const hasPermission = await storage.checkUserPermission(userId, existingApp.job?.companyId!, 'manage_applications');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const validatedData = insertApplicationSchema.partial().parse(req.body);
      const application = await storage.updateApplication(id, validatedData);
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(400).json({ message: "Failed to update application" });
    }
  });

  // Selection Stages routes
  app.get('/api/jobs/:jobId/stages', isAuthenticated, async (req: any, res) => {
    try {
      const { jobId } = req.params;
      const userId = (req.session as any).user.id;
      
      // Get job to check company permission
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const hasPermission = await storage.checkUserPermission(userId, job.companyId!, 'view_jobs');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const stages = await storage.getSelectionStagesByJob(jobId);
      res.json(stages);
    } catch (error) {
      console.error("Error fetching selection stages:", error);
      res.status(500).json({ message: "Failed to fetch selection stages" });
    }
  });

  app.post('/api/selection-stages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const validatedData = insertSelectionStageSchema.parse(req.body);
      
      // Get job to check company permission
      const job = await storage.getJob(validatedData.jobId!);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const hasPermission = await storage.checkUserPermission(userId, job.companyId!, 'edit_jobs');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const stage = await storage.createSelectionStage(validatedData);
      res.status(201).json(stage);
    } catch (error) {
      console.error("Error creating selection stage:", error);
      res.status(400).json({ message: "Invalid selection stage data" });
    }
  });

  app.put('/api/selection-stages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      // Get existing stage to check permissions
      const stages = await storage.getSelectionStagesByJob("dummy"); // Need to get stage first to check job
      // Note: This could be improved with a getSelectionStage(id) method
      
      const validatedData = insertSelectionStageSchema.partial().parse(req.body);
      const stage = await storage.updateSelectionStage(id, validatedData);
      res.json(stage);
    } catch (error) {
      console.error("Error updating selection stage:", error);
      res.status(400).json({ message: "Failed to update selection stage" });
    }
  });

  app.delete('/api/selection-stages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      // Note: Should check permissions by getting stage and its job first
      await storage.deleteSelectionStage(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting selection stage:", error);
      res.status(500).json({ message: "Failed to delete selection stage" });
    }
  });

  app.post('/api/jobs/:jobId/setup-default-stages', isAuthenticated, async (req: any, res) => {
    try {
      const { jobId } = req.params;
      const userId = (req.session as any).user.id;
      
      // Get job to check company permission
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const hasPermission = await storage.checkUserPermission(userId, job.companyId!, 'edit_jobs');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      await storage.setupDefaultSelectionStages(jobId);
      res.json({ message: "Default stages created successfully" });
    } catch (error) {
      console.error("Error setting up default stages:", error);
      res.status(500).json({ message: "Failed to setup default stages" });
    }
  });

  // Interview routes
  app.get('/api/applications/:applicationId/interviews', isAuthenticated, async (req: any, res) => {
    try {
      const { applicationId } = req.params;
      const userId = (req.session as any).user.id;
      
      // Get application to check company permission
      const application = await storage.getApplicationWithDetails(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      const hasPermission = await storage.checkUserPermission(userId, application.job?.companyId!, 'view_applications');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const interviews = await storage.getInterviewsByApplication(applicationId);
      res.json(interviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      res.status(500).json({ message: "Failed to fetch interviews" });
    }
  });

  app.get('/api/interviews/upcoming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const interviewerId = req.query.interviewerId as string;
      
      const interviews = await storage.getUpcomingInterviews(interviewerId);
      res.json(interviews);
    } catch (error) {
      console.error("Error fetching upcoming interviews:", error);
      res.status(500).json({ message: "Failed to fetch upcoming interviews" });
    }
  });

  app.get('/api/interviews/calendar', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const interviewerId = req.query.interviewerId as string;
      
      const calendar = await storage.getInterviewCalendar(interviewerId);
      res.json(calendar);
    } catch (error) {
      console.error("Error fetching interview calendar:", error);
      res.status(500).json({ message: "Failed to fetch interview calendar" });
    }
  });

  app.post('/api/interviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const validatedData = insertInterviewSchema.parse(req.body);
      
      // Check if user can schedule interviews (interviewer role or manage_applications permission)
      const hasPermission = await storage.checkUserPermission(userId, "dummy", 'interview_candidates'); // Note: Need company context
      
      const interview = await storage.createInterview(validatedData);
      res.status(201).json(interview);
    } catch (error) {
      console.error("Error creating interview:", error);
      res.status(400).json({ message: "Invalid interview data" });
    }
  });

  app.get('/api/interviews/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      const interview = await storage.getInterviewWithDetails(id);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      res.json(interview);
    } catch (error) {
      console.error("Error fetching interview:", error);
      res.status(500).json({ message: "Failed to fetch interview" });
    }
  });

  app.put('/api/interviews/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      const validatedData = insertInterviewSchema.partial().parse(req.body);
      const interview = await storage.updateInterview(id, validatedData);
      res.json(interview);
    } catch (error) {
      console.error("Error updating interview:", error);
      res.status(400).json({ message: "Failed to update interview" });
    }
  });

  // Application Stage Progress routes
  app.get('/api/applications/:applicationId/progress', isAuthenticated, async (req: any, res) => {
    try {
      const { applicationId } = req.params;
      const userId = (req.session as any).user.id;
      
      const progress = await storage.getApplicationProgress(applicationId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching application progress:", error);
      res.status(500).json({ message: "Failed to fetch application progress" });
    }
  });

  app.post('/api/applications/:applicationId/advance-stage', isAuthenticated, async (req: any, res) => {
    try {
      const { applicationId } = req.params;
      const { stageId, score, feedback } = req.body;
      const userId = (req.session as any).user.id;
      
      await storage.advanceApplicationStage(applicationId, stageId, score, feedback);
      res.json({ message: "Application stage advanced successfully" });
    } catch (error) {
      console.error("Error advancing application stage:", error);
      res.status(500).json({ message: "Failed to advance application stage" });
    }
  });

  // Selection Process Analytics routes
  app.get('/api/analytics/selection-process', isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.query.companyId as string;
      const timeframe = req.query.timeframe as string;
      
      const metrics = await storage.getSelectionProcessMetrics(companyId, timeframe);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching selection process metrics:", error);
      res.status(500).json({ message: "Failed to fetch selection process metrics" });
    }
  });

  app.get('/api/analytics/conversion-rates', isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.query.companyId as string;
      
      const conversionRates = await storage.getConversionRates(companyId);
      res.json(conversionRates);
    } catch (error) {
      console.error("Error fetching conversion rates:", error);
      res.status(500).json({ message: "Failed to fetch conversion rates" });
    }
  });

  app.get('/api/analytics/time-to-hire', isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.query.companyId as string;
      
      const avgTimeToHire = await storage.getAverageTimeToHire(companyId);
      res.json({ averageTimeToHire: avgTimeToHire });
    } catch (error) {
      console.error("Error fetching time to hire:", error);
      res.status(500).json({ message: "Failed to fetch time to hire" });
    }
  });

  // Permission routes
  app.get('/api/permissions/user-roles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const roles = await storage.getUserCompanyRoles(userId);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });

  app.get('/api/permissions/:companyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const { companyId } = req.params;
      const permissions = await storage.getUserPermissions(userId, companyId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      res.status(500).json({ message: "Failed to fetch user permissions" });
    }
  });

  app.post('/api/permissions/assign', isAuthenticated, requirePermission('manage_permissions'), async (req, res) => {
    try {
      const validatedData = insertUserCompanyRoleSchema.parse(req.body);
      const assignment = await storage.assignUserToCompany(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error assigning user to company:", error);
      res.status(400).json({ message: "Invalid assignment data" });
    }
  });

  app.put('/api/permissions/:id/role', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const userId = (req.session as any).user.id;
      
      // First get the assignment to verify company ownership
      const assignment = await storage.getUserCompanyRoleById(id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Check if user has permission to manage roles in the assignment's company
      if (!assignment.companyId) {
        return res.status(400).json({ message: "Invalid assignment - missing company ID" });
      }
      const hasPermission = await storage.checkUserPermission(userId, assignment.companyId, 'manage_permissions');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      // Validate role value
      const roleSchema = z.enum(['admin', 'hr_manager', 'recruiter', 'interviewer', 'viewer']);
      const validatedRole = roleSchema.parse(role);
      
      const updatedRole = await storage.updateUserCompanyRole(id, validatedRole);
      res.json(updatedRole);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete('/api/permissions/:userId/:companyId', isAuthenticated, requirePermission('manage_permissions'), async (req, res) => {
    try {
      const { userId, companyId } = req.params;
      await storage.removeUserFromCompany(userId, companyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing user from company:", error);
      res.status(500).json({ message: "Failed to remove user from company" });
    }
  });

  app.get('/api/permissions/roles/permissions', isAuthenticated, async (req, res) => {
    try {
      const permissions = await storage.getRolePermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  app.post('/api/permissions/roles/permissions/toggle', isAuthenticated, async (req, res) => {
    try {
      const { role, permission, isGranted } = req.body;
      const updated = await storage.toggleRolePermission(role, permission, isGranted);
      res.json(updated);
    } catch (error) {
      console.error("Error toggling role permission:", error);
      res.status(500).json({ message: "Failed to toggle role permission" });
    }
  });

  app.post('/api/permissions/roles/permissions/add', isAuthenticated, async (req, res) => {
    try {
      const { role, permission } = req.body;
      const added = await storage.addRolePermission(role, permission);
      res.json(added);
    } catch (error) {
      console.error("Error adding role permission:", error);
      res.status(500).json({ message: "Failed to add role permission" });
    }
  });

  app.delete('/api/permissions/roles/permissions/remove', isAuthenticated, async (req, res) => {
    try {
      const { role, permission } = req.body;
      await storage.removeRolePermission(role, permission);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing role permission:", error);
      res.status(500).json({ message: "Failed to remove role permission" });
    }
  });

  app.post('/api/permissions/setup-defaults', isAuthenticated, async (req: any, res) => {
    try {
      // Only allow system admins to setup defaults (users with admin role globally)
      const userId = (req.session as any).user.id;
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only system administrators can setup default permissions" });
      }
      
      await storage.setupDefaultRolePermissions();
      res.json({ message: "Default permissions setup completed" });
    } catch (error) {
      console.error("Error setting up default permissions:", error);
      res.status(500).json({ message: "Failed to setup default permissions" });
    }
  });

  // Menu permission routes
  app.get('/api/permissions/menu/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const permissions = await storage.getUserMenuPermissions(userId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching user menu permissions:", error);
      res.status(500).json({ message: "Failed to fetch menu permissions" });
    }
  });

  app.get('/api/permissions/menu/:userId/accessible', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const accessibleMenus = await storage.getUserAccessibleMenus(userId);
      res.json(accessibleMenus);
    } catch (error) {
      console.error("Error fetching accessible menus:", error);
      res.status(500).json({ message: "Failed to fetch accessible menus" });
    }
  });

  app.post('/api/permissions/menu', isAuthenticated, async (req, res) => {
    try {
      const permissionData = insertUserMenuPermissionSchema.parse(req.body);
      const permission = await storage.createUserMenuPermission(permissionData);
      res.status(201).json(permission);
    } catch (error) {
      console.error("Error creating menu permission:", error);
      res.status(500).json({ message: "Failed to create menu permission" });
    }
  });

  app.put('/api/permissions/menu/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { canAccess } = req.body;
      const updated = await storage.updateUserMenuPermission(id, canAccess);
      res.json(updated);
    } catch (error) {
      console.error("Error updating menu permission:", error);
      res.status(500).json({ message: "Failed to update menu permission" });
    }
  });

  app.delete('/api/permissions/menu/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUserMenuPermission(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu permission:", error);
      res.status(500).json({ message: "Failed to delete menu permission" });
    }
  });

  app.post('/api/permissions/menu/:userId/defaults', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.setDefaultMenuPermissions(userId);
      res.json({ message: "Default menu permissions set successfully" });
    } catch (error) {
      console.error("Error setting default menu permissions:", error);
      res.status(500).json({ message: "Failed to set default menu permissions" });
    }
  });

  app.post('/api/permissions/menu/:userId/bulk', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const { menuPermissions } = req.body;
      await storage.bulkUpdateUserMenuPermissions(userId, menuPermissions);
      res.json({ message: "Menu permissions updated successfully" });
    } catch (error) {
      console.error("Error bulk updating menu permissions:", error);
      res.status(500).json({ message: "Failed to update menu permissions" });
    }
  });

  // Role job status permission routes
  app.get('/api/permissions/role-job-status', isAuthenticated, async (req, res) => {
    try {
      const { role } = req.query;
      console.log('[DEBUG] Fetching role job status permissions for role:', role);
      const permissions = await storage.getRoleJobStatusPermissions(role as string | undefined);
      console.log('[DEBUG] Found permissions:', permissions.length, permissions);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching role job status permissions:", error);
      res.status(500).json({ message: "Failed to fetch role job status permissions" });
    }
  });

  app.post('/api/permissions/role-job-status', isAuthenticated, async (req, res) => {
    try {
      const permissionData = insertRoleJobStatusPermissionSchema.parse(req.body);
      const permission = await storage.createRoleJobStatusPermission(permissionData);
      res.status(201).json(permission);
    } catch (error) {
      console.error("Error creating role job status permission:", error);
      res.status(500).json({ message: "Failed to create role job status permission" });
    }
  });

  app.put('/api/permissions/role-job-status/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const permissionData = updateRoleJobStatusPermissionSchema.parse(req.body);
      const updated = await storage.updateRoleJobStatusPermission(id, permissionData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating role job status permission:", error);
      res.status(500).json({ message: "Failed to update role job status permission" });
    }
  });

  app.delete('/api/permissions/role-job-status/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRoleJobStatusPermission(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting role job status permission:", error);
      res.status(500).json({ message: "Failed to delete role job status permission" });
    }
  });

  app.post('/api/permissions/role-job-status/:role/bulk', isAuthenticated, async (req, res) => {
    try {
      const { role } = req.params;
      const validatedData = bulkRoleJobStatusPermissionsSchema.parse(req.body);
      await storage.bulkUpdateRoleJobStatusPermissions(role, validatedData.permissions);
      res.json({ message: "Role job status permissions updated successfully" });
    } catch (error) {
      console.error("Error bulk updating role job status permissions:", error);
      res.status(500).json({ message: "Failed to update role job status permissions" });
    }
  });

  // Kanban Board routes
  app.get('/api/kanban-boards', isAuthenticated, async (req, res) => {
    try {
      const boards = await storage.getKanbanBoards();
      res.json(boards);
    } catch (error) {
      console.error("Error fetching kanban boards:", error);
      res.status(500).json({ message: "Failed to fetch kanban boards" });
    }
  });

  app.get('/api/kanban-boards/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const board = await storage.getKanbanBoard(id);
      if (!board) {
        return res.status(404).json({ message: "Kanban board not found" });
      }
      res.json(board);
    } catch (error) {
      console.error("Error fetching kanban board:", error);
      res.status(500).json({ message: "Failed to fetch kanban board" });
    }
  });

  app.post('/api/kanban-boards', isAuthenticated, async (req, res) => {
    try {
      const { name, description } = req.body;
      const newBoard = await storage.createKanbanBoard({
        id: `kanban-${Date.now()}`,
        name,
        description,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      res.status(201).json(newBoard);
    } catch (error) {
      console.error("Error creating kanban board:", error);
      res.status(500).json({ message: "Failed to create kanban board" });
    }
  });

  app.patch('/api/kanban-boards/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const updated = await storage.updateKanbanBoard(id, { name, description });
      res.json(updated);
    } catch (error) {
      console.error("Error updating kanban board:", error);
      res.status(500).json({ message: "Failed to update kanban board" });
    }
  });

  app.patch('/api/kanban-boards/:id/set-default', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      // First, set all kanbans to non-default
      const allBoards = await storage.getKanbanBoards();
      for (const board of allBoards) {
        if (board.isDefault) {
          await storage.updateKanbanBoard(board.id, { isDefault: false });
        }
      }
      
      // Then set this one as default
      const updated = await storage.updateKanbanBoard(id, { isDefault: true });
      res.json(updated);
    } catch (error) {
      console.error("Error setting default kanban board:", error);
      res.status(500).json({ message: "Failed to set default kanban board" });
    }
  });

  app.delete('/api/kanban-boards/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if kanban has associated jobs
      const jobs = await storage.getJobs();
      const associatedJobs = jobs.filter(job => job.kanbanBoardId === id);
      
      console.log(`[DELETE KANBAN] ID: ${id}, Total jobs: ${jobs.length}, Associated jobs: ${associatedJobs.length}`);
      
      if (associatedJobs.length > 0) {
        console.log(`[DELETE KANBAN] Cannot delete - has ${associatedJobs.length} associated jobs`);
        return res.status(400).json({ 
          message: `Não é possível excluir este Kanban pois existem ${associatedJobs.length} vaga(s) associada(s) a ele. Remova ou reassocie as vagas antes de excluir o Kanban.`
        });
      }
      
      await storage.deleteKanbanBoard(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting kanban board:", error);
      
      // Check if it's a foreign key constraint error
      if (error.code === '23503') {
        return res.status(400).json({ 
          message: "Não é possível excluir este Kanban pois existem vagas ou etapas associadas a ele. Remova ou reassocie as vagas antes de excluir o Kanban."
        });
      }
      
      res.status(500).json({ message: "Erro ao excluir Kanban. Tente novamente." });
    }
  });

  // Kanban Stages routes
  app.get('/api/kanban-boards/:id/stages', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const stages = await storage.getKanbanStages(id);
      res.json(stages);
    } catch (error) {
      console.error("Error fetching kanban stages:", error);
      res.status(500).json({ message: "Failed to fetch kanban stages" });
    }
  });

  app.post('/api/kanban-stages', isAuthenticated, async (req, res) => {
    try {
      const { kanbanBoardId, name, color, order } = req.body;
      const newStage = await storage.createKanbanStage({
        kanbanBoardId,
        name,
        color,
        order,
        createdAt: new Date(),
      });
      res.status(201).json(newStage);
    } catch (error) {
      console.error("Error creating kanban stage:", error);
      res.status(500).json({ message: "Failed to create kanban stage" });
    }
  });

  app.patch('/api/kanban-stages/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, color, order } = req.body;
      const updated = await storage.updateKanbanStage(id, { name, color, order });
      res.json(updated);
    } catch (error) {
      console.error("Error updating kanban stage:", error);
      res.status(500).json({ message: "Failed to update kanban stage" });
    }
  });

  app.delete('/api/kanban-stages/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteKanbanStage(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting kanban stage:", error);
      res.status(500).json({ message: "Failed to delete kanban stage" });
    }
  });

  app.post('/api/kanban-stages/reorder', isAuthenticated, async (req, res) => {
    try {
      const { stageUpdates } = req.body;
      await storage.reorderKanbanStages(stageUpdates);
      res.json({ message: "Stages reordered successfully" });
    } catch (error) {
      console.error("Error reordering kanban stages:", error);
      res.status(500).json({ message: "Failed to reorder kanban stages" });
    }
  });

  // Financial routes (Invoices and Boletos)
  app.get('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const { organizationId } = req.query;
      const invoices = organizationId 
        ? await storage.getInvoicesByOrganization(organizationId as string)
        : await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const newInvoice = await storage.createInvoice(validatedData);
      res.status(201).json(newInvoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ message: "Failed to create invoice", error });
    }
  });

  app.patch('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateInvoice(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteInvoice(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  app.post('/api/invoices/:id/mark-paid', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { paidDate, paymentMethod } = req.body;
      const updatedInvoice = await storage.markInvoiceAsPaid(
        id, 
        new Date(paidDate), 
        paymentMethod
      );
      res.json(updatedInvoice);
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      res.status(500).json({ message: "Failed to mark invoice as paid" });
    }
  });

  app.get('/api/payments/:invoiceId', isAuthenticated, async (req, res) => {
    try {
      const { invoiceId } = req.params;
      const payments = await storage.getPaymentsByInvoice(invoiceId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post('/api/payments', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPaymentHistorySchema.parse(req.body);
      const newPayment = await storage.createPayment(validatedData);
      res.status(201).json(newPayment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(400).json({ message: "Failed to create payment", error });
    }
  });

  // Plans routes
  app.get('/api/plans', isAuthenticated, async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.get('/api/plans/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const plan = await storage.getPlan(id);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json(plan);
    } catch (error) {
      console.error("Error fetching plan:", error);
      res.status(500).json({ message: "Failed to fetch plan" });
    }
  });

  app.post('/api/plans', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPlanSchema.parse(req.body);
      const newPlan = await storage.createPlan(validatedData);
      res.status(201).json(newPlan);
    } catch (error) {
      console.error("Error creating plan:", error);
      res.status(400).json({ message: "Failed to create plan", error });
    }
  });

  app.patch('/api/plans/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedPlan = await storage.updatePlan(id, updates);
      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating plan:", error);
      res.status(500).json({ message: "Failed to update plan" });
    }
  });

  app.delete('/api/plans/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePlan(id);
      res.json({ message: "Plan deleted successfully" });
    } catch (error) {
      console.error("Error deleting plan:", error);
      res.status(500).json({ message: "Failed to delete plan" });
    }
  });

  // Approval Workflow routes
  app.get('/api/workflows', isAuthenticated, async (req, res) => {
    try {
      const workflows = await storage.getApprovalWorkflows();
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });

  app.get('/api/workflows/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const workflow = await storage.getApprovalWorkflow(id);
      if (!workflow) {
        res.status(404).json({ message: "Workflow not found" });
        return;
      }
      res.json(workflow);
    } catch (error) {
      console.error("Error fetching workflow:", error);
      res.status(500).json({ message: "Failed to fetch workflow" });
    }
  });

  app.post('/api/workflows', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertApprovalWorkflowSchema.parse(req.body);
      const newWorkflow = await storage.createApprovalWorkflow(validatedData);
      res.status(201).json(newWorkflow);
    } catch (error) {
      console.error("Error creating workflow:", error);
      res.status(400).json({ message: "Failed to create workflow", error });
    }
  });

  app.patch('/api/workflows/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedWorkflow = await storage.updateApprovalWorkflow(id, updates);
      res.json(updatedWorkflow);
    } catch (error) {
      console.error("Error updating workflow:", error);
      res.status(500).json({ message: "Failed to update workflow" });
    }
  });

  app.delete('/api/workflows/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteApprovalWorkflow(id);
      res.json({ message: "Workflow deleted successfully" });
    } catch (error) {
      console.error("Error deleting workflow:", error);
      res.status(500).json({ message: "Failed to delete workflow" });
    }
  });

  // Workflow Steps routes
  app.get('/api/workflows/:workflowId/steps', isAuthenticated, async (req, res) => {
    try {
      const { workflowId } = req.params;
      const steps = await storage.getWorkflowSteps(workflowId);
      res.json(steps);
    } catch (error) {
      console.error("Error fetching workflow steps:", error);
      res.status(500).json({ message: "Failed to fetch workflow steps" });
    }
  });

  app.post('/api/workflow-steps', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertApprovalWorkflowStepSchema.parse(req.body);
      const newStep = await storage.createWorkflowStep(validatedData);
      res.status(201).json(newStep);
    } catch (error) {
      console.error("Error creating workflow step:", error);
      res.status(400).json({ message: "Failed to create workflow step", error });
    }
  });

  app.patch('/api/workflow-steps/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedStep = await storage.updateWorkflowStep(id, updates);
      res.json(updatedStep);
    } catch (error) {
      console.error("Error updating workflow step:", error);
      res.status(500).json({ message: "Failed to update workflow step" });
    }
  });

  app.delete('/api/workflow-steps/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWorkflowStep(id);
      res.json({ message: "Workflow step deleted successfully" });
    } catch (error) {
      console.error("Error deleting workflow step:", error);
      res.status(500).json({ message: "Failed to delete workflow step" });
    }
  });

  // Job Approval History routes
  app.get('/api/jobs/:jobId/approval-history', isAuthenticated, async (req, res) => {
    try {
      const { jobId } = req.params;
      const history = await storage.getJobApprovalHistory(jobId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching job approval history:", error);
      res.status(500).json({ message: "Failed to fetch job approval history" });
    }
  });

  app.post('/api/job-approval-history', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertJobApprovalHistorySchema.parse(req.body);
      const newHistory = await storage.createJobApprovalHistory(validatedData);
      res.status(201).json(newHistory);
    } catch (error) {
      console.error("Error creating job approval history:", error);
      res.status(400).json({ message: "Failed to create job approval history", error });
    }
  });

  app.patch('/api/job-approval-history/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedHistory = await storage.updateJobApprovalHistory(id, updates);
      res.json(updatedHistory);
    } catch (error) {
      console.error("Error updating job approval history:", error);
      res.status(500).json({ message: "Failed to update job approval history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
