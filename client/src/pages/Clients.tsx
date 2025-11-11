import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Client } from "@shared/schema";
import TopBar from "@/components/TopBar";
import ClientModal from "@/components/ClientModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, MapPin, Phone, Mail, Pencil, Trash2, FileText, CheckCircle, Briefcase, Users, Search, Download, RefreshCw, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Clients() {
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | undefined>();
  const [deletingClientId, setDeletingClientId] = useState<string | undefined>();
  const [viewingEmployeesClientId, setViewingEmployeesClientId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState<string>("all");

  const { toast } = useToast();

  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: viewingClientEmployees = [] } = useQuery<any[]>({
    queryKey: ["/api/clients", viewingEmployeesClientId, "employees"],
    enabled: !!viewingEmployeesClientId,
  });

  const { data: costCenters = [] } = useQuery<any[]>({
    queryKey: ["/api/cost-centers"],
    enabled: !!viewingEmployeesClientId,
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      await apiRequest("DELETE", `/api/clients/${clientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso!",
      });
      setDeletingClientId(undefined);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente.",
        variant: "destructive",
      });
    },
  });

  const syncClientsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/senior/sync-clients");
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Sincronização Concluída",
        description: data.message || `${data.imported || 0} clientes importados, ${data.updated || 0} atualizados`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Sincronização",
        description: error.message || "Erro ao sincronizar clientes da Senior",
        variant: "destructive",
      });
    },
  });

  const handleEditClient = (clientId: string) => {
    setEditingClientId(clientId);
    setShowClientModal(true);
  };

  const handleCloseModal = () => {
    setShowClientModal(false);
    setEditingClientId(undefined);
  };

  const handleDeleteClient = (clientId: string) => {
    deleteClientMutation.mutate(clientId);
  };

  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.contactPerson?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: "Ativo", variant: "default" as const },
      desligado: { label: "Desligado", variant: "destructive" as const },
      ferias: { label: "Férias", variant: "secondary" as const },
      afastamento: { label: "Afastamento", variant: "outline" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const viewingClient = clients?.find(c => c.id === viewingEmployeesClientId);

  const filteredEmployees = viewingClientEmployees.filter((employee) => {
    // Filtro principal: apenas funcionários em centros de custo com "localiza"
    const costCenter = costCenters.find((cc: any) => cc.id === employee.costCenterId);
    const isLocalizaCostCenter = costCenter?.name?.toLowerCase().includes('localiza');
    
    if (!isLocalizaCostCenter) return false;
    
    // Filtro por status
    if (employeeStatusFilter !== "all" && employee.status !== employeeStatusFilter) {
      return false;
    }
    
    // Filtro de busca por nome, cargo, centro de custo
    if (!employeeSearch) return true;
    
    const searchLower = employeeSearch.toLowerCase();
    const nameMatch = employee.name?.toLowerCase().includes(searchLower);
    const positionMatch = employee.position?.toLowerCase().includes(searchLower);
    const costCenterMatch = costCenter?.name?.toLowerCase().includes(searchLower);
    
    const statusConfig = {
      ativo: "ativo",
      desligado: "desligado",
      ferias: "férias",
      afastamento: "afastamento",
    };
    const statusLabel = statusConfig[employee.status as keyof typeof statusConfig] || employee.status;
    const statusMatch = statusLabel.toLowerCase().includes(searchLower);
    
    return nameMatch || positionMatch || costCenterMatch || statusMatch;
  });

  return (
    <>
      <TopBar
        title="Clientes"
        showCreateButton
        onCreateClick={() => setShowClientModal(true)}
        createButtonText="Novo Cliente"
      />

      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Buscar clientes..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-clients"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => syncClientsMutation.mutate()}
                disabled={syncClientsMutation.isPending}
                data-testid="button-sync-senior-clients"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncClientsMutation.isPending ? 'animate-spin' : ''}`} />
                Importar da Senior
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredClients.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Cliente</TableHead>
                    <TableHead className="text-center">Vagas</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Contrato</TableHead>
                    <TableHead className="text-center">Max. Vagas</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead className="text-right w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <UserCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium" data-testid={`text-client-name-${client.id}`}>
                              {client.name}
                            </div>
                            {client.city && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {client.city} - {client.state}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" data-testid={`text-jobs-count-${client.id}`}>
                          {(client as any).jobsCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {client.contactPerson ? (
                          <span className="text-sm" data-testid={`text-contact-${client.id}`}>
                            {client.contactPerson}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.phone ? (
                          <div className="flex items-center gap-1 text-sm" data-testid={`text-phone-${client.id}`}>
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {client.phone}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.email ? (
                          <div className="flex items-center gap-1 text-sm" data-testid={`text-email-${client.id}`}>
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {client.email}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {client.contractFileName ? (
                          <div className="flex items-center justify-center gap-1" data-testid={`text-contract-${client.id}`}>
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-500 font-medium">Sim</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Não</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {client.maxJobs ? (
                          <span className="text-sm font-medium" data-testid={`text-maxjobs-${client.id}`}>
                            {client.maxJobs}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.address ? (
                          <div className="max-w-xs">
                            <span className="text-sm text-muted-foreground line-clamp-1" data-testid={`text-address-${client.id}`}>
                              {client.address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingEmployeesClientId(client.id)}
                            data-testid={`button-view-employees-${client.id}`}
                            title="Ver funcionários"
                          >
                            <Users className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClient(client.id)}
                            data-testid={`button-edit-client-${client.id}`}
                          >
                            <Pencil className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingClientId(client.id)}
                            data-testid={`button-delete-client-${client.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <UserCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum cliente encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {search ? "Tente ajustar sua busca" : "Comece cadastrando seu primeiro cliente"}
                </p>
                {!search && (
                  <Button onClick={() => setShowClientModal(true)} data-testid="button-create-first-client">
                    <i className="fas fa-plus mr-2"></i>
                    Novo Cliente
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client Modal */}
      {showClientModal && (
        <ClientModal
          clientId={editingClientId}
          onClose={handleCloseModal}
        />
      )}

      {/* Employees List Dialog */}
      <Dialog open={!!viewingEmployeesClientId} onOpenChange={() => {
        setViewingEmployeesClientId(undefined);
        setEmployeeSearch("");
        setEmployeeStatusFilter("all");
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="title-employees-modal">
              Funcionários - {viewingClient?.name}
            </DialogTitle>
            <DialogDescription>
              Lista de funcionários cadastrados para este cliente
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, cargo ou centro de custo..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="pl-9"
                data-testid="input-employee-search"
              />
            </div>
            <div className="w-48">
              <Select value={employeeStatusFilter} onValueChange={setEmployeeStatusFilter}>
                <SelectTrigger data-testid="select-employee-status-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="desligado">Desligado</SelectItem>
                  <SelectItem value="ferias">Férias</SelectItem>
                  <SelectItem value="afastamento">Afastamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredEmployees.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Centro de Custo</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} data-testid={`row-employee-${employee.id}`}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.position || "-"}</TableCell>
                      <TableCell>
                        {(() => {
                          const costCenter = costCenters.find((cc: any) => cc.id === employee.costCenterId);
                          return costCenter ? costCenter.name : "-";
                        })()}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(employee.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : viewingClientEmployees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhum funcionário cadastrado</p>
              <p className="text-sm">
                Este cliente ainda não possui funcionários cadastrados
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhum resultado encontrado</p>
              <p className="text-sm">
                Tente ajustar os termos de busca
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingClientId} onOpenChange={() => setDeletingClientId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingClientId && handleDeleteClient(deletingClientId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
