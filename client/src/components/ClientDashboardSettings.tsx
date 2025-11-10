import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Monitor, Users, BarChart3, FileText, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Client {
  id: string;
  name: string;
}

interface DashboardPermission {
  id: string;
  clientId: string;
  dashboardKey: string;
  isEnabled: boolean;
}

const DASHBOARD_TYPES = [
  { key: "realtime", label: "Tempo Real", icon: Monitor, description: "Dashboard de métricas em tempo real" },
  { key: "analytics", label: "Análises", icon: BarChart3, description: "Dashboard de análises avançadas" },
  { key: "reports", label: "Relatórios", icon: FileText, description: "Dashboard de relatórios gerenciais" },
];

export function ClientDashboardSettings() {
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<string>("all");

  // Fetch all clients
  const { data: clients = [], isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Fetch all permissions
  const { data: allPermissions = [], isLoading: isLoadingPermissions } = useQuery<DashboardPermission[]>({
    queryKey: ['/api/client-dashboard-permissions'],
  });

  // Mutation para criar/atualizar permissão
  const updatePermission = useMutation({
    mutationFn: async ({ clientId, dashboardKey, isEnabled }: { clientId: string; dashboardKey: string; isEnabled: boolean }) => {
      return await apiRequest('POST', '/api/client-dashboard-permissions', { clientId, dashboardKey, isEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-dashboard-permissions'] });
      toast({
        title: "Permissão atualizada",
        description: "A permissão de dashboard foi atualizada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar permissão de dashboard.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = async (clientId: string, dashboardKey: string, currentValue: boolean) => {
    await updatePermission.mutateAsync({
      clientId,
      dashboardKey,
      isEnabled: !currentValue,
    });
  };

  const getPermissionStatus = (clientId: string, dashboardKey: string): boolean => {
    const permission = allPermissions.find(
      (p) => p.clientId === clientId && p.dashboardKey === dashboardKey
    );
    return permission?.isEnabled ?? true; // Default habilitado
  };

  const filteredClients = selectedClientId === "all"
    ? clients
    : clients.filter((c) => c.id === selectedClientId);

  if (isLoadingClients || isLoadingPermissions) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Permissões de Dashboards por Cliente
            </CardTitle>
            <CardDescription>
              Configure quais dashboards cada cliente pode acessar no painel de tempo real
            </CardDescription>
          </div>
          <div className="w-72">
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger data-testid="select-client-filter">
                <SelectValue placeholder="Filtrar por cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredClients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum cliente cadastrado</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredClients.map((client) => (
              <div key={client.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {client.name}
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dashboard</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DASHBOARD_TYPES.map((dashboard) => {
                      const DashboardIcon = dashboard.icon;
                      const isEnabled = getPermissionStatus(client.id, dashboard.key);
                      return (
                        <TableRow key={dashboard.key}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DashboardIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{dashboard.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {dashboard.description}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-sm text-muted-foreground">
                                {isEnabled ? "Habilitado" : "Desabilitado"}
                              </span>
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={() => handleToggle(client.id, dashboard.key, isEnabled)}
                                disabled={updatePermission.isPending}
                                data-testid={`switch-${client.id}-${dashboard.key}`}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
