import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, GitBranch, Edit, Trash2, Check, X, UserCheck, Users, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { ApprovalWorkflow, ApprovalWorkflowStep, User, Division } from "@shared/schema";

const workflowStepSchema = z.object({
  stepOrder: z.number().min(1),
  approvalType: z.enum(["dual", "user", "role"]),
  dualApprovalSubtype: z.enum(["user", "role"]).optional(),
  approverId: z.string().optional(),
  approverId2: z.string().optional(), // Segundo aprovador para dupla alçada
  requiredRole: z.string().optional(),
  requiredRole2: z.string().optional(), // Segundo cargo para dupla alçada
});

const createWorkflowSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  divisionId: z.string().min(1, "Divisão é obrigatória"), // Divisão obrigatória
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  steps: z.array(workflowStepSchema).min(1, "Adicione pelo menos uma etapa de aprovação"),
});

type CreateWorkflowForm = z.infer<typeof createWorkflowSchema>;

interface WorkflowStep {
  stepOrder: number;
  approvalType: "dual" | "user" | "role";
  dualApprovalSubtype?: "user" | "role";
  approverId?: string;
  approverId2?: string; // Segundo aprovador para dupla alçada
  requiredRole?: string;
  requiredRole2?: string; // Segundo cargo para dupla alçada
}

