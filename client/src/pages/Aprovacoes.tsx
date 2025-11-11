import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, User, Building2, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";
import JobModal from "@/components/JobModal";

interface PendingApproval {
  job: {
    id: string;
    jobCode: string;
    title?: string;
    professionId?: string;
    openingDate?: Date;
    vacancyQuantity: number;
    status: string;
  };
  company: {
    id: string;
    name: string;
  } | null;
  client: {
    id: string;
    name: string;
  } | null;
  profession: {
    id: string;
    name: string;
  } | null;
  workflow: {
    id: string;
    name: string;
  } | null;
  currentStep: {
    id: string;
    stepOrder: number;
    requiresDualApproval: boolean;
  } | null;
}

interface ApprovalHistory {
  history: {
    id: string;
    stepName: string;
    stepOrder: number;
    status: string;
    comments: string | null;
    approvedAt: Date | null;
  };
  job: {
    id: string;
    jobCode: string;
    title?: string;
  } | null;
  approver: {
    id: string;
    name: string;
  } | null;
  company: {
    id: string;
    name: string;
  } | null;
  client: {
    id: string;
    name: string;
  } | null;
  profession: {
    id: string;
    name: string;
  } | null;
}

export default function Aprovacoes() {
  const { toast } = useToast();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<PendingApproval | null>(null);
  const [comments, setComments] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [viewJobId, setViewJobId] = useState<string | null>(null);

  // Fetch pending approvals
  const { data: pendingApprovals, isLoading: loadingPending } = useQuery<PendingApproval[]>({
    queryKey: ['/api/approvals/pending'],
  });

  // Fetch approval history
  const { data: approvalHistory, isLoading: loadingHistory } = useQuery<ApprovalHistory[]>({
    queryKey: ['/api/approvals/history'],
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ jobId, comments }: { jobId: string; comments?: string }) => {
      return await apiRequest('POST', `/api/approvals/${jobId}/approve`, { comments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/approvals/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/approvals/history'] });
      toast({
        title: "Vaga aprovada",
        description: "A vaga foi aprovada com sucesso.",
      });
      setApproveDialogOpen(false);
      setComments("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao aprovar",
        description: error.message || "Não foi possível aprovar a vaga.",
        variant: "destructive",
      });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ jobId, reason }: { jobId: string; reason: string }) => {
      return await apiRequest('POST', `/api/approvals/${jobId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/approvals/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/approvals/history'] });
      toast({
        title: "Vaga rejeitada",
        description: "A vaga foi rejeitada.",
      });
      setRejectDialogOpen(false);
      setRejectReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao rejeitar",
        description: error.message || "Não foi possível rejeitar a vaga.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (job: PendingApproval) => {
    setSelectedJob(job);
    setApproveDialogOpen(true);
  };

  const handleReject = (job: PendingApproval) => {
    setSelectedJob(job);
    setRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (!selectedJob) return;
    approveMutation.mutate({ jobId: selectedJob.job.id, comments });
  };

  const confirmReject = () => {
    if (!selectedJob || !rejectReason.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Por favor, informe o motivo da rejeição.",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({ jobId: selectedJob.job.id, reason: rejectReason });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
          Aprovações
        </h1>
        <p className="text-muted-foreground">
          Aprove ou rejeite vagas pendentes de aprovação
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pendentes
            {pendingApprovals && pendingApprovals.length > 0 && (
              <Badge className="ml-2" variant="secondary">{pendingApprovals.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vagas Pendentes de Aprovação</CardTitle>
              <CardDescription>
                Vagas aguardando sua aprovação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPending ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : !pendingApprovals || pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-pending">
                  Nenhuma vaga pendente de aprovação
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Profissão</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Vagas</TableHead>
                        <TableHead>Data Abertura</TableHead>
                        <TableHead>Workflow</TableHead>
                        <TableHead>Etapa</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApprovals.map((approval) => (
                        <TableRow key={approval.job.id} data-testid={`row-job-${approval.job.id}`}>
                          <TableCell className="font-medium">
                            {approval.job.jobCode}
                          </TableCell>
                          <TableCell>
                            {approval.profession?.name || approval.job.title || '-'}
                          </TableCell>
                          <TableCell>{approval.client?.name || '-'}</TableCell>
                          <TableCell>{approval.company?.name || '-'}</TableCell>
                          <TableCell>{approval.job.vacancyQuantity}</TableCell>
                          <TableCell>
                            {approval.job.openingDate 
                              ? format(new Date(approval.job.openingDate), 'dd/MM/yyyy')
                              : '-'
                            }
                          </TableCell>
                          <TableCell>{approval.workflow?.name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              Etapa {approval.currentStep?.stepOrder || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewJobId(approval.job.id)}
                                data-testid={`button-view-${approval.job.id}`}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Ver Detalhes
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(approval)}
                                data-testid={`button-approve-${approval.job.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(approval)}
                                data-testid={`button-reject-${approval.job.id}`}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Aprovações</CardTitle>
              <CardDescription>
                Registro de todas as aprovações e rejeições
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : !approvalHistory || approvalHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-history">
                  Nenhum registro no histórico
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Profissão</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Etapa</TableHead>
                        <TableHead>Aprovador</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Comentários</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvalHistory.map((item) => (
                        <TableRow key={item.history.id} data-testid={`row-history-${item.history.id}`}>
                          <TableCell>
                            {item.history.approvedAt 
                              ? format(new Date(item.history.approvedAt), 'dd/MM/yyyy HH:mm')
                              : '-'
                            }
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.job?.jobCode || '-'}
                          </TableCell>
                          <TableCell>
                            {item.profession?.name || item.job?.title || '-'}
                          </TableCell>
                          <TableCell>{item.client?.name || '-'}</TableCell>
                          <TableCell>{item.company?.name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.history.stepName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              {item.approver?.name || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.history.status)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {item.history.comments || '-'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent data-testid="dialog-approve">
          <DialogHeader>
            <DialogTitle>Aprovar Vaga</DialogTitle>
            <DialogDescription>
              Confirme a aprovação da vaga {selectedJob?.job.jobCode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">{selectedJob?.client?.name || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Empresa:</span>
                <span className="font-medium">{selectedJob?.company?.name || '-'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="approve-comments">Comentários (opcional)</Label>
              <Textarea
                id="approve-comments"
                placeholder="Adicione comentários sobre a aprovação..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                data-testid="textarea-approve-comments"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              data-testid="button-cancel-approve"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={approveMutation.isPending}
              data-testid="button-confirm-approve"
            >
              {approveMutation.isPending ? "Aprovando..." : "Confirmar Aprovação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent data-testid="dialog-reject">
          <DialogHeader>
            <DialogTitle>Rejeitar Vaga</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição da vaga {selectedJob?.job.jobCode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">{selectedJob?.client?.name || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Empresa:</span>
                <span className="font-medium">{selectedJob?.company?.name || '-'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Motivo da Rejeição *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Informe o motivo da rejeição..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                data-testid="textarea-reject-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              data-testid="button-cancel-reject"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={rejectMutation.isPending || !rejectReason.trim()}
              data-testid="button-confirm-reject"
            >
              {rejectMutation.isPending ? "Rejeitando..." : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Details Modal */}
      {viewJobId && (
        <JobModal
          jobId={viewJobId}
          isOpen={!!viewJobId}
          onClose={() => setViewJobId(null)}
        />
      )}
    </div>
  );
}
