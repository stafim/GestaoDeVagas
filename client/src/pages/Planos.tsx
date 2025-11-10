import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Package, DollarSign, Users, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlanSchema, type Plan } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";

// Definição das funcionalidades do sistema
const SYSTEM_FEATURES = [
  { id: "dashboard", label: "Dashboard Principal", description: "Visão geral do sistema" },
  { id: "realtime", label: "Tempo Real", description: "Dashboard do cliente em tempo real" },
  { id: "jobs", label: "Gestão de Vagas", description: "Criar e gerenciar vagas de emprego" },
  { id: "kanban", label: "Kanban", description: "Pipeline de candidatos" },
  { id: "companies", label: "Empresas", description: "Cadastro de empresas" },
  { id: "clients", label: "Clientes", description: "Cadastro de clientes" },
  { id: "users", label: "Usuários", description: "Gerenciar usuários" },
  { id: "permissions", label: "Permissões", description: "Controle de acesso" },
  { id: "job_closure", label: "Fechamento de Vagas", description: "Ranking de recrutadores" },
  { id: "advanced_reports", label: "Relatórios Avançados", description: "Análises e relatórios detalhados" },
  { id: "integrations", label: "Integrações", description: "Integração com sistemas externos" },
  { id: "notifications", label: "Notificações", description: "Email e WhatsApp" },
];

type FormValues = z.infer<typeof insertPlanSchema>;

export default function Planos() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ["/api/plans"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/plans", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Sucesso!",
        description: "Plano criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o plano.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FormValues> }) => {
      const res = await apiRequest("PATCH", `/api/plans/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      setEditingPlan(null);
      setIsCreateDialogOpen(false);
      toast({
        title: "Sucesso!",
        description: "Plano atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o plano.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/plans/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: "Sucesso!",
        description: "Plano excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o plano.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(insertPlanSchema),
    defaultValues: {
      name: "",
      description: "",
      monthlyPrice: "0",
      yearlyPrice: "0",
      maxUsers: 10,
      maxJobs: null,
      features: {},
      isActive: true,
      displayOrder: 0,
    },
  });

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      description: plan.description || "",
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice || "0",
      maxUsers: plan.maxUsers || 10,
      maxJobs: plan.maxJobs,
      features: plan.features as Record<string, boolean>,
      isActive: plan.isActive ?? true,
      displayOrder: plan.displayOrder || 0,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este plano?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: FormValues) => {
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Planos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os planos de venda do sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen || editingPlan !== null} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingPlan(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-novo-plano">
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Editar Plano" : "Novo Plano"}</DialogTitle>
              <DialogDescription>
                Configure os recursos e limites do plano de vendas
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Plano *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Básico, Profissional, Enterprise" {...field} data-testid="input-plan-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordem de Exibição</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value ?? 0} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} data-testid="input-display-order" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descreva o plano e seus benefícios" {...field} value={field.value ?? ""} data-testid="input-plan-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="monthlyPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Mensal (R$) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-monthly-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearlyPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Anual (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value || ""} data-testid="input-yearly-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxUsers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máximo de Usuários</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value ?? 10} onChange={(e) => field.onChange(parseInt(e.target.value) || 10)} data-testid="input-max-users" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxJobs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máximo de Vagas (deixe vazio para ilimitado)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Ilimitado"
                            {...field} 
                            value={field.value || ""} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} 
                            data-testid="input-max-jobs" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormLabel>Funcionalidades Incluídas</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {SYSTEM_FEATURES.map((feature) => (
                      <FormField
                        key={feature.id}
                        control={form.control}
                        name="features"
                        render={({ field }) => {
                          const features = (field.value as Record<string, boolean>) || {};
                          return (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={features[feature.id] || false}
                                  onCheckedChange={(checked) => {
                                    const updatedFeatures = { ...features };
                                    updatedFeatures[feature.id] = !!checked;
                                    field.onChange(updatedFeatures);
                                  }}
                                  data-testid={`checkbox-feature-${feature.id}`}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-medium">{feature.label}</FormLabel>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-is-active"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-medium">Plano Ativo</FormLabel>
                        <p className="text-sm text-muted-foreground">Plano disponível para venda</p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingPlan(null);
                      form.reset();
                    }}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-plan">
                    {editingPlan ? "Atualizar" : "Criar"} Plano
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando planos...</p>
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">Nenhum plano encontrado</p>
            <p className="text-sm text-muted-foreground">
              Clique em "Novo Plano" para começar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const features = (plan.features as Record<string, boolean>) || {};
            const enabledFeatures = SYSTEM_FEATURES.filter(f => features[f.id]);
            
            return (
              <Card key={plan.id} className="relative hover:shadow-lg transition-shadow" data-testid={`card-plan-${plan.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription className="mt-2">{plan.description}</CardDescription>
                    </div>
                    {plan.isActive ? (
                      <Badge variant="default" className="ml-2">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-2">Inativo</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(plan.monthlyPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground">por mês</p>
                      </div>
                    </div>
                    {plan.yearlyPrice && parseFloat(plan.yearlyPrice) > 0 && (
                      <div className="flex items-center gap-2 ml-6">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {formatCurrency(plan.yearlyPrice)}
                          </p>
                          <p className="text-xs text-muted-foreground">por ano</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        Até {plan.maxUsers || 0} usuários
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {plan.maxJobs ? `Até ${plan.maxJobs} vagas` : "Vagas ilimitadas"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                      Funcionalidades ({enabledFeatures.length})
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {enabledFeatures.length > 0 ? (
                        enabledFeatures.map((feature) => (
                          <div key={feature.id} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-foreground">{feature.label}</p>
                              <p className="text-xs text-muted-foreground">{feature.description}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma funcionalidade habilitada</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(plan)}
                      data-testid={`button-edit-${plan.id}`}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(plan.id)}
                      data-testid={`button-delete-${plan.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
