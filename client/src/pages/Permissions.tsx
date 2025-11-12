import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomRoleSchema, type CustomRole } from "@shared/schema";
import { Shield, CheckCircle2, XCircle, Settings, Briefcase, Building2, Users, FileText, BarChart3, Download, UserCog, Lock, CheckSquare, Edit, Trash2, Eye, UserCheck, FolderKanban, CreditCard, ClipboardList, UserPlus, LayoutDashboard, Workflow, Plus } from "lucide-react";

// Role labels and colors
const roleLabels: Record<string, string> = {
  admin: "Administrador",
  hr_manager: "Gerente RH", 
  recruiter: "Recrutador",
  interviewer: "Entrevistador",
  viewer: "Visualizador",
  approver: "Aprovador",
  manager: "Gestor"
};

const roleColors: Record<string, string> = {
  admin: "destructive",
  hr_manager: "default",
  recruiter: "secondary", 
  interviewer: "outline",
  viewer: "outline",
  approver: "default",
  manager: "secondary"
};

// All available roles
const availableRoles = [
  "admin",
  "hr_manager",
  "recruiter",
  "interviewer",
  "viewer",
  "approver",
  "manager"
];

// Permission categories with icons and descriptions - mapped to menu items
const permissionCategories = {
  "Módulos Principais": {
    icon: LayoutDashboard,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    permissions: [
      { key: "access_dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Acessar dashboard com métricas e gráficos" },
      { key: "access_jobs", label: "Vagas", icon: Briefcase, description: "Acessar módulo de gestão de vagas" },
      { key: "access_kanban", label: "Kanban", icon: FolderKanban, description: "Visualizar e gerenciar Kanban de vagas" },
      { key: "access_approvals", label: "Aprovações", icon: CheckSquare, description: "Acessar aprovações de vagas" },
    ]
  },
  "Cadastros": {
    icon: Building2,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    permissions: [
      { key: "access_companies", label: "Empresas", icon: Building2, description: "Gerenciar cadastro de empresas" },
      { key: "access_clients", label: "Clientes", icon: Users, description: "Gerenciar cadastro de clientes" },
      { key: "access_users", label: "Usuários", icon: UserCog, description: "Gerenciar cadastro de usuários" },
    ]
  },
  "Administração": {
    icon: Settings,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    permissions: [
      { key: "access_permissions", label: "Permissões", icon: Lock, description: "Configurar permissões por função" },
      { key: "access_workflow", label: "Workflow", icon: Workflow, description: "Gerenciar workflows de aprovação" },
      { key: "access_settings", label: "Configurações", icon: Settings, description: "Acessar configurações do sistema" },
    ]
  },
  "Relatórios": {
    icon: BarChart3,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    permissions: [
      { key: "access_reports", label: "Relatórios", icon: FileText, description: "Visualizar relatórios do sistema" },
      { key: "export_data", label: "Exportar Dados", icon: Download, description: "Exportar dados em diversos formatos" },
    ]
  }
};

// Available menu items
const availableMenus = [
  { path: "/dashboard", name: "Dashboard", icon: "📊" },
  { path: "/jobs", name: "Vagas", icon: "💼" },
  { path: "/kanban", name: "Kanban", icon: "📋" },
  { path: "/companies", name: "Empresas", icon: "🏢" },
  { path: "/clients", name: "Clientes", icon: "👥" },
  { path: "/users", name: "Usuários", icon: "👤" },
  { path: "/permissions", name: "Permissões", icon: "🔐" },
  { path: "/workflow", name: "Workflow", icon: "🔄" },
  { path: "/approvals", name: "Aprovações", icon: "✅" },
  { path: "/reports/job-closure", name: "Fechamento de Vagas", icon: "📈" },
  { path: "/settings", name: "Configurações", icon: "⚙️" },
];

type CustomRoleFormData = {
  name: string;
  description?: string;
};

