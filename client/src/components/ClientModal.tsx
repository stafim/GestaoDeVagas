import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertClientSchema, insertClientEmployeeSchema, type Client, type ClientEmployee, type SelectClientProfessionLimit, type Profession } from "@shared/schema";
import { getAllCities, BRAZILIAN_STATES } from "@shared/constants";
import { FileText, Upload, Download, Trash2, UserPlus, Pencil, Users, Search } from "lucide-react";

interface ClientModalProps {
  clientId?: string;
  onClose: () => void;
}

const formSchema = insertClientSchema.extend({
  name: z.string().min(1, "Nome é obrigatório"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ClientModal({ clientId, onClose }: ClientModalProps) {
  const { toast } = useToast();
  const isEditing = !!clientId;
  const [cities] = useState(getAllCities());
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [uploadingContract, setUploadingContract] = useState(false);
  const [deletingContract, setDeletingContract] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<ClientEmployee | null>(null);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [selectedProfession, setSelectedProfession] = useState<string>("");
  const [maxJobsForProfession, setMaxJobsForProfession] = useState<number>(0);

  const { data: client } = useQuery<Client>({
    queryKey: ["/api/clients", clientId],
    enabled: isEditing,
  });

  const { data: employees = [] } = useQuery<ClientEmployee[]>({
    queryKey: ["/api/clients", clientId, "employees"],
    enabled: isEditing && !!clientId,
  });

  const { data: costCenters = [] } = useQuery<any[]>({
    queryKey: ["/api/cost-centers"],
    enabled: isEditing,
  });

  const { data: clientJobs = [] } = useQuery<any[]>({
    queryKey: ["/api/jobs"],
    enabled: isEditing && !!clientId,
    select: (jobs) => jobs.filter((job: any) => job.clientId === clientId),
  });

  const { data: professions = [] } = useQuery<Profession[]>({
    queryKey: ["/api/professions"],
  });

  const { data: professionLimits = [] } = useQuery<SelectClientProfessionLimit[]>({
    queryKey: ["/api/clients", clientId, "profession-limits"],
    enabled: isEditing && !!clientId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        contactPerson: client.contactPerson || "",
        phone: client.phone || "",
        email: client.email || "",
        address: client.address || "",
        city: client.city || "",
        state: client.state || "",
        notes: client.notes || "",
      });
    }
  }, [client, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContractFile(file);
    }
  };

  const handleUploadContract = async () => {
    if (!contractFile || !clientId) return;

    try {
      setUploadingContract(true);
      const formData = new FormData();
      formData.append('contract', contractFile);

      const response = await fetch(`/api/clients/${clientId}/contract`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar contrato');
      }

      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId] });

      toast({
        title: "Sucesso",
        description: "Contrato enviado com sucesso!",
      });

      setContractFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar contrato",
        variant: "destructive",
      });
    } finally {
      setUploadingContract(false);
    }
  };

  const handleDownloadContract = () => {
    if (!clientId) return;
    window.open(`/api/clients/${clientId}/contract`, '_blank');
  };

  const handleDeleteContract = async () => {
    if (!clientId) return;

    try {
      setDeletingContract(true);
      const response = await fetch(`/api/clients/${clientId}/contract`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Falha ao remover contrato');
      }

      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId] });

      toast({
        title: "Sucesso",
        description: "Contrato removido com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover contrato",
        variant: "destructive",
      });
    } finally {
      setDeletingContract(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing) {
        return await apiRequest("PUT", `/api/clients/${clientId}`, data);
      }
      return await apiRequest("POST", "/api/clients", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Sucesso",
        description: `Cliente ${isEditing ? "atualizado" : "criado"} com sucesso!`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || `Erro ao ${isEditing ? "atualizar" : "criar"} cliente`,
        variant: "destructive",
      });
    },
  });

  const employeeFormSchema = insertClientEmployeeSchema.extend({
    name: z.string().min(1, "Nome é obrigatório"),
    clientId: z.string(),
  });

  const employeeForm = useForm({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      position: "",
      status: "ativo" as "ativo" | "desligado" | "ferias" | "afastamento",
      clientId: clientId || "",
      costCenterId: "",
    },
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingEmployee) {
        return await apiRequest("PUT", `/api/client-employees/${editingEmployee.id}`, data);
      }
      return await apiRequest("POST", "/api/client-employees", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId, "employees"] });
      toast({
        title: "Sucesso",
        description: `Funcionário ${editingEmployee ? "atualizado" : "adicionado"} com sucesso!`,
      });
      setShowEmployeeForm(false);
      setEditingEmployee(null);
      employeeForm.reset({
        name: "",
        position: "",
        status: "ativo" as const,
        clientId: clientId || "",
        costCenterId: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar funcionário",
        variant: "destructive",
      });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      return await apiRequest("DELETE", `/api/client-employees/${employeeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId, "employees"] });
      toast({
        title: "Sucesso",
        description: "Funcionário removido com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover funcionário",
        variant: "destructive",
      });
    },
  });

  const addProfessionLimitMutation = useMutation({
    mutationFn: async (data: { professionId: string; maxJobs: number }) => {
      return await apiRequest("POST", `/api/clients/${clientId}/profession-limits`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId, "profession-limits"] });
      toast({
        title: "Sucesso",
        description: "Limite de profissão adicionado com sucesso!",
      });
      setSelectedProfession("");
      setMaxJobsForProfession(0);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar limite de profissão",
        variant: "destructive",
      });
    },
  });

  const deleteProfessionLimitMutation = useMutation({
    mutationFn: async (limitId: string) => {
      return await apiRequest("DELETE", `/api/client-profession-limits/${limitId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId, "profession-limits"] });
      toast({
        title: "Sucesso",
        description: "Limite de profissão removido com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover limite de profissão",
        variant: "destructive",
      });
    },
  });

  const handleAddProfessionLimit = () => {
    if (!selectedProfession || maxJobsForProfession <= 0) {
      toast({
        title: "Erro",
        description: "Selecione uma profissão e defina um limite válido",
        variant: "destructive",
      });
      return;
    }

    addProfessionLimitMutation.mutate({
      professionId: selectedProfession,
      maxJobs: maxJobsForProfession,
    });
  };

  const handleEditEmployee = (employee: ClientEmployee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
    employeeForm.reset({
      name: employee.name,
      position: employee.position || "",
      status: employee.status as "ativo" | "desligado" | "ferias" | "afastamento",
      clientId: employee.clientId,
      costCenterId: (employee as any).costCenterId || "",
    });
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowEmployeeForm(true);
    employeeForm.reset({
      name: "",
      position: "",
      status: "ativo" as "ativo" | "desligado" | "ferias" | "afastamento",
      clientId: clientId || "",
      costCenterId: "",
    });
  };

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const onEmployeeSubmit = (data: any) => {
    createEmployeeMutation.mutate(data);
  };

  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      ativo: "Ativo",
      desligado: "Desligado",
      ferias: "Férias",
      afastamento: "Afastamento",
    };
    return statusLabels[status] || status;
  };

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

  // Filtra funcionários com base no termo de busca
  const filteredEmployees = employees.filter((employee) => {
    if (!employeeSearchTerm) return true;
    
    const searchLower = employeeSearchTerm.toLowerCase();
    const name = employee.name.toLowerCase();
    const position = (employee.position || "").toLowerCase();
    const costCenter = costCenters.find((cc: any) => cc.id === (employee as any).costCenterId);
    const costCenterName = costCenter ? costCenter.name.toLowerCase() : "";
    const statusLabel = getStatusLabel(employee.status).toLowerCase();
    
    return (
      name.includes(searchLower) ||
      position.includes(searchLower) ||
      costCenterName.includes(searchLower) ||
      statusLabel.includes(searchLower)
    );
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="title-client-modal">
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do cliente"
              : "Preencha os dados do novo cliente"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Informações Básicas
              </h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: João Silva Construções"
                        {...field}
                        data-testid="input-client-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pessoa de Contato</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: João Silva"
                        {...field}
                        data-testid="input-contact-person"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 98765-4321"
                          {...field}
                          data-testid="input-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contato@exemplo.com"
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Endereço
              </h3>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço Completo</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Rua, número, bairro, complemento..."
                        {...field}
                        data-testid="input-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-city">
                            <SelectValue placeholder="Selecione a cidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-state">
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BRAZILIAN_STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Limites por Profissão */}
            {isEditing && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Limites de Vagas por Profissão
                </h3>

                {/* Formulário para adicionar limite */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="text-sm font-medium mb-3">Adicionar Limite</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Select
                      value={selectedProfession}
                      onValueChange={setSelectedProfession}
                    >
                      <SelectTrigger data-testid="select-profession-limit">
                        <SelectValue placeholder="Selecione a profissão" />
                      </SelectTrigger>
                      <SelectContent>
                        {professions
                          .filter((prof) => !professionLimits.some((limit) => limit.professionId === prof.id))
                          .map((profession) => (
                            <SelectItem key={profession.id} value={profession.id}>
                              {profession.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      placeholder="Máximo de vagas"
                      value={maxJobsForProfession || ""}
                      onChange={(e) => setMaxJobsForProfession(Number(e.target.value) || 0)}
                      min={0}
                      data-testid="input-profession-max-jobs"
                    />

                    <Button
                      type="button"
                      onClick={handleAddProfessionLimit}
                      disabled={!selectedProfession || maxJobsForProfession <= 0 || addProfessionLimitMutation.isPending}
                      data-testid="button-add-profession-limit"
                    >
                      {addProfessionLimitMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2" />
                          Adicionando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus mr-2" />
                          Adicionar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Tabela de limites existentes */}
                {professionLimits.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Profissão</TableHead>
                          <TableHead>Limite Máximo</TableHead>
                          <TableHead>Vagas Abertas</TableHead>
                          <TableHead>Disponíveis</TableHead>
                          <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {professionLimits.map((limit) => {
                          const profession = professions.find((p) => p.id === limit.professionId);
                          const jobsForProfession = clientJobs.filter(
                            (job: any) => job.professionId === limit.professionId &&
                            !['admitido', 'cancelada'].includes(job.status)
                          ).length;
                          const available = limit.maxJobs - jobsForProfession;

                          return (
                            <TableRow key={limit.id}>
                              <TableCell className="font-medium">
                                {profession?.name || "Profissão desconhecida"}
                              </TableCell>
                              <TableCell>{limit.maxJobs}</TableCell>
                              <TableCell>{jobsForProfession}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={available > 0 ? "default" : "destructive"}
                                  data-testid={`badge-profession-available-${limit.id}`}
                                >
                                  {available >= 0 ? available : 0}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteProfessionLimitMutation.mutate(limit.id)}
                                  disabled={deleteProfessionLimitMutation.isPending}
                                  data-testid={`button-delete-profession-limit-${limit.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                    <i className="fas fa-briefcase h-12 w-12 mx-auto mb-2 opacity-50"></i>
                    <p className="text-sm">Nenhum limite de profissão configurado</p>
                    <p className="text-xs mt-1">
                      Configure limites específicos para cada profissão
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Contrato */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Contrato
              </h3>

              {/* Upload de Contrato */}
              {isEditing && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Documento do Contrato
                  </h4>
                  
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {client?.contractFileName || "Nenhum contrato enviado"}
                          </p>
                          {client?.contractFileName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Clique nos botões ao lado para baixar ou remover o contrato
                            </p>
                          )}
                        </div>
                      </div>
                      {client?.contractFileName && (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadContract}
                            data-testid="button-download-contract"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteContract}
                            disabled={deletingContract}
                            data-testid="button-delete-contract"
                          >
                            {deletingContract ? (
                              <i className="fas fa-spinner fa-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="flex-1"
                        data-testid="input-contract-file"
                      />
                      <Button
                        type="button"
                        onClick={handleUploadContract}
                        disabled={!contractFile || uploadingContract}
                        data-testid="button-upload-contract"
                      >
                        {uploadingContract ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Enviar
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                    </p>
                  </div>
                </div>
              )}

              {!isEditing && (
                <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                  ℹ️ Após criar o cliente, você poderá fazer upload do contrato editando o cadastro.
                </p>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Observações
              </h3>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informações adicionais sobre o cliente..."
                        rows={4}
                        {...field}
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dados do Contrato */}
            {isEditing && (
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Dados do Contrato
                    </h3>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddEmployee}
                    size="sm"
                    data-testid="button-add-employee"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Funcionário
                  </Button>
                </div>

                {showEmployeeForm && (
                  <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                    <h4 className="text-sm font-medium">
                      {editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}
                    </h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={employeeForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nome do funcionário"
                                    {...field}
                                    data-testid="input-employee-name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={employeeForm.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cargo</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Cargo do funcionário"
                                    {...field}
                                    value={field.value || ""}
                                    data-testid="input-employee-position"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={employeeForm.control}
                            name="costCenterId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Centro de Custo</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-employee-cost-center">
                                      <SelectValue placeholder="Selecione o centro de custo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="">Nenhum</SelectItem>
                                    {costCenters.map((cc: any) => (
                                      <SelectItem key={cc.id} value={cc.id}>
                                        {cc.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={employeeForm.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-employee-status">
                                      <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="desligado">Desligado</SelectItem>
                                    <SelectItem value="ferias">Férias</SelectItem>
                                    <SelectItem value="afastamento">Afastamento</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowEmployeeForm(false);
                              setEditingEmployee(null);
                            }}
                            data-testid="button-cancel-employee"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            onClick={() => employeeForm.handleSubmit(onEmployeeSubmit)()}
                            disabled={createEmployeeMutation.isPending}
                            data-testid="button-save-employee"
                          >
                            {createEmployeeMutation.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-2" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-save mr-2" />
                                {editingEmployee ? "Atualizar" : "Adicionar"}
                              </>
                            )}
                          </Button>
                        </div>
                    </div>
                  </div>
                )}

                {employees.length > 0 ? (
                  <div className="space-y-3">
                    {/* Campo de busca */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar funcionários por nome, cargo, centro de custo ou status..."
                        value={employeeSearchTerm}
                        onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-employees"
                      />
                    </div>

                    {/* Tabela de funcionários */}
                    {filteredEmployees.length > 0 ? (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
                              <TableHead>Cargo</TableHead>
                              <TableHead>Centro de Custo</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredEmployees.map((employee) => (
                              <TableRow key={employee.id} data-testid={`row-employee-${employee.id}`}>
                                <TableCell className="font-medium">{employee.name}</TableCell>
                                <TableCell>{employee.position || "-"}</TableCell>
                                <TableCell>
                                  {(() => {
                                    const costCenter = costCenters.find((cc: any) => cc.id === (employee as any).costCenterId);
                                    return costCenter ? costCenter.name : "-";
                                  })()}
                                </TableCell>
                                <TableCell className="text-center">
                                  {getStatusBadge(employee.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditEmployee(employee)}
                                      data-testid={`button-edit-employee-${employee.id}`}
                                    >
                                      <Pencil className="h-4 w-4 text-primary" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteEmployeeMutation.mutate(employee.id)}
                                      disabled={deleteEmployeeMutation.isPending}
                                      data-testid={`button-delete-employee-${employee.id}`}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                      </TableBody>
                    </Table>
                  </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                        <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum funcionário encontrado</p>
                        <p className="text-xs mt-1">
                          Tente outro termo de busca
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum funcionário cadastrado</p>
                    <p className="text-xs mt-1">
                      Clique em "Adicionar Funcionário" para começar
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-submit-client"
              >
                {createMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    {isEditing ? "Atualizar" : "Criar"} Cliente
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
