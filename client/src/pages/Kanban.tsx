import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Mail, Phone, Briefcase, Clock, Plus, Filter, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface KanbanStage {
  id: string;
  kanbanBoardId: string;
  name: string;
  order: number;
  color: string;
  createdAt: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  kanbanStageId: string;
  appliedAt: string;
  notes?: string;
  candidate?: Candidate;
  job?: {
    profession?: {
      name: string;
    };
    company?: {
      name: string;
    };
  };
}

const candidateFormSchema = z.object({
  candidateType: z.enum(["new", "existing"]),
  existingCandidateId: z.string().optional(),
  candidateName: z.string().optional(),
  candidateEmail: z.string().optional(),
  candidatePhone: z.string().optional(),
  candidateDocument: z.string().optional(),
  jobId: z.string().min(1, "Vaga é obrigatória"),
}).refine((data) => {
  if (data.candidateType === "new") {
    return data.candidateName && data.candidateName.length >= 3 && 
           data.candidateEmail && data.candidateEmail.includes("@");
  }
  return data.existingCandidateId && data.existingCandidateId.length > 0;
}, {
  message: "Preencha os campos obrigatórios",
  path: ["candidateType"],
});

type CandidateFormData = z.infer<typeof candidateFormSchema>;

const stageFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  color: z.string().min(1, "Cor é obrigatória"),
});

type StageFormData = z.infer<typeof stageFormSchema>;

