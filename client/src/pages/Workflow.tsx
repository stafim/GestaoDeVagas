import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, GitBranch, Edit, Trash2, Check, X, UserCheck, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import type { ApprovalWorkflow, ApprovalWorkflowStep, User } from "@shared/schema";

const workflowStepSchema = z.object({
  stepOrder: z.number().min(1),
  approvalType: z.enum(["dual", "user", "permission"]),
  approverId: z.string().optional(),
  requiredPermission: z.string().optional(),
});

const createWorkflowSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  steps: z.array(workflowStepSchema).min(1, "Adicione pelo menos uma etapa de aprovação"),
});

type CreateWorkflowForm = z.infer<typeof createWorkflowSchema>;

interface WorkflowStep {
  stepOrder: number;
  approvalType: "dual" | "user" | "permission";
  approverId?: string;
  requiredPermission?: string;
}

export default function Workflow() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [isEditingWorkflow, setIsEditingWorkflow] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);

  const { data: workflows, isLoading } = useQuery<ApprovalWorkflow[]>({
    queryKey: ["/api/workflows"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm<CreateWorkflowForm>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      isDefault: false,
      steps: [],
    },
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (data: CreateWorkflowForm) => {
      const workflowRes = await apiRequest("POST", "/api/workflows", {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        isDefault: data.isDefault,
      });
      
      const workflow = await workflowRes.json();

      for (const step of data.steps) {
        await apiRequest("POST", "/api/workflow-steps", {
          workflowId: workflow.id,
          stepOrder: step.stepOrder,
          approvalType: step.approvalType,
          approverId: step.approverId,
          requiredPermission: step.requiredPermission,
        });
      }

      return workflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow criado!",
        description: "O workflow de aprovação foi criado com sucesso.",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      setWorkflowSteps([]);
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar workflow",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar o workflow",
        variant: "destructive",
      });
    },
  });

  const addStep = () => {
    const newStep: WorkflowStep = {
      stepOrder: workflowSteps.length + 1,
      approvalType: "dual",
    };
    setWorkflowSteps([...workflowSteps, newStep]);
  };

  const removeStep = (index: number) => {
    const updatedSteps = workflowSteps.filter((_, i) => i !== index);
    const reorderedSteps = updatedSteps.map((step, i) => ({ ...step, stepOrder: i + 1 }));
    setWorkflowSteps(reorderedSteps);
  };

  const updateStep = (index: number, field: keyof WorkflowStep, value: any) => {
    const updatedSteps = [...workflowSteps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setWorkflowSteps(updatedSteps);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows de Aprovação</h1>
          <p className="text-muted-foreground mt-1">
            Configure fluxos de aprovação para vagas com dupla alçada, aprovação por usuário ou permissão
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
              Crie seu primeiro workflow de aprovação para gerenciar a aprovação de vagas com múltiplas alçadas
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-workflow">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="hover-elevate">
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-primary" />
                    <span className="truncate">{workflow.name}</span>
                  </CardTitle>
                  {workflow.description && (
                    <CardDescription className="mt-1 text-sm line-clamp-2">
                      {workflow.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-1 flex-wrap">
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
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedWorkflow(workflow);
                      setIsEditingWorkflow(true);
                    }}
                    data-testid={`button-edit-workflow-${workflow.id}`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Workflow</DialogTitle>
            <DialogDescription>
              Configure um fluxo de aprovação para vagas com múltiplas etapas e alçadas
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Workflow</FormLabel>
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
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descreva o propósito deste workflow..."
                          data-testid="input-workflow-description"
                        />
                      </FormControl>
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
                          <FormLabel>Workflow Ativo</FormLabel>
                          <FormDescription className="text-xs">
                            Pode ser usado em novas vagas
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
                          <FormLabel>Workflow Padrão</FormLabel>
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Etapas de Aprovação</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure as etapas do fluxo de aprovação
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
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <GitBranch className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma etapa adicionada. Clique em "Adicionar Etapa" para começar.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {workflowSteps.map((step, index) => (
                      <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
                          <CardTitle className="text-base">Etapa {step.stepOrder}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(index)}
                            data-testid={`button-remove-step-${index}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label>Tipo de Aprovação</Label>
                            <Select
                              value={step.approvalType}
                              onValueChange={(value: "dual" | "user" | "permission") =>
                                updateStep(index, "approvalType", value)
                              }
                            >
                              <SelectTrigger data-testid={`select-approval-type-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dual">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Dupla Alçada (2 aprovações)
                                  </div>
                                </SelectItem>
                                <SelectItem value="user">
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4" />
                                    Usuário Específico
                                  </div>
                                </SelectItem>
                                <SelectItem value="permission">
                                  <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4" />
                                    Por Permissão/Cargo
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {step.approvalType === "user" && (
                            <div>
                              <Label>Aprovador</Label>
                              <Select
                                value={step.approverId}
                                onValueChange={(value) => updateStep(index, "approverId", value)}
                              >
                                <SelectTrigger data-testid={`select-approver-${index}`}>
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
                            </div>
                          )}

                          {step.approvalType === "permission" && (
                            <div>
                              <Label>Permissão/Cargo Necessário</Label>
                              <Select
                                value={step.requiredPermission}
                                onValueChange={(value) => updateStep(index, "requiredPermission", value)}
                              >
                                <SelectTrigger data-testid={`select-permission-${index}`}>
                                  <SelectValue placeholder="Selecione uma permissão" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Administrador</SelectItem>
                                  <SelectItem value="manager">Gerente</SelectItem>
                                  <SelectItem value="hr_manager">Gerente de RH</SelectItem>
                                  <SelectItem value="approver">Aprovador</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {step.approvalType === "dual" && (
                            <div className="text-sm text-muted-foreground">
                              Esta etapa requer aprovação de dois usuários diferentes com permissão de aprovador.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
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
                  disabled={createWorkflowMutation.isPending}
                  data-testid="button-save-workflow"
                >
                  {createWorkflowMutation.isPending ? "Criando..." : "Criar Workflow"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
