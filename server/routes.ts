import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simpleAuth";
import { getWorkPositions } from "./hcm-connection";
import { emailService } from "./emailService";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { 
  insertOrganizationSchema,
  insertOrganizationWithAdminSchema,
  insertCompanySchema, 
  insertCostCenterSchema,
  insertClientSchema,
  insertClientEmployeeSchema,
  insertClientDashboardPermissionSchema,
  insertClientProfessionLimitSchema,
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
  insertJobApprovalHistorySchema,
  insertBlacklistCandidateSchema,
  divisions,
  costCenters
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
      const jobTypes = Array.isArray(req.query.jobType) ? req.query.jobType as string[] : (req.query.jobType ? [req.query.jobType as string] : []);
      const openingReasons = Array.isArray(req.query.openingReason) ? req.query.openingReason as string[] : (req.query.openingReason ? [req.query.openingReason as string] : []);
      const metrics = await storage.getDashboardMetrics(months, companyIds, divisions, recruiterIds, jobTypes, openingReasons);
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
      const jobTypes = Array.isArray(req.query.jobType) ? req.query.jobType as string[] : (req.query.jobType ? [req.query.jobType as string] : []);
      const openingReasons = Array.isArray(req.query.openingReason) ? req.query.openingReason as string[] : (req.query.openingReason ? [req.query.openingReason as string] : []);
      const data = await storage.getJobsByStatus(months, companyIds, divisions, recruiterIds, jobTypes, openingReasons);
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
      const jobTypes = Array.isArray(req.query.jobType) ? req.query.jobType as string[] : (req.query.jobType ? [req.query.jobType as string] : []);
      const openingReasons = Array.isArray(req.query.openingReason) ? req.query.openingReason as string[] : (req.query.openingReason ? [req.query.openingReason as string] : []);
      const data = await storage.getJobsByCreator(months, companyIds, divisions, recruiterIds, jobTypes, openingReasons);
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
      const jobTypes = Array.isArray(req.query.jobType) ? req.query.jobType as string[] : (req.query.jobType ? [req.query.jobType as string] : []);
      const openingReasons = Array.isArray(req.query.openingReason) ? req.query.openingReason as string[] : (req.query.openingReason ? [req.query.openingReason as string] : []);
      const data = await storage.getAllJobsByCreator(months, companyIds, divisions, recruiterIds, jobTypes, openingReasons);
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
      const jobTypes = Array.isArray(req.query.jobType) ? req.query.jobType as string[] : (req.query.jobType ? [req.query.jobType as string] : []);
      const openingReasons = Array.isArray(req.query.openingReason) ? req.query.openingReason as string[] : (req.query.openingReason ? [req.query.openingReason as string] : []);
      const data = await storage.getJobsByCompany(months, companyIds, divisions, recruiterIds, jobTypes, openingReasons);
      res.json(data);
    } catch (error) {
      console.error("Error fetching jobs by company:", error);
      res.status(500).json({ message: "Failed to fetch jobs by company" });
    }
  });

  app.get('/api/dashboard/jobs-by-work-position', isAuthenticated, async (req, res) => {
    try {
      const months = Array.isArray(req.query.month) ? req.query.month as string[] : (req.query.month ? [req.query.month as string] : []);
      const companyIds = Array.isArray(req.query.companyId) ? req.query.companyId as string[] : (req.query.companyId ? [req.query.companyId as string] : []);
      const divisions = Array.isArray(req.query.division) ? req.query.division as string[] : (req.query.division ? [req.query.division as string] : []);
      const recruiterIds = Array.isArray(req.query.recruiterId) ? req.query.recruiterId as string[] : (req.query.recruiterId ? [req.query.recruiterId as string] : []);
      const jobTypes = Array.isArray(req.query.jobType) ? req.query.jobType as string[] : (req.query.jobType ? [req.query.jobType as string] : []);
      const openingReasons = Array.isArray(req.query.openingReason) ? req.query.openingReason as string[] : (req.query.openingReason ? [req.query.openingReason as string] : []);
      const data = await storage.getJobsByWorkPosition(months, companyIds, divisions, recruiterIds, jobTypes, openingReasons);
      res.json(data);
    } catch (error) {
      console.error("Error fetching jobs by work position:", error);
      res.status(500).json({ message: "Failed to fetch jobs by work position" });
    }
  });

  app.get('/api/dashboard/jobs-by-cost-center', isAuthenticated, async (req, res) => {
    try {
      const months = Array.isArray(req.query.month) ? req.query.month as string[] : (req.query.month ? [req.query.month as string] : []);
      const companyIds = Array.isArray(req.query.companyId) ? req.query.companyId as string[] : (req.query.companyId ? [req.query.companyId as string] : []);
      const divisions = Array.isArray(req.query.division) ? req.query.division as string[] : (req.query.division ? [req.query.division as string] : []);
      const recruiterIds = Array.isArray(req.query.recruiterId) ? req.query.recruiterId as string[] : (req.query.recruiterId ? [req.query.recruiterId as string] : []);
      const jobTypes = Array.isArray(req.query.jobType) ? req.query.jobType as string[] : (req.query.jobType ? [req.query.jobType as string] : []);
      const openingReasons = Array.isArray(req.query.openingReason) ? req.query.openingReason as string[] : (req.query.openingReason ? [req.query.openingReason as string] : []);
      const data = await storage.getJobsByCostCenter(months, companyIds, divisions, recruiterIds, jobTypes, openingReasons);
      res.json(data);
    } catch (error) {
      console.error("Error fetching jobs by cost center:", error);
      res.status(500).json({ message: "Failed to fetch jobs by cost center" });
    }
  });

  app.get('/api/dashboard/jobs-by-client', isAuthenticated, async (req, res) => {
    try {
      const months = Array.isArray(req.query.month) ? req.query.month as string[] : (req.query.month ? [req.query.month as string] : []);
      const companyIds = Array.isArray(req.query.companyId) ? req.query.companyId as string[] : (req.query.companyId ? [req.query.companyId as string] : []);
      const divisions = Array.isArray(req.query.division) ? req.query.division as string[] : (req.query.division ? [req.query.division as string] : []);
      const recruiterIds = Array.isArray(req.query.recruiterId) ? req.query.recruiterId as string[] : (req.query.recruiterId ? [req.query.recruiterId as string] : []);
      const jobTypes = Array.isArray(req.query.jobType) ? req.query.jobType as string[] : (req.query.jobType ? [req.query.jobType as string] : []);
      const openingReasons = Array.isArray(req.query.openingReason) ? req.query.openingReason as string[] : (req.query.openingReason ? [req.query.openingReason as string] : []);
      const data = await storage.getJobsByClient(months, companyIds, divisions, recruiterIds, jobTypes, openingReasons);
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
      const jobTypes = Array.isArray(req.query.jobType) ? req.query.jobType as string[] : (req.query.jobType ? [req.query.jobType as string] : []);
      const openingReasons = Array.isArray(req.query.openingReason) ? req.query.openingReason as string[] : (req.query.openingReason ? [req.query.openingReason as string] : []);
      const data = await storage.getJobsSLA(months, companyIds, divisions, recruiterIds, jobTypes, openingReasons);
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
      const jobTypes = Array.isArray(req.query.jobType) ? req.query.jobType as string[] : (req.query.jobType ? [req.query.jobType as string] : []);
      const openingReasons = Array.isArray(req.query.openingReason) ? req.query.openingReason as string[] : (req.query.openingReason ? [req.query.openingReason as string] : []);
      const data = await storage.getJobsProductivity(months, companyIds, divisions, recruiterIds, jobTypes, openingReasons);
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

  // Senior Integration routes
  app.get('/api/senior-integration/settings', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || (req.session as any).user?.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "Organization ID not found" });
      }

      const settings = await storage.getSeniorIntegrationSettings(user.organizationId);
      
      // Mask the API key for security
      if (settings && settings.apiKey) {
        settings.apiKey = '***';
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching Senior integration settings:", error);
      res.status(500).json({ message: "Failed to fetch Senior integration settings" });
    }
  });

  app.post('/api/senior-integration/settings', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || (req.session as any).user?.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "Organization ID not found" });
      }

      const { apiUrl, apiKey, isActive, autoSync, syncInterval } = req.body;

      if (!apiUrl || !apiKey) {
        return res.status(400).json({ message: "API URL and API Key are required" });
      }

      const settings = await storage.createOrUpdateSeniorIntegrationSettings(user.organizationId, {
        apiUrl,
        apiKey,
        isActive: isActive ?? true,
        autoSync: autoSync ?? false,
        syncInterval: syncInterval ?? 60,
      });

      // Mask the API key in response
      if (settings && settings.apiKey) {
        settings.apiKey = '***';
      }

      res.json(settings);
    } catch (error) {
      console.error("Error saving Senior integration settings:", error);
      res.status(500).json({ message: "Failed to save Senior integration settings" });
    }
  });

  app.post('/api/senior-integration/test-connection', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || (req.session as any).user?.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "Organization ID not found" });
      }

      const settings = await storage.getSeniorIntegrationSettings(user.organizationId);
      
      if (!settings || !settings.isActive) {
        return res.status(400).json({ 
          success: false, 
          error: "Integração Senior não está configurada ou ativa" 
        });
      }

      // Test health endpoint
      const healthResponse = await fetch(`${settings.apiUrl}/health`, {
        headers: {
          'x-api-key': settings.apiKey,
        },
      });

      if (!healthResponse.ok) {
        return res.json({
          success: false,
          error: `API retornou status ${healthResponse.status}`,
        });
      }

      const healthData = await healthResponse.json();

      // Test tables endpoint
      const tablesResponse = await fetch(`${settings.apiUrl}/tables`, {
        headers: {
          'x-api-key': settings.apiKey,
        },
      });

      let tablesCount = 0;
      if (tablesResponse.ok) {
        const tablesData = await tablesResponse.json();
        tablesCount = tablesData.tables?.length || 0;
      }

      // Test employees count
      const employeesResponse = await fetch(`${settings.apiUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.apiKey,
        },
        body: JSON.stringify({
          query: "SELECT COUNT(*) as total FROM funcionarios WHERE sitafa = 'A'"
        }),
      });

      let employeesCount = 0;
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        employeesCount = employeesData.data?.[0]?.total || 0;
      }

      res.json({
        success: true,
        health: healthData,
        tablesCount,
        employeesCount,
      });

    } catch (error) {
      console.error("Error testing Senior connection:", error);
      res.json({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido ao testar conexão",
      });
    }
  });

  app.post('/api/senior-integration/sync', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || (req.session as any).user?.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "Organization ID not found" });
      }

      const settings = await storage.getSeniorIntegrationSettings(user.organizationId);
      
      if (!settings || !settings.isActive) {
        return res.status(400).json({ 
          success: false, 
          error: "Integração Senior não está configurada ou ativa" 
        });
      }

      // Sync employees
      const employeesResponse = await fetch(`${settings.apiUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.apiKey,
        },
        body: JSON.stringify({
          query: "SELECT * FROM funcionarios WHERE sitafa = 'A'"
        }),
      });

      if (!employeesResponse.ok) {
        throw new Error(`Falha ao buscar funcionários: ${employeesResponse.status}`);
      }

      const employeesData = await employeesResponse.json();
      const employeesCount = employeesData.data?.length || 0;

      // Update last sync info
      await storage.updateSeniorIntegrationSyncStatus(
        user.organizationId, 
        'success', 
        `Sincronizados ${employeesCount} colaboradores`,
        null
      );

      res.json({
        success: true,
        message: `Sincronização concluída com sucesso! ${employeesCount} colaboradores atualizados.`,
        employeesCount,
      });

    } catch (error) {
      console.error("Error syncing Senior data:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      // Update last sync with error
      try {
        const userId = req.user?.id || (req.session as any).user?.id;
        const user = await storage.getUser(userId);
        if (user?.organizationId) {
          await storage.updateSeniorIntegrationSyncStatus(
            user.organizationId, 
            'error', 
            null,
            errorMessage
          );
        }
      } catch (updateError) {
        console.error("Error updating sync status:", updateError);
      }

      res.json({
        success: false,
        error: errorMessage,
      });
    }
  });

  app.get('/api/senior-integration/tables', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || (req.session as any).user?.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "Organization ID not found" });
      }

      const settings = await storage.getSeniorIntegrationSettings(user.organizationId);
      
      if (!settings || !settings.isActive) {
        return res.status(400).json({ 
          success: false, 
          error: "Integração Senior não está configurada ou ativa" 
        });
      }

      const tablesResponse = await fetch(`${settings.apiUrl}/tables`, {
        headers: {
          'x-api-key': settings.apiKey,
        },
      });

      if (!tablesResponse.ok) {
        throw new Error(`Falha ao buscar tabelas: ${tablesResponse.status}`);
      }

      const tablesData = await tablesResponse.json();
      res.json({
        success: true,
        tables: tablesData.tables || tablesData || [],
      });

    } catch (error) {
      console.error("Error fetching Senior tables:", error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Erro ao buscar tabelas" 
      });
    }
  });

  app.post('/api/senior-integration/query', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || (req.session as any).user?.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "Organization ID not found" });
      }

      const settings = await storage.getSeniorIntegrationSettings(user.organizationId);
      
      if (!settings || !settings.isActive) {
        return res.status(400).json({ 
          success: false, 
          error: "Integração Senior não está configurada ou ativa" 
        });
      }

      const { query, sqlText } = req.body;
      const sql = sqlText || query;

      if (!sql) {
        return res.status(400).json({ message: "SQL query is required" });
      }

      const queryResponse = await fetch(`${settings.apiUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.apiKey,
        },
        body: JSON.stringify({ sqlText: sql }),
      });

      if (!queryResponse.ok) {
        throw new Error(`Query falhou: ${queryResponse.status}`);
      }

      const data = await queryResponse.json();
      res.json(data);

    } catch (error) {
      console.error("Error executing Senior query:", error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Erro ao executar query" 
      });
    }
  });

  // Import companies from Senior r030emp table
  app.post('/api/senior-integration/import-companies', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || (req.session as any).user?.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "Organization ID not found" });
      }

      const settings = await storage.getSeniorIntegrationSettings(user.organizationId);
      
      if (!settings || !settings.isActive) {
        return res.status(400).json({ 
          success: false, 
          error: "Integração Senior não está configurada ou ativa" 
        });
      }

      // Query to fetch all companies from r030emp
      const queryResponse = await fetch(`${settings.apiUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.apiKey,
        },
        body: JSON.stringify({ 
          sqlText: 'SELECT numemp, nomemp, apeemp, sigemp, numtel, numfax, dddtel, dditel FROM r030emp ORDER BY numemp' 
        }),
      });

      if (!queryResponse.ok) {
        throw new Error(`Query falhou: ${queryResponse.status}`);
      }

      const seniorCompanies = await queryResponse.json();

      if (!Array.isArray(seniorCompanies) || seniorCompanies.length === 0) {
        return res.json({ 
          success: true, 
          imported: 0,
          skipped: 0,
          message: "Nenhuma empresa encontrada na tabela r030emp" 
        });
      }

      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      // Import each company
      for (const seniorCompany of seniorCompanies) {
        try {
          // Check if company already exists in our system
          const existingCompanies = await storage.getCompanies();
          const exists = existingCompanies.some(c => 
            c.name === seniorCompany.nomemp || 
            (c as any).seniorId === seniorCompany.numemp.toString()
          );

          if (exists) {
            skipped++;
            continue;
          }

          // Format phone number
          let phone = '';
          if (seniorCompany.numtel) {
            const ddd = seniorCompany.dddtel || seniorCompany.dditel || '';
            phone = ddd ? `(${ddd}) ${seniorCompany.numtel}` : seniorCompany.numtel;
          }

          // Create company in our system
          const companyData = {
            organizationId: user.organizationId,
            name: seniorCompany.nomemp || `Empresa ${seniorCompany.numemp}`,
            phone: phone,
            description: seniorCompany.apeemp || '',
            seniorId: seniorCompany.numemp.toString(),
            importedFromSenior: true,
            lastSyncedAt: new Date(),
          };

          await storage.createCompany(companyData);
          imported++;

        } catch (error) {
          console.error(`Error importing company ${seniorCompany.nomemp}:`, error);
          errors.push(`${seniorCompany.nomemp}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }

      res.json({
        success: true,
        imported,
        skipped,
        total: seniorCompanies.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Importação concluída: ${imported} empresas importadas, ${skipped} já existentes`
      });

    } catch (error) {
      console.error("Error importing companies from Senior:", error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Erro ao importar empresas" 
      });
    }
  });

  // Import cost centers from Senior r018ccu table
  app.post('/api/senior-integration/import-cost-centers', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || (req.session as any).user?.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "Organization ID not found" });
      }

      const settings = await storage.getSeniorIntegrationSettings(user.organizationId);
      
      if (!settings || !settings.isActive) {
        return res.status(400).json({ 
          success: false, 
          error: "Integração Senior não está configurada ou ativa" 
        });
      }

      // Create Senior integration service
      const { createSeniorIntegrationService } = await import('./services/seniorIntegration');
      const seniorService = createSeniorIntegrationService({
        apiUrl: settings.apiUrl,
        apiKey: settings.apiKey,
      });

      // Get all companies from our system to map numemp -> company ID
      const companies = await storage.getCompanies();
      const companyMap = new Map<string, string>();
      companies.forEach(company => {
        if ((company as any).seniorId) {
          companyMap.set((company as any).seniorId, company.id);
        }
      });

      // Get all divisions to map code -> division ID
      const allDivisions = await storage.getDivisions();
      const divisionMap = new Map<string, string>();
      allDivisions.forEach(division => {
        if (division.code) {
          divisionMap.set(division.code.toString(), division.id);
        }
      });

      // Query to fetch all cost centers from r018ccu (including division)
      const seniorCostCenters = await seniorService.executeQuery<{
        numemp: number;
        codccu: string;
        nomccu: string;
        usu_coddiv: number | null;
      }>('SELECT numemp, codccu, nomccu, usu_coddiv FROM r018ccu ORDER BY numemp, codccu');

      if (!Array.isArray(seniorCostCenters) || seniorCostCenters.length === 0) {
        return res.json({ 
          success: true, 
          imported: 0,
          skipped: 0,
          message: "Nenhum centro de custo encontrado na tabela r018ccu" 
        });
      }

      // Load existing cost centers once and create lookup map
      const existingCostCenters = await storage.getCostCenters();
      const existingMap = new Set<string>();
      existingCostCenters.forEach(cc => {
        if ((cc as any).seniorId && cc.companyId) {
          existingMap.add(`${(cc as any).seniorId}-${cc.companyId}`);
        }
      });

      let imported = 0;
      let updated = 0;
      let skipped = 0;
      let withDivision = 0;
      let withoutDivision = 0;
      const errors: string[] = [];

      // Import each cost center
      for (const seniorCC of seniorCostCenters) {
        try {
          // Find the corresponding company in our system
          const companyId = companyMap.get(seniorCC.numemp.toString());
          
          if (!companyId) {
            errors.push(`Centro de custo ${seniorCC.codccu}: Empresa ${seniorCC.numemp} não encontrada no sistema`);
            skipped++;
            continue;
          }

          // Find division if usu_coddiv is set
          let divisionId: string | null = null;
          if (seniorCC.usu_coddiv && seniorCC.usu_coddiv !== 0) {
            const foundDivisionId = divisionMap.get(seniorCC.usu_coddiv.toString());
            if (foundDivisionId) {
              divisionId = foundDivisionId;
              withDivision++;
            }
          }

          if (!divisionId) {
            withoutDivision++;
          }

          // Check if cost center already exists
          const key = `${seniorCC.codccu}-${companyId}`;
          const exists = existingMap.has(key);

          if (exists) {
            // Update existing cost center with division info
            await db.update(costCenters)
              .set({
                name: seniorCC.nomccu || `Centro de Custo ${seniorCC.codccu}`,
                divisionId: divisionId,
                lastSyncedAt: new Date(),
              })
              .where(and(
                eq(costCenters.seniorId, seniorCC.codccu),
                eq(costCenters.companyId, companyId)
              ));
            updated++;
          } else {
            // Create cost center in our system
            await db.insert(costCenters).values({
              name: seniorCC.nomccu || `Centro de Custo ${seniorCC.codccu}`,
              code: seniorCC.codccu,
              companyId: companyId,
              divisionId: divisionId,
              seniorId: seniorCC.codccu,
              importedFromSenior: true,
              lastSyncedAt: new Date(),
            });
            imported++;
          }

        } catch (error) {
          console.error(`Error importing cost center ${seniorCC.codccu}:`, error);
          errors.push(`${seniorCC.codccu}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }

      res.json({
        success: true,
        imported,
        updated,
        skipped,
        withDivision,
        withoutDivision,
        total: seniorCostCenters.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Importação concluída: ${imported} importados, ${updated} atualizados, ${withDivision} com divisão, ${withoutDivision} sem divisão`
      });

    } catch (error) {
      console.error("Error importing cost centers from Senior:", error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Erro ao importar centros de custo" 
      });
    }
  });

  // Import divisions from Senior usu_tdivare table
  app.post('/api/senior-integration/import-divisions', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || (req.session as any).user?.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "Organization ID not found" });
      }

      const settings = await storage.getSeniorIntegrationSettings(user.organizationId);
      
      if (!settings || !settings.isActive) {
        return res.status(400).json({ 
          success: false, 
          error: "Integração Senior não está configurada ou ativa" 
        });
      }

      // Create Senior integration service
      const { createSeniorIntegrationService } = await import('./services/seniorIntegration');
      const seniorService = createSeniorIntegrationService({
        apiUrl: settings.apiUrl,
        apiKey: settings.apiKey,
      });

      // Query to fetch all divisions from usu_tdivare
      const seniorDivisions = await seniorService.executeQuery<{usu_coddiv: number; usu_desdiv: string}>(
        'SELECT usu_coddiv, usu_desdiv FROM usu_tdivare ORDER BY usu_coddiv'
      );

      if (!Array.isArray(seniorDivisions) || seniorDivisions.length === 0) {
        return res.json({ 
          success: true, 
          imported: 0,
          skipped: 0,
          message: "Nenhuma divisão encontrada na tabela usu_tdivare" 
        });
      }

      // Load existing divisions once and create lookup map by code
      const existingDivisions = await storage.getDivisions();
      const divisionMap = new Map(existingDivisions.map(d => [d.code, d]));

      let imported = 0;
      let skipped = 0;
      let updated = 0;
      const errors: string[] = [];

      // Import each division
      for (const seniorDiv of seniorDivisions) {
        try {
          const existing = divisionMap.get(seniorDiv.usu_coddiv);

          if (existing) {
            // Update name if changed
            if (existing.name !== seniorDiv.usu_desdiv) {
              await storage.updateDivisionName(existing.id, seniorDiv.usu_desdiv);
              updated++;
            } else {
              skipped++;
            }
            continue;
          }

          // Create division in our system
          await storage.createDivision({
            code: seniorDiv.usu_coddiv,
            name: seniorDiv.usu_desdiv,
            isActive: true,
          });
          imported++;

        } catch (error) {
          console.error(`Error importing division ${seniorDiv.usu_coddiv}:`, error);
          errors.push(`${seniorDiv.usu_coddiv}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }

      res.json({
        success: true,
        imported,
        updated,
        skipped,
        total: seniorDivisions.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Importação concluída: ${imported} divisões importadas, ${updated} atualizadas, ${skipped} já existentes`
      });

    } catch (error) {
      console.error("Error importing divisions from Senior:", error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Erro ao importar divisões" 
      });
    }
  });

  // Get professions from Senior API (real-time)
  app.get('/api/senior-integration/professions', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || (req.session as any).user?.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "Organization ID not found" });
      }

      const settings = await storage.getSeniorIntegrationSettings(user.organizationId);
      
      if (!settings || !settings.isActive) {
        return res.status(400).json({ 
          success: false, 
          error: "Integração Senior não está configurada ou ativa" 
        });
      }

      // Create Senior integration service
      const { createSeniorIntegrationService } = await import('./services/seniorIntegration');
      const seniorService = createSeniorIntegrationService({
        apiUrl: settings.apiUrl,
        apiKey: settings.apiKey,
      });

      // Query to fetch all professions/cargos from r024car
      const seniorProfessions = await seniorService.executeQuery<{
        estcar: number;
        codcar: string;
        titcar: string;
        codcb2: string;
      }>(
        'SELECT estcar, codcar, titcar, codcb2 FROM r024car ORDER BY titcar'
      );

      if (!Array.isArray(seniorProfessions)) {
        return res.json([]);
      }

      // Transform to match our Profession interface
      const professions = seniorProfessions.map(p => ({
        id: `${p.estcar}-${p.codcar}`,
        name: p.titcar,
        cboCode: p.codcb2 || null,
        category: null,
        description: null,
        seniorId: `${p.estcar}-${p.codcar}`,
        seniorEstablishment: p.estcar.toString(),
        importedFromSenior: true,
        isActive: true,
        lastSyncedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      res.json(professions);

    } catch (error) {
      console.error("Error fetching professions from Senior:", error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Erro ao buscar profissões da Senior HCM" 
      });
    }
  });

  // Import professions from Senior r024car table
  app.post('/api/senior-integration/import-professions', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || (req.session as any).user?.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "Organization ID not found" });
      }

      const settings = await storage.getSeniorIntegrationSettings(user.organizationId);
      
      if (!settings || !settings.isActive) {
        return res.status(400).json({ 
          success: false, 
          error: "Integração Senior não está configurada ou ativa" 
        });
      }

      // Create Senior integration service
      const { createSeniorIntegrationService } = await import('./services/seniorIntegration');
      const seniorService = createSeniorIntegrationService({
        apiUrl: settings.apiUrl,
        apiKey: settings.apiKey,
      });

      // Query to fetch all professions/cargos from r024car
      const seniorProfessions = await seniorService.executeQuery<{
        estcar: number;
        codcar: string;
        titcar: string;
        codcb2: string;
      }>(
        'SELECT estcar, codcar, titcar, codcb2 FROM r024car ORDER BY titcar'
      );

      if (!Array.isArray(seniorProfessions) || seniorProfessions.length === 0) {
        return res.json({ 
          success: true, 
          imported: 0,
          skipped: 0,
          message: "Nenhuma profissão encontrada na tabela r024car" 
        });
      }

      // Load existing professions once and create lookup map by senior_id
      const existingProfessions = await storage.getProfessions();
      const professionMap = new Map(
        existingProfessions
          .filter(p => p.seniorId)
          .map(p => [p.seniorId, p])
      );

      let imported = 0;
      let skipped = 0;
      let updated = 0;
      const errors: string[] = [];

      // Import each profession
      for (const seniorProf of seniorProfessions) {
        try {
          const seniorId = `${seniorProf.estcar}-${seniorProf.codcar}`;
          const existing = professionMap.get(seniorId);

          if (existing) {
            // Update name if changed
            if (existing.name !== seniorProf.titcar || existing.cboCode !== seniorProf.codcb2) {
              await storage.updateProfession(existing.id, {
                name: seniorProf.titcar,
                cboCode: seniorProf.codcb2 || undefined,
                lastSyncedAt: new Date(),
              });
              updated++;
            } else {
              skipped++;
            }
            continue;
          }

          // Create profession in our system
          await storage.createProfession({
            name: seniorProf.titcar,
            cboCode: seniorProf.codcb2 || undefined,
            seniorId: seniorId,
            seniorEstablishment: seniorProf.estcar.toString(),
            importedFromSenior: true,
            lastSyncedAt: new Date(),
            isActive: true,
          });
          imported++;

        } catch (error) {
          console.error(`Error importing profession ${seniorProf.titcar}:`, error);
          errors.push(`${seniorProf.titcar}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }

      res.json({
        success: true,
        imported,
        updated,
        skipped,
        total: seniorProfessions.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Importação concluída: ${imported} profissões importadas, ${updated} atualizadas, ${skipped} já existentes`
      });

    } catch (error) {
      console.error("Error importing professions from Senior:", error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Erro ao importar profissões" 
      });
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
      const user = (req.session as any).user;
      const organizationId = user.organizationId;
      const companies = await storage.getCompanies(organizationId);
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
  app.get('/api/cost-centers', isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any).user;
      const organizationId = user.organizationId;
      const costCenters = await storage.getCostCenters(organizationId);
      res.json(costCenters);
    } catch (error) {
      console.error("Error fetching all cost centers:", error);
      res.status(500).json({ message: "Failed to fetch cost centers" });
    }
  });

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

  // Work Positions routes
  app.get('/api/work-positions', isAuthenticated, async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const workPositions = await storage.getWorkPositions(search, limit);
      res.json(workPositions);
    } catch (error) {
      console.error("Error fetching work positions:", error);
      res.status(500).json({ message: "Failed to fetch work positions" });
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
      const user = (req.session as any).user;
      const organizationId = user.organizationId;
      const clients = await storage.getClients(organizationId);
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

  // Client Profession Limits routes
  app.get('/api/clients/:clientId/profession-limits', isAuthenticated, async (req, res) => {
    try {
      const { clientId } = req.params;
      const limits = await storage.getClientProfessionLimits(clientId);
      res.json(limits);
    } catch (error) {
      console.error("Error fetching client profession limits:", error);
      res.status(500).json({ message: "Falha ao buscar limites de profissões" });
    }
  });

  app.get('/api/clients/:clientId/profession-limits/:professionId', isAuthenticated, async (req, res) => {
    try {
      const { clientId, professionId } = req.params;
      const limit = await storage.getClientProfessionLimit(clientId, professionId);
      if (!limit) {
        return res.status(404).json({ message: "Limite não encontrado" });
      }
      res.json(limit);
    } catch (error) {
      console.error("Error fetching client profession limit:", error);
      res.status(500).json({ message: "Falha ao buscar limite de profissão" });
    }
  });

  app.post('/api/clients/:clientId/profession-limits', isAuthenticated, async (req, res) => {
    try {
      const { clientId } = req.params;
      const validatedData = insertClientProfessionLimitSchema.parse({
        ...req.body,
        clientId
      });
      const limit = await storage.upsertClientProfessionLimit(validatedData);
      res.status(201).json(limit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Error upserting client profession limit:", error);
      res.status(500).json({ message: "Falha ao criar/atualizar limite de profissão" });
    }
  });

  app.delete('/api/client-profession-limits/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteClientProfessionLimit(id);
      res.json({ message: "Limite de profissão removido com sucesso" });
    } catch (error) {
      console.error("Error deleting client profession limit:", error);
      res.status(500).json({ message: "Falha ao remover limite de profissão" });
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
      
      const user = (req.session as any).user;
      const organizationId = user.organizationId;
      
      let jobs = await storage.getJobs(limit, offset, search, status, companyId, professionId, recruiterId, organizationId);
      
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

  // Helper function to create approval workflow entries for a job
  async function createJobApprovalWorkflow(job: any, storage: IStorage) {
    if (!job.approvalWorkflowId) {
      console.log('No workflow configured for job, skipping approval creation');
      return;
    }
    
    console.log(`Creating approval workflow entries for job ${job.id} with workflow ${job.approvalWorkflowId}`);
    
    // Get workflow steps
    const workflowSteps = await storage.getWorkflowSteps(job.approvalWorkflowId);
    
    if (!workflowSteps || workflowSteps.length === 0) {
      console.log('No workflow steps found, skipping approval creation');
      return;
    }
    
    console.log(`Found ${workflowSteps.length} workflow steps`);
    
    // Create approval history entry for each step with status='pending'
    for (const step of workflowSteps) {
      await storage.createJobApprovalHistory({
        jobId: job.id,
        workflowStepId: step.id,
        stepName: step.stepName,
        stepOrder: step.stepOrder,
        status: 'pending',
      });
      
      console.log(`Created approval entry for step ${step.stepOrder}: ${step.stepName}`);
    }
    
    // Update job to set approvalStatus='pending' and currentApprovalStep=1
    await storage.updateJob(job.id, {
      approvalStatus: 'pending',
      currentApprovalStep: 1,
    });
    
    console.log(`Job ${job.id} updated with approval status: pending, current step: 1`);
  }

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
        return res.status(400).json({ message: "Profissão inválida ou inativa" });
      }
      
      // Require companyId for authorization
      if (!validatedData.companyId) {
        return res.status(400).json({ message: "Empresa é obrigatória" });
      }
      
      // Require clientId for quota validation
      if (!validatedData.clientId) {
        return res.status(400).json({ message: "Cliente é obrigatório" });
      }
      
      // Skip permission checks in AUTH_BYPASS mode
      if (process.env.AUTH_BYPASS !== 'true') {
        // Get user's global role
        const user = (req.session as any).user;
        const isGlobalAdmin = user.role === 'admin' || user.role === 'super_admin';
        
        // Apenas GESTOR, Gerente de RH e Admins globais podem criar vagas
        if (!isGlobalAdmin) {
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
            return res.status(403).json({ message: "Sem permissão para criar vagas" });
          }
        }
      }
      
      // === VALIDAÇÃO DE POLÍTICA E DISPONIBILIDADE DE VAGAS ===
      
      // 1. Buscar política de criação de vagas
      const quotaPolicy = await storage.getSystemSetting('job_creation_quota_policy');
      const policy = quotaPolicy?.value || 'allow'; // Default: allow
      
      console.log(`Política de criação de vagas: ${policy}`);
      
      // 2. Buscar limite de vagas para esta profissão e cliente
      const professionLimit = await storage.getClientProfessionLimit(
        validatedData.clientId,
        validatedData.professionId
      );
      
      console.log('Limite de profissão:', professionLimit);
      
      // Se a política for "allow", não precisa validar limites
      if (policy !== 'allow') {
        if (!professionLimit) {
          return res.status(400).json({ 
            message: `Limite de vagas não configurado para a profissão "${profession.name}" neste cliente` 
          });
        }
      }
      
      // 3. Contar vagas ativas desta profissão para este cliente (apenas se houver limite)
      const quantity = jobDataForDb.vacancyQuantity || 1;
      
      if (professionLimit) {
        const activeJobsCount = await storage.countActiveJobsByClientAndProfession(
          validatedData.clientId,
          validatedData.professionId
        );
        
        const futureCount = activeJobsCount + quantity;
        
        console.log(`Vagas ativas: ${activeJobsCount}, Novas: ${quantity}, Total futuro: ${futureCount}, Limite: ${professionLimit.maxJobs}`);
        
        // 4. Aplicar política de criação de vagas
        if (futureCount > professionLimit.maxJobs) {
        const availableSlots = Math.max(0, professionLimit.maxJobs - activeJobsCount);
        
        if (policy === 'block') {
          return res.status(400).json({ 
            message: `Limite de vagas excedido! Cliente possui ${activeJobsCount} vagas ativas de ${professionLimit.maxJobs} permitidas para "${profession.name}". Disponível: ${availableSlots} vaga(s).`,
            quota: {
              active: activeJobsCount,
              limit: professionLimit.maxJobs,
              available: availableSlots,
              requested: quantity
            }
          });
        } else if (policy === 'require_approval') {
          // Marcar vaga como criada com irregularidade
          jobDataForDb.createdWithIrregularity = true;
          console.log('Vaga será criada com irregularidade (requer aprovação)');
        }
        // Se policy === 'allow', continua normalmente mesmo excedendo o limite
        }
      } else {
        console.log('Nenhum limite de profissão configurado, criando vaga sem validação de quota');
      }
      
      // If vacancyQuantity > 1, create multiple job records
      
      if (quantity > 1) {
        const createdJobs = [];
        
        for (let i = 0; i < quantity; i++) {
          // Create a copy of job data for each vacancy
          const jobCopy = { ...jobDataForDb };
          // Set vacancyQuantity to 1 for each individual job record
          jobCopy.vacancyQuantity = 1;
          
          const job = await storage.createJob(jobCopy);
          
          // Create approval workflow entries if workflow is configured
          await createJobApprovalWorkflow(job, storage);
          
          createdJobs.push(job);
        }
        
        console.log(`Created ${quantity} job records`);
        // Return the first job as response
        res.status(201).json(createdJobs[0]);
      } else {
        const job = await storage.createJob(jobDataForDb);
        
        // Create approval workflow entries if workflow is configured
        await createJobApprovalWorkflow(job, storage);
        
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
      
      // QUOTA VALIDATION: Check if update would violate profession limits
      const activeStatuses = ['nova_vaga', 'aprovada', 'em_recrutamento', 'em_dp', 'em_admissao'];
      const wasActive = activeStatuses.includes(existingJob.status || '');
      const willBeActive = validatedData.status ? activeStatuses.includes(validatedData.status) : wasActive;
      const quantityChange = validatedData.vacancyQuantity !== undefined;
      
      // Only validate if:
      // 1. Status is changing from inactive to active (reopening job), OR
      // 2. Quantity is changing while job is/will be active
      if ((!wasActive && willBeActive) || (willBeActive && quantityChange)) {
        const quotaPolicy = await storage.getSystemSetting('job_creation_quota_policy');
        const policy = quotaPolicy?.value || 'allow';
        
        if (policy !== 'allow' && existingJob.clientId && existingJob.professionId) {
          const professionLimit = await storage.getClientProfessionLimit(
            existingJob.clientId,
            existingJob.professionId
          );
          
          if (professionLimit) {
            // Count current active jobs (includes this job if it's currently active)
            const currentActiveCount = await storage.countActiveJobsByClientAndProfession(
              existingJob.clientId,
              existingJob.professionId
            );
            
            // Calculate projected usage correctly:
            // Start with current count, subtract this job's current contribution, add new contribution
            const currentJobContribution = wasActive ? (existingJob.vacancyQuantity || 1) : 0;
            const newJobContribution = willBeActive ? (validatedData.vacancyQuantity || existingJob.vacancyQuantity || 1) : 0;
            const projectedCount = currentActiveCount - currentJobContribution + newJobContribution;
            
            if (projectedCount > professionLimit.maxJobs) {
              const netIncrease = newJobContribution - currentJobContribution;
              const availableSlots = Math.max(0, professionLimit.maxJobs - currentActiveCount);
              
              if (policy === 'block') {
                const profession = await storage.getProfession(existingJob.professionId);
                return res.status(400).json({ 
                  message: `Limite de vagas excedido! Cliente possui ${currentActiveCount} vagas ativas de ${professionLimit.maxJobs} permitidas para "${profession?.name || 'esta profissão'}". Disponível: ${availableSlots} vaga(s).`,
                  quota: {
                    active: currentActiveCount,
                    limit: professionLimit.maxJobs,
                    available: availableSlots,
                    requested: netIncrease
                  }
                });
              } else if (policy === 'require_approval') {
                // Mark as created with irregularity if reopening/increasing
                validatedData.createdWithIrregularity = true;
              }
            }
          }
        }
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
      
      // QUOTA VALIDATION: Check if status change would violate profession limits
      const activeStatuses = ['nova_vaga', 'aprovada', 'em_recrutamento', 'em_dp', 'em_admissao'];
      const wasActive = activeStatuses.includes(existingJob.status || '');
      const willBeActive = activeStatuses.includes(status);
      let markAsIrregular = false;
      
      // Only validate if reopening (inactive → active)
      if (!wasActive && willBeActive) {
        const quotaPolicy = await storage.getSystemSetting('job_creation_quota_policy');
        const policy = quotaPolicy?.value || 'allow';
        
        if (policy !== 'allow' && existingJob.clientId && existingJob.professionId) {
          const professionLimit = await storage.getClientProfessionLimit(
            existingJob.clientId,
            existingJob.professionId
          );
          
          if (professionLimit) {
            const currentActiveCount = await storage.countActiveJobsByClientAndProfession(
              existingJob.clientId,
              existingJob.professionId
            );
            
            // Calculate projected usage: current - 0 (was inactive) + new contribution
            const newJobContribution = existingJob.vacancyQuantity || 1;
            const projectedCount = currentActiveCount + newJobContribution;
            
            if (projectedCount > professionLimit.maxJobs) {
              const availableSlots = Math.max(0, professionLimit.maxJobs - currentActiveCount);
              
              if (policy === 'block') {
                const profession = await storage.getProfession(existingJob.professionId);
                return res.status(400).json({ 
                  message: `Limite de vagas excedido! Cliente possui ${currentActiveCount} vagas ativas de ${professionLimit.maxJobs} permitidas para "${profession?.name || 'esta profissão'}". Disponível: ${availableSlots} vaga(s).`,
                  quota: {
                    active: currentActiveCount,
                    limit: professionLimit.maxJobs,
                    available: availableSlots,
                    requested: newJobContribution
                  }
                });
              } else if (policy === 'require_approval') {
                // Mark to set irregularity flag along with status
                markAsIrregular = true;
              }
            }
          }
        }
      }
      
      // Update status (and irregularity flag if needed)
      const updateData: any = { status };
      if (markAsIrregular) {
        updateData.createdWithIrregularity = true;
      }
      const job = await storage.updateJob(id, updateData);
      
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
      const { reason } = req.body;
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
      
      // Log deletion reason in status history
      if (reason) {
        await storage.createJobStatusHistory({
          jobId: id,
          previousStatus: existingJob.status || undefined,
          newStatus: `Excluída - Motivo: ${reason}`,
          changedBy: userId,
        });
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

  // Blacklist Candidates routes
  app.get('/api/blacklist-candidates', isAuthenticated, async (req, res) => {
    try {
      const candidates = await storage.getBlacklistCandidates();
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching blacklist candidates:", error);
      res.status(500).json({ message: "Failed to fetch blacklist candidates" });
    }
  });

  app.get('/api/blacklist-candidates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const candidate = await storage.getBlacklistCandidate(id);
      if (!candidate) {
        return res.status(404).json({ message: "Blacklist candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      console.error("Error fetching blacklist candidate:", error);
      res.status(500).json({ message: "Failed to fetch blacklist candidate" });
    }
  });

  app.get('/api/blacklist-candidates/check/:cpf', isAuthenticated, async (req, res) => {
    try {
      const { cpf } = req.params;
      const candidate = await storage.getBlacklistCandidateByCPF(cpf);
      res.json({ isBlacklisted: !!candidate, candidate });
    } catch (error) {
      console.error("Error checking blacklist:", error);
      res.status(500).json({ message: "Failed to check blacklist" });
    }
  });

  app.post('/api/blacklist-candidates', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBlacklistCandidateSchema.parse(req.body);
      
      // Verificar se o CPF já está na blacklist
      const existing = await storage.getBlacklistCandidateByCPF(validatedData.cpf);
      if (existing) {
        return res.status(409).json({ 
          message: "Candidato já existe na blacklist",
          candidate: existing 
        });
      }
      
      const newCandidate = await storage.createBlacklistCandidate(validatedData);
      res.status(201).json(newCandidate);
    } catch (error) {
      console.error("Error creating blacklist candidate:", error);
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: (error as any).issues 
        });
      }
      res.status(400).json({ message: "Failed to create blacklist candidate", error });
    }
  });

  app.patch('/api/blacklist-candidates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedCandidate = await storage.updateBlacklistCandidate(id, updates);
      res.json(updatedCandidate);
    } catch (error) {
      console.error("Error updating blacklist candidate:", error);
      res.status(500).json({ message: "Failed to update blacklist candidate" });
    }
  });

  app.delete('/api/blacklist-candidates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBlacklistCandidate(id);
      res.json({ message: "Blacklist candidate deleted successfully" });
    } catch (error) {
      console.error("Error deleting blacklist candidate:", error);
      res.status(500).json({ message: "Failed to delete blacklist candidate" });
    }
  });

  app.post('/api/blacklist-candidates/batch', isAuthenticated, async (req, res) => {
    try {
      const { candidates } = req.body;
      
      if (!Array.isArray(candidates) || candidates.length === 0) {
        return res.status(400).json({ message: "Lista de candidatos inválida ou vazia" });
      }

      const results = {
        success: [] as any[],
        errors: [] as any[],
        duplicates: [] as any[],
      };

      for (const candidate of candidates) {
        try {
          // Validar dados
          const validatedData = insertBlacklistCandidateSchema.parse(candidate);
          
          // Verificar duplicata
          const existing = await storage.getBlacklistCandidateByCPF(validatedData.cpf);
          if (existing) {
            results.duplicates.push({
              cpf: validatedData.cpf,
              fullName: validatedData.fullName,
              message: "Já existe na blacklist"
            });
            continue;
          }
          
          // Criar candidato
          const newCandidate = await storage.createBlacklistCandidate(validatedData);
          results.success.push(newCandidate);
        } catch (error) {
          results.errors.push({
            candidate,
            error: error instanceof Error ? error.message : "Erro desconhecido"
          });
        }
      }

      res.json({
        message: `Importação concluída: ${results.success.length} adicionados, ${results.duplicates.length} duplicados, ${results.errors.length} erros`,
        results
      });
    } catch (error) {
      console.error("Error batch creating blacklist candidates:", error);
      res.status(500).json({ message: "Failed to batch create blacklist candidates" });
    }
  });

  // Divisions routes
  app.get('/api/divisions', isAuthenticated, async (req, res) => {
    try {
      const divisions = await storage.getDivisions();
      res.json(divisions);
    } catch (error) {
      console.error("Error fetching divisions:", error);
      res.status(500).json({ message: "Failed to fetch divisions" });
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

  // Alias endpoint for backwards compatibility
  app.get('/api/workflow-steps/:workflowId', isAuthenticated, async (req, res) => {
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

  // Workflow Job Status Rules routes
  app.get('/api/workflow-status-rules/:workflowId', isAuthenticated, async (req, res) => {
    try {
      const { workflowId } = req.params;
      const rules = await storage.getWorkflowJobStatusRules(workflowId);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching workflow status rules:", error);
      res.status(500).json({ message: "Failed to fetch workflow status rules" });
    }
  });

  app.post('/api/workflow-status-rules', isAuthenticated, async (req, res) => {
    try {
      const ruleData = req.body;
      const rule = await storage.createWorkflowJobStatusRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating workflow status rule:", error);
      res.status(400).json({ message: "Failed to create workflow status rule" });
    }
  });

  app.delete('/api/workflow-status-rules/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWorkflowJobStatusRule(id);
      res.json({ message: "Workflow status rule deleted successfully" });
    } catch (error) {
      console.error("Error deleting workflow status rule:", error);
      res.status(500).json({ message: "Failed to delete workflow status rule" });
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

  // Approvals routes - For the Approvals menu
  // Get pending approvals for the logged-in user
  app.get('/api/approvals/pending', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const pendingApprovals = await storage.getPendingApprovalsForUser(userId);
      res.json(pendingApprovals);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });

  // Approve a job
  app.post('/api/approvals/:jobId/approve', isAuthenticated, async (req, res) => {
    try {
      const { jobId } = req.params;
      const userId = (req.session as any)?.user?.id;
      const { comments } = req.body;

      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const result = await storage.approveJob(jobId, userId, comments);
      res.json(result);
    } catch (error) {
      console.error("Error approving job:", error);
      res.status(500).json({ message: "Failed to approve job", error });
    }
  });

  // Reject a job
  app.post('/api/approvals/:jobId/reject', isAuthenticated, async (req, res) => {
    try {
      const { jobId } = req.params;
      const userId = (req.session as any)?.user?.id;
      const { reason } = req.body;

      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      if (!reason || reason.trim() === '') {
        res.status(400).json({ message: "Rejection reason is required" });
        return;
      }

      const result = await storage.rejectJob(jobId, userId, reason);
      res.json(result);
    } catch (error) {
      console.error("Error rejecting job:", error);
      res.status(500).json({ message: "Failed to reject job", error });
    }
  });

  // Get approval history (all approvals)
  app.get('/api/approvals/history', isAuthenticated, async (req, res) => {
    try {
      const history = await storage.getAllApprovalHistory();
      res.json(history);
    } catch (error) {
      console.error("Error fetching approval history:", error);
      res.status(500).json({ message: "Failed to fetch approval history" });
    }
  });

  // Get job approval details (status history + approval history)
  app.get('/api/jobs/:jobId/approval-details', isAuthenticated, async (req, res) => {
    try {
      const { jobId } = req.params;
      
      // Get job status history
      const statusHistory = await storage.getJobStatusHistory(jobId);
      
      // Get job approval history
      const approvalHistory = await storage.getJobApprovalHistoryForJob(jobId);
      
      res.json({
        statusHistory,
        approvalHistory
      });
    } catch (error) {
      console.error("Error fetching job approval details:", error);
      res.status(500).json({ message: "Failed to fetch job approval details" });
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

  // Senior HCM Integration Routes
  // Get Senior integration settings for current organization
  app.get('/api/senior-integration/settings', isAuthenticated, async (req, res) => {
    try {
      const organizationId = (req.session as any)?.user?.organizationId;
      if (!organizationId) {
        res.status(400).json({ message: "Organization ID not found" });
        return;
      }

      const settings = await storage.getSeniorIntegrationSettings(organizationId);
      
      // Omitir API key na resposta por segurança
      if (settings) {
        const { apiKey, ...safeSettings } = settings;
        res.json({ ...safeSettings, apiKey: '***' });
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching Senior integration settings:", error);
      res.status(500).json({ message: "Failed to fetch Senior integration settings" });
    }
  });

  // Create or update Senior integration settings
  app.post('/api/senior-integration/settings', isAuthenticated, async (req, res) => {
    try {
      const organizationId = (req.session as any)?.user?.organizationId;
      const userId = (req.session as any)?.user?.id;
      
      if (!organizationId || !userId) {
        res.status(400).json({ message: "Organization ID or User ID not found" });
        return;
      }

      const settingsData = {
        ...req.body,
        organizationId,
        createdBy: userId,
      };

      const settings = await storage.createOrUpdateSeniorIntegrationSettings(organizationId, settingsData);
      
      // Omitir API key na resposta
      const { apiKey, ...safeSettings } = settings;
      res.json({ ...safeSettings, apiKey: '***' });
    } catch (error) {
      console.error("Error saving Senior integration settings:", error);
      res.status(500).json({ message: "Failed to save Senior integration settings" });
    }
  });

  // Test Senior integration connection
  app.post('/api/senior-integration/test-connection', isAuthenticated, async (req, res) => {
    try {
      const organizationId = (req.session as any)?.user?.organizationId;
      if (!organizationId) {
        res.status(400).json({ message: "Organization ID not found" });
        return;
      }

      const testResult = await storage.testSeniorConnection(organizationId);
      res.json(testResult);
    } catch (error) {
      console.error("Error testing Senior connection:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to test connection",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get active employees from Senior
  app.get('/api/senior-integration/employees', isAuthenticated, async (req, res) => {
    try {
      const organizationId = (req.session as any)?.user?.organizationId;
      if (!organizationId) {
        res.status(400).json({ message: "Organization ID not found" });
        return;
      }

      const employees = await storage.getSeniorEmployees(organizationId);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching Senior employees:", error);
      res.status(500).json({ message: "Failed to fetch employees from Senior" });
    }
  });

  // Get departments from Senior
  app.get('/api/senior-integration/departments', isAuthenticated, async (req, res) => {
    try {
      const organizationId = (req.session as any)?.user?.organizationId;
      if (!organizationId) {
        res.status(400).json({ message: "Organization ID not found" });
        return;
      }

      const departments = await storage.getSeniorDepartments(organizationId);
      res.json(departments);
    } catch (error) {
      console.error("Error fetching Senior departments:", error);
      res.status(500).json({ message: "Failed to fetch departments from Senior" });
    }
  });

  // Get positions from Senior
  app.get('/api/senior-integration/positions', isAuthenticated, async (req, res) => {
    try {
      const organizationId = (req.session as any)?.user?.organizationId;
      if (!organizationId) {
        res.status(400).json({ message: "Organization ID not found" });
        return;
      }

      const positions = await storage.getSeniorPositions(organizationId);
      res.json(positions);
    } catch (error) {
      console.error("Error fetching Senior positions:", error);
      res.status(500).json({ message: "Failed to fetch positions from Senior" });
    }
  });

  // Execute custom SQL query on Senior database
  app.post('/api/senior-integration/query', isAuthenticated, async (req, res) => {
    try {
      const organizationId = (req.session as any)?.user?.organizationId;
      const { sqlText } = req.body;
      
      if (!organizationId) {
        res.status(400).json({ message: "Organization ID not found" });
        return;
      }

      if (!sqlText || typeof sqlText !== 'string') {
        res.status(400).json({ message: "SQL query is required" });
        return;
      }

      // Validar que é apenas SELECT (segurança)
      const trimmedQuery = sqlText.trim().toUpperCase();
      if (!trimmedQuery.startsWith('SELECT')) {
        res.status(400).json({ message: "Only SELECT queries are allowed" });
        return;
      }

      const results = await storage.executeSeniorQuery(organizationId, sqlText);
      res.json(results);
    } catch (error) {
      console.error("Error executing Senior query:", error);
      res.status(500).json({ message: "Failed to execute query on Senior" });
    }
  });

  // Sync data from Senior
  app.post('/api/senior-integration/sync', isAuthenticated, async (req, res) => {
    try {
      const organizationId = (req.session as any)?.user?.organizationId;
      if (!organizationId) {
        res.status(400).json({ message: "Organization ID not found" });
        return;
      }

      const syncResult = await storage.syncSeniorData(organizationId);
      res.json(syncResult);
    } catch (error) {
      console.error("Error syncing Senior data:", error);
      res.status(500).json({ message: "Failed to sync data from Senior" });
    }
  });

  // Sync clients from Senior API
  app.post('/api/senior/sync-clients', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || (req.session as any).user?.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "Organization ID not found" });
      }

      // Buscar configurações da integração Senior
      const settings = await storage.getSeniorIntegrationSettings(user.organizationId);
      
      if (!settings || !settings.isActive) {
        return res.status(400).json({ 
          success: false,
          message: "Integração com Senior não está configurada ou ativa" 
        });
      }

      // Criar instância do serviço Senior
      const seniorService = createSeniorIntegrationService({
        apiUrl: settings.apiUrl,
        apiKey: settings.apiKey,
      });

      // Buscar clientes da API Senior
      const seniorClients = await seniorService.getClients();

      let importedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      // Processar cada cliente
      for (const seniorClient of seniorClients) {
        try {
          // Verificar se já existe um cliente com este seniorId
          const existingClients = await storage.getClients();
          const existingClient = existingClients.find(c => c.seniorId === seniorClient.seniorId);

          if (existingClient) {
            // Atualizar cliente existente
            await storage.updateClient(existingClient.id, {
              name: seniorClient.name,
              contactPerson: seniorClient.contactPerson,
              phone: seniorClient.phone,
              email: seniorClient.email,
              address: seniorClient.address,
              city: seniorClient.city,
              state: seniorClient.state,
              lastSyncedAt: new Date(),
            });
            updatedCount++;
          } else {
            // Criar novo cliente
            await storage.createClient({
              organizationId: user.organizationId,
              name: seniorClient.name,
              contactPerson: seniorClient.contactPerson,
              phone: seniorClient.phone,
              email: seniorClient.email,
              address: seniorClient.address,
              city: seniorClient.city,
              state: seniorClient.state,
              importedFromSenior: true,
              seniorId: seniorClient.seniorId,
              lastSyncedAt: new Date(),
            });
            importedCount++;
          }
        } catch (clientError) {
          console.error(`Error processing client ${seniorClient.name}:`, clientError);
          errors.push(`Erro ao processar ${seniorClient.name}: ${clientError instanceof Error ? clientError.message : 'Erro desconhecido'}`);
          skippedCount++;
        }
      }

      res.json({
        success: true,
        message: `Sincronização concluída: ${importedCount} importados, ${updatedCount} atualizados, ${skippedCount} com erro`,
        imported: importedCount,
        updated: updatedCount,
        skipped: skippedCount,
        errors: errors.length > 0 ? errors : undefined,
      });

    } catch (error) {
      console.error("Error syncing clients from Senior:", error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Erro ao sincronizar clientes da Senior" 
      });
    }
  });

  // Custom Roles endpoints
  app.get('/api/custom-roles', isAuthenticated, async (req: any, res) => {
    try {
      const user = (req.session as any).user;
      const organizationId = user.organizationId;
      const roles = await storage.getCustomRoles(organizationId);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching custom roles:", error);
      res.status(500).json({ message: "Failed to fetch custom roles" });
    }
  });

  app.get('/api/custom-roles/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const role = await storage.getCustomRole(id);
      if (!role) {
        return res.status(404).json({ message: "Custom role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Error fetching custom role:", error);
      res.status(500).json({ message: "Failed to fetch custom role" });
    }
  });

  app.post('/api/custom-roles', isAuthenticated, async (req: any, res) => {
    try {
      const user = (req.session as any).user;
      const roleData = {
        ...req.body,
        organizationId: user.organizationId,
      };
      const role = await storage.createCustomRole(roleData);
      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating custom role:", error);
      res.status(500).json({ message: "Failed to create custom role" });
    }
  });

  app.put('/api/custom-roles/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const role = await storage.updateCustomRole(id, req.body);
      res.json(role);
    } catch (error) {
      console.error("Error updating custom role:", error);
      res.status(500).json({ message: "Failed to update custom role" });
    }
  });

  app.delete('/api/custom-roles/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCustomRole(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting custom role:", error);
      res.status(500).json({ message: "Failed to delete custom role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
