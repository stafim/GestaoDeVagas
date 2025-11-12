import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle2, XCircle, User, Settings } from "lucide-react";

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

// Permission categories and labels
const permissionCategories = {
  "Vagas": [
    { key: "create_jobs", label: "Criar Vagas" },
    { key: "edit_jobs", label: "Editar Vagas" },
    { key: "delete_jobs", label: "Excluir Vagas" },
    { key: "view_jobs", label: "Visualizar Vagas" },
    { key: "approve_jobs", label: "Aprovar Vagas" },
    { key: "assign_to_jobs", label: "Pegar Vagas no Grid" },
  ],
  "Empresas": [
    { key: "create_companies", label: "Criar Empresas" },
    { key: "edit_companies", label: "Editar Empresas" },
    { key: "delete_companies", label: "Excluir Empresas" },
    { key: "view_companies", label: "Visualizar Empresas" },
    { key: "manage_cost_centers", label: "Gerenciar Centros de Custo" },
  ],
  "Candidatos": [
    { key: "view_applications", label: "Visualizar Candidaturas" },
    { key: "manage_applications", label: "Gerenciar Candidaturas" },
    { key: "interview_candidates", label: "Entrevistar Candidatos" },
    { key: "hire_candidates", label: "Contratar Candidatos" },
  ],
  "Sistema": [
    { key: "view_reports", label: "Visualizar Relatórios" },
    { key: "export_data", label: "Exportar Dados" },
    { key: "manage_users", label: "Gerenciar Usuários" },
    { key: "manage_permissions", label: "Gerenciar Permissões" },
  ]
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
  const [selectedUser, setSelectedUser] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get role permissions
  const { data: rolePermissions = [], isLoading: rolePermsLoading } = useQuery<any[]>({
    queryKey: ["/api/permissions/roles/permissions"],
  });

  // Get all users for menu permissions
  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Get menu permissions for selected user
  const { data: userMenuPerms = [] } = useQuery({
    queryKey: ["/api/permissions/menu", selectedUser],
    enabled: !!selectedUser,
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

  // Update menu permissions for selected user
  const updateMenuPermissionsMutation = useMutation({
    mutationFn: async (data: { userId: string; menuPermissions: Array<{ menuPath: string; menuName: string; canAccess: boolean }> }) => {
      const res = await apiRequest("POST", `/api/permissions/menu/${data.userId}/bulk`, { menuPermissions: data.menuPermissions });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Permissões de menu atualizadas com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/menu", selectedUser] });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar permissões de menu", variant: "destructive" });
    }
  });

  // Check if a role has a specific permission
  const hasPermission = (role: string, permission: string): boolean => {
    const perm = rolePermissions.find(
      (p: any) => p.role === role && p.permission === permission
    );
    return perm?.isGranted ?? false;
  };

  // Check if a user has access to a specific menu
  const hasMenuAccess = (menuPath: string): boolean => {
    const perm = userMenuPerms.find((p: any) => p.menuPath === menuPath);
    return perm?.canAccess ?? false;
  };

  // Toggle permission for a role
  const handleTogglePermission = (role: string, permission: string, currentValue: boolean) => {
    toggleRolePermissionMutation.mutate({
      role,
      permission,
      isGranted: !currentValue
    });
  };

  // Toggle menu access for a user
  const handleToggleMenu = (menuPath: string, menuName: string, currentValue: boolean) => {
    if (!selectedUser) return;
    
    // Update all menu permissions at once
    const updatedPermissions = availableMenus.map(menu => {
      if (menu.path === menuPath) {
        return { menuPath: menu.path, menuName: menu.name, canAccess: !currentValue };
      }
      return { 
        menuPath: menu.path, 
        menuName: menu.name, 
        canAccess: hasMenuAccess(menu.path) 
      };
    });

    updateMenuPermissionsMutation.mutate({
      userId: selectedUser,
      menuPermissions: updatedPermissions
    });
  };

  if (rolePermsLoading || usersLoading) {
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

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles" data-testid="tab-role-permissions">
            <Settings className="h-4 w-4 mr-2" />
            Permissões por Função
          </TabsTrigger>
          <TabsTrigger value="menu" data-testid="tab-menu-permissions">
            <User className="h-4 w-4 mr-2" />
            Permissões de Menu
          </TabsTrigger>
        </TabsList>

        {/* Role Permissions Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Permissões por Função</CardTitle>
                  <CardDescription>
                    Controle quais funcionalidades cada tipo de usuário pode acessar
                  </CardDescription>
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[250px]" data-testid="select-role">
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role} data-testid={`select-role-${role}`}>
                        <div className="flex items-center gap-2">
                          <Badge variant={roleColors[role] as any}>
                            {roleLabels[role]}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(permissionCategories).map(([category, permissions]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3">{category}</h3>
                    <div className="space-y-2">
                      {permissions.map((perm) => {
                        const hasAccess = hasPermission(selectedRole, perm.key);
                        return (
                          <div
                            key={perm.key}
                            className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                            data-testid={`permission-row-${perm.key}`}
                          >
                            <div className="flex items-center gap-3">
                              {hasAccess ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-gray-400" />
                              )}
                              <span className="font-medium">{perm.label}</span>
                            </div>
                            <Switch
                              checked={hasAccess}
                              onCheckedChange={() => handleTogglePermission(selectedRole, perm.key, hasAccess)}
                              data-testid={`switch-permission-${perm.key}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menu Permissions Tab */}
        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Permissões de Menu por Usuário</CardTitle>
                  <CardDescription>
                    Controle quais itens do menu cada usuário específico pode acessar
                  </CardDescription>
                </div>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="w-[300px]" data-testid="select-user">
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id} data-testid={`select-user-${user.id}`}>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.firstName} {user.lastName}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedUser ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Selecione um usuário para configurar suas permissões de menu
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableMenus.map((menu) => {
                    const hasAccess = hasMenuAccess(menu.path);
                    return (
                      <div
                        key={menu.path}
                        className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                        data-testid={`menu-row-${menu.path}`}
                      >
                        <div className="flex items-center gap-3">
                          {hasAccess ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                          <span className="text-2xl">{menu.icon}</span>
                          <div>
                            <span className="font-medium">{menu.name}</span>
                            <p className="text-xs text-muted-foreground">{menu.path}</p>
                          </div>
                        </div>
                        <Switch
                          checked={hasAccess}
                          onCheckedChange={() => handleToggleMenu(menu.path, menu.name, hasAccess)}
                          data-testid={`switch-menu-${menu.path}`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