export default function Kanban() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draggedItem, setDraggedItem] = useState<Application | null>(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [location] = useLocation();
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");
  const [showNotesReport, setShowNotesReport] = useState(false);
  const [showNewStageModal, setShowNewStageModal] = useState(false);

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications", selectedJobFilter],
    enabled: !!selectedJobFilter,
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (selectedJobFilter) {
        queryParams.set('jobId', selectedJobFilter);
      }
      const queryString = queryParams.toString();
      const applicationsUrl = `/api/applications${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(applicationsUrl, { credentials: "include" });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return await response.json();
    },
  });

  const { data: jobs = [] } = useQuery<any[]>({
    queryKey: ["/api/jobs"],
  });

  // Fetch Kanban boards
  const { data: kanbanBoards = [] } = useQuery<any[]>({
    queryKey: ["/api/kanban-boards"],
  });

  // Get the selected job's kanban board, or use default
  const selectedJob = jobs.find(job => job.id === selectedJobFilter);
  const selectedJobKanbanId = selectedJob?.kanbanBoardId;
  const defaultKanban = kanbanBoards.find((board) => board.isDefault) || kanbanBoards[0];
  const activeKanbanId = selectedJobKanbanId || defaultKanban?.id;

  // Fetch stages for the job's Kanban board
  const { data: kanbanStages = [], isLoading: isLoadingStages } = useQuery<KanbanStage[]>({
    queryKey: ["/api/kanban-boards", activeKanbanId, "stages"],
    enabled: !!activeKanbanId,
  });

  const { data: candidates = [] } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  // Buscar blacklist de candidatos
  const { data: blacklistCandidates = [] } = useQuery<any[]>({
    queryKey: ["/api/blacklist-candidates"],
  });

  // Set job filter from URL or default to first job
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobIdFromUrl = urlParams.get('jobId');
    
    if (jobIdFromUrl) {
      setSelectedJobFilter(jobIdFromUrl);
    } else if (jobs.length > 0 && !selectedJobFilter) {
      setSelectedJobFilter(jobs[0].id);
    }
  }, [location, jobs]);

  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      candidateType: "new",
      existingCandidateId: "",
      candidateName: "",
      candidateEmail: "",
      candidatePhone: "",
      candidateDocument: "",
      jobId: "",
    },
  });

  // Update form jobId when selectedJobFilter changes
  useEffect(() => {
    if (selectedJobFilter) {
      form.setValue("jobId", selectedJobFilter);
    }
  }, [selectedJobFilter, form]);

  const stageForm = useForm<StageFormData>({
    resolver: zodResolver(stageFormSchema),
    defaultValues: {
      name: "",
      color: "bg-blue-500",
    },
  });

  const createStageMutation = useMutation({
    mutationFn: async (data: StageFormData) => {
      if (!activeKanbanId) {
        throw new Error("Nenhum Kanban selecionado");
      }
      
      const nextOrder = kanbanStages.length > 0 ? Math.max(...kanbanStages.map(s => s.order)) + 1 : 1;
      
      const response = await apiRequest("POST", "/api/kanban-stages", {
        kanbanBoardId: activeKanbanId,
        name: data.name,
        color: data.color,
        order: nextOrder,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban-boards", activeKanbanId, "stages"] });
      toast({
        title: "Sucesso",
        description: "Nova etapa criada com sucesso!",
      });
      setShowNewStageModal(false);
      stageForm.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar nova etapa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const reorderStageMutation = useMutation({
    mutationFn: async (stages: { id: string; order: number }[]) => {
      const response = await apiRequest("POST", "/api/kanban-stages/reorder", { stageUpdates: stages });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban-boards", activeKanbanId, "stages"] });
      toast({
        title: "Sucesso",
        description: "Etapas reorganizadas com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao reorganizar etapas. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const createCandidateMutation = useMutation({
    mutationFn: async (data: CandidateFormData) => {
      let candidateId: string;

      if (data.candidateType === "new") {
        // Create a new candidate
        const candidateResponse = await apiRequest("POST", "/api/candidates", {
          name: data.candidateName!,
          email: data.candidateEmail!,
          phone: data.candidatePhone || "",
          document: data.candidateDocument || "",
        });
        const candidate = await candidateResponse.json();
        candidateId = candidate.id;
      } else {
        // Use existing candidate
        candidateId = data.existingCandidateId!;
      }
      
      // Create the application linking candidate to job
      // Use the first stage from the kanban board
      const firstStage = kanbanStages[0]?.id || "entrevista_inicial";
      const applicationResponse = await apiRequest("POST", "/api/applications", {
        jobId: data.jobId,
        candidateId: candidateId,
        kanbanStageId: firstStage,
      });
      return applicationResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Sucesso",
        description: "Candidato adicionado ao Kanban com sucesso!",
      });
      setShowCandidateModal(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar candidato. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      await apiRequest("PATCH", `/api/applications/${id}`, { kanbanStageId: stage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Sucesso",
        description: "Candidato movido para nova etapa!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao mover candidato. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      await apiRequest("PATCH", `/api/applications/${id}`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Sucesso",
        description: "Notas salvas com sucesso!",
      });
      setShowNotesModal(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar notas. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDragStart = (application: Application) => {
    setDraggedItem(application);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: string) => {
    if (draggedItem && draggedItem.kanbanStageId !== stageId) {
      updateStageMutation.mutate({ id: draggedItem.id, stage: stageId });
    }
    setDraggedItem(null);
  };

  const getApplicationsByStage = (stageId: string) => {
    return applications.filter((app) => app.kanbanStageId === stageId);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  const onSubmit = (data: CandidateFormData) => {
    // Se for um novo candidato, verificar se o CPF está na blacklist
    if (data.candidateType === "new" && data.candidateDocument) {
      // Normalizar CPF removendo pontos e traços para comparação
      const normalizedCPF = data.candidateDocument.replace(/[.-]/g, '');
      
      // Verificar se existe na blacklist
      const isBlacklisted = blacklistCandidates.some((blacklisted: any) => {
        const blacklistedCPF = blacklisted.cpf.replace(/[.-]/g, '');
        return blacklistedCPF === normalizedCPF;
      });
      
      if (isBlacklisted) {
        toast({
          title: "Candidato Bloqueado",
          description: "Este candidato não pode ser cadastrado pois está na lista de banimento (blacklist). Verifique o motivo na aba de Configurações > Blacklist.",
          variant: "destructive",
        });
        return; // Bloquear o cadastro
      }
    }
    
    // Se não estiver na blacklist, prosseguir com o cadastro normalmente
    createCandidateMutation.mutate(data);
  };

  const handleOpenModal = (initialStage?: string) => {
    if (selectedJobFilter) {
      form.setValue("jobId", selectedJobFilter);
    }
    setShowCandidateModal(true);
  };

  const handleCloseModal = () => {
    setShowCandidateModal(false);
    form.reset();
  };

  const handleOpenNotes = (application: Application) => {
    setSelectedApplication(application);
    setNotes(application.notes || "");
    setShowNotesModal(true);
  };

  const handleSaveNotes = () => {
    if (selectedApplication) {
      updateNotesMutation.mutate({ id: selectedApplication.id, notes });
    }
  };

  const handleMoveStageLeft = (currentIndex: number) => {
    if (currentIndex === 0) return; // Already at the start
    
    const newStages = [...kanbanStages];
    const temp = newStages[currentIndex - 1];
    newStages[currentIndex - 1] = newStages[currentIndex];
    newStages[currentIndex] = temp;
    
    const reorderedStages = newStages.map((stage, index) => ({
      id: stage.id,
      order: index + 1,
    }));
    
    reorderStageMutation.mutate(reorderedStages);
  };

  const handleMoveStageRight = (currentIndex: number) => {
    if (currentIndex === kanbanStages.length - 1) return; // Already at the end
    
    const newStages = [...kanbanStages];
    const temp = newStages[currentIndex + 1];
    newStages[currentIndex + 1] = newStages[currentIndex];
    newStages[currentIndex] = temp;
    
    const reorderedStages = newStages.map((stage, index) => ({
      id: stage.id,
      order: index + 1,
    }));
    
    reorderStageMutation.mutate(reorderedStages);
  };

  return (
    <>
      <TopBar 
        title="Kanban de Candidatos"
        showCreateButton
        onCreateClick={handleOpenModal}
        createButtonText="Novo Candidato"
      />

      <div className="space-y-6">
        {/* Filter by Job */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {jobs.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Nenhuma vaga cadastrada. Crie uma vaga primeiro para usar o Kanban.
                </div>
              ) : (
                <Select value={selectedJobFilter} onValueChange={setSelectedJobFilter}>
                  <SelectTrigger className="w-[300px]" data-testid="select-job-filter">
                    <SelectValue placeholder="Selecione uma vaga" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job: any) => (
                      <SelectItem key={job.id} value={job.id}>
                        [{job.jobCode || job.id.slice(0, 6)}] {job.profession?.name || job.title} - {job.company?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotesReport(true)}
              data-testid="button-notes-report"
            >
              <FileText className="h-4 w-4 mr-2" />
              Relatório de Notas
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {kanbanStages.map((stage) => {
            const count = getApplicationsByStage(stage.id).length;
            return (
              <Card key={stage.id} className="border-t-4" style={{ borderTopColor: stage.color.replace("bg-", "") }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stage.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanStages.map((stage, index) => {
            const stageApplications = getApplicationsByStage(stage.id);
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                <div className="bg-muted/30 rounded-lg p-4 h-full min-h-[500px]">
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                        <h3 className="font-semibold text-sm">{stage.name}</h3>
                      </div>
                      <Badge variant="secondary">{stageApplications.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveStageLeft(index)}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                        data-testid={`button-move-left-${stage.id}`}
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <span className="text-xs text-muted-foreground">Reorganizar</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveStageRight(index)}
                        disabled={index === kanbanStages.length - 1}
                        className="h-6 w-6 p-0"
                        data-testid={`button-move-right-${stage.id}`}
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal()}
                    className="w-full mb-3 border-dashed"
                    disabled={!selectedJobFilter}
                    data-testid={`button-add-${stage.id}`}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>

                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="text-center text-muted-foreground py-8">Carregando...</div>
                    ) : stageApplications.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8 text-sm">
                        Nenhum candidato
                      </div>
                    ) : (
                      stageApplications.map((application) => (
                        <Card
                          key={application.id}
                          draggable
                          onDragStart={() => handleDragStart(application)}
                          className="cursor-move hover:shadow-md transition-shadow bg-card"
                          data-testid={`card-application-${application.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Candidate Info */}
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {getInitials(application.candidate?.name || "?")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm truncate">
                                    {application.candidate?.name || "Candidato"}
                                  </h4>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate">{application.candidate?.email || "N/A"}</span>
                                  </div>
                                  {application.candidate?.phone && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{application.candidate.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Job Info */}
                              {application.job && (
                                <div className="space-y-1">
                                  {application.job.profession && (
                                    <div className="flex items-center gap-1 text-xs">
                                      <Briefcase className="h-3 w-3 text-muted-foreground" />
                                      <span className="font-medium">
                                        {application.job.profession.name}
                                      </span>
                                    </div>
                                  )}
                                  {application.job.company && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Users className="h-3 w-3" />
                                      <span>{application.job.company.name}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Date and Notes */}
                              <div className="space-y-2 pt-2 border-t">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>Aplicado em {formatDate(application.appliedAt)}</span>
                                </div>
                                <Button
                                  variant={application.notes ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleOpenNotes(application)}
                                  className="w-full h-8"
                                  data-testid={`button-notes-${application.id}`}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  {application.notes ? "Ver Notas" : "Adicionar Notas"}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Modal */}
      <Dialog open={showCandidateModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Candidato</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="candidateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger data-testid="select-candidate-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Novo Candidato</SelectItem>
                          <SelectItem value="existing">Candidato Existente</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("candidateType") === "existing" ? (
                <FormField
                  control={form.control}
                  name="existingCandidateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selecione o Candidato *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger data-testid="select-existing-candidate">
                            <SelectValue placeholder="Escolha um candidato" />
                          </SelectTrigger>
                          <SelectContent>
                            {candidates.map((candidate) => (
                              <SelectItem key={candidate.id} value={candidate.id}>
                                {candidate.name} - {candidate.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="candidateName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="João da Silva" {...field} data-testid="input-candidate-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="candidateEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="joao@example.com" 
                            {...field} 
                            data-testid="input-candidate-email" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="candidatePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(11) 99999-9999" 
                            {...field} 
                            data-testid="input-candidate-phone" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="candidateDocument"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="000.000.000-00" 
                            {...field} 
                            data-testid="input-candidate-document" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="jobId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaga *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-job">
                          <SelectValue placeholder="Selecione a vaga" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobs.map((job: any) => (
                          <SelectItem key={job.id} value={job.id}>
                            [{job.jobCode || job.id.slice(0, 6)}] {job.profession?.name || job.title} - {job.company?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal} data-testid="button-cancel">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createCandidateMutation.isPending}
                  data-testid="button-save"
                >
                  {createCandidateMutation.isPending && (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  )}
                  {form.watch("candidateType") === "existing" ? "Adicionar ao Kanban" : "Criar e Adicionar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Notes Modal */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Notas do Candidato - {selectedApplication?.candidate?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Notas Internas</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione notas sobre o candidato, observações da entrevista, feedback, etc..."
                className="min-h-[200px]"
                data-testid="textarea-notes"
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNotesModal(false)}
                data-testid="button-cancel-notes"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveNotes}
                disabled={updateNotesMutation.isPending}
                data-testid="button-save-notes"
              >
                {updateNotesMutation.isPending && (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                )}
                Salvar Notas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Report Modal */}
      <Dialog open={showNotesReport} onOpenChange={setShowNotesReport}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relatório de Notas dos Candidatos</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {applications.filter(app => app.notes && app.notes.trim() !== "").length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhuma nota registrada</p>
                <p className="text-sm">Adicione notas aos candidatos para vê-las aqui.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications
                  .filter(app => app.notes && app.notes.trim() !== "")
                  .map((application) => (
                    <Card key={application.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Candidate Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {getInitials(application.candidate?.name || "?")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-base">
                                  {application.candidate?.name || "Candidato"}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <span>{application.candidate?.email || "N/A"}</span>
                                  </div>
                                  {application.candidate?.phone && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Phone className="h-3 w-3" />
                                      <span>{application.candidate.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {kanbanStages.find((s: KanbanStage) => s.id === application.kanbanStageId)?.name || application.kanbanStageId}
                            </Badge>
                          </div>

                          {/* Job Info */}
                          {application.job && (
                            <div className="flex items-center gap-4 text-sm bg-muted/50 p-2 rounded">
                              {application.job.profession && (
                                <div className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-medium">{application.job.profession.name}</span>
                                </div>
                              )}
                              {application.job.company && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  <span>{application.job.company.name}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Notes */}
                          <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">Notas:</p>
                                <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-wrap">
                                  {application.notes}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Aplicado em {formatDate(application.appliedAt)}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleOpenNotes(application);
                                setShowNotesReport(false);
                              }}
                              className="h-7"
                            >
                              Editar Notas
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Stage Modal */}
      <Dialog open={showNewStageModal} onOpenChange={setShowNewStageModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Etapa do Kanban</DialogTitle>
          </DialogHeader>

          <Form {...stageForm}>
            <form onSubmit={stageForm.handleSubmit((data) => createStageMutation.mutate(data))} className="space-y-4">
              <FormField
                control={stageForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Etapa *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Ex: Entrevista Final, Aprovação Gerencial..." 
                        data-testid="input-stage-name" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={stageForm.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor da Etapa *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-stage-color">
                          <SelectValue placeholder="Selecione a cor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bg-blue-500">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500"></div>
                            <span>Azul</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bg-purple-500">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-purple-500"></div>
                            <span>Roxo</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bg-orange-500">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-orange-500"></div>
                            <span>Laranja</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bg-green-500">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-500"></div>
                            <span>Verde</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bg-red-500">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-500"></div>
                            <span>Vermelho</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bg-yellow-500">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-yellow-500"></div>
                            <span>Amarelo</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bg-pink-500">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-pink-500"></div>
                            <span>Rosa</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bg-emerald-600">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-emerald-600"></div>
                            <span>Esmeralda</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewStageModal(false)}
                  data-testid="button-cancel-stage"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createStageMutation.isPending}
                  data-testid="button-save-stage"
                >
                  {createStageMutation.isPending && (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  )}
                  Criar Etapa
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