export default function Workflow() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(new Set());

  const { data: workflows, isLoading } = useQuery<ApprovalWorkflow[]>({
    queryKey: ["/api/workflows"],
  });

  const workflowIds = workflows?.map(w => w.id).sort().join(',') || '';
  
  const { data: workflowStepsData } = useQuery<Record<string, ApprovalWorkflowStep[]>>({
    queryKey: ["/api/workflow-steps/all", workflowIds],
    queryFn: async () => {
      if (!workflows || workflows.length === 0) {
        console.log("No workflows found for loading steps");
        return {};
      }
      
      console.log(`Loading steps for ${workflows.length} workflows:`, workflows.map(w => w.id));
      
      const stepsMap: Record<string, ApprovalWorkflowStep[]> = {};
      for (const workflow of workflows) {
        try {
          const response = await fetch(`/api/workflow-steps/${workflow.id}`, { credentials: "include" });
          if (response.ok) {
            const steps = await response.json();
            stepsMap[workflow.id] = steps;
            console.log(`Loaded ${steps.length} steps for workflow ${workflow.id}:`, steps);
          } else {
            console.error(`Failed to load steps for workflow ${workflow.id}:`, response.status);
          }
        } catch (error) {
          console.error(`Error loading steps for workflow ${workflow.id}:`, error);
        }
      }
      console.log("Final stepsMap:", stepsMap);
      return stepsMap;
    },
    enabled: !!workflows && workflows.length > 0,
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: divisions } = useQuery<Division[]>({
    queryKey: ["/api/divisions"],
  });

  const form = useForm<CreateWorkflowForm>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: {
      name: "",
      description: "",
      divisionId: undefined,
      isActive: true,
      isDefault: false,
      steps: [],
    },
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (data: CreateWorkflowForm) => {
      console.log("Creating workflow with data:", data);
      
      const workflowRes = await apiRequest("POST", "/api/workflows", {
        name: data.name,
        description: data.description,
        divisionId: data.divisionId,
        isActive: data.isActive,
        isDefault: data.isDefault,
      });
      
      if (!workflowRes.ok) {
        const errorData = await workflowRes.json();
        throw new Error(errorData.message || "Falha ao criar workflow");
      }
      
      const workflow = await workflowRes.json();
      console.log("Workflow created:", workflow);

      for (const step of data.steps) {
        const stepName = step.approvalType === "dual" 
          ? `Dupla Alçada - Etapa ${step.stepOrder}`
          : step.approvalType === "user"
          ? `Aprovação por Usuário - Etapa ${step.stepOrder}`
          : `Aprovação por Cargo - Etapa ${step.stepOrder}`;

        const stepData = {
          workflowId: workflow.id,
          stepOrder: step.stepOrder,
          stepName: stepName,
          stepType: step.approvalType,
          dualApprovalSubtype: step.dualApprovalSubtype,
          userId: step.approverId,
          userId2: step.approverId2, // Segundo aprovador para dupla alçada
          role: step.requiredRole,
          role2: step.requiredRole2, // Segundo cargo para dupla alçada
        };
        
        console.log("Creating step:", stepData);
        
        const stepRes = await apiRequest("POST", "/api/workflow-steps", stepData);
        
        if (!stepRes.ok) {
          const errorData = await stepRes.json();
          console.error("Error creating step:", errorData);
          throw new Error(errorData.message || "Falha ao criar etapa de workflow");
        }
      }

      return workflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-steps/all"] });
      toast({
        title: "Workflow criado!",
        description: "O workflow de aprovação foi criado com sucesso.",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      setWorkflowSteps([]);
    },
    onError: (error) => {
      console.error("Error in createWorkflowMutation:", error);
      toast({
        title: "Erro ao criar workflow",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar o workflow",
        variant: "destructive",
      });
    },
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/workflows/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-steps/all"] });
      toast({
        title: "Workflow excluído",
        description: "O workflow foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir workflow",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir o workflow",
        variant: "destructive",
      });
    },
  });

  const addStep = () => {
    const newStep: WorkflowStep = {
      stepOrder: workflowSteps.length + 1,
      approvalType: "user",
    };
    const updatedSteps = [...workflowSteps, newStep];
    setWorkflowSteps(updatedSteps);
    form.setValue("steps", updatedSteps);
  };

  const removeStep = (index: number) => {
    const updatedSteps = workflowSteps.filter((_, i) => i !== index);
    const reorderedSteps = updatedSteps.map((step, i) => ({ ...step, stepOrder: i + 1 }));
    setWorkflowSteps(reorderedSteps);
    form.setValue("steps", reorderedSteps);
  };

  const updateStep = (index: number, field: keyof WorkflowStep, value: any) => {
    const updatedSteps = [...workflowSteps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setWorkflowSteps(updatedSteps);
    form.setValue("steps", updatedSteps);
  };

  const handleSubmit = (data: CreateWorkflowForm) => {
    if (workflowSteps.length === 0) {
      toast({
        title: "Adicione etapas",
        description: "É necessário adicionar pelo menos uma etapa de aprovação",
        variant: "destructive",
      });
      return;
    }

    createWorkflowMutation.mutate({
      ...data,
      steps: workflowSteps,
    });
  };

  const toggleWorkflowExpand = (workflowId: string) => {
    const newExpanded = new Set(expandedWorkflows);
    if (newExpanded.has(workflowId)) {
      newExpanded.delete(workflowId);
    } else {
      newExpanded.add(workflowId);
    }
    setExpandedWorkflows(newExpanded);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      "admin": "Administrador",
      "hr_manager": "Gerente de RH",
      "recruiter": "Recrutador",
      "interviewer": "Entrevistador",
      "viewer": "Visualizador",
      "approver": "Aprovador",
      "manager": "Gerente",
    };
    return labels[role] || role;
  };

  const getStepTypeLabel = (step: ApprovalWorkflowStep) => {
    if (step.stepType === "dual") {
      return step.dualApprovalSubtype === "user" ? "Dupla Alçada (Usuários)" : "Dupla Alçada (Tipo de Usuário)";
    }
    if (step.stepType === "user") return "Usuário Específico";
    if (step.stepType === "role") return "Tipo de Usuário (Cargo)";
    if (step.stepType === "permission") return "Tipo de Usuário (Cargo)";
    return step.stepType;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows de Aprovação</h1>
          <p className="text-muted-foreground mt-1">
            Configure fluxos de aprovação para vagas novas (Nova Vaga → Aprovada)
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          data-testid="button-create-workflow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Workflow
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando workflows...</div>
        </div>
      ) : !workflows || workflows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum workflow configurado
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Crie seu primeiro workflow de aprovação para gerenciar a aprovação de vagas
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-workflow">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workflows.map((workflow) => {
            const steps = workflowStepsData?.[workflow.id] || [];
            const isExpanded = expandedWorkflows.has(workflow.id);
            
            console.log(`Rendering workflow ${workflow.id} (${workflow.name}):`, {
              isExpanded,
              stepsCount: steps.length,
              steps,
              allStepsData: workflowStepsData
            });
            
            return (
              <Card key={workflow.id} className="hover-elevate">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <GitBranch className="h-5 w-5 text-primary flex-shrink-0" />
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <div className="flex gap-2 flex-wrap">
                          {workflow.isDefault && (
                            <Badge variant="default" className="text-xs">
                              Padrão
                            </Badge>
                          )}
                          {workflow.isActive ? (
                            <Badge variant="outline" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <X className="h-3 w-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </div>
                      </div>
                      {workflow.description && (
                        <CardDescription className="text-sm">
                          {workflow.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleWorkflowExpand(workflow.id)}
                        data-testid={`button-toggle-${workflow.id}`}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWorkflowMutation.mutate(workflow.id)}
                        data-testid={`button-delete-${workflow.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    
                    {/* Informações Gerais */}
                    <div className="space-y-3 mb-6">
                      <div className="text-sm font-medium text-muted-foreground">
                        Informações Gerais
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Status</div>
                          <div className="text-sm">
                            {workflow.isActive ? (
                              <Badge variant="default" className="bg-green-600">Ativo</Badge>
                            ) : (
                              <Badge variant="secondary">Inativo</Badge>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Workflow Padrão</div>
                          <div className="text-sm">
                            {workflow.isDefault ? (
                              <Badge variant="default">Sim</Badge>
                            ) : (
                              <Badge variant="outline">Não</Badge>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Divisão</div>
                          <div className="text-sm">
                            {workflow.divisionId 
                              ? divisions?.find(d => d.id === workflow.divisionId)?.name || 'N/A'
                              : 'Todas as divisões'
                            }
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Total de Etapas</div>
                          <div className="text-sm font-medium">{steps.length}</div>
                        </div>
                        {workflow.createdAt && (
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Criado em</div>
                            <div className="text-sm">
                              {new Date(workflow.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        )}
                        {workflow.updatedAt && (
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Atualizado em</div>
                            <div className="text-sm">
                              {new Date(workflow.updatedAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="mb-4" />

                    {/* Etapas de Aprovação */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        Etapas de Aprovação ({steps.length})
                      </div>
                      
                      {steps.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          Nenhuma etapa configurada
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {steps
                            .sort((a, b) => a.stepOrder - b.stepOrder)
                            .map((step, index) => {
                              const user = step.userId ? users?.find(u => u.id === step.userId) : null;
                              const user2 = step.userId2 ? users?.find(u => u.id === step.userId2) : null;
                              
                              return (
                                <div
                                  key={step.id}
                                  className="flex items-center justify-between p-3 rounded-md border bg-card"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <Badge variant="outline" className="text-xs font-mono">
                                      #{step.stepOrder}
                                    </Badge>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium flex items-center gap-2">
                                        {step.stepType === "dual" && <Users className="h-4 w-4 text-primary" />}
                                        {step.stepType === "user" && <UserCheck className="h-4 w-4 text-primary" />}
                                        {step.stepType === "permission" && <Shield className="h-4 w-4 text-primary" />}
                                        {step.stepName || getStepTypeLabel(step)}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {step.stepType === "user" && user && (
                                          <span>Aprovador: {user.firstName} {user.lastName} ({user.email})</span>
                                        )}
                                        {(step.stepType === "role" || step.stepType === "permission") && step.role && (
                                          <span>Cargo: {getRoleLabel(step.role)}</span>
                                        )}
                                        {step.stepType === "dual" && step.dualApprovalSubtype === "user" && (
                                          <div className="space-y-0.5">
                                            {user && (
                                              <div>Aprovador 1: {user.firstName} {user.lastName} ({user.email})</div>
                                            )}
                                            {user2 && (
                                              <div>Aprovador 2: {user2.firstName} {user2.lastName} ({user2.email})</div>
                                            )}
                                            {!user && !user2 && <span>2 aprovadores específicos</span>}
                                          </div>
                                        )}
                                        {step.stepType === "dual" && step.dualApprovalSubtype === "permission" && step.role && (
                                          <span>2 aprovações de usuários do tipo: {getRoleLabel(step.role)}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    {/* Regras de Aplicação */}
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Regras de Aplicação
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1 bg-muted p-3 rounded-md">
                        <div>• Este workflow será aplicado automaticamente nas vagas criadas{workflow.divisionId ? ` da divisão "${divisions?.find(d => d.id === workflow.divisionId)?.name}"` : ' de todas as divisões'}</div>
                        {workflow.isDefault && (
                          <div>• Como workflow padrão, será selecionado automaticamente ao criar uma vaga</div>
                        )}
                        <div>• As vagas passarão por {steps.length} etapa(s) de aprovação sequenciais</div>
                        <div>• Após aprovação em todas as etapas, a vaga será movida para o status "Aprovada"</div>
                        <div>• Se rejeitada em qualquer etapa, a vaga será marcada como "Rejeitada"</div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Workflow de Aprovação</DialogTitle>
            <DialogDescription>
              Configure um fluxo de aprovação para vagas novas (Nova Vaga → Aprovada)
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Workflow *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Aprovação de Vagas Executivas"
                          data-testid="input-workflow-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descreva o propósito deste workflow..."
                          rows={2}
                          data-testid="input-workflow-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="divisionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Divisão</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-division">
                            <SelectValue placeholder="Selecione a divisão" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {divisions?.map((division) => (
                            <SelectItem key={division.id} value={division.id}>
                              {division.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Este workflow será aplicado apenas para vagas desta divisão
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Workflow Ativo</FormLabel>
                          <FormDescription className="text-xs">
                            Disponível para uso
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-workflow-active"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Workflow Padrão</FormLabel>
                          <FormDescription className="text-xs">
                            Selecionado automaticamente
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-workflow-default"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">Etapas de Aprovação</h3>
                    <p className="text-sm text-muted-foreground">
                      Adicione as etapas do fluxo de aprovação
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStep}
                    data-testid="button-add-step"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Etapa
                  </Button>
                </div>

                {workflowSteps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-md">
                    <GitBranch className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma etapa adicionada. Clique em "Adicionar Etapa" para começar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workflowSteps.map((step, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono">#{step.stepOrder}</Badge>
                              <CardTitle className="text-sm">Etapa {step.stepOrder}</CardTitle>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStep(index)}
                              data-testid={`button-remove-step-${index}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-sm">Tipo de Aprovação *</Label>
                            <Select
                              value={step.approvalType}
                              onValueChange={(value: "dual" | "user" | "role") => {
                                updateStep(index, "approvalType", value);
                                // Quando seleciona "dual", define o subtipo padrão como "user"
                                if (value === "dual" && !step.dualApprovalSubtype) {
                                  updateStep(index, "dualApprovalSubtype", "user");
                                }
                              }}
                            >
                              <SelectTrigger data-testid={`select-approval-type-${index}`} className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4" />
                                    Usuário Específico
                                  </div>
                                </SelectItem>
                                <SelectItem value="role">
                                  <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Tipo de Usuário (Cargo)
                                  </div>
                                </SelectItem>
                                <SelectItem value="dual">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Dupla Alçada (2 Usuários)
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {step.approvalType === "user" && (
                            <div>
                              <Label className="text-sm">Usuário Aprovador *</Label>
                              <Select
                                value={step.approverId}
                                onValueChange={(value) => updateStep(index, "approverId", value)}
                              >
                                <SelectTrigger data-testid={`select-approver-${index}`} className="mt-1">
                                  <SelectValue placeholder="Selecione um usuário" />
                                </SelectTrigger>
                                <SelectContent>
                                  {users?.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.firstName} {user.lastName} ({user.email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground mt-1">
                                Este usuário específico precisará aprovar a vaga
                              </p>
                            </div>
                          )}

                          {step.approvalType === "role" && (
                            <div>
                              <Label className="text-sm">Tipo de Usuário (Cargo) *</Label>
                              <Select
                                value={step.requiredRole}
                                onValueChange={(value) => updateStep(index, "requiredRole", value)}
                              >
                                <SelectTrigger data-testid={`select-role-${index}`} className="mt-1">
                                  <SelectValue placeholder="Selecione um tipo de usuário" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Administrador</SelectItem>
                                  <SelectItem value="hr_manager">Gerente de RH</SelectItem>
                                  <SelectItem value="manager">Gerente</SelectItem>
                                  <SelectItem value="approver">Aprovador</SelectItem>
                                  <SelectItem value="recruiter">Recrutador</SelectItem>
                                  <SelectItem value="interviewer">Entrevistador</SelectItem>
                                  <SelectItem value="viewer">Visualizador</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground mt-1">
                                Qualquer usuário com este cargo poderá aprovar
                              </p>
                            </div>
                          )}

                          {step.approvalType === "dual" && (
                            <div className="space-y-3">
                              <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                                <strong>Dupla Alçada:</strong> Requer aprovação de dois usuários diferentes
                              </div>
                              
                              <div>
                                <Label className="text-sm">Primeiro Aprovador *</Label>
                                    <Select
                                      value={step.approverId}
                                      onValueChange={(value) => updateStep(index, "approverId", value)}
                                    >
                                      <SelectTrigger data-testid={`select-approver1-${index}`} className="mt-1">
                                    <SelectValue placeholder="Selecione o primeiro aprovador" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {users?.map((user) => (
                                      <SelectItem key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName} ({user.email})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label className="text-sm">Segundo Aprovador *</Label>
                                <Select
                                  value={step.approverId2}
                                  onValueChange={(value) => updateStep(index, "approverId2", value)}
                                >
                                  <SelectTrigger data-testid={`select-approver2-${index}`} className="mt-1">
                                    <SelectValue placeholder="Selecione o segundo aprovador" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {users?.filter(user => user.id !== step.approverId).map((user) => (
                                      <SelectItem key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName} ({user.email})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Ambos os aprovadores selecionados acima precisarão aprovar esta etapa
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    form.reset();
                    setWorkflowSteps([]);
                  }}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createWorkflowMutation.isPending || workflowSteps.length === 0}
                  data-testid="button-save-workflow"
                >
                  {createWorkflowMutation.isPending ? (
                    <>Criando...</>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Criar Workflow
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
