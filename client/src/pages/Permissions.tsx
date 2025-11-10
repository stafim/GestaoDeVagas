import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserCompanyRoleSchema, type InsertUserCompanyRole } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Shield, Menu } from "lucide-react";

const roleLabels = {
  admin: "Administrador",
  hr_manager: "Gerente RH", 
  recruiter: "Recrutador",
  interviewer: "Entrevistador",
  viewer: "Visualizador",
  approver: "Aprovador",
  manager: "Gestor"
};

const roleColors = {
  admin: "bg-red-100 text-red-800",
  hr_manager: "bg-blue-100 text-blue-800",
  recruiter: "bg-green-100 text-green-800", 
  interviewer: "bg-yellow-100 text-yellow-800",
  viewer: "bg-gray-100 text-gray-800",
  approver: "bg-purple-100 text-purple-800",
  manager: "bg-orange-100 text-orange-800"
};

const permissionLabels: Record<string, string> = {
  create_jobs: "Criar Vagas",
  edit_jobs: "Editar Vagas",
  delete_jobs: "Excluir Vagas",
  view_jobs: "Visualizar Vagas",
  approve_jobs: "Aprovar Vagas",
  assign_to_jobs: "Pegar Vagas no Grid",
  create_companies: "Criar Empresas",
  edit_companies: "Editar Empresas",
  delete_companies: "Excluir Empresas",
  view_companies: "Visualizar Empresas",
  manage_cost_centers: "Gerenciar Centros de Custo",
  view_applications: "Visualizar Candidaturas",
  manage_applications: "Gerenciar Candidaturas",
  interview_candidates: "Entrevistar Candidatos",
  hire_candidates: "Contratar Candidatos",
  view_reports: "Visualizar Relatórios",
  export_data: "Exportar Dados",
  manage_users: "Gerenciar Usuários",
  manage_permissions: "Gerenciar Permissões"
};

const availablePermissions = [
  "create_jobs",
  "edit_jobs",
  "delete_jobs",
  "view_jobs",
  "approve_jobs",
  "assign_to_jobs",
  "create_companies",
  "edit_companies",
  "delete_companies",
  "view_companies",
  "manage_cost_centers",
  "view_applications",
  "manage_applications",
  "interview_candidates",
  "hire_candidates",
  "view_reports",
  "export_data",
  "manage_users",
  "manage_permissions"
];

const availableMenus = [
  { path: "/dashboard", name: "Dashboard" },
  { path: "/jobs", name: "Vagas" },
  { path: "/kanban", name: "Kanban" },
  { path: "/companies", name: "Empresas" },
  { path: "/clients", name: "Clientes" },
  { path: "/users", name: "Usuários" },
  { path: "/permissions", name: "Permissões" },
  { path: "/reports/job-closure", name: "Fechamento de Vagas" },
  { path: "/settings", name: "Configurações" },
  { path: "/help", name: "Ajuda" },
];

