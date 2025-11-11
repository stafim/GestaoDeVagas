import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  Briefcase, 
  Building2,
  UserCheck,
  Users, 
  Shield, 
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ClipboardCheck,
  Monitor,
  DollarSign,
  Package,
  GitBranch,
  CheckCircle
} from "lucide-react";
import logoImage from "@assets/Screenshot_20250930_142224_Chrome~2_1759253037075.jpg";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

// Client navigation items
const clientNavigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    description: "Visão geral do sistema"
  },
  {
    name: "Vagas",
    href: "/jobs",
    icon: Briefcase,
    description: "Gerenciar vagas de emprego",
    badge: "Novo"
  },
  {
    name: "Kanban",
    href: "/kanban",
    icon: BarChart3,
    description: "Pipeline de candidatos"
  },
  {
    name: "Empresas",
    href: "/companies",
    icon: Building2,
    description: "Cadastro de empresas"
  },
  {
    name: "Clientes",
    href: "/clients",
    icon: UserCheck,
    description: "Cadastro de clientes"
  },
  {
    name: "Usuários",
    href: "/users",
    icon: Users,
    description: "Gerenciar usuários"
  },
  {
    name: "Permissões",
    href: "/permissions",
    icon: Shield,
    description: "Controle de acesso"
  },
  {
    name: "Workflow",
    href: "/workflow",
    icon: GitBranch,
    description: "Aprovação de vagas"
  },
  {
    name: "Aprovações",
    href: "/aprovacoes",
    icon: CheckCircle,
    description: "Aprovar ou rejeitar vagas"
  },
  {
    name: "Fechamento de Vagas",
    href: "/reports/job-closure",
    icon: ClipboardCheck,
    description: "Ranking de recrutadores"
  },
];

// Admin navigation items (Super Admin only)
const adminNavigationItems = [
  {
    name: "Organizações",
    href: "/organizations",
    icon: Building2,
    description: "Gerenciar organizações clientes"
  },
  {
    name: "Planos",
    href: "/planos",
    icon: Package,
    description: "Planos de venda do sistema"
  },
  {
    name: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
    description: "Faturas e pagamentos"
  },
];

const bottomNavItems = [
  {
    name: "Configurações",
    href: "/settings",
    icon: Settings,
    description: "Configurações do sistema"
  },
  {
    name: "Documentação do Sistema",
    href: "/help",
    icon: HelpCircle,
    description: "Manual completo do sistema"
  },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Get current user from API
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Get accessible menus for the current user
  const { data: accessibleMenus } = useQuery<string[]>({
    queryKey: ["/api/permissions/menu", currentUser?.id, "accessible"],
    enabled: !!currentUser?.id,
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      
      // Clear all queries
      await queryClient.invalidateQueries();
      queryClient.clear();
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      
      // Redirect to login page
      setLocation("/login-demo");
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar sair do sistema.",
        variant: "destructive",
      });
    }
  };

  // Check if user is super admin
  const isSuperAdmin = currentUser?.role === 'super_admin';
  
  // Filter navigation items based on user permissions
  // Super admins ONLY see admin navigation items (Organizations, Plans, Financial)
  // null = no permissions configured (show all menus by default)
  // [] = permissions configured but no access (show no menus)
  // [items] = show only the accessible menus
  const filteredClientNavigationItems = isSuperAdmin ? [] : clientNavigationItems.filter(item => {
    if (accessibleMenus === null || accessibleMenus === undefined) {
      return true; // No permissions configured, show all menus
    }
    if (Array.isArray(accessibleMenus) && accessibleMenus.length === 0) {
      return false; // Permissions configured but user has no access
    }
    return (accessibleMenus as string[]).includes(item.href);
  });

  // Admin items are only visible to Master Admins (users without organizationId) or Super Admins
  const isMasterAdmin = currentUser?.organizationId === null || isSuperAdmin;
  
  const filteredAdminNavigationItems = isMasterAdmin ? adminNavigationItems.filter(item => {
    if (accessibleMenus === null || accessibleMenus === undefined) {
      return true; // No permissions configured, show all menus
    }
    if (Array.isArray(accessibleMenus) && accessibleMenus.length === 0) {
      return false; // Permissions configured but user has no access
    }
    return (accessibleMenus as string[]).includes(item.href);
  }) : [];

  const filteredBottomNavItems = bottomNavItems.filter(item => {
    if (accessibleMenus === null || accessibleMenus === undefined) {
      return true; // No permissions configured, show all menus
    }
    if (Array.isArray(accessibleMenus) && accessibleMenus.length === 0) {
      return false; // Permissions configured but user has no access
    }
    return (accessibleMenus as string[]).includes(item.href);
  });

  return (
    <nav className="hidden md:flex md:w-72 md:flex-col">
      <div className="flex flex-col flex-grow bg-card border-r border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center flex-shrink-0 px-6 py-6">
          <div className="flex items-center">
            <img 
              src={logoImage} 
              alt="VagasPro Logo" 
              className="w-12 h-12 object-contain"
            />
            <div className="ml-3">
              <p className="text-xs text-muted-foreground">Gestão de Vagas</p>
            </div>
          </div>
        </div>

        <Separator className="mx-6" />

        {/* Navigation */}
        <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {/* Client Section - Hidden for super admins */}
          {!isSuperAdmin && filteredClientNavigationItems.length > 0 && (
            <div className="mb-3">
              <div className="px-3 mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Cliente
                </p>
              </div>
              {filteredClientNavigationItems.map((item) => {
              const isActive = location === item.href || location.startsWith(item.href + "/");
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    data-testid={`link-${item.name.toLowerCase().replace(" ", "-")}`}
                    title={item.description}
                  >
                    <div className="flex items-center">
                      <Icon className={cn(
                        "h-5 w-5 mr-3 transition-colors",
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground",
                        item.name === "Tempo Real" && "animate-pulse text-red-500"
                      )} />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className={cn(
                          "text-xs",
                          isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {item.description}
                        </span>
                      </div>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          )}

          {/* Admin Section - Only show if there are items */}
          {filteredAdminNavigationItems.length > 0 && (
            <>
              <Separator className="my-3" />
              <div className="mb-3">
                <div className="px-3 mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Administrador
                  </p>
                </div>
                {filteredAdminNavigationItems.map((item) => {
                  const isActive = location === item.href || location.startsWith(item.href + "/");
                  const Icon = item.icon;
                  
                  return (
                    <Link key={item.name} href={item.href}>
                      <div
                        className={cn(
                          "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                        data-testid={`link-${item.name.toLowerCase().replace(" ", "-")}`}
                        title={item.description}
                      >
                        <div className="flex items-center">
                          <Icon className={cn(
                            "h-5 w-5 mr-3 transition-colors",
                            isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                          )} />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{item.name}</span>
                            <span className={cn(
                              "text-xs",
                              isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              {item.description}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          <Separator className="my-3" />

          {/* Bottom Navigation */}
          <div className="space-y-1">
            {filteredBottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    data-testid={`link-${item.name.toLowerCase()}`}
                    title={item.description}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Profile */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-2 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-semibold text-primary-foreground">U</span>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {currentUser?.firstName && currentUser?.lastName 
                    ? `${currentUser.firstName} ${currentUser.lastName}` 
                    : currentUser?.email || "Demo User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentUser?.role === "admin" ? "Administrador" : "Usuário"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
              data-testid="button-logout"
              title="Sair do sistema"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
