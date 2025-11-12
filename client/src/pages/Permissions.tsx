import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle2, XCircle, Settings, Briefcase, Building2, Users, FileText, BarChart3, Download, UserCog, Lock, CheckSquare, Edit, Trash2, Eye, UserCheck, FolderKanban, CreditCard, ClipboardList, UserPlus } from "lucide-react";

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

// Permission categories with icons and descriptions
const permissionCategories = {
  "Vagas": {
    icon: Briefcase,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    permissions: [
      { key: "create_jobs", label: "Criar Vagas", icon: Briefcase, description: "Criar novas vagas no sistema" },
      { key: "edit_jobs", label: "Editar Vagas", icon: Edit, description: "Modificar vagas existentes" },
      { key: "delete_jobs", label: "Excluir Vagas", icon: Trash2, description: "Remover vagas do sistema" },
      { key: "view_jobs", label: "Visualizar Vagas", icon: Eye, description: "Ver detalhes das vagas" },
      { key: "approve_jobs", label: "Aprovar Vagas", icon: CheckSquare, description: "Aprovar solicitações de vagas" },
      { key: "assign_to_jobs", label: "Pegar Vagas no Grid", icon: UserCheck, description: "Assumir vagas para trabalhar" },
    ]
  },
  "Empresas": {
    icon: Building2,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    permissions: [
      { key: "create_companies", label: "Criar Empresas", icon: Building2, description: "Cadastrar novas empresas" },
      { key: "edit_companies", label: "Editar Empresas", icon: Edit, description: "Alterar dados de empresas" },
      { key: "delete_companies", label: "Excluir Empresas", icon: Trash2, description: "Remover empresas" },
      { key: "view_companies", label: "Visualizar Empresas", icon: Eye, description: "Acessar informações de empresas" },
      { key: "manage_cost_centers", label: "Gerenciar Centros de Custo", icon: CreditCard, description: "Administrar centros de custo" },
    ]
  },
  "Candidatos": {
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    permissions: [
      { key: "view_applications", label: "Visualizar Candidaturas", icon: Eye, description: "Ver candidaturas recebidas" },
      { key: "manage_applications", label: "Gerenciar Candidaturas", icon: ClipboardList, description: "Administrar todo o processo" },
      { key: "interview_candidates", label: "Entrevistar Candidatos", icon: Users, description: "Realizar entrevistas" },
      { key: "hire_candidates", label: "Contratar Candidatos", icon: UserPlus, description: "Aprovar contratações" },
    ]
  },
  "Sistema": {
    icon: Settings,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    permissions: [
      { key: "view_reports", label: "Visualizar Relatórios", icon: BarChart3, description: "Acessar dashboards e relatórios" },
      { key: "export_data", label: "Exportar Dados", icon: Download, description: "Baixar dados do sistema" },
      { key: "manage_users", label: "Gerenciar Usuários", icon: UserCog, description: "Administrar usuários" },
      { key: "manage_permissions", label: "Gerenciar Permissões", icon: Lock, description: "Configurar permissões" },
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

export default function Permissions() {
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get role permissions
  const { data: rolePermissions = [], isLoading: rolePermsLoading } = useQuery<any[]>({
    queryKey: ["/api/permissions/roles/permissions"],
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
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-4 rounded-lg border-2 transition-all hover-elevate text-left ${
                    selectedRole === role 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                  data-testid={`button-role-${role}`}
                >
                  <Badge 
                    variant={roleColors[role] as any}
                    className="mb-2"
                  >
                    {roleLabels[role]}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-2">
                    {permissionStats.total > 0 && selectedRole === role && (
                      <span>{permissionStats.active}/{permissionStats.total} permissões</span>
                    )}
                  </div>
                </button>
              ))}
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
                <Badge variant={roleColors[selectedRole] as any} className="text-sm">
                  {roleLabels[selectedRole]}
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
