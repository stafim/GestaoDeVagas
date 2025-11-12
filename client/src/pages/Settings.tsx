import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings2, Edit, Trash2, Clock, Tag, Bell, ChevronRight, LayoutGrid, Plug, Monitor, Ban, Database, CheckCircle2, XCircle, Loader2, Briefcase, RefreshCw, Download, Users } from "lucide-react";
import { z } from "zod";
import { ClientDashboardSettings } from "@/components/ClientDashboardSettings";
import { BlacklistManager } from "@/components/BlacklistManager";
import { SeniorIntegrationSettings } from "@/components/SeniorIntegrationSettings";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import type { Profession } from "@shared/schema";

const workScaleFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  breakIntervals: z.string().optional(),
});

const jobStatusFormSchema = z.object({
  key: z.string().min(2, "Chave deve ter pelo menos 2 caracteres").regex(/^[a-z_]+$/, "Use apenas letras minúsculas e underscores"),
  label: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  variant: z.enum(["default", "secondary", "destructive", "outline"]),
  color: z.string().optional(),
  description: z.string().optional(),
  displayOrder: z.number().min(0).optional(),
  isFinal: z.boolean().optional(),
});

const kanbanBoardFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
});

const kanbanStageFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  color: z.string().min(1, "Cor é obrigatória"),
  order: z.number().min(1),
});

const systemSettingFormSchema = z.object({
  value: z.string().min(1, "Valor é obrigatório"),
});

const seniorIntegrationFormSchema = z.object({
  apiUrl: z.string().url("URL da API deve ser válida"),
  apiKey: z.string().min(10, "API Key deve ter no mínimo 10 caracteres"),
  isActive: z.boolean().default(true),
  autoSync: z.boolean().default(false),
  syncInterval: z.number().min(5, "Intervalo mínimo é de 5 minutos").max(1440, "Intervalo máximo é de 24 horas").default(60),
});

const customRoleFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
});

type WorkScaleFormData = z.infer<typeof workScaleFormSchema>;
type JobStatusFormData = z.infer<typeof jobStatusFormSchema>;
type KanbanBoardFormData = z.infer<typeof kanbanBoardFormSchema>;
type KanbanStageFormData = z.infer<typeof kanbanStageFormSchema>;
type SystemSettingFormData = z.infer<typeof systemSettingFormSchema>;
type SeniorIntegrationFormData = z.infer<typeof seniorIntegrationFormSchema>;
type CustomRoleFormData = z.infer<typeof customRoleFormSchema>;

