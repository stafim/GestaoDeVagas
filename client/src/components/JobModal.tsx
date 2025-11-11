import { useState, useEffect } from "react";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobSchema, type InsertJob, type JobWithDetails, type CompaniesListResponse, type Profession, type Client, type WorkScale, type Employee, type SelectClientProfessionLimit } from "@shared/schema";
import { getAllCities } from "@shared/constants";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const jobFormSchema = z.object({
  professionId: z.string().min(1, "Profissão é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  costCenterId: z.string().optional(),
  costCenterDescription: z.string().optional(),
  workPosition: z.string().optional(),
  department: z.string().min(1, "Departamento é obrigatório"),
  location: z.string().min(1, "Cidade é obrigatória"),
  contractType: z.enum(["clt", "pj", "freelancer", "estagio", "temporario"], {
    required_error: "Tipo de contrato é obrigatório"
  }),
  jobType: z.enum(["produtiva", "improdutiva"], {
    required_error: "Tipo de vaga é obrigatório"
  }),
  status: z.string().default("aberto"),
  
  // Novos campos detalhados
  openingDate: z.string().min(1, "Data de abertura é obrigatória"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  openingReason: z.enum(["substituicao", "aumento_quadro"], {
    required_error: "Motivo de abertura é obrigatório"
  }),
  replacementEmployeeName: z.string().optional(),
  ageRangeMin: z.string().min(1, "Idade mínima é obrigatória"),
  ageRangeMax: z.string().min(1, "Idade máxima é obrigatória"),
  specifications: z.string().min(1, "Especificações da vaga são obrigatórias"),
  clientId: z.string().min(1, "Cliente é obrigatório"),
  vacancyQuantity: z.string().min(1, "Quantidade de vagas é obrigatória"),
  gender: z.enum(["masculino", "feminino", "indiferente"], {
    required_error: "Sexo é obrigatório"
  }),
  workScaleId: z.string().min(1, "Escala de trabalho é obrigatória"),
  workHours: z.string().min(1, "Horário de trabalho é obrigatório"),
  
  salaryMin: z.string().min(1, "Valor do salário é obrigatório"),
  salaryMax: z.string().optional().default(""),
  bonus: z.string().optional(),
  hasHazardPay: z.boolean().default(false),
  unhealthinessLevel: z.enum(["nao", "10", "20", "40"]).default("nao"),
  
  hasMealVoucher: z.boolean().default(false),
  hasFoodVoucher: z.boolean().default(false),
  hasTransportVoucher: z.boolean().default(false),
  hasHealthInsurance: z.boolean().default(false),
  hasChartered: z.boolean().default(false),
  
  kanbanBoardId: z.string().optional(),
  approvalWorkflowId: z.string().min(1, "Workflow de aprovação é obrigatório"),
}).refine((data) => {
  // Se o motivo for substituição, a quantidade deve ser 1
  if (data.openingReason === "substituicao") {
    const quantity = parseInt(data.vacancyQuantity || "1");
    return quantity === 1;
  }
  return true;
}, {
  message: "Para substituição, a quantidade de vagas deve ser 1",
  path: ["vacancyQuantity"],
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId?: string;
  initialClientId?: string;
}

type CostCenter = {
  id: string;
  name: string;
  code: string;
  companyId: string | null;
};

export default function JobModal({ isOpen, onClose, jobId, initialClientId }: JobModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!jobId;
  const [cities] = useState(getAllCities());
  const [professionPopoverOpen, setProfessionPopoverOpen] = useState(false);
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const [employeePopoverOpen, setEmployeePopoverOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clientHasNoPositions, setClientHasNoPositions] = useState(false);
  const [userAwareOfIrregularity, setUserAwareOfIrregularity] = useState(false);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [workPositionSearch, setWorkPositionSearch] = useState("");
  const [workPositionPopoverOpen, setWorkPositionPopoverOpen] = useState(false);

  // Função para obter a data de hoje no formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Função para calcular a data mínima de início (abertura + 14 dias)
  const getMinStartDate = (openingDate: string) => {
    if (!openingDate) return '';
    const opening = new Date(openingDate);
    opening.setDate(opening.getDate() + 14);
    const year = opening.getFullYear();
    const month = String(opening.getMonth() + 1).padStart(2, '0');
    const day = String(opening.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const { data: companies } = useQuery<CompaniesListResponse>({
    queryKey: ["/api/companies"],
  });

  const { data: professions } = useQuery<Profession[]>({
    queryKey: ["/api/professions"],
  });

  const { data: workPositions } = useQuery<any[]>({
    queryKey: ["/api/work-positions", workPositionSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (workPositionSearch) {
        params.append('search', workPositionSearch);
      }
      params.append('limit', '100');
      const response = await fetch(`/api/work-positions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch work positions');
      return response.json();
    },
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: workScales } = useQuery<WorkScale[]>({
    queryKey: ["/api/work-scales"],
  });

  const { data: workflows } = useQuery<any[]>({
    queryKey: ["/api/workflows"],
  });

  type KanbanBoard = {
    id: string;
    name: string;
    isDefault: boolean;
  };

  const { data: kanbanBoards = [] } = useQuery<KanbanBoard[]>({
    queryKey: ["/api/kanban-boards"],
  });

  const defaultKanban = kanbanBoards.find(board => board.isDefault) || kanbanBoards[0];

  type JobStatus = {
    id: string;
    key: string;
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    displayOrder: number;
    isActive: boolean;
  };

  const { data: jobStatuses = [] } = useQuery<JobStatus[]>({
    queryKey: ["/api/job-statuses"],
  });

  // Fetch job creation quota policy
  type SystemSetting = {
    key: string;
    value: string;
  };

  const { data: quotaPolicy } = useQuery<SystemSetting>({
    queryKey: ["/api/settings", "job_creation_quota_policy"],
    queryFn: async () => {
      const res = await fetch("/api/settings/job_creation_quota_policy", {
        credentials: "include",
      });
      if (!res.ok) {
        return { key: "job_creation_quota_policy", value: "require_approval" };
      }
      return res.json();
    },
  });

  const { data: jobData } = useQuery<JobWithDetails>({
    queryKey: ["/api/jobs", jobId],
    enabled: isEditing,
  });

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      professionId: "",
      description: "",
      department: "",
      location: "",
      workPosition: "",
      costCenterDescription: "",
      status: "aberto",
      vacancyQuantity: "1",
      unhealthinessLevel: "nao",
      hasHazardPay: false,
      hasMealVoucher: false,
      hasFoodVoucher: false,
      hasTransportVoucher: false,
      hasHealthInsurance: false,
      hasChartered: false,
      salaryMin: "",
      openingDate: getTodayDate(),
      kanbanBoardId: defaultKanban?.id || "",
    },
  });

  // Set default kanban when creating a new job
  React.useEffect(() => {
    if (!isEditing && defaultKanban && !form.getValues("kanbanBoardId")) {
      form.setValue("kanbanBoardId", defaultKanban.id);
    }
  }, [isEditing, defaultKanban, form]);

  // Set initial client when provided (from RealTime dashboard)
  React.useEffect(() => {
    if (!isEditing && initialClientId && !form.getValues("clientId")) {
      form.setValue("clientId", initialClientId);
    }
  }, [isEditing, initialClientId, form]);

  // Update form when job data is loaded
  React.useEffect(() => {
    if (isEditing && jobData && !form.formState.isDirty) {
      form.reset({
        professionId: jobData.professionId || "",
        description: jobData.description || "",
        department: jobData.department || "",
        location: jobData.location || "",
        companyId: jobData.companyId || undefined,
        costCenterId: jobData.costCenterId || undefined,
        costCenterDescription: jobData.costCenterDescription || "",
        workPosition: jobData.workPosition || "",
        contractType: jobData.contractType || "clt",
        jobType: jobData.jobType || undefined,
        status: jobData.status || "aberto",
        salaryMin: jobData.salaryMin || "",
        openingDate: jobData.openingDate ? new Date(jobData.openingDate).toISOString().split('T')[0] : undefined,
        startDate: jobData.startDate ? new Date(jobData.startDate).toISOString().split('T')[0] : undefined,
        openingReason: jobData.openingReason || undefined,
        replacementEmployeeName: jobData.replacementEmployeeName || "",
        ageRangeMin: jobData.ageRangeMin?.toString() || "",
        ageRangeMax: jobData.ageRangeMax?.toString() || "",
        specifications: jobData.specifications || "",
        clientId: jobData.clientId || "",
        vacancyQuantity: jobData.vacancyQuantity?.toString() || "1",
        gender: jobData.gender || "indiferente",
        workScaleId: jobData.workScaleId || undefined,
        workHours: jobData.workHours || "",
        bonus: jobData.bonus || "",
        hasHazardPay: jobData.hasHazardPay || false,
        unhealthinessLevel: jobData.unhealthinessLevel || "nao",
        hasMealVoucher: false,
        hasFoodVoucher: false,
        hasTransportVoucher: false,
        hasHealthInsurance: false,
        hasChartered: false,
        kanbanBoardId: jobData.kanbanBoardId || defaultKanban?.id || "",
      });
    }
  }, [isEditing, jobData, form, defaultKanban]);

  // Watch form values
  const selectedCompanyId = form.watch("companyId");
  const selectedProfessionId = form.watch("professionId");
  const selectedClientId = form.watch("clientId");
  const openingReason = form.watch("openingReason");

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/companies", selectedCompanyId, "employees"],
    enabled: !!selectedCompanyId,
  });

  // Load cost centers when company is selected
  useEffect(() => {
    const loadCostCenters = async () => {
      if (selectedCompanyId) {
        try {
          const response = await fetch(`/api/companies/${selectedCompanyId}/cost-centers`, {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            setCostCenters(data);
          } else {
            setCostCenters([]);
          }
        } catch (error) {
          console.error('Error loading cost centers:', error);
          setCostCenters([]);
        }
      } else {
        setCostCenters([]);
        // Clear cost center selection when company changes
        if (form.getValues('costCenterId')) {
          form.setValue('costCenterId', undefined);
        }
      }
    };
    loadCostCenters();
  }, [selectedCompanyId, form]);

  // Fetch selected client data and its employees
  const { data: selectedClient } = useQuery<any>({
    queryKey: ["/api/clients", selectedClientId],
    enabled: !!selectedClientId && !isEditing,
  });

  const { data: clientEmployees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/clients", selectedClientId, "employees"],
    enabled: !!selectedClientId && !isEditing,
  });

  // Get profession limits for selected client
  const { data: professionLimits = [] } = useQuery<SelectClientProfessionLimit[]>({
    queryKey: ["/api/clients", selectedClientId, "profession-limits"],
    enabled: !!selectedClientId && !isEditing,
  });

  // Get jobs for selected client and profession
  const { data: allJobs = [] } = useQuery<any[]>({
    queryKey: ["/api/jobs"],
    enabled: !!selectedClientId && !!selectedProfessionId && !isEditing,
  });

  // Get selected profession
  const selectedProfession = professions?.find(p => p.id === selectedProfessionId);

  // Check if selected profession has available positions for this client
  React.useEffect(() => {
    if (!isEditing && selectedClientId && selectedProfessionId && professionLimits && allJobs) {
      // Find the limit for this specific profession
      const professionLimit = professionLimits.find(
        (limit) => limit.professionId === selectedProfessionId
      );

      if (professionLimit) {
        // Count active jobs for this client and profession
        const activeJobsCount = allJobs.filter(
          (job: any) =>
            job.clientId === selectedClientId &&
            job.professionId === selectedProfessionId &&
            !['admitido', 'cancelada'].includes(job.status)
        ).length;

        const availablePositions = professionLimit.maxJobs - activeJobsCount;
        setClientHasNoPositions(availablePositions <= 0);
      } else {
        // No limit configured for this profession - allow creation
        setClientHasNoPositions(false);
      }
      
      // Reset awareness when client or profession changes
      setUserAwareOfIrregularity(false);
    } else {
      setClientHasNoPositions(false);
      setUserAwareOfIrregularity(false);
    }
  }, [isEditing, selectedClientId, selectedProfessionId, professionLimits, allJobs]);

  // Auto-adjust vacancy quantity when opening reason is "substituicao"
  React.useEffect(() => {
    if (openingReason === "substituicao") {
      form.setValue("vacancyQuantity", "1");
    }
  }, [openingReason, form]);

  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      // Convert form data to API format and remove invalid fields
      const apiData: any = {
        professionId: data.professionId,
        companyId: data.companyId,
        description: data.description || undefined,
        costCenterId: data.costCenterId || undefined,
        costCenterDescription: data.costCenterDescription || undefined,
        workPosition: data.workPosition || undefined,
        department: data.department || undefined,
        location: data.location || undefined,
        contractType: data.contractType,
        jobType: data.jobType || undefined,
        salaryMin: data.salaryMin || undefined,
        status: data.status,
        clientId: data.clientId || undefined,
        vacancyQuantity: data.vacancyQuantity ? parseInt(data.vacancyQuantity) : 1,
        gender: data.gender || undefined,
        workScaleId: data.workScaleId || undefined,
        workHours: data.workHours || undefined,
        bonus: data.bonus || undefined,
        hasHazardPay: data.hasHazardPay || undefined,
        unhealthinessLevel: data.unhealthinessLevel || undefined,
        openingDate: data.openingDate ? new Date(data.openingDate).toISOString() : undefined,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        openingReason: data.openingReason || undefined,
        replacementEmployeeName: data.replacementEmployeeName || undefined,
        ageRangeMin: data.ageRangeMin ? parseInt(data.ageRangeMin) : undefined,
        ageRangeMax: data.ageRangeMax ? parseInt(data.ageRangeMax) : undefined,
        specifications: data.specifications || undefined,
      };
      
      // Remove undefined values to keep payload clean
      Object.keys(apiData).forEach(key => {
        if (apiData[key] === undefined || apiData[key] === "" || apiData[key] === null) {
          delete apiData[key];
        }
      });
      
      const response = await apiRequest("POST", "/api/jobs", apiData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Sucesso",
        description: "Vaga criada com sucesso!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar vaga. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async (data: Partial<JobFormData>) => {
      // Convert form data to API format and remove invalid fields
      const apiData: any = {
        professionId: data.professionId,
        description: data.description || undefined,
        costCenterId: data.costCenterId || undefined,
        costCenterDescription: data.costCenterDescription || undefined,
        workPosition: data.workPosition || undefined,
        department: data.department || undefined,
        location: data.location || undefined,
        contractType: data.contractType,
        jobType: data.jobType || undefined,
        salaryMin: data.salaryMin || undefined,
        status: data.status,
        clientId: data.clientId || undefined,
        vacancyQuantity: data.vacancyQuantity ? parseInt(data.vacancyQuantity) : undefined,
        gender: data.gender || undefined,
        workScaleId: data.workScaleId || undefined,
        workHours: data.workHours || undefined,
        bonus: data.bonus || undefined,
        hasHazardPay: data.hasHazardPay || undefined,
        unhealthinessLevel: data.unhealthinessLevel || undefined,
        openingDate: data.openingDate ? new Date(data.openingDate).toISOString() : undefined,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        openingReason: data.openingReason || undefined,
        replacementEmployeeName: data.replacementEmployeeName || undefined,
        ageRangeMin: data.ageRangeMin ? parseInt(data.ageRangeMin) : undefined,
        ageRangeMax: data.ageRangeMax ? parseInt(data.ageRangeMax) : undefined,
        specifications: data.specifications || undefined,
      };
      
      // Remove undefined, empty string, and null values
      Object.keys(apiData).forEach(key => {
        if (apiData[key] === undefined || apiData[key] === "" || apiData[key] === null) {
          delete apiData[key];
        }
      });
      
      const response = await apiRequest("PUT", `/api/jobs/${jobId}`, apiData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", jobId] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Sucesso",
        description: "Vaga atualizada com sucesso!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar vaga. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Sucesso",
        description: "Vaga excluída com sucesso!",
      });
      setShowDeleteDialog(false);
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir vaga. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobFormData) => {
    const policy = quotaPolicy?.value || "require_approval";

    // Check quota policy when client has no available positions
    if (!isEditing && clientHasNoPositions) {
      if (policy === "block") {
        // Block: Completely prevent job creation
        toast({
          title: "Criação Bloqueada",
          description: "O cliente atingiu o limite de vagas. A criação de novas vagas está bloqueada pela política do sistema.",
          variant: "destructive",
        });
        return;
      } else if (policy === "require_approval" && !userAwareOfIrregularity) {
        // Require approval: User must acknowledge before creating
        toast({
          title: "Confirmação Necessária",
          description: "Você precisa confirmar estar ciente da situação irregular antes de criar esta vaga.",
          variant: "destructive",
        });
        return;
      }
      // If policy === "allow", no checks needed - proceed normally
    }

    if (isEditing) {
      updateJobMutation.mutate(data);
    } else {
      // Mark job as created with irregularity if user acknowledged it (only for require_approval policy)
      const jobData = {
        ...data,
        createdWithIrregularity: policy === "require_approval" && clientHasNoPositions && userAwareOfIrregularity
      };
      createJobMutation.mutate(jobData);
    }
  };

  const handleDelete = () => {
    deleteJobMutation.mutate();
  };

  const handleClose = () => {
    form.reset();
    setUserAwareOfIrregularity(false);
    setClientHasNoPositions(false);
    onClose();
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Vaga" : "Nova Vaga"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seção 1: Informações Básicas */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-client">
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
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
                  name="professionId"
                  render={({ field }) => {
                    const activeProfessions = Array.isArray(professions) 
                      ? professions.filter(p => p.isActive).sort((a, b) => 
                          (a.category || "").localeCompare(b.category || "") || a.name.localeCompare(b.name)
                        )
                      : [];
                    
                    const selectedProfession = activeProfessions.find(p => p.id === field.value);
                    
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel>Profissão *</FormLabel>
                        <Popover open={professionPopoverOpen} onOpenChange={setProfessionPopoverOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                data-testid="select-profession"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {selectedProfession ? (
                                  <>
                                    <span className="text-xs text-muted-foreground mr-2">
                                      {selectedProfession.category}
                                    </span>
                                    {selectedProfession.name}
                                  </>
                                ) : (
                                  "Digite para buscar uma profissão..."
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0">
                            <Command>
                              <CommandInput 
                                placeholder="Buscar profissão..." 
                                data-testid="input-search-profession"
                              />
                              <CommandList>
                                <CommandEmpty>Nenhuma profissão encontrada.</CommandEmpty>
                                <CommandGroup>
                                  {activeProfessions.map((profession) => (
                                    <CommandItem
                                      key={profession.id}
                                      value={`${profession.category} ${profession.name}`}
                                      onSelect={() => {
                                        form.setValue("professionId", profession.id);
                                        setProfessionPopoverOpen(false);
                                      }}
                                      data-testid={`profession-option-${profession.id}`}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          profession.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <span className="text-xs text-muted-foreground mr-2">
                                        {profession.category}
                                      </span>
                                      {profession.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {selectedProfession?.union && (
                  <FormItem>
                    <FormLabel>Sindicato</FormLabel>
                    <FormControl>
                      <Input value={selectedProfession.union} disabled className="bg-muted" />
                    </FormControl>
                  </FormItem>
                )}

                <FormField
                  control={form.control}
                  name="workPosition"
                  render={({ field }) => {
                    const selectedPosition = workPositions?.find(p => p.name === field.value);
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel>Posto de Trabalho</FormLabel>
                        <Popover open={workPositionPopoverOpen} onOpenChange={setWorkPositionPopoverOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                data-testid="button-work-position"
                                className={cn(
                                  "justify-between font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {selectedPosition?.name || "Buscar posto de trabalho..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0">
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder="Digite para buscar..."
                                value={workPositionSearch}
                                onValueChange={setWorkPositionSearch}
                                data-testid="input-work-position-search"
                              />
                              <CommandList>
                                <CommandEmpty>Nenhum posto de trabalho encontrado.</CommandEmpty>
                                <CommandGroup>
                                  {Array.isArray(workPositions) && workPositions.map((position: any) => (
                                    <CommandItem
                                      key={position.id}
                                      value={position.name}
                                      onSelect={() => {
                                        form.setValue("workPosition", position.name);
                                        setWorkPositionPopoverOpen(false);
                                        setWorkPositionSearch("");
                                      }}
                                      data-testid={`option-work-position-${position.id}`}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          position.name === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {position.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company">
                            <SelectValue placeholder="Selecione uma empresa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(companies) && companies.map((company: any) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
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
                  name="costCenterId"
                  render={({ field }) => {
                    const selectedCompanyId = form.watch("companyId");
                    const filteredCostCenters = selectedCompanyId 
                      ? costCenters.filter(cc => cc.companyId === selectedCompanyId)
                      : costCenters;

                    return (
                      <FormItem>
                        <FormLabel>Centro de Custo</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                          disabled={!selectedCompanyId}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-cost-center">
                              <SelectValue placeholder={selectedCompanyId ? "Selecione um centro de custo" : "Selecione primeiro uma empresa"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredCostCenters.length > 0 ? (
                              filteredCostCenters.map((costCenter) => (
                                <SelectItem key={costCenter.id} value={costCenter.id}>
                                  {costCenter.code} - {costCenter.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                Nenhum centro de custo disponível para esta empresa
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="approvalWorkflowId"
                  render={({ field }) => {
                    // Sort workflows - default workflow first
                    const sortedWorkflows = Array.isArray(workflows) 
                      ? [...workflows].sort((a, b) => {
                          if (a.isDefault && !b.isDefault) return -1;
                          if (!a.isDefault && b.isDefault) return 1;
                          return a.name.localeCompare(b.name);
                        })
                      : [];

                    return (
                      <FormItem>
                        <FormLabel>Workflow de Aprovação *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-approval-workflow">
                              <SelectValue placeholder="Selecione o workflow de aprovação" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sortedWorkflows.map((workflow) => (
                              <SelectItem key={workflow.id} value={workflow.id}>
                                {workflow.name} {workflow.isDefault ? "(Padrão)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              {/* Warning when client has no available positions */}
              {clientHasNoPositions && (() => {
                const policy = quotaPolicy?.value || "require_approval";
                
                // Policy: BLOCK - Show blocking message with no option to proceed
                if (policy === "block") {
                  return (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <i className="fas fa-ban text-red-600 dark:text-red-400 text-lg"></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                            🚫 Criação de Vaga Bloqueada
                          </h4>
                          <p className="text-sm text-red-800 dark:text-red-300">
                            O cliente selecionado já atingiu o número máximo de vagas para a profissão <strong>{selectedProfession?.name}</strong>.
                          </p>
                          <p className="text-sm text-red-800 dark:text-red-300 mt-2">
                            A <strong>política do sistema</strong> impede a criação de novas vagas quando o limite é atingido. 
                            Para prosseguir, é necessário <strong>aumentar o limite desta profissão no contrato do cliente</strong> ou <strong>selecionar outro cliente/profissão</strong>.
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-400 mt-3 italic">
                            💡 Para alterar esta política, acesse Configurações → Política de Criação de Vagas
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Policy: REQUIRE_APPROVAL - Show warning with acknowledgment button
                if (policy === "require_approval") {
                  if (!userAwareOfIrregularity) {
                    return (
                      <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-lg"></i>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                              ⚠️ Cliente Atingiu Limite para esta Profissão
                            </h4>
                            <p className="text-sm text-red-800 dark:text-red-300">
                              O cliente selecionado já atingiu o número máximo de vagas para a profissão <strong>{selectedProfession?.name}</strong>.
                            </p>
                            <p className="text-sm text-red-800 dark:text-red-300 mt-2">
                              Você pode criar esta vaga, mas ela será marcada como <strong>pré-reprovada</strong> e 
                              exigirá aprovação do gestor do contrato.
                            </p>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-red-200 dark:border-red-800">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-red-300 dark:border-red-700 text-red-900 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/50"
                            onClick={() => setUserAwareOfIrregularity(true)}
                            data-testid="button-aware-irregularity"
                          >
                            <i className="fas fa-check-circle mr-2"></i>
                            Estou Ciente e Desejo Criar Vaga Mesmo Assim
                          </Button>
                          <p className="text-xs text-red-700 dark:text-red-400 mt-2 text-center">
                            A vaga será criada como <strong>pré-reprovada</strong> para aprovação do gestor
                          </p>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <i className="fas fa-check-circle text-amber-600 dark:text-amber-400 text-lg"></i>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                              ✓ Confirmação Registrada
                            </h4>
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                              Você confirmou estar ciente de que esta vaga excede o limite contratual. 
                              A vaga será marcada como <strong>pré-reprovada</strong> e o gestor receberá uma notificação automática.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                }
                
                // Policy: ALLOW - Show informational message only (no blocking)
                if (policy === "allow") {
                  return (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 text-lg"></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                            ℹ️ Informação sobre Limite de Vagas
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            O cliente selecionado já atingiu o número máximo de vagas para a profissão <strong>{selectedProfession?.name}</strong>.
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-300 mt-2">
                            A vaga pode ser criada normalmente de acordo com a política do sistema.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return null;
              })()}
            </div>

            <Separator />

            {/* Seção 2: Detalhes da Vaga */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Detalhes da Vaga</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="openingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Abertura</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          disabled 
                          className="bg-muted cursor-not-allowed"
                          data-testid="input-opening-date" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          min={getMinStartDate(form.watch("openingDate"))}
                          data-testid="input-start-date" 
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Mínimo: 14 dias após a data de abertura
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="openingReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo da Abertura</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-opening-reason">
                            <SelectValue placeholder="Selecione o motivo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="substituicao">Substituição</SelectItem>
                          <SelectItem value="aumento_quadro">Aumento de Quadro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {openingReason === "substituicao" && (
                  <FormField
                    control={form.control}
                    name="replacementEmployeeName"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Colaborador a Substituir</FormLabel>
                        <Popover open={employeePopoverOpen} onOpenChange={setEmployeePopoverOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={employeePopoverOpen}
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="select-replacement-employee"
                              >
                                {field.value
                                  ? (() => {
                                      const employee = employees.find(
                                        (emp) => emp.name === field.value
                                      );
                                      return employee
                                        ? `${employee.employeeCode} - ${employee.name} (${employee.position})`
                                        : field.value;
                                    })()
                                  : "Selecione o funcionário"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput 
                                placeholder="Buscar funcionário por nome..." 
                                data-testid="input-search-employee"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {selectedCompanyId 
                                    ? "Nenhum funcionário encontrado" 
                                    : "Selecione uma empresa primeiro"}
                                </CommandEmpty>
                                <CommandGroup>
                                  {employees && employees.length > 0 && employees.map((employee) => (
                                    <CommandItem
                                      key={employee.id}
                                      value={`${employee.employeeCode} ${employee.name} ${employee.position}`}
                                      onSelect={() => {
                                        form.setValue("replacementEmployeeName", employee.name);
                                        setEmployeePopoverOpen(false);
                                      }}
                                      data-testid={`option-employee-${employee.employeeCode}`}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === employee.name
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {employee.employeeCode} - {employee.name} ({employee.position})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="vacancyQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de Vagas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max={openingReason === "substituicao" ? "1" : undefined}
                          placeholder="1" 
                          {...field} 
                          disabled={openingReason === "substituicao"}
                          data-testid="input-vacancy-quantity" 
                        />
                      </FormControl>
                      {openingReason === "substituicao" && (
                        <p className="text-xs text-muted-foreground">
                          Para substituição, apenas 1 vaga é permitida
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ageRangeMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idade Mínima</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="18" {...field} data-testid="input-age-min" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ageRangeMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idade Máxima</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="65" {...field} data-testid="input-age-max" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-gender">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="indiferente">Indiferente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Divisão</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-department">
                            <SelectValue placeholder="Selecione uma divisão" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Facilities">Facilities</SelectItem>
                          <SelectItem value="Engenharia">Engenharia</SelectItem>
                          <SelectItem value="Manutenção">Manutenção</SelectItem>
                          <SelectItem value="Indústria">Indústria</SelectItem>
                          <SelectItem value="Mobilidade">Mobilidade</SelectItem>
                          <SelectItem value="Administrativo">Administrativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Cidade</FormLabel>
                      <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="select-location"
                            >
                              {field.value || "Digite para buscar uma cidade..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Buscar cidade..." 
                              data-testid="input-search-city"
                            />
                            <CommandList>
                              <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                              <CommandGroup>
                                {cities.map((city) => (
                                  <CommandItem
                                    key={city}
                                    value={city}
                                    onSelect={() => {
                                      form.setValue("location", city);
                                      setCityPopoverOpen(false);
                                    }}
                                    data-testid={`city-option-${city}`}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        city === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {city}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Contrato</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-contract-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="clt">CLT</SelectItem>
                          <SelectItem value="pj">PJ</SelectItem>
                          <SelectItem value="freelancer">Freelancer</SelectItem>
                          <SelectItem value="estagio">Estágio</SelectItem>
                          <SelectItem value="temporario">Temporário</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Vaga</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-job-type">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="produtiva">PRODUTIVA - Vaga faturada, perco dinheiro</SelectItem>
                          <SelectItem value="improdutiva">IMPRODUTIVA - Vaga não faturada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="specifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especificações da Vaga</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva as especificações detalhadas da vaga..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid="input-specifications"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva as responsabilidades e requisitos da vaga..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Seção 3: Condições de Trabalho */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Condições de Trabalho</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="workScaleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escala de Trabalho</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-work-scale">
                            <SelectValue placeholder="Selecione a escala" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workScales?.map((scale: any) => (
                            <SelectItem key={scale.id} value={scale.id}>
                              {scale.name}
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
                  name="workHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Trabalho</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 08:00 às 17:00" {...field} data-testid="input-work-hours" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Seção 4: Remuneração e Benefícios */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Remuneração e Benefícios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="salaryMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Salário (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5000"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-salary-min"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bonus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gratificação (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1000"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-bonus"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hasHazardPay"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-hazard-pay"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Periculosidade</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unhealthinessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insalubridade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-unhealthiness">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="nao">Não</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                            <SelectItem value="20">20%</SelectItem>
                            <SelectItem value="40">40%</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Benefícios</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hasMealVoucher"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-meal-voucher"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Vale Alimentação</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasFoodVoucher"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-food-voucher"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Vale Refeição</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasTransportVoucher"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-transport-voucher"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Vale Transporte</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasHealthInsurance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-health-insurance"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Plano de Saúde</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasChartered"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-chartered"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Fretado</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Status - Apenas visível ao editar vaga */}
            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobStatuses
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((status) => (
                            <SelectItem key={status.id} value={status.key}>
                              {status.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Separator />

            {/* Seção: Configurações */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Configurações</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="kanbanBoardId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kanban</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-kanban-board">
                            <SelectValue placeholder="Selecione um kanban" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {kanbanBoards.map((board) => (
                            <SelectItem key={board.id} value={board.id}>
                              {board.name} {board.isDefault && "(Padrão)"}
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

            {/* Mensagem informativa quando criar nova vaga */}
            {!isEditing && (
              <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                ℹ️ Ao criar uma vaga, o status será automaticamente definido como <strong>ABERTO</strong>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              {isEditing && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => setShowDeleteDialog(true)}
                  data-testid="button-delete-job"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Vaga
                </Button>
              )}
              <div className={`flex items-center space-x-4 ${!isEditing ? 'ml-auto' : ''}`}>
                <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={(() => {
                    if (createJobMutation.isPending || updateJobMutation.isPending) return true;
                    if (isEditing) return false;
                    
                    const policy = quotaPolicy?.value || "require_approval";
                    if (!clientHasNoPositions) return false;
                    
                    // Block policy: always disabled when quota exceeded
                    if (policy === "block") return true;
                    
                    // Require approval: disabled until user acknowledges
                    if (policy === "require_approval" && !userAwareOfIrregularity) return true;
                    
                    // Allow policy: never disabled
                    return false;
                  })()}
                  data-testid="button-save"
                >
                  {(createJobMutation.isPending || updateJobMutation.isPending) && (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  )}
                  {isEditing ? "Atualizar Vaga" : "Criar Vaga"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.
            Todas as candidaturas relacionadas também serão removidas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="button-confirm-delete"
          >
            Excluir Vaga
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
