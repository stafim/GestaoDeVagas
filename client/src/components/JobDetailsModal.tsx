import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { JobWithDetails } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, UserCheck, XCircle, StickyNote, Calendar, User, FileText, Briefcase, MapPin, Phone, CreditCard, Cake } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId?: string;
}

export default function JobDetailsModal({ isOpen, onClose, jobId }: JobDetailsModalProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [isEditingAdmission, setIsEditingAdmission] = useState(false);
  const [admissionDate, setAdmissionDate] = useState("");
  const [hiredCandidateId, setHiredCandidateId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery<any>({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: !!jobId && isOpen,
  });

  const { data: applications = [] } = useQuery<any[]>({
    queryKey: [`/api/applications/job/${jobId}`],
    enabled: !!jobId && isOpen,
  });

  const { data: statusHistory = [] } = useQuery<any[]>({
    queryKey: [`/api/jobs/${jobId}/status-history`],
    enabled: !!jobId && isOpen,
  });

  const { data: kanbanBoards = [] } = useQuery<any[]>({
    queryKey: [`/api/kanban-boards`],
    enabled: isOpen,
  });

  const defaultBoard = kanbanBoards.find((b: any) => b.isDefault);

  const { data: kanbanStages = [] } = useQuery<any[]>({
    queryKey: [`/api/kanban-boards/${defaultBoard?.id}/stages`],
    enabled: isOpen && !!defaultBoard,
  });

  const { data: jobStatuses = [] } = useQuery<any[]>({
    queryKey: [`/api/job-statuses`],
    enabled: isOpen,
  });

  const getKanbanStageName = (stageId: string) => {
    const stage = kanbanStages.find((s: any) => s.id === stageId);
    return stage?.name || 'Sem estágio';
  };

  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      await apiRequest("PATCH", `/api/jobs/${jobId}/notes`, { notes });
    },
    onSuccess: async () => {
      toast({
        title: "Nota salva",
        description: "A nota foi salva com sucesso",
      });
      // Force refetch of the job data
      await queryClient.refetchQueries({ queryKey: [`/api/jobs/${jobId}`] });
      setIsEditingNotes(false);
    },
    onError: (error) => {
      console.error("Error updating notes:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar a nota",
        variant: "destructive",
      });
    }
  });

  const updateAdmissionMutation = useMutation({
    mutationFn: async ({ admissionDate, hiredCandidateId }: { admissionDate: string; hiredCandidateId: string }) => {
      const response = await apiRequest("PATCH", `/api/jobs/${jobId}/admission`, {
        admissionDate,
        hiredCandidateId,
      });
      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: "Dados de Admissão Salvos",
        description: "Os dados de admissão foram salvos com sucesso",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      await queryClient.refetchQueries({ queryKey: [`/api/jobs/${jobId}`] });
      setIsEditingAdmission(false);
    },
    onError: (error) => {
      console.error("Error updating admission data:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar dados de admissão",
        variant: "destructive",
      });
    }
  });

  const completeJobMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/jobs/${jobId}/complete`, {});
      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: "Vaga Concluída",
        description: "A vaga foi concluída com sucesso",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      await queryClient.refetchQueries({ queryKey: [`/api/jobs/${jobId}`] });
      onClose();
    },
    onError: (error) => {
      console.error("Error completing job:", error);
      toast({
        title: "Erro",
        description: "Falha ao concluir a vaga",
        variant: "destructive",
      });
    }
  });

  const handleSaveNotes = () => {
    updateNotesMutation.mutate(notesText);
  };

  const handleCreateNote = () => {
    setNotesText(job?.notes || "");
    setIsEditingNotes(true);
  };

  const handleCancelNotes = () => {
    setNotesText("");
    setIsEditingNotes(false);
  };

  const handleSaveAdmission = () => {
    if (!admissionDate || !hiredCandidateId) {
      toast({
        title: "Erro",
        description: "Selecione a data de admissão e o candidato contratado",
        variant: "destructive",
      });
      return;
    }
    updateAdmissionMutation.mutate({ admissionDate, hiredCandidateId });
  };

  const handleCancelAdmission = () => {
    setAdmissionDate(job?.admissionDate || "");
    setHiredCandidateId(job?.hiredCandidateId || "");
    setIsEditingAdmission(false);
  };

  const handleEditAdmission = () => {
    setAdmissionDate(job?.admissionDate?.split('T')[0] || "");
    setHiredCandidateId(job?.hiredCandidateId || "");
    setIsEditingAdmission(true);
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (statusId: string) => {
    const statusObj = jobStatuses.find((s: any) => s.id === statusId);
    return statusObj?.label || statusId;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Vaga {job?.jobCode}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : job ? (
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="about" data-testid="tab-about">Sobre a vaga</TabsTrigger>
              <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
              <TabsTrigger value="info" data-testid="tab-info">Informações</TabsTrigger>
              <TabsTrigger value="admission" data-testid="tab-admission">Admissão</TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">Histórico</TabsTrigger>
            </TabsList>

            {/* Sobre a vaga Tab */}
            <TabsContent value="about" className="space-y-4 mt-4 min-h-[500px]">
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Informações Básicas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Código da Vaga:</p>
                      <p className="text-sm font-semibold text-primary">{job.jobCode || 'Não informado'}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Profissão:</p>
                      <p className="text-sm font-medium">{job.profession?.name || job.title || 'Não informado'}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Empresa:</p>
                      <p className="text-sm font-medium">{job.company?.name || 'Não informado'}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Cliente:</p>
                      <p className="text-sm font-medium">{job.client?.name || 'Não informado'}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Departamento:</p>
                      <p className="text-sm font-medium">{job.department || 'Não informado'}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Localização:</p>
                      <p className="text-sm font-medium">{job.location || 'Não informado'}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Tipo de Contrato:</p>
                      <p className="text-sm font-medium">{job.contractType === 'clt' ? 'CLT' : job.contractType === 'pj' ? 'PJ' : job.contractType === 'terceiro' ? 'Terceiro' : 'Não informado'}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Tipo de Vaga:</p>
                      <p className="text-sm font-medium">{job.jobType === 'produtiva' ? 'Produtiva (faturar)' : job.jobType === 'improdutiva' ? 'Improdutiva (sem faturar)' : 'Não informado'}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Quantidade de Vagas:</p>
                      <p className="text-sm font-medium">{job.vacancyQuantity || 1}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Gênero:</p>
                      <p className="text-sm font-medium">
                        {job.gender === 'masculino' ? 'Masculino' : job.gender === 'feminino' ? 'Feminino' : 'Indiferente'}
                      </p>
                    </div>
                    {job.ageRangeMin && job.ageRangeMax && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Faixa Etária:</p>
                        <p className="text-sm font-medium">{job.ageRangeMin} - {job.ageRangeMax} anos</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Descrição e Requisitos */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Descrição e Requisitos
                  </h3>
                  <div className="space-y-3">
                    {job.description && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Descrição:</p>
                        <p className="text-sm whitespace-pre-wrap">{job.description}</p>
                      </div>
                    )}
                    {job.requirements && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Requisitos:</p>
                        <p className="text-sm whitespace-pre-wrap">{job.requirements}</p>
                      </div>
                    )}
                    {job.specifications && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Especificações:</p>
                        <p className="text-sm whitespace-pre-wrap">{job.specifications}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Centro de Custo */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Centro de Custo
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Código:</p>
                      <p className="text-sm font-medium">{job.costCenter?.code || 'Não informado'}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Nome:</p>
                      <p className="text-sm font-medium">{job.costCenter?.name || 'Não informado'}</p>
                    </div>
                    {job.costCenterDescription && (
                      <div className="p-3 bg-muted/30 rounded-lg md:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Descrição específica:</p>
                        <p className="text-sm">{job.costCenterDescription}</p>
                      </div>
                    )}
                    {job.workPosition && (
                      <div className="p-3 bg-muted/30 rounded-lg md:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Posto de Trabalho:</p>
                        <p className="text-sm font-medium">{job.workPosition}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Datas e Motivo */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Datas e Motivo de Abertura
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {job.openingDate && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Data de Abertura:</p>
                        <p className="text-sm font-medium">{new Date(job.openingDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                    {job.startDate && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Data de Início:</p>
                        <p className="text-sm font-medium">{new Date(job.startDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Motivo de Abertura:</p>
                      <p className="text-sm font-medium">
                        {job.openingReason === 'substituicao' ? 'Substituição' : job.openingReason === 'aumento_quadro' ? 'Aumento de Quadro' : 'Não informado'}
                      </p>
                    </div>
                    {job.replacementEmployeeName && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Colaborador a Substituir:</p>
                        <p className="text-sm font-medium">{job.replacementEmployeeName}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Horário de Trabalho */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horário de Trabalho
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {job.workScale && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Escala de Trabalho:</p>
                        <p className="text-sm font-medium">{job.workScale.name || 'Não informado'}</p>
                      </div>
                    )}
                    {job.workHours && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Horário:</p>
                        <p className="text-sm font-medium">{job.workHours}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Remuneração e Benefícios */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Remuneração e Benefícios
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {job.salaryMin && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Salário:</p>
                        <p className="text-sm font-medium">R$ {Number(job.salaryMin).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    )}
                    {job.bonus && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Gratificação:</p>
                        <p className="text-sm font-medium">R$ {Number(job.bonus).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    )}
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Periculosidade:</p>
                      <p className="text-sm font-medium">{job.hasHazardPay ? 'Sim' : 'Não'}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Insalubridade:</p>
                      <p className="text-sm font-medium">
                        {job.unhealthinessLevel === 'nao' ? 'Não' : 
                         job.unhealthinessLevel === 'baixo' ? 'Baixo' : 
                         job.unhealthinessLevel === 'medio' ? 'Médio' : 
                         job.unhealthinessLevel === 'alto' ? 'Alto' : 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Responsáveis */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Responsáveis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Criado por:</p>
                      <p className="text-sm font-medium">
                        {job.creator ? `${job.creator.firstName} ${job.creator.lastName}` : 'Não informado'}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Recrutador:</p>
                      <p className="text-sm font-medium">
                        {job.recruiter ? `${job.recruiter.firstName} ${job.recruiter.lastName}` : 'Não atribuído'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-4 mt-4 min-h-[500px]">
              {/* Timeline de eventos */}
              <div className="space-y-4">
              {/* Abertura da vaga */}
              <div className="flex gap-4 items-start">
                <div className="mt-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Vaga Aberta</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.creator ? (
                      <>
                        Por: {job.creator.firstName} {job.creator.lastName}
                        {job.creator.email && ` (${job.creator.email})`}
                      </>
                    ) : (
                      "Criador não identificado"
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDateTime(job.createdAt)}
                  </p>
                </div>
              </div>

              {/* Aprovação (se status for aprovada ou superior) */}
              {job.status && ["aprovada", "em_recrutamento", "em_documentacao", "dp", "closed"].includes(job.status) && (
                <div className="flex gap-4 items-start">
                  <div className="mt-1">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Vaga Aprovada</h3>
                    <p className="text-sm text-muted-foreground">
                      Status atualizado para: {getStatusLabel(job.status)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateTime(job.updatedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Recrutamento */}
              {job.recruiter && (
                <div className="flex gap-4 items-start">
                  <div className="mt-1">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Recrutador Atribuído</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.recruiter.firstName} {job.recruiter.lastName}
                      {job.recruiter.email && ` (${job.recruiter.email})`}
                    </p>
                  </div>
                </div>
              )}

              {/* Fechamento */}
              {job.status === "closed" && (
                <div className="flex gap-4 items-start">
                  <div className="mt-1">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Vaga Fechada</h3>
                    <p className="text-sm text-muted-foreground">
                      Data de fechamento: {formatDateTime(job.updatedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Cancelamento */}
              {job.status === "cancelada" && (
                <div className="flex gap-4 items-start">
                  <div className="mt-1">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Vaga Cancelada</h3>
                    <p className="text-sm text-muted-foreground">
                      Data de cancelamento: {formatDateTime(job.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
              </div>
            </TabsContent>

            {/* Informações Tab */}
            <TabsContent value="info" className="space-y-4 mt-4 min-h-[500px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Informações Adicionais</h3>
                {!isEditingNotes && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNote}
                    data-testid="button-create-note"
                  >
                    <StickyNote className="h-4 w-4 mr-2" />
                    {job?.notes ? "Editar Nota" : "Criar Nota"}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground">Status Atual:</p>
                  <p className="font-medium">{getStatusLabel(job.status)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última Atualização:</p>
                  <p className="font-medium">{formatDateTime(job.updatedAt)}</p>
                </div>
                {job.company && (
                  <div>
                    <p className="text-muted-foreground">Empresa:</p>
                    <p className="font-medium">{job.company.name}</p>
                  </div>
                )}
                {job.profession && (
                  <div>
                    <p className="text-muted-foreground">Profissão:</p>
                    <p className="font-medium">{job.profession.name}</p>
                  </div>
                )}
              </div>

              {/* Notas section */}
              {isEditingNotes ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nota:</label>
                    <Textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      placeholder="Digite suas observações sobre esta vaga..."
                      className="min-h-[120px]"
                      data-testid="textarea-notes"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelNotes}
                      disabled={updateNotesMutation.isPending}
                      data-testid="button-cancel-notes"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={updateNotesMutation.isPending}
                      data-testid="button-save-notes"
                    >
                      {updateNotesMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Notas:</p>
                      {job?.notes ? (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.notes}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Nenhuma nota adicionada ainda</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            </TabsContent>

            {/* Admissão Tab */}
            <TabsContent value="admission" className="space-y-4 mt-4 min-h-[500px]">
              {!job?.admissionDate && !isEditingAdmission && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Candidatos no Kanban
                  </h3>
                  {applications.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {applications.map((app: any) => (
                        <div
                          key={app.id}
                          className="p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setHiredCandidateId(app.candidateId);
                            setAdmissionDate("");
                            setIsEditingAdmission(true);
                          }}
                          data-testid={`candidate-card-${app.candidateId}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{app.candidate?.name || 'Sem nome'}</p>
                              <p className="text-sm text-muted-foreground">{app.candidate?.email || 'Sem email'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right mr-3">
                                <p className="text-xs text-muted-foreground">Estágio no Kanban</p>
                                <p className="text-sm font-medium">
                                  {app.kanbanStageId ? getKanbanStageName(app.kanbanStageId) : 'Sem estágio'}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setHiredCandidateId(app.candidateId);
                                  setAdmissionDate("");
                                  setIsEditingAdmission(true);
                                }}
                                data-testid={`button-hire-${app.candidateId}`}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Informar Admissão
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic py-4 text-center">
                      Nenhum candidato inscrito nesta vaga
                    </p>
                  )}
                </div>
              )}

              <div>
                {isEditingAdmission && !job?.admissionDate && (
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Dados de Admissão
                    </h3>
                  </div>
                )}
                
                {!isEditingAdmission && job?.admissionDate && (
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Dados de Admissão
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditAdmission}
                      data-testid="button-edit-admission"
                    >
                      Editar
                    </Button>
                  </div>
                )}

                {isEditingAdmission ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Candidato Contratado:</label>
                      <Select value={hiredCandidateId} onValueChange={setHiredCandidateId}>
                        <SelectTrigger data-testid="select-hired-candidate">
                          <SelectValue placeholder="Selecione o candidato" />
                        </SelectTrigger>
                        <SelectContent>
                          {applications.map((app: any) => (
                            <SelectItem key={app.candidateId} value={app.candidateId}>
                              {app.candidate?.name || 'Sem nome'} - {getKanbanStageName(app.kanbanStageId)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Data de Admissão:</label>
                      <Input
                        type="date"
                        value={admissionDate}
                        onChange={(e) => setAdmissionDate(e.target.value)}
                        data-testid="input-admission-date"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelAdmission}
                        disabled={updateAdmissionMutation.isPending}
                        data-testid="button-cancel-admission"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveAdmission}
                        disabled={updateAdmissionMutation.isPending}
                        data-testid="button-save-admission"
                      >
                        {updateAdmissionMutation.isPending ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </div>
                ) : job?.admissionDate ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Nome Completo */}
                        {job.hiredCandidateId && applications.find((app: any) => app.candidateId === job.hiredCandidateId) && (
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-1" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-muted-foreground">Nome Completo:</p>
                              <p className="text-sm font-medium">
                                {applications.find((app: any) => app.candidateId === job.hiredCandidateId)?.candidate?.name || 'N/A'}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Email */}
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Email:</p>
                            <p className="text-sm font-medium">
                              {applications.find((app: any) => app.candidateId === job.hiredCandidateId)?.candidate?.email || 'Não informado'}
                            </p>
                          </div>
                        </div>
                        
                        {/* CPF */}
                        <div className="flex items-start gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground">CPF:</p>
                            <p className="text-sm font-medium">
                              {applications.find((app: any) => app.candidateId === job.hiredCandidateId)?.candidate?.document || 'Não informado'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Telefone */}
                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Telefone:</p>
                            <p className="text-sm font-medium">
                              {applications.find((app: any) => app.candidateId === job.hiredCandidateId)?.candidate?.phone || 'Não informado'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Data de Nascimento */}
                        <div className="flex items-start gap-2">
                          <Cake className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Data de Nascimento:</p>
                            <p className="text-sm font-medium">
                              {applications.find((app: any) => app.candidateId === job.hiredCandidateId)?.candidate?.birthDate 
                                ? formatDateTime(applications.find((app: any) => app.candidateId === job.hiredCandidateId)?.candidate?.birthDate)
                                : 'Não informado'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Data de Admissão */}
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Data de Admissão:</p>
                            <p className="text-sm font-medium">{formatDateTime(job.admissionDate)}</p>
                          </div>
                        </div>
                        
                        {/* Recrutador */}
                        {job.recruiter && (
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-1" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-muted-foreground">Recrutador:</p>
                              <p className="text-sm font-medium">{job.recruiter.name}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Data de Abertura da Vaga */}
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Data de Abertura da Vaga:</p>
                            <p className="text-sm font-medium">{formatDateTime(job.createdAt)}</p>
                          </div>
                        </div>
                        
                        {/* Código Centro de Custo */}
                        <div className="flex items-start gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Código Centro de Custo:</p>
                            <p className="text-sm font-medium">{job.costCenter?.code || 'Não informado'}</p>
                          </div>
                        </div>
                        
                        {/* Descrição do Centro de Custo */}
                        <div className="flex items-start gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Descrição do Centro de Custo:</p>
                            <p className="text-sm font-medium">{job.costCenter?.description || job.costCenter?.name || 'Não informado'}</p>
                          </div>
                        </div>
                        
                        {/* Cargo */}
                        <div className="flex items-start gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground">Cargo:</p>
                            <p className="text-sm font-medium">{job.title}</p>
                          </div>
                        </div>
                        
                        {/* Localização */}
                        {job.location && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-muted-foreground">Localização:</p>
                              <p className="text-sm font-medium">{job.location}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Botão Download Dossiê */}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          window.open(`/api/jobs/${jobId}/admission-pdf`, '_blank');
                        }}
                        data-testid="button-download-admission-dossier"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Baixar Dossiê de Admissão
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhum dado de admissão informado</p>
                )}
              </div>
            </TabsContent>

            {/* Histórico Tab */}
            <TabsContent value="history" className="space-y-4 mt-4 min-h-[500px]">
              {/* Histórico de Mudanças de Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Histórico de Mudanças de Status
                  </h3>
                </div>

                {statusHistory && statusHistory.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {statusHistory.map((historyItem: any) => (
                      <div
                        key={historyItem.id}
                        className="p-3 border rounded-lg bg-muted/30"
                        data-testid={`status-history-${historyItem.id}`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Status Anterior:</p>
                            <p className="text-sm font-medium">
                              {historyItem.previousStatus || 'Criação da vaga'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Novo Status:</p>
                            <p className="text-sm font-medium">{historyItem.newStatus}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Alterado por:</p>
                            <p className="text-sm font-medium">
                              {historyItem.changerName || historyItem.changerEmail || 'Sistema'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Data/Hora:</p>
                            <p className="text-sm font-medium">
                              {formatDateTime(historyItem.changedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhuma mudança de status registrada</p>
                )}
              </div>

              {/* Botão Concluir Vaga */}
              {!job?.completedAt && (
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="default"
                    onClick={() => completeJobMutation.mutate()}
                    disabled={completeJobMutation.isPending}
                    data-testid="button-complete-job"
                  >
                    {completeJobMutation.isPending ? "Concluindo..." : "Concluir Vaga"}
                  </Button>
                </div>
              )}
              
              {/* Data de conclusão */}
              {job?.completedAt && (
                <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Vaga Concluída
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      {formatDateTime(job.completedAt)}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Vaga não encontrada
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