type CustomRole = {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

type SystemSetting = {
  id: string;
  key: string;
  value: string;
  label: string;
  description?: string;
  minValue?: number;
  maxValue?: number;
  updatedAt: string;
};

type WorkScale = {
  id: string;
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  breakIntervals?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type JobStatus = {
  id: string;
  key: string;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  color?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type KanbanBoard = {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type KanbanStage = {
  id: string;
  kanbanBoardId: string;
  name: string;
  order: number;
  color: string;
  createdAt: string;
};

type SeniorIntegrationSetting = {
  id: string;
  organizationId: string;
  apiUrl: string;
  apiKey: string;
  isActive: boolean;
  autoSync: boolean;
  syncInterval: number;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  lastSyncError?: string;
  createdAt: string;
  updatedAt: string;
};

export default function Settings() {
  // Work Scale state
  const [isWorkScaleModalOpen, setIsWorkScaleModalOpen] = useState(false);
  const [editingWorkScale, setEditingWorkScale] = useState<WorkScale | null>(null);
  const [deletingWorkScaleId, setDeletingWorkScaleId] = useState<string | undefined>();
  
  // Job Status state
  const [isJobStatusModalOpen, setIsJobStatusModalOpen] = useState(false);
  const [editingJobStatus, setEditingJobStatus] = useState<JobStatus | null>(null);
  const [deletingJobStatusId, setDeletingJobStatusId] = useState<string | undefined>();
  
  // Kanban Board state
  const [isKanbanBoardModalOpen, setIsKanbanBoardModalOpen] = useState(false);
  const [editingKanbanBoard, setEditingKanbanBoard] = useState<KanbanBoard | null>(null);
  const [deletingKanbanBoardId, setDeletingKanbanBoardId] = useState<string | undefined>();
  const [managingStagesKanbanId, setManagingStagesKanbanId] = useState<string | undefined>();
  
  // Senior Integration state
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<any>(null);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<KanbanStage | null>(null);
  
  // Temporary stages for new kanban creation
  const [tempStages, setTempStages] = useState<Array<{ name: string; color: string; order: number }>>([]);
  
  // Custom Roles state
  const [isCustomRoleModalOpen, setIsCustomRoleModalOpen] = useState(false);
  const [editingCustomRole, setEditingCustomRole] = useState<CustomRole | null>(null);
  const [deletingCustomRoleId, setDeletingCustomRoleId] = useState<string | undefined>();
  
  const { toast } = useToast();

  const systemSettingForm = useForm<SystemSettingFormData>({
    resolver: zodResolver(systemSettingFormSchema),
    defaultValues: {
      value: "",
    },
  });

  const workScaleForm = useForm<WorkScaleFormData>({
    resolver: zodResolver(workScaleFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  const customRoleForm = useForm<CustomRoleFormData>({
    resolver: zodResolver(customRoleFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const jobStatusForm = useForm<JobStatusFormData>({
    resolver: zodResolver(jobStatusFormSchema),
    defaultValues: {
      key: "",
      label: "",
      variant: "default",
      color: "",
      description: "",
      displayOrder: 0,
      isFinal: false,
    },
  });

  const kanbanBoardForm = useForm<KanbanBoardFormData>({
    resolver: zodResolver(kanbanBoardFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const kanbanStageForm = useForm<KanbanStageFormData>({
    resolver: zodResolver(kanbanStageFormSchema),
    defaultValues: {
      name: "",
      color: "bg-blue-500",
      order: 1,
    },
  });

  const seniorIntegrationForm = useForm<SeniorIntegrationFormData>({
    resolver: zodResolver(seniorIntegrationFormSchema),
    defaultValues: {
      apiUrl: "https://senior-sql.acelera-it.io",
      apiKey: "",
      isActive: true,
      autoSync: false,
      syncInterval: 60,
    },
  });

  // Work Scale queries
  const { data: workScales = [], isLoading: isLoadingWorkScales } = useQuery<WorkScale[]>({
    queryKey: ["/api/work-scales?includeInactive=true"],
  });

  // Job Status queries  
  const { data: jobStatuses = [], isLoading: isLoadingJobStatuses } = useQuery<JobStatus[]>({
    queryKey: ["/api/job-statuses", "includeInactive=true"],
    queryFn: async () => {
      const res = await fetch("/api/job-statuses?includeInactive=true", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch job statuses");
      }
      return res.json();
    },
  });

  // Kanban Board queries
  const { data: kanbanBoards = [], isLoading: isLoadingKanbanBoards } = useQuery<KanbanBoard[]>({
    queryKey: ["/api/kanban-boards"],
  });

  const { data: kanbanStages = [] } = useQuery<KanbanStage[]>({
    queryKey: ["/api/kanban-boards", managingStagesKanbanId, "stages"],
    enabled: !!managingStagesKanbanId,
  });

  // System Settings queries
  const { data: systemSettings = [], isLoading: isLoadingSettings } = useQuery<SystemSetting[]>({
    queryKey: ["/api/settings"],
  });

  // Professions queries - busca do cadastro local
  const { data: professions = [], isLoading: isLoadingProfessions } = useQuery<Profession[]>({
    queryKey: ["/api/professions"],
  });

  const [professionsSearch, setProfessionsSearch] = useState("");
  
  // Custom Roles queries
  const { data: customRoles = [], isLoading: isLoadingCustomRoles } = useQuery<CustomRole[]>({
    queryKey: ["/api/custom-roles"],
  });

  // System Settings mutations
  const updateSystemSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("PATCH", `/api/settings/${key}`, { value });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar configuração",
        variant: "destructive",
      });
    },
  });

  // Work Scale mutations
  const createWorkScaleMutation = useMutation({
    mutationFn: async (data: WorkScaleFormData) => {
      const response = await apiRequest("POST", "/api/work-scales", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-scales?includeInactive=true"] });
      toast({
        title: "Sucesso",
        description: "Escala de trabalho criada com sucesso!",
      });
      setIsWorkScaleModalOpen(false);
      workScaleForm.reset();
      setEditingWorkScale(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar escala de trabalho. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateWorkScaleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WorkScaleFormData }) => {
      const response = await apiRequest("PUT", `/api/work-scales/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-scales?includeInactive=true"] });
      toast({
        title: "Sucesso",
        description: "Escala de trabalho atualizada com sucesso!",
      });
      setIsWorkScaleModalOpen(false);
      workScaleForm.reset();
      setEditingWorkScale(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar escala de trabalho. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteWorkScaleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PUT", `/api/work-scales/${id}`, { isActive: false });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-scales?includeInactive=true"] });
      toast({
        title: "Sucesso",
        description: "Escala de trabalho desativada com sucesso!",
      });
      setDeletingWorkScaleId(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao desativar escala de trabalho. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Job Status mutations
  const createJobStatusMutation = useMutation({
    mutationFn: async (data: JobStatusFormData) => {
      const response = await apiRequest("POST", "/api/job-statuses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-statuses"] });
      toast({
        title: "Sucesso",
        description: "Status de vaga criado com sucesso!",
      });
      setIsJobStatusModalOpen(false);
      jobStatusForm.reset();
      setEditingJobStatus(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar status de vaga. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: JobStatusFormData }) => {
      const response = await apiRequest("PUT", `/api/job-statuses/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-statuses"] });
      toast({
        title: "Sucesso",
        description: "Status de vaga atualizado com sucesso!",
      });
      setIsJobStatusModalOpen(false);
      jobStatusForm.reset();
      setEditingJobStatus(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar status de vaga. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteJobStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PUT", `/api/job-statuses/${id}`, { isActive: false });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-statuses"] });
      toast({
        title: "Sucesso",
        description: "Status de vaga desativado com sucesso!",
      });
      setDeletingJobStatusId(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao desativar status de vaga. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Kanban Board mutations
  const createKanbanBoardMutation = useMutation({
    mutationFn: async (data: KanbanBoardFormData) => {
      const response = await apiRequest("POST", "/api/kanban-boards", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban-boards"] });
      toast({
        title: "Sucesso",
        description: "Kanban criado com sucesso!",
      });
      setIsKanbanBoardModalOpen(false);
      kanbanBoardForm.reset();
      setEditingKanbanBoard(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar Kanban. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateKanbanBoardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: KanbanBoardFormData }) => {
      const response = await apiRequest("PATCH", `/api/kanban-boards/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban-boards"] });
      toast({
        title: "Sucesso",
        description: "Kanban atualizado com sucesso!",
      });
      setIsKanbanBoardModalOpen(false);
      kanbanBoardForm.reset();
      setEditingKanbanBoard(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar Kanban. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteKanbanBoardMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/kanban-boards/${id}`, {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban-boards"] });
      toast({
        title: "Sucesso",
        description: "Kanban excluído com sucesso!",
      });
      setDeletingKanbanBoardId(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir Kanban. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const setDefaultKanbanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/kanban-boards/${id}/set-default`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban-boards"] });
      toast({
        title: "Sucesso",
        description: "Kanban definido como padrão!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao definir Kanban como padrão. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const createKanbanStageMutation = useMutation({
    mutationFn: async (data: KanbanStageFormData & { kanbanBoardId: string }) => {
      const response = await apiRequest("POST", "/api/kanban-stages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban-boards", managingStagesKanbanId, "stages"] });
      toast({
        title: "Sucesso",
        description: "Etapa criada com sucesso!",
      });
      setIsStageModalOpen(false);
      kanbanStageForm.reset();
      setEditingStage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar etapa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateKanbanStageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<KanbanStageFormData> }) => {
      const response = await apiRequest("PATCH", `/api/kanban-stages/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban-boards", managingStagesKanbanId, "stages"] });
      toast({
        title: "Sucesso",
        description: "Etapa atualizada com sucesso!",
      });
      setIsStageModalOpen(false);
      kanbanStageForm.reset();
      setEditingStage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar etapa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteKanbanStageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/kanban-stages/${id}`, {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban-boards", managingStagesKanbanId, "stages"] });
      toast({
        title: "Sucesso",
        description: "Etapa excluída com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir etapa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Professions mutations
  const importProfessionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/senior-integration/import-professions");
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/professions"] });
      toast({
        title: "Importação concluída",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na importação",
        description: error.message || "Erro ao importar profissões da Senior HCM",
        variant: "destructive",
      });
    },
  });

  // Custom Roles mutations
  const createCustomRoleMutation = useMutation({
    mutationFn: async (data: CustomRoleFormData) => {
      const response = await apiRequest("POST", "/api/custom-roles", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-roles"] });
      toast({
        title: "Sucesso",
        description: "Função customizada criada com sucesso!",
      });
      setIsCustomRoleModalOpen(false);
      customRoleForm.reset();
      setEditingCustomRole(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar função customizada. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateCustomRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomRoleFormData }) => {
      const response = await apiRequest("PUT", `/api/custom-roles/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-roles"] });
      toast({
        title: "Sucesso",
        description: "Função customizada atualizada com sucesso!",
      });
      setIsCustomRoleModalOpen(false);
      customRoleForm.reset();
      setEditingCustomRole(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar função customizada. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteCustomRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/custom-roles/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-roles"] });
      toast({
        title: "Sucesso",
        description: "Função customizada excluída com sucesso!",
      });
      setDeletingCustomRoleId(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir função customizada. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const toggleCustomRoleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/custom-roles/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-roles"] });
      toast({
        title: "Sucesso",
        description: "Status da função customizada atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar status da função customizada. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmitWorkScale = (data: WorkScaleFormData) => {
    if (editingWorkScale) {
      updateWorkScaleMutation.mutate({ id: editingWorkScale.id, data });
    } else {
      createWorkScaleMutation.mutate(data);
    }
  };

  const onSubmitJobStatus = (data: JobStatusFormData) => {
    if (editingJobStatus) {
      updateJobStatusMutation.mutate({ id: editingJobStatus.id, data });
    } else {
      createJobStatusMutation.mutate(data);
    }
  };

  const onSubmitCustomRole = (data: CustomRoleFormData) => {
    if (editingCustomRole) {
      updateCustomRoleMutation.mutate({ id: editingCustomRole.id, data });
    } else {
      createCustomRoleMutation.mutate(data);
    }
  };

  const handleEditWorkScale = (workScale: WorkScale) => {
    setEditingWorkScale(workScale);
    workScaleForm.reset({
      name: workScale.name,
      description: workScale.description || "",
      startTime: workScale.startTime || "",
      endTime: workScale.endTime || "",
      breakIntervals: workScale.breakIntervals || "",
    });
    setIsWorkScaleModalOpen(true);
  };

  const handleEditJobStatus = (jobStatus: JobStatus) => {
    setEditingJobStatus(jobStatus);
    jobStatusForm.reset({
      key: jobStatus.key,
      label: jobStatus.label,
      variant: jobStatus.variant,
      color: jobStatus.color || "",
      description: jobStatus.description || "",
      displayOrder: jobStatus.displayOrder || 0,
      isFinal: jobStatus.isFinal || false,
    });
    setIsJobStatusModalOpen(true);
  };

  const handleDeleteWorkScale = (id: string) => {
    deleteWorkScaleMutation.mutate(id);
  };

  const handleDeleteJobStatus = (id: string) => {
    deleteJobStatusMutation.mutate(id);
  };

  const handleCloseWorkScaleModal = () => {
    setIsWorkScaleModalOpen(false);
    setEditingWorkScale(null);
    workScaleForm.reset({
      name: "",
      description: "",
      startTime: "",
      endTime: "",
      breakIntervals: "",
    });
  };

  const handleCloseJobStatusModal = () => {
    setIsJobStatusModalOpen(false);
    setEditingJobStatus(null);
    jobStatusForm.reset({
      key: "",
      label: "",
      variant: "default",
      color: "",
      description: "",
      displayOrder: 0,
    });
  };

  const handleEditCustomRole = (customRole: CustomRole) => {
    setEditingCustomRole(customRole);
    customRoleForm.reset({
      name: customRole.name,
      description: customRole.description || "",
    });
    setIsCustomRoleModalOpen(true);
  };

  const handleDeleteCustomRole = (id: string) => {
    deleteCustomRoleMutation.mutate(id);
  };

  const handleCloseCustomRoleModal = () => {
    setIsCustomRoleModalOpen(false);
    setEditingCustomRole(null);
    customRoleForm.reset({
      name: "",
      description: "",
    });
  };

  // Reset form when editing work scale changes
  useEffect(() => {
    if (editingWorkScale) {
      workScaleForm.reset({
        name: editingWorkScale.name,
        description: editingWorkScale.description || "",
        startTime: editingWorkScale.startTime || "",
        endTime: editingWorkScale.endTime || "",
        breakIntervals: editingWorkScale.breakIntervals || "",
      });
    }
  }, [editingWorkScale]);

  // Reset form when editing custom role changes
  useEffect(() => {
    if (editingCustomRole) {
      customRoleForm.reset({
        name: editingCustomRole.name,
        description: editingCustomRole.description || "",
      });
    }
  }, [editingCustomRole]);

  // Kanban Board handlers
  const onSubmitKanbanBoard = async (data: KanbanBoardFormData) => {
    if (editingKanbanBoard) {
      // Update kanban - stages are managed separately via "Gerenciar Etapas"
      updateKanbanBoardMutation.mutate({ id: editingKanbanBoard.id, data });
      setTempStages([]);
    } else {
      // Create kanban with stages
      try {
        const boardResponse = await apiRequest("POST", "/api/kanban-boards", data);
        const newBoard = await boardResponse.json();
        
        // Create all temp stages for the new board
        if (tempStages.length > 0) {
          await Promise.all(
            tempStages.map((stage) =>
              apiRequest("POST", "/api/kanban-stages", {
                ...stage,
                kanbanBoardId: newBoard.id,
              })
            )
          );
        }
        
        queryClient.invalidateQueries({ queryKey: ["/api/kanban-boards"] });
        toast({
          title: "Sucesso",
          description: `Kanban criado com ${tempStages.length} etapa(s)!`,
        });
        setIsKanbanBoardModalOpen(false);
        kanbanBoardForm.reset();
        setTempStages([]);
        setEditingKanbanBoard(null);
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao criar Kanban. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  // Temp stage handlers
  const addTempStage = (name: string, color: string) => {
    const nextOrder = tempStages.length + 1;
    setTempStages([...tempStages, { name, color, order: nextOrder }]);
  };

  const removeTempStage = (index: number) => {
    setTempStages(tempStages.filter((_, i) => i !== index));
  };

  const onSubmitKanbanStage = (data: KanbanStageFormData) => {
    if (!managingStagesKanbanId) return;
    
    if (editingStage) {
      updateKanbanStageMutation.mutate({ id: editingStage.id, data });
    } else {
      const nextOrder = kanbanStages.length > 0 ? Math.max(...kanbanStages.map(s => s.order)) + 1 : 1;
      createKanbanStageMutation.mutate({ ...data, kanbanBoardId: managingStagesKanbanId, order: nextOrder });
    }
  };

  const handleEditKanbanBoard = async (board: KanbanBoard) => {
    setEditingKanbanBoard(board);
    kanbanBoardForm.reset({
      name: board.name,
      description: board.description || "",
    });
    
    // Load stages for this kanban when editing
    try {
      const response = await fetch(`/api/kanban-boards/${board.id}/stages`);
      if (response.ok) {
        const stages = await response.json();
        setTempStages(stages);
      }
    } catch (error) {
      console.error("Error loading kanban stages:", error);
    }
    
    setIsKanbanBoardModalOpen(true);
  };

  const handleManageStages = (kanbanId: string) => {
    setManagingStagesKanbanId(kanbanId);
  };

  const handleEditStage = (stage: KanbanStage) => {
    setEditingStage(stage);
    kanbanStageForm.reset({
      name: stage.name,
      color: stage.color,
      order: stage.order,
    });
    setIsStageModalOpen(true);
  };

  if (isLoadingWorkScales || isLoadingJobStatuses || isLoadingKanbanBoards) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Configurações
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Gerencie as configurações do sistema
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9 lg:w-auto">
          <TabsTrigger value="general" className="flex items-center gap-2" data-testid="tab-general">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2" data-testid="tab-status">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Status</span>
          </TabsTrigger>
          <TabsTrigger value="scales" className="flex items-center gap-2" data-testid="tab-scales">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Escalas</span>
          </TabsTrigger>
          <TabsTrigger value="professions" className="flex items-center gap-2" data-testid="tab-professions">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Profissões</span>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-2" data-testid="tab-kanban">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Kanban</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2" data-testid="tab-integrations">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="dashboards" className="flex items-center gap-2" data-testid="tab-dashboards">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboards</span>
          </TabsTrigger>
          <TabsTrigger value="blacklist" className="flex items-center gap-2" data-testid="tab-blacklist">
            <Ban className="h-4 w-4" />
            <span className="hidden sm:inline">Lista de banimento</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2" data-testid="tab-roles">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Funções</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba Geral */}
        <TabsContent value="general" className="space-y-6">
          {/* Configurações Avançadas */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>Acesse configurações específicas do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/settings/notifications">
                  <div 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors group"
                    data-testid="link-notifications-settings"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Notificações</h3>
                        <p className="text-sm text-muted-foreground">
                          Configurar alertas de email
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>

                <Link href="/settings/integrations">
                  <div 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors group"
                    data-testid="link-integrations-settings"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        <Plug className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Integrações</h3>
                        <p className="text-sm text-muted-foreground">
                          Configurar APIs externas
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Job Creation Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Política de Criação de Vagas
              </CardTitle>
              <CardDescription>
                Defina o comportamento quando um cliente atingir o limite de vagas contratadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSettings ? (
                <p className="text-gray-500 text-center py-8">Carregando...</p>
              ) : (() => {
                const quotaPolicySetting = systemSettings.find(s => s.key === 'job_creation_quota_policy');
                if (!quotaPolicySetting) return null;
                
                return (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="grid gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {quotaPolicySetting.label}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {quotaPolicySetting.description}
                          </p>
                        </div>
                        
                        <div>
                          <Select 
                            value={quotaPolicySetting.value}
                            onValueChange={(value) => {
                              updateSystemSettingMutation.mutate({
                                key: 'job_creation_quota_policy',
                                value: value,
                              });
                            }}
                          >
                            <SelectTrigger className="w-full" data-testid="select-quota-policy">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="allow">
                                <div className="flex items-start gap-2 py-1">
                                  <div className="flex-1">
                                    <div className="font-semibold">Permitir Sempre</div>
                                    <div className="text-xs text-muted-foreground">
                                      Vagas podem ser criadas livremente, mesmo quando o cliente atingir o limite
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="block">
                                <div className="flex items-start gap-2 py-1">
                                  <div className="flex-1">
                                    <div className="font-semibold">Barrar Criação</div>
                                    <div className="text-xs text-muted-foreground">
                                      Impede completamente a criação de vagas quando o limite for atingido
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="require_approval">
                                <div className="flex items-start gap-2 py-1">
                                  <div className="flex-1">
                                    <div className="font-semibold">Exigir Aprovação do Gestor</div>
                                    <div className="text-xs text-muted-foreground">
                                      Permite criação, mas marca a vaga como pré-reprovada para aprovação do gestor
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
                          <div className="flex items-start gap-2">
                            <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 mt-0.5"></i>
                            <div className="text-sm text-blue-800 dark:text-blue-300">
                              {quotaPolicySetting.value === 'allow' && (
                                <p><strong>Modo Atual:</strong> Vagas serão criadas sem restrições, mesmo quando o cliente exceder o limite contratual.</p>
                              )}
                              {quotaPolicySetting.value === 'block' && (
                                <p><strong>Modo Atual:</strong> O sistema bloqueará a criação de novas vagas quando o cliente atingir seu limite contratual.</p>
                              )}
                              {quotaPolicySetting.value === 'require_approval' && (
                                <p><strong>Modo Atual:</strong> Vagas podem ser criadas, mas serão marcadas como pré-reprovadas e exigirão aprovação do gestor quando excederem o limite.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* System Settings Section */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Outras Configurações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSettings ? (
            <p className="text-gray-500 text-center py-8">Carregando...</p>
          ) : (() => {
            const otherSettings = systemSettings.filter(s => s.key !== 'job_creation_quota_policy');
            return otherSettings.length === 0 ? (
              <p className="text-gray-500 text-center py-8" data-testid="text-no-settings">
                Nenhuma configuração disponível
              </p>
            ) : (
              <div className="space-y-4">
                {otherSettings.map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`setting-row-${setting.key}`}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white" data-testid={`text-setting-label-${setting.key}`}>
                        {setting.label}
                      </h3>
                      {setting.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300" data-testid={`text-setting-description-${setting.key}`}>
                          {setting.description}
                        </p>
                      )}
                      {(setting.minValue !== null || setting.maxValue !== null) && (
                        <p className="text-xs text-gray-500 mt-1">
                          Valor permitido: {setting.minValue} - {setting.maxValue}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={setting.minValue || undefined}
                        max={setting.maxValue || undefined}
                        defaultValue={setting.value}
                        className="w-24"
                        data-testid={`input-setting-value-${setting.key}`}
                        onBlur={(e) => {
                          const newValue = e.target.value;
                          if (newValue !== setting.value) {
                            const numValue = parseInt(newValue);
                            if (
                              !isNaN(numValue) &&
                              (setting.minValue === null || setting.minValue === undefined || numValue >= setting.minValue) &&
                              (setting.maxValue === null || setting.maxValue === undefined || numValue <= setting.maxValue)
                            ) {
                              updateSystemSettingMutation.mutate({
                                key: setting.key,
                                value: newValue,
                              });
                            } else {
                              toast({
                                title: "Erro",
                                description: `Valor deve estar entre ${setting.minValue} e ${setting.maxValue}`,
                                variant: "destructive",
                              });
                              e.target.value = setting.value;
                            }
                          }
                        }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">dias</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>
        </TabsContent>

        {/* Aba Status */}
        <TabsContent value="status">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Status de Vagas
          </CardTitle>
          <Dialog open={isJobStatusModalOpen} onOpenChange={setIsJobStatusModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-job-status" onClick={() => setEditingJobStatus(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingJobStatus ? "Editar Status de Vaga" : "Novo Status de Vaga"}
                </DialogTitle>
              </DialogHeader>
              <Form {...jobStatusForm}>
                <form onSubmit={jobStatusForm.handleSubmit(onSubmitJobStatus)} className="space-y-4">
                  <FormField
                    control={jobStatusForm.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chave (ID único)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: aberto, em_recrutamento, fechada"
                            disabled={!!editingJobStatus}
                            data-testid="input-job-status-key"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={jobStatusForm.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de Exibição</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: Aberto, Em Recrutamento, Fechada"
                            data-testid="input-job-status-label"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={jobStatusForm.control}
                    name="variant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variante Visual</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-job-status-variant">
                              <SelectValue placeholder="Selecione a variante" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="default">Padrão (azul)</SelectItem>
                            <SelectItem value="secondary">Secundário (cinza)</SelectItem>
                            <SelectItem value="destructive">Destrutivo (vermelho)</SelectItem>
                            <SelectItem value="outline">Contorno</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={jobStatusForm.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor do Status</FormLabel>
                        <div className="flex gap-2 items-center">
                          <div className="relative">
                            <input
                              type="color"
                              value={field.value || "#3B82F6"}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="h-10 w-20 rounded border border-input cursor-pointer"
                              data-testid="color-picker-job-status"
                            />
                          </div>
                          <FormControl className="flex-1">
                            <Input
                              {...field}
                              placeholder="Ex: #3B82F6"
                              data-testid="input-job-status-color"
                              className="font-mono"
                            />
                          </FormControl>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Escolha uma cor usando o seletor ou digite o código hexadecimal
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={jobStatusForm.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordem de Exibição</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            placeholder="Ex: 0, 1, 2..."
                            data-testid="input-job-status-order"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={jobStatusForm.control}
                    name="isFinal"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-job-status-is-final"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Etapa de Conclusão
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Vagas com este status não aparecerão no grid principal de vagas
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={jobStatusForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Descreva o significado deste status..."
                            rows={3}
                            data-testid="input-job-status-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseJobStatusModal}
                      data-testid="button-cancel-job-status"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createJobStatusMutation.isPending || updateJobStatusMutation.isPending}
                      data-testid="button-save-job-status"
                    >
                      {createJobStatusMutation.isPending || updateJobStatusMutation.isPending
                        ? "Salvando..."
                        : editingJobStatus
                        ? "Atualizar"
                        : "Criar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {jobStatuses.length === 0 ? (
            <p className="text-gray-500 text-center py-8" data-testid="text-no-job-statuses">
              Nenhum status de vaga cadastrado
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chave</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Variante</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Etapa Final</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobStatuses.map((jobStatus) => (
                  <TableRow key={jobStatus.id} data-testid={`job-status-row-${jobStatus.id}`}>
                    <TableCell className="font-mono text-sm" data-testid={`text-job-status-key-${jobStatus.id}`}>
                      {jobStatus.key}
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`text-job-status-label-${jobStatus.id}`}>
                      <Badge 
                        variant={jobStatus.variant}
                        style={jobStatus.color ? {
                          backgroundColor: jobStatus.color,
                          color: '#ffffff',
                          borderColor: jobStatus.color
                        } : undefined}
                      >
                        {jobStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-job-status-variant-${jobStatus.id}`}>
                      {jobStatus.variant}
                    </TableCell>
                    <TableCell data-testid={`text-job-status-order-${jobStatus.id}`}>
                      {jobStatus.displayOrder}
                    </TableCell>
                    <TableCell data-testid={`text-job-status-description-${jobStatus.id}`}>
                      {jobStatus.description || "-"}
                    </TableCell>
                    <TableCell>
                      {jobStatus.isFinal ? (
                        <Badge variant="destructive" data-testid={`badge-job-status-is-final-${jobStatus.id}`}>
                          Sim
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Não</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={jobStatus.isActive ? "default" : "secondary"}
                        data-testid={`badge-job-status-status-${jobStatus.id}`}
                      >
                        {jobStatus.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditJobStatus(jobStatus)}
                          data-testid={`button-edit-job-status-${jobStatus.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {jobStatus.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingJobStatusId(jobStatus.id)}
                            data-testid={`button-delete-job-status-${jobStatus.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* Aba Escalas */}
        <TabsContent value="scales">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Escalas de Trabalho
          </CardTitle>
          <Dialog open={isWorkScaleModalOpen} onOpenChange={setIsWorkScaleModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-work-scale" onClick={() => setEditingWorkScale(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Escala
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingWorkScale ? "Editar Escala de Trabalho" : "Nova Escala de Trabalho"}
                </DialogTitle>
              </DialogHeader>
              <Form {...workScaleForm}>
                <form onSubmit={workScaleForm.handleSubmit(onSubmitWorkScale)} className="space-y-4">
                  <FormField
                    control={workScaleForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Escala</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: 5x1, 5x2, 6x1, 12x36"
                            data-testid="input-work-scale-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={workScaleForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Descreva os detalhes da escala de trabalho..."
                            rows={3}
                            data-testid="input-work-scale-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={workScaleForm.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário de Entrada</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                              placeholder="08:00"
                              data-testid="input-work-scale-start-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={workScaleForm.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário de Saída</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                              placeholder="17:00"
                              data-testid="input-work-scale-end-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={workScaleForm.control}
                    name="breakIntervals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervalos (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Ex: 12:00-13:00, 15:00-15:15"
                            rows={2}
                            data-testid="input-work-scale-break-intervals"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Digite os intervalos no formato HH:MM-HH:MM, separados por vírgula
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseWorkScaleModal}
                      data-testid="button-cancel"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createWorkScaleMutation.isPending || updateWorkScaleMutation.isPending}
                      data-testid="button-save-work-scale"
                    >
                      {createWorkScaleMutation.isPending || updateWorkScaleMutation.isPending
                        ? "Salvando..."
                        : editingWorkScale
                        ? "Atualizar"
                        : "Criar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {workScales.length === 0 ? (
            <p className="text-gray-500 text-center py-8" data-testid="text-no-work-scales">
              Nenhuma escala de trabalho cadastrada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Horários</TableHead>
                  <TableHead>Intervalos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workScales.map((workScale) => (
                  <TableRow key={workScale.id} data-testid={`work-scale-row-${workScale.id}`}>
                    <TableCell className="font-medium" data-testid={`text-work-scale-name-${workScale.id}`}>
                      <div>
                        <div className="font-semibold">{workScale.name}</div>
                        {workScale.description && (
                          <div className="text-sm text-muted-foreground">{workScale.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-work-scale-hours-${workScale.id}`}>
                      {workScale.startTime && workScale.endTime ? (
                        <div className="text-sm">
                          {workScale.startTime} - {workScale.endTime}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell data-testid={`text-work-scale-breaks-${workScale.id}`}>
                      {workScale.breakIntervals ? (
                        <div className="text-sm">{workScale.breakIntervals}</div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={workScale.isActive ? "default" : "secondary"}
                        data-testid={`badge-work-scale-status-${workScale.id}`}
                      >
                        {workScale.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditWorkScale(workScale)}
                          data-testid={`button-edit-work-scale-${workScale.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {workScale.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingWorkScaleId(workScale.id)}
                            data-testid={`button-delete-work-scale-${workScale.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* Aba Kanban */}
        <TabsContent value="kanban">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Quadros Kanban
          </CardTitle>
          <Dialog open={isKanbanBoardModalOpen} onOpenChange={setIsKanbanBoardModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-kanban" onClick={() => setEditingKanbanBoard(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Kanban
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingKanbanBoard ? "Editar Kanban" : "Novo Processo Kanban"}
                </DialogTitle>
              </DialogHeader>
              <Form {...kanbanBoardForm}>
                <form onSubmit={kanbanBoardForm.handleSubmit(onSubmitKanbanBoard)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={kanbanBoardForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Kanban</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Processo Seletivo Padrão" data-testid="input-kanban-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={kanbanBoardForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição (opcional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Descreva o propósito deste Kanban..." rows={3} data-testid="input-kanban-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Stages Section */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Etapas do Kanban</h3>
                      <p className="text-sm text-muted-foreground">
                        {tempStages.length} etapa(s) {editingKanbanBoard ? '' : 'adicionada(s)'}
                      </p>
                    </div>

                    {editingKanbanBoard ? (
                      /* Show stages in read-only mode when editing */
                      <div className="space-y-2">
                        {tempStages.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhuma etapa cadastrada. Use "Gerenciar Etapas" para adicionar.
                          </p>
                        ) : (
                          tempStages.map((stage, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-card border rounded-lg"
                              data-testid={`existing-stage-${index}`}
                            >
                              <Badge variant="outline">{stage.order || index + 1}</Badge>
                              <div className={`w-4 h-4 rounded ${stage.color}`}></div>
                              <span className="font-medium">{stage.name}</span>
                            </div>
                          ))
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          💡 Para editar as etapas, use o botão "Gerenciar Etapas" na tabela.
                        </p>
                      </div>
                    ) : (
                      /* Add Stage Form - Only for new kanban */
                      <>
                        <div className="bg-muted/30 p-4 rounded-lg mb-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Nome da Etapa</label>
                            <Input
                              id="temp-stage-name"
                              placeholder="Ex: Triagem"
                              data-testid="input-temp-stage-name"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Cor</label>
                            <Select
                              onValueChange={(value) => {
                                const colorSelect = document.getElementById('temp-stage-color') as HTMLSelectElement;
                                if (colorSelect) colorSelect.setAttribute('data-value', value);
                              }}
                            >
                              <SelectTrigger id="temp-stage-color" data-testid="select-temp-stage-color">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bg-blue-500">Azul</SelectItem>
                                <SelectItem value="bg-purple-500">Roxo</SelectItem>
                                <SelectItem value="bg-orange-500">Laranja</SelectItem>
                                <SelectItem value="bg-green-500">Verde</SelectItem>
                                <SelectItem value="bg-red-500">Vermelho</SelectItem>
                                <SelectItem value="bg-yellow-500">Amarelo</SelectItem>
                                <SelectItem value="bg-pink-500">Rosa</SelectItem>
                                <SelectItem value="bg-emerald-600">Esmeralda</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            const nameInput = document.getElementById('temp-stage-name') as HTMLInputElement;
                            const colorSelect = document.getElementById('temp-stage-color') as HTMLElement;
                            const color = colorSelect?.getAttribute('data-value') || '';
                            
                            if (nameInput?.value && color) {
                              addTempStage(nameInput.value, color);
                              nameInput.value = '';
                              colorSelect.setAttribute('data-value', '');
                            } else {
                              toast({
                                title: "Campos obrigatórios",
                                description: "Preencha nome e cor da etapa",
                                variant: "destructive",
                              });
                            }
                          }}
                          data-testid="button-add-temp-stage"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Etapa
                        </Button>
                      </div>

                      {/* Temp Stages List */}
                      {tempStages.length > 0 && (
                        <div className="space-y-2">
                          {tempStages.map((stage, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-card border rounded-lg"
                              data-testid={`temp-stage-${index}`}
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">{index + 1}</Badge>
                                <div className={`w-4 h-4 rounded ${stage.color}`}></div>
                                <span className="font-medium">{stage.name}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTempStage(index)}
                                data-testid={`button-remove-temp-stage-${index}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      </>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end border-t pt-4">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsKanbanBoardModalOpen(false);
                      setTempStages([]);
                    }}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createKanbanBoardMutation.isPending || updateKanbanBoardMutation.isPending} data-testid="button-save-kanban">
                      {createKanbanBoardMutation.isPending || updateKanbanBoardMutation.isPending ? "Salvando..." : editingKanbanBoard ? "Atualizar" : "Criar Kanban"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {kanbanBoards.length === 0 ? (
            <p className="text-gray-500 text-center py-8" data-testid="text-no-kanbans">Nenhum Kanban cadastrado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kanbanBoards.map((board) => (
                  <TableRow key={board.id} data-testid={`kanban-row-${board.id}`}>
                    <TableCell className="font-medium">{board.name}</TableCell>
                    <TableCell>{board.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={board.isDefault ? "default" : "secondary"}>
                        {board.isDefault ? "Padrão" : "Personalizado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {!board.isDefault && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setDefaultKanbanMutation.mutate(board.id)} 
                            data-testid={`button-set-default-${board.id}`}
                          >
                            Definir como Padrão
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleManageStages(board.id)} data-testid={`button-manage-stages-${board.id}`}>
                          <Edit className="h-4 w-4" />
                          Gerenciar Etapas
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditKanbanBoard(board)} data-testid={`button-edit-kanban-${board.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!board.isDefault && (
                          <Button variant="ghost" size="sm" onClick={() => setDeletingKanbanBoardId(board.id)} data-testid={`button-delete-kanban-${board.id}`}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Manage Stages Dialog */}
      <Dialog open={!!managingStagesKanbanId} onOpenChange={() => setManagingStagesKanbanId(undefined)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Etapas do Kanban</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Etapas</h3>
              <Button size="sm" onClick={() => setIsStageModalOpen(true)} data-testid="button-add-stage">
                <Plus className="h-4 w-4 mr-2" />
                Nova Etapa
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kanbanStages.map((stage) => (
                  <TableRow key={stage.id}>
                    <TableCell>{stage.order}</TableCell>
                    <TableCell>{stage.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${stage.color}`}></div>
                        <span className="text-sm text-gray-500">{stage.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleEditStage(stage)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteKanbanStageMutation.mutate(stage.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stage Modal */}
      <Dialog open={isStageModalOpen} onOpenChange={setIsStageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStage ? "Editar Etapa" : "Nova Etapa"}</DialogTitle>
          </DialogHeader>
          <Form {...kanbanStageForm}>
            <form onSubmit={kanbanStageForm.handleSubmit(onSubmitKanbanStage)} className="space-y-4">
              <FormField
                control={kanbanStageForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Etapa</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Entrevista Inicial" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={kanbanStageForm.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a cor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bg-blue-500">Azul</SelectItem>
                        <SelectItem value="bg-purple-500">Roxo</SelectItem>
                        <SelectItem value="bg-orange-500">Laranja</SelectItem>
                        <SelectItem value="bg-green-500">Verde</SelectItem>
                        <SelectItem value="bg-red-500">Vermelho</SelectItem>
                        <SelectItem value="bg-yellow-500">Amarelo</SelectItem>
                        <SelectItem value="bg-pink-500">Rosa</SelectItem>
                        <SelectItem value="bg-emerald-600">Esmeralda</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setIsStageModalOpen(false); setEditingStage(null); }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createKanbanStageMutation.isPending || updateKanbanStageMutation.isPending}>
                  {createKanbanStageMutation.isPending || updateKanbanStageMutation.isPending ? "Salvando..." : editingStage ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Kanban Dialog */}
      <AlertDialog open={!!deletingKanbanBoardId} onOpenChange={() => setDeletingKanbanBoardId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Kanban</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este Kanban? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingKanbanBoardId && deleteKanbanBoardMutation.mutate(deletingKanbanBoardId)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Job Status Dialog */}
      <AlertDialog open={!!deletingJobStatusId} onOpenChange={() => setDeletingJobStatusId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar Status de Vaga</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar este status de vaga? Ele será marcado como inativo
              e não aparecerá mais nas opções de seleção.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-job-status">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingJobStatusId && handleDeleteJobStatus(deletingJobStatusId)}
              data-testid="button-confirm-delete-job-status"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Work Scale Dialog */}
      <AlertDialog open={!!deletingWorkScaleId} onOpenChange={() => setDeletingWorkScaleId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar Escala de Trabalho</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar esta escala de trabalho? Ela será marcada como inativa
              e não aparecerá mais nas opções de seleção.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingWorkScaleId && handleDeleteWorkScale(deletingWorkScaleId)}
              data-testid="button-confirm-delete"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </TabsContent>

        {/* Aba Profissões */}
        <TabsContent value="professions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Cadastro de Profissões
                </CardTitle>
                <CardDescription>
                  {professions.length} profissões cadastradas ({professions.filter(p => p.importedFromSenior).length} importadas da Senior HCM)
                </CardDescription>
              </div>
              <Button
                onClick={() => importProfessionsMutation.mutate()}
                disabled={importProfessionsMutation.isPending}
                data-testid="button-import-professions"
              >
                {importProfessionsMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Sincronizar com Senior HCM
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Buscar profissões ou código CBO..."
                  value={professionsSearch}
                  onChange={(e) => setProfessionsSearch(e.target.value)}
                  data-testid="input-search-professions"
                />
              </div>

              {isLoadingProfessions ? (
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (() => {
                const filteredProfessions = professions.filter((profession) =>
                  profession.name.toLowerCase().includes(professionsSearch.toLowerCase()) ||
                  profession.cboCode?.toLowerCase().includes(professionsSearch.toLowerCase())
                );

                return filteredProfessions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[400px]">Profissão</TableHead>
                        <TableHead className="w-[150px]">Código CBO</TableHead>
                        <TableHead className="w-[150px]">Categoria</TableHead>
                        <TableHead className="w-[120px]">Origem</TableHead>
                        <TableHead className="text-center w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfessions.map((profession) => (
                        <TableRow key={profession.id} data-testid={`row-profession-${profession.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium" data-testid={`text-profession-name-${profession.id}`}>
                                  {profession.name}
                                </div>
                                {profession.description && (
                                  <div className="text-xs text-muted-foreground line-clamp-1">
                                    {profession.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {profession.cboCode ? (
                              <Badge variant="outline" className="font-mono">
                                {profession.cboCode}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground italic">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {profession.category ? (
                              <Badge variant="secondary">
                                {profession.category}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground italic">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {profession.importedFromSenior ? (
                              <Badge variant="default" className="bg-purple-600">
                                Senior HCM
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                Manual
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {profession.isActive ? (
                              <Badge variant="default" className="bg-green-600">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                Inativo
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <Briefcase className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Nenhuma profissão encontrada</h3>
                    <p className="text-muted-foreground mb-4">
                      {professionsSearch
                        ? "Nenhuma profissão corresponde à sua busca"
                        : "Comece sincronizando profissões da Senior HCM"}
                    </p>
                    {!professionsSearch && (
                      <Button
                        variant="default"
                        onClick={() => importProfessionsMutation.mutate()}
                        disabled={importProfessionsMutation.isPending}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Sincronizar com Senior HCM
                      </Button>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Dashboards */}
        <TabsContent value="dashboards">
          <ClientDashboardSettings />
        </TabsContent>

        {/* Aba Integrações */}
        <TabsContent value="integrations">
          <SeniorIntegrationSettings />
        </TabsContent>

        {/* Aba Lista de banimento */}
        <TabsContent value="blacklist">
          <BlacklistManager />
        </TabsContent>

        {/* Aba Funções Customizadas */}
        <TabsContent value="roles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Funções Customizadas
                </CardTitle>
                <CardDescription>
                  Gerencie as funções personalizadas para organizar seus colaboradores
                </CardDescription>
              </div>
              <Dialog open={isCustomRoleModalOpen} onOpenChange={setIsCustomRoleModalOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-custom-role" onClick={() => setEditingCustomRole(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Função
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCustomRole ? "Editar Função Customizada" : "Nova Função Customizada"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...customRoleForm}>
                    <form onSubmit={customRoleForm.handleSubmit(onSubmitCustomRole)} className="space-y-4">
                      <FormField
                        control={customRoleForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Função</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ex: Gerente de Vendas, Coordenador de TI"
                                data-testid="input-custom-role-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={customRoleForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição (opcional)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Descreva as responsabilidades desta função..."
                                rows={3}
                                data-testid="input-custom-role-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseCustomRoleModal}
                          data-testid="button-cancel-custom-role"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={createCustomRoleMutation.isPending || updateCustomRoleMutation.isPending}
                          data-testid="button-save-custom-role"
                        >
                          {createCustomRoleMutation.isPending || updateCustomRoleMutation.isPending
                            ? "Salvando..."
                            : editingCustomRole
                            ? "Atualizar"
                            : "Criar"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingCustomRoles ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : customRoles.length === 0 ? (
                <p className="text-gray-500 text-center py-8" data-testid="text-no-custom-roles">
                  Nenhuma função customizada cadastrada
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customRoles.map((customRole) => (
                      <TableRow key={customRole.id} data-testid={`custom-role-row-${customRole.id}`}>
                        <TableCell className="font-medium" data-testid={`text-custom-role-name-${customRole.id}`}>
                          {customRole.name}
                        </TableCell>
                        <TableCell data-testid={`text-custom-role-description-${customRole.id}`}>
                          {customRole.description || "-"}
                        </TableCell>
                        <TableCell data-testid={`text-custom-role-created-${customRole.id}`}>
                          {new Date(customRole.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCustomRole(customRole)}
                              data-testid={`button-edit-custom-role-${customRole.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingCustomRoleId(customRole.id)}
                              data-testid={`button-delete-custom-role-${customRole.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!deletingCustomRoleId} onOpenChange={(open) => !open && setDeletingCustomRoleId(undefined)}>
            <AlertDialogContent data-testid="dialog-delete-custom-role-confirmation">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta função customizada? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete-custom-role">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (deletingCustomRoleId) {
                      handleDeleteCustomRole(deletingCustomRoleId);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
                  data-testid="button-confirm-delete-custom-role"
                >
                  {deleteCustomRoleMutation.isPending ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