export default function Permissions() {
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [isCustomRoleModalOpen, setIsCustomRoleModalOpen] = useState(false);
  const [editingCustomRole, setEditingCustomRole] = useState<CustomRole | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form for custom roles
  const customRoleForm = useForm<CustomRoleFormData>({
    resolver: zodResolver(insertCustomRoleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Get role permissions
  const { data: rolePermissions = [], isLoading: rolePermsLoading } = useQuery<any[]>({
    queryKey: ["/api/permissions/roles/permissions"],
  });

  // Get custom roles
  const { data: customRoles = [], isLoading: customRolesLoading } = useQuery<CustomRole[]>({
    queryKey: ["/api/custom-roles"],
  });

  // Setup default permissions mutation
  const setupDefaultsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/permissions/setup-defaults", {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Permissões padrão configuradas com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/roles/permissions"] });
    },
    onError: () => {
      toast({ 
        title: "Erro ao configurar permissões padrão", 
        variant: "destructive" 
      });
    }
  });

  // Toggle role permission mutation
  const toggleRolePermissionMutation = useMutation({
    mutationFn: async (data: { role: string; permission: string; isGranted: boolean }) => {
      const res = await apiRequest("POST", "/api/permissions/roles/permissions/toggle", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/roles/permissions"] });
    },
    onError: () => {
      toast({ 
        title: "Erro ao atualizar permissão", 
        variant: "destructive" 
      });
    }
  });

  // Create custom role mutation
  const createCustomRoleMutation = useMutation({
    mutationFn: async (data: CustomRoleFormData) => {
      const response = await apiRequest("POST", "/api/custom-roles", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-roles"] });
      toast({
        title: "Sucesso",
        description: "Função criada com sucesso!",
      });
      setIsCustomRoleModalOpen(false);
      customRoleForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar função. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update custom role mutation
  const updateCustomRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomRoleFormData }) => {
      const response = await apiRequest("PUT", `/api/custom-roles/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-roles"] });
      toast({
        title: "Sucesso",
        description: "Função atualizada com sucesso!",
      });
      setIsCustomRoleModalOpen(false);
      customRoleForm.reset();
      setEditingCustomRole(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar função. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Delete custom role mutation
  const deleteCustomRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/custom-roles/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-roles"] });
      toast({
        title: "Sucesso",
        description: "Função excluída com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir função. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Submit custom role
  const onSubmitCustomRole = (data: CustomRoleFormData) => {
    if (editingCustomRole) {
      updateCustomRoleMutation.mutate({ id: editingCustomRole.id, data });
    } else {
      createCustomRoleMutation.mutate(data);
    }
  };

  // Handle close modal
  const handleCloseCustomRoleModal = () => {
    setIsCustomRoleModalOpen(false);
    setEditingCustomRole(null);
    customRoleForm.reset({
      name: "",
      description: "",
    });
  };

  // Combine predefined roles with custom roles
  const allAvailableRoles = useMemo(() => {
    const customRoleIds = customRoles.map(cr => `custom_${cr.id}`);
    return [...availableRoles, ...customRoleIds];
  }, [customRoles]);

  // Get role label (handles both predefined and custom roles)
  const getRoleLabel = (roleId: string): string => {
    if (roleId.startsWith('custom_')) {
      const customRoleId = roleId.replace('custom_', '');
      const customRole = customRoles.find(cr => cr.id === customRoleId);
      return customRole?.name || roleId;
    }
    return roleLabels[roleId] || roleId;
  };

  // Get role color
  const getRoleColor = (roleId: string): string => {
    if (roleId.startsWith('custom_')) {
      return "default";
    }
    return roleColors[roleId] || "default";
  };

  // Check if a role has a specific permission
  const hasPermission = (role: string, permission: string): boolean => {
    const perm = rolePermissions.find(
      (p: any) => p.role === role && p.permission === permission
    );
    return perm?.isGranted ?? false;
  };

  // Toggle permission for a role
  const handleTogglePermission = (role: string, permission: string, currentValue: boolean) => {
    toggleRolePermissionMutation.mutate({
      role,
      permission,
      isGranted: !currentValue
    });
  };

  // Calculate permission statistics
  const permissionStats = useMemo(() => {
    let total = 0;
    let active = 0;
    
    Object.values(permissionCategories).forEach((category) => {
      category.permissions.forEach((perm) => {
        total++;
        if (hasPermission(selectedRole, perm.key)) {
          active++;
        }
      });
    });
    
    return { total, active, percentage: total > 0 ? Math.round((active / total) * 100) : 0 };
  }, [selectedRole, rolePermissions]);

  // Toggle all permissions in a category
  const handleToggleCategory = (categoryName: string, enable: boolean) => {
    const category = permissionCategories[categoryName as keyof typeof permissionCategories];
    category.permissions.forEach((perm: any) => {
      const currentValue = hasPermission(selectedRole, perm.key);
      if (currentValue !== enable) {
        handleTogglePermission(selectedRole, perm.key, currentValue);
      }
    });
  };

  if (rolePermsLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Gestão de Permissões
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure permissões por função e controle de acesso ao menu
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCustomRoleModalOpen} onOpenChange={setIsCustomRoleModalOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="default"
                data-testid="button-new-custom-role"
                onClick={() => {
                  setEditingCustomRole(null);
                  customRoleForm.reset({ name: "", description: "" });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Função
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCustomRole ? "Editar Função" : "Nova Função"}
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
                            placeholder="Ex: Supervisor de Vendas"
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
                            placeholder="Descreva as responsabilidades..."
                            data-testid="textarea-custom-role-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
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
                      {editingCustomRole ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Button 
            onClick={() => setupDefaultsMutation.mutate()}
            disabled={setupDefaultsMutation.isPending}
            variant="outline"
            data-testid="button-setup-defaults"
          >
            <Shield className="h-4 w-4 mr-2" />
            Configurar Padrões
          </Button>
        </div>
      </div>

      {/* Role Selector and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Selecionar Função</CardTitle>
            <CardDescription>
              Escolha a função que deseja configurar as permissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allAvailableRoles.map((role) => {
                const isCustomRole = role.startsWith('custom_');
                return (
                  <div
                    key={role}
                    className="relative"
                  >
                    <button
                      onClick={() => setSelectedRole(role)}
                      className={`w-full p-4 rounded-lg border-2 transition-all hover-elevate text-left ${
                        selectedRole === role 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                      data-testid={`button-role-${role}`}
                    >
                      <Badge 
                        variant={getRoleColor(role) as any}
                        className="mb-2"
                      >
                        {getRoleLabel(role)}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-2">
                        {permissionStats.total > 0 && selectedRole === role && (
                          <span>{permissionStats.active}/{permissionStats.total} permissões</span>
                        )}
                      </div>
                    </button>
                    {isCustomRole && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          const customRoleId = role.replace('custom_', '');
                          if (window.confirm(`Tem certeza que deseja excluir a função "${getRoleLabel(role)}"?`)) {
                            deleteCustomRoleMutation.mutate(customRoleId);
                          }
                        }}
                        data-testid={`button-delete-role-${role}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Permissões Ativas</span>
                  <span className="text-2xl font-bold">{permissionStats.active}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${permissionStats.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {permissionStats.percentage}% de {permissionStats.total} disponíveis
                </p>
              </div>

              <div className="pt-4 border-t">
                <Badge variant={getRoleColor(selectedRole) as any} className="text-sm">
                  {getRoleLabel(selectedRole)}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Função selecionada
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(permissionCategories).map(([categoryName, category]) => {
          const categoryActive = category.permissions.filter(p => hasPermission(selectedRole, p.key)).length;
          const categoryTotal = category.permissions.length;
          const CategoryIcon = category.icon;
          
          return (
            <Card key={categoryName} className="overflow-hidden">
              <div className={`${category.bgColor} p-4 border-b`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`${category.color} bg-white dark:bg-gray-900 p-2 rounded-lg`}>
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{categoryName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {categoryActive} de {categoryTotal} ativas
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleCategory(categoryName, true)}
                      className="h-7 text-xs"
                    >
                      Todas
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleCategory(categoryName, false)}
                      className="h-7 text-xs"
                    >
                      Nenhuma
                    </Button>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  {category.permissions.map((perm) => {
                    const hasAccess = hasPermission(selectedRole, perm.key);
                    const PermIcon = perm.icon;
                    
                    return (
                      <div
                        key={perm.key}
                        className={`p-3 rounded-lg border transition-all ${
                          hasAccess 
                            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                            : 'bg-muted/30 border-border'
                        }`}
                        data-testid={`permission-row-${perm.key}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`mt-0.5 ${hasAccess ? 'text-green-600' : 'text-muted-foreground'}`}>
                              <PermIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{perm.label}</span>
                                {hasAccess && (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {perm.description}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={hasAccess}
                            onCheckedChange={() => handleTogglePermission(selectedRole, perm.key, hasAccess)}
                            data-testid={`switch-permission-${perm.key}`}
                            className="flex-shrink-0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