export default function Permissions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [menuPermissions, setMenuPermissions] = useState<Record<string, boolean>>({});
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [selectedRoleForStatus, setSelectedRoleForStatus] = useState<string>("admin");
  const [localJobStatusPermissions, setLocalJobStatusPermissions] = useState<Record<string, { canView: boolean; canEdit: boolean }>>({});
  const { toast} = useToast();
  const queryClient = useQueryClient();

  // Get user roles
  const { data: userRoles = [], isLoading: rolesLoading } = useQuery<any[]>({
    queryKey: ["/api/permissions/user-roles"],
  });

  // Get companies for assignment
  const { data: companies = [] } = useQuery<any[]>({
    queryKey: ["/api/companies"],
  });

  // Get role permissions
  const { data: rolePermissions = [] } = useQuery<any[]>({
    queryKey: ["/api/permissions/roles/permissions"],
  });

  // Get all users for menu permissions
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Get menu permissions for selected user
  const { data: userMenuPerms = [] } = useQuery({
    queryKey: ["/api/permissions/menu", selectedUserId],
    enabled: !!selectedUserId,
  });

  // Get job statuses
  const { data: jobStatuses = [] } = useQuery<any[]>({
    queryKey: ["/api/job-statuses"],
  });

  // Get role job status permissions
  const { data: roleJobStatusPerms = [] } = useQuery<any[]>({
    queryKey: ["/api/permissions/role-job-status", selectedRoleForStatus],
    queryFn: async () => {
      const response = await fetch(`/api/permissions/role-job-status?role=${selectedRoleForStatus}`);
      if (!response.ok) throw new Error('Failed to fetch role job status permissions');
      return response.json();
    },
    enabled: !!selectedRoleForStatus,
  });

  // Update menu permissions for selected user when they change
  const updateMenuPermissionsMutation = useMutation({
    mutationFn: async (data: { userId: string; menuPermissions: Array<{ menuPath: string; menuName: string; canAccess: boolean }> }) => {
      const res = await apiRequest("POST", `/api/permissions/menu/${data.userId}/bulk`, { menuPermissions: data.menuPermissions });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Permissões de menu atualizadas com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/menu", selectedUserId] });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar permissões de menu", variant: "destructive" });
    }
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
      toast({ title: "Permissão atualizada com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/roles/permissions"] });
    },
    onError: () => {
      toast({ 
        title: "Erro ao atualizar permissão", 
        variant: "destructive" 
      });
    }
  });

  // Update role job status permissions mutation
  const updateRoleJobStatusPermsMutation = useMutation({
    mutationFn: async (data: { role: string; permissions: Array<{ jobStatusId: string; canView: boolean; canEdit: boolean }> }) => {
      const res = await apiRequest("POST", `/api/permissions/role-job-status/${data.role}/bulk`, { permissions: data.permissions });
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({ title: "Permissões por status de vaga atualizadas com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/role-job-status", variables.role] });
      setLocalJobStatusPermissions({});
    },
    onError: () => {
      toast({ 
        title: "Erro ao atualizar permissões por status de vaga", 
        variant: "destructive" 
      });
    }
  });

  // Assign user mutation
  const assignUserMutation = useMutation({
    mutationFn: async (data: InsertUserCompanyRole) => {
      const res = await apiRequest("POST", "/api/permissions/assign", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Usuário atribuído com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/user-roles"] });
      setIsModalOpen(false);
    },
    onError: () => {
      toast({ 
        title: "Erro ao atribuir usuário", 
        variant: "destructive" 
      });
    }
  });

  // Form for assigning users
  const form = useForm<InsertUserCompanyRole>({
    resolver: zodResolver(insertUserCompanyRoleSchema),
    defaultValues: {
      userId: "",
      companyId: "",
      role: "viewer" as any,
      costCenterId: null,
      isActive: true
    }
  });

  const onSubmit = (data: InsertUserCompanyRole) => {
    assignUserMutation.mutate(data);
  };

  // Derive job status permissions from query data
  const serverJobStatusPermissions = useMemo(() => {
    if (roleJobStatusPerms && roleJobStatusPerms.length > 0) {
      const permsMap: Record<string, { canView: boolean; canEdit: boolean }> = {};
      roleJobStatusPerms.forEach((perm: any) => {
        permsMap[perm.jobStatusId] = {
          canView: perm.canView,
          canEdit: perm.canEdit
        };
      });
      return permsMap;
    }
    return {};
  }, [roleJobStatusPerms]);

  // Combine server permissions with local edits
  const jobStatusPermissions = useMemo(() => {
    return { ...serverJobStatusPermissions, ...localJobStatusPermissions };
  }, [serverJobStatusPermissions, localJobStatusPermissions]);

  if (rolesLoading) {
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestão de Permissões
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gerencie permissões de usuários por empresa e centro de custo
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setupDefaultsMutation.mutate()}
            disabled={setupDefaultsMutation.isPending}
            variant="outline"
            data-testid="button-setup-defaults"
          >
            <Shield className="h-4 w-4 mr-2" />
            Configurar Padrões
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-assign-user">
                <Plus className="h-4 w-4 mr-2" />
                Atribuir Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atribuir Usuário à Empresa</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="userId">ID do Usuário</Label>
                  <Input
                    id="userId"
                    {...form.register("userId")}
                    placeholder="ID do usuário"
                    data-testid="input-user-id"
                  />
                </div>
                <div>
                  <Label htmlFor="companyId">Empresa</Label>
                  <Select 
                    value={form.watch("companyId") || undefined} 
                    onValueChange={(value) => form.setValue("companyId", value)}
                  >
                    <SelectTrigger data-testid="select-company">
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company: any) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role">Função</Label>
                  <Select 
                    value={form.watch("role")} 
                    onValueChange={(value) => form.setValue("role", value as any)}
                  >
                    <SelectTrigger data-testid="select-role">
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={assignUserMutation.isPending}
                    data-testid="button-save-assignment"
                  >
                    Atribuir
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current User Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Suas Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRoles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Você ainda não possui permissões em nenhuma empresa
            </p>
          ) : (
            <div className="space-y-4">
              {userRoles.map((role: any) => (
                <div 
                  key={role.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">Empresa: {role.companyId}</p>
                      {role.costCenterId && (
                        <p className="text-sm text-gray-500">
                          Centro de Custo: {role.costCenterId}
                        </p>
                      )}
                    </div>
                    <Badge className={roleColors[role.role as keyof typeof roleColors]}>
                      {roleLabels[role.role as keyof typeof roleLabels]}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Desde: {new Date(role.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Menu Permissions Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5" />
            Gerenciar Permissões de Menu por Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-select">Selecionar Usuário</Label>
              <Select
                value={selectedUserId}
                onValueChange={(value) => {
                  setSelectedUserId(value);
                  // Load menu permissions for this user
                  if (value) {
                    const userPerms = userMenuPerms as any[];
                    const permsMap: Record<string, boolean> = {};
                    
                    // Initialize all menus as accessible (default)
                    availableMenus.forEach(menu => {
                      permsMap[menu.path] = true;
                    });
                    
                    // Override with existing permissions
                    userPerms.forEach((perm: any) => {
                      permsMap[perm.menuPath] = perm.canAccess;
                    });
                    
                    setMenuPermissions(permsMap);
                  }
                }}
              >
                <SelectTrigger data-testid="select-user-menu-perms">
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUserId && (
              <div className="space-y-3">
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">
                    Configure quais menus este usuário pode acessar:
                  </p>
                  <div className="space-y-2">
                    {availableMenus.map((menu) => (
                      <div
                        key={menu.path}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{menu.name}</span>
                          <span className="text-sm text-gray-500">{menu.path}</span>
                        </div>
                        <Switch
                          checked={menuPermissions[menu.path] ?? true}
                          onCheckedChange={(checked) => {
                            setMenuPermissions(prev => ({
                              ...prev,
                              [menu.path]: checked
                            }));
                          }}
                          data-testid={`switch-menu-${menu.path.replace(/\//g, '-')}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedUserId("");
                      setMenuPermissions({});
                    }}
                    data-testid="button-cancel-menu-perms"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      const menuPermsArray = availableMenus.map(menu => ({
                        menuPath: menu.path,
                        menuName: menu.name,
                        canAccess: menuPermissions[menu.path] ?? true
                      }));
                      
                      updateMenuPermissionsMutation.mutate({
                        userId: selectedUserId,
                        menuPermissions: menuPermsArray
                      });
                    }}
                    disabled={updateMenuPermissionsMutation.isPending}
                    data-testid="button-save-menu-perms"
                  >
                    {updateMenuPermissionsMutation.isPending ? "Salvando..." : "Salvar Permissões"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gerenciar Permissões por Função
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-select">Selecionar Função</Label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger data-testid="select-role-permissions">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([roleKey, roleLabel]) => (
                    <SelectItem key={roleKey} value={roleKey}>
                      <div className="flex items-center gap-2">
                        <Badge className={roleColors[roleKey as keyof typeof roleColors]}>
                          {roleLabel}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRole && (
              <div className="border-t pt-4" data-testid="role-permissions-section">
                <p className="text-sm font-medium mb-3 text-blue-600">
                  Configure as permissões para {roleLabels[selectedRole as keyof typeof roleLabels]}: ({rolePermissions.length} permissões carregadas)
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Total de permissões disponíveis: {availablePermissions.length}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-900 p-4 rounded" data-testid="permissions-grid">
                  {availablePermissions.map((permission) => {
                    const hasPermission = rolePermissions.some(
                      (p: any) => p.role === selectedRole && p.permission === permission && p.isGranted
                    );
                    
                    return (
                      <div
                        key={permission}
                        className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-sm">
                            {permissionLabels[permission]}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({permission})
                          </span>
                        </div>
                        <Switch
                          checked={hasPermission}
                          onCheckedChange={(checked) => {
                            toggleRolePermissionMutation.mutate({
                              role: selectedRole,
                              permission,
                              isGranted: checked
                            });
                          }}
                          data-testid={`switch-permission-${permission}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Job Status Permissions Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissões por Status de Vaga
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-status-select">Selecionar Função</Label>
              <Select
                value={selectedRoleForStatus}
                onValueChange={(value) => {
                  setSelectedRoleForStatus(value);
                  setLocalJobStatusPermissions({});
                }}
              >
                <SelectTrigger data-testid="select-role-status-permissions">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([roleKey, roleLabel]) => (
                    <SelectItem key={roleKey} value={roleKey}>
                      <div className="flex items-center gap-2">
                        <Badge className={roleColors[roleKey as keyof typeof roleColors]}>
                          {roleLabel}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRoleForStatus && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">
                  Configure as permissões de visualização e edição de vagas por status para{" "}
                  {roleLabels[selectedRoleForStatus as keyof typeof roleLabels]}
                </p>
                <div className="space-y-3">
                  {jobStatuses.map((status: any) => {
                    const perms = jobStatusPermissions[status.id] || { canView: false, canEdit: false };
                    
                    return (
                      <div
                        key={status.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex-1">
                          <span className="font-medium">{status.name}</span>
                          {status.description && (
                            <p className="text-xs text-gray-500 mt-1">{status.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Visualizar</Label>
                            <Switch
                              checked={perms.canView}
                              onCheckedChange={(checked) => {
                                setLocalJobStatusPermissions(prev => ({
                                  ...prev,
                                  [status.id]: { ...perms, canView: checked }
                                }));
                              }}
                              data-testid={`switch-view-${status.id}`}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Editar</Label>
                            <Switch
                              checked={perms.canEdit}
                              onCheckedChange={(checked) => {
                                setLocalJobStatusPermissions(prev => ({
                                  ...prev,
                                  [status.id]: { ...perms, canEdit: checked }
                                }));
                              }}
                              data-testid={`switch-edit-${status.id}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRoleForStatus("admin");
                      setLocalJobStatusPermissions({});
                    }}
                    data-testid="button-cancel-status-perms"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      const permsArray = jobStatuses.map((status: any) => ({
                        jobStatusId: status.id,
                        canView: jobStatusPermissions[status.id]?.canView || false,
                        canEdit: jobStatusPermissions[status.id]?.canEdit || false
                      }));
                      
                      updateRoleJobStatusPermsMutation.mutate({
                        role: selectedRoleForStatus,
                        permissions: permsArray
                      });
                    }}
                    disabled={updateRoleJobStatusPermsMutation.isPending}
                    data-testid="button-save-status-perms"
                  >
                    {updateRoleJobStatusPermsMutation.isPending ? "Salvando..." : "Salvar Permissões"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}