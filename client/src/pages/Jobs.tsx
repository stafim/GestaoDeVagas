import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { JobsListResponse } from "@shared/schema";
import Layout from "@/components/Layout";
import TopBar from "@/components/TopBar";
import JobModal from "@/components/JobModal";
import JobDetailsModal from "@/components/JobDetailsModal";
import JobStatusSelect from "@/components/JobStatusSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { JOB_STATUS_CONFIG, getStatusLabel } from "@shared/constants";
import {
  Search,
  Filter,
  Download,
  MapPin,
  Users,
  User,
  Eye,
  Briefcase,
  Plus,
  LayoutDashboard,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  UserPlus
} from "lucide-react";
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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const statusLabels: Record<string, string> = {
  closed: "Fechada",
  aberto: "Aberto",
  em_recrutamento: "Em Recrutamento",
  em_documentacao: "Em Documentação"
};

// Calculate SLA based on admission date and start date
const calculateSLA = (startDate: string | null, admissionDate: string | null, slaLimit: number = 14) => {
  if (!startDate || !admissionDate) {
    return null;
  }
  
  const start = new Date(startDate);
  const admission = new Date(admissionDate);
  
  const daysTaken = Math.floor((admission.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const isWithinSLA = daysTaken <= slaLimit;
  
  return {
    daysTaken,
    slaLimit,
    isWithinSLA
  };
};

export default function Jobs() {
  const [location] = useLocation();
  const [showJobModal, setShowJobModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsJobId, setDetailsJobId] = useState<string | undefined>();
  const [initialClientId, setInitialClientId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [recruiterFilter, setRecruiterFilter] = useState("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;
  const [showGenerateCandidatesDialog, setShowGenerateCandidatesDialog] = useState(false);
  const [selectedJobIdForCandidates, setSelectedJobIdForCandidates] = useState<string | null>(null);
  const [candidateCount, setCandidateCount] = useState(10);

  // Check for clientId in URL params (from RealTime dashboard)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clientIdParam = params.get('clientId');
    if (clientIdParam) {
      setInitialClientId(clientIdParam);
      setShowJobModal(true);
      // Clean up URL without reloading
      window.history.replaceState({}, '', '/jobs');
    }
  }, []);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch companies for filter
  const { data: companies } = useQuery<any[]>({
    queryKey: ["/api/companies"],
  });

  // Fetch users (recruiters) for filter
  const { data: users } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const { data: jobs, isLoading } = useQuery<JobsListResponse>({
    queryKey: ["/api/jobs", { limit: pageSize, offset: currentPage * pageSize, search, statusFilter, companyFilter, recruiterFilter }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.set('limit', pageSize.toString());
      queryParams.set('offset', (currentPage * pageSize).toString());
      if (search.trim()) {
        queryParams.set('search', search.trim());
      }
      if (statusFilter && statusFilter !== 'all') {
        queryParams.set('status', statusFilter);
      }
      if (companyFilter && companyFilter !== 'all') {
        queryParams.set('companyId', companyFilter);
      }
      if (recruiterFilter && recruiterFilter !== 'all') {
        queryParams.set('recruiterId', recruiterFilter);
      }
      const queryString = queryParams.toString();
      const jobsUrl = `/api/jobs${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(jobsUrl, { credentials: "include" });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return await response.json();
    },
  });

  const assignRecruiterMutation = useMutation({
    mutationFn: async ({ jobId, userId }: { jobId: string; userId: string }) => {
      const response = await apiRequest("PUT", `/api/jobs/${jobId}`, { recruiterId: userId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.refetchQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Sucesso",
        description: "Vaga atribuída com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atribuir vaga. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const generateCandidatesMutation = useMutation({
    mutationFn: async ({ jobId, count }: { jobId: string; count: number }) => {
      const response = await apiRequest("POST", `/api/jobs/${jobId}/generate-candidates`, { count });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.refetchQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Sucesso",
        description: `${data.candidatesCreated} candidatos criados e ${data.applicationsCreated} aplicações geradas com sucesso!`,
      });
      setShowGenerateCandidatesDialog(false);
      setCandidateCount(10);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao gerar candidatos. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    closed: "destructive"
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleExportToCSV = () => {
    if (!sortedJobs || sortedJobs.length === 0) {
      toast({
        title: "Nenhuma vaga para exportar",
        description: "Não há vagas disponíveis com os filtros atuais.",
        variant: "destructive",
      });
      return;
    }

    // Define CSV headers
    const headers = [
      "ID Vaga",
      "Profissão",
      "Categoria",
      "Localização",
      "Empresa",
      "Cliente",
      "Status",
      "Candidatos",
      "Salário Mín",
      "Salário Máx",
      "SLA (dias)",
      "Dentro do SLA",
      "Recrutador",
      "Gestor",
      "Criado em"
    ];

    // Convert jobs to CSV rows
    const rows = sortedJobs.map((job: any) => {
      const sla = calculateSLA(job.startDate, job.admissionDate);
      
      return [
        job.jobCode || "N/A",
        job.profession?.name || job.title || "N/A",
        job.profession?.category || "",
        job.location || "",
        job.company?.name || "N/A",
        job.client?.name || "N/A",
        getStatusLabel(job.status) || "N/A",
        job.applicationsCount || 0,
        job.salaryMin || 0,
        job.salaryMax || 0,
        sla ? sla.daysTaken : "N/A",
        sla ? (sla.isWithinSLA ? "Sim" : "Não") : "N/A",
        job.recruiter ? (job.recruiter.firstName && job.recruiter.lastName 
          ? `${job.recruiter.firstName} ${job.recruiter.lastName}`
          : job.recruiter.email) : "Não atribuído",
        job.creator ? (job.creator.firstName && job.creator.lastName 
          ? `${job.creator.firstName} ${job.creator.lastName}`
          : job.creator.email) : "N/A",
        new Date(job.createdAt).toLocaleDateString('pt-BR')
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => {
        // Escape commas and quotes in cell values
        const cellStr = String(cell);
        if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `vagas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportação concluída",
      description: `${sortedJobs.length} vaga(s) exportada(s) com sucesso!`,
    });
  };

  const getSortedJobs = () => {
    if (!jobs) return jobs;

    // Filter completed jobs based on showCompleted state
    let filteredJobs = showCompleted 
      ? jobs.filter((job: any) => job.completedAt)
      : jobs.filter((job: any) => !job.completedAt);

    if (!sortColumn) return filteredJobs;

    const sorted = [...filteredJobs].sort((a: any, b: any) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'jobCode':
          aValue = a.jobCode || '';
          bValue = b.jobCode || '';
          break;
        case 'profession':
          aValue = a.profession?.name || a.title || '';
          bValue = b.profession?.name || b.title || '';
          break;
        case 'company':
          aValue = a.company?.name || '';
          bValue = b.company?.name || '';
          break;
        case 'client':
          aValue = a.client?.name || '';
          bValue = b.client?.name || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'applicationsCount':
          aValue = a.applicationsCount || 0;
          bValue = b.applicationsCount || 0;
          break;
        case 'salary':
          aValue = parseFloat(a.salaryMin || '0');
          bValue = parseFloat(b.salaryMin || '0');
          break;
        case 'sla':
          const aSLA = calculateSLA(a.startDate, a.admissionDate);
          const bSLA = calculateSLA(b.startDate, b.admissionDate);
          aValue = aSLA ? aSLA.daysTaken : 999;
          bValue = bSLA ? bSLA.daysTaken : 999;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'recruiter':
          aValue = a.recruiter?.email || '';
          bValue = b.recruiter?.email || '';
          break;
        case 'creator':
          aValue = a.creator?.email || a.creator?.firstName || '';
          bValue = b.creator?.email || b.creator?.firstName || '';
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
    });

    return sorted;
  };

  const sortedJobs = getSortedJobs();

  const formatSalary = (min?: string, max?: string) => {
    if (!min && !max) return "Não informado";
    if (!min) return `Até R$ ${parseFloat(max!).toLocaleString()}`;
    if (!max) return `R$ ${parseFloat(min).toLocaleString()}`;
    return `R$ ${parseFloat(min).toLocaleString()} - ${parseFloat(max).toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const handleCloseModal = () => {
    setShowJobModal(false);
    setInitialClientId(undefined); // Clear initial client when closing modal
  };

  const handleViewDetails = (jobId: string) => {
    setDetailsJobId(jobId);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setDetailsJobId(undefined);
  };

  const handleAssignToMe = (jobId: string) => {
    if (user?.id) {
      assignRecruiterMutation.mutate({ jobId, userId: user.id });
    }
  };

  const handleGoToKanban = (jobId: string) => {
    setLocation(`/kanban?jobId=${jobId}`);
  };

  const handleOpenGenerateCandidates = (jobId: string) => {
    setSelectedJobIdForCandidates(jobId);
    setShowGenerateCandidatesDialog(true);
  };

  const handleGenerateCandidates = () => {
    if (selectedJobIdForCandidates && candidateCount > 0 && candidateCount <= 100) {
      generateCandidatesMutation.mutate({ 
        jobId: selectedJobIdForCandidates, 
        count: candidateCount 
      });
    }
  };

  return (
    <>
      <TopBar
        title="Gerenciar Vagas"
        showCreateButton
        onCreateClick={() => setShowJobModal(true)}
        createButtonText="Nova Vaga"
      />

      <div className="space-y-6">
        {/* Filters and Search */}
        <div className="bg-card p-6 rounded-lg border border-border space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-xl">
              <Input
                placeholder="Buscar por ID, profissão, empresa ou categoria..."
                className="pl-10 h-11 text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportToCSV}
                data-testid="button-export"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Filters - Always Visible */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Vaga</label>
                <Select value={showCompleted ? "completed" : "active"} onValueChange={(value) => setShowCompleted(value === "completed")}>
                  <SelectTrigger data-testid="select-completed-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Vagas Ativas</SelectItem>
                    <SelectItem value="completed">Vagas Concluídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {Object.keys(JOB_STATUS_CONFIG).map((status) => (
                      <SelectItem key={status} value={status}>
                        {getStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Empresa</label>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger data-testid="select-company-filter">
                    <SelectValue placeholder="Todas as empresas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as empresas</SelectItem>
                    {companies?.map((company: any) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Recrutador</label>
                <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
                  <SelectTrigger data-testid="select-recruiter-filter">
                    <SelectValue placeholder="Todos os recrutadores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os recrutadores</SelectItem>
                    {users?.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setStatusFilter("all");
                  setCompanyFilter("all");
                  setRecruiterFilter("all");
                }}
                data-testid="button-clear-filters"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-card rounded-lg border border-border shadow-sm">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('jobCode')}
                    >
                      <div className="flex items-center gap-1">
                        ID Vaga
                        {sortColumn === 'jobCode' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('profession')}
                    >
                      <div className="flex items-center gap-1">
                        Profissão
                        {sortColumn === 'profession' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('company')}
                    >
                      <div className="flex items-center gap-1">
                        Empresa
                        {sortColumn === 'company' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('client')}
                    >
                      <div className="flex items-center gap-1">
                        Cliente
                        {sortColumn === 'client' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {sortColumn === 'status' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('applicationsCount')}
                    >
                      <div className="flex items-center gap-1">
                        Candidatos
                        {sortColumn === 'applicationsCount' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('salary')}
                    >
                      <div className="flex items-center gap-1">
                        Salário
                        {sortColumn === 'salary' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('sla')}
                    >
                      <div className="flex items-center gap-1">
                        SLA (14 dias)
                        {sortColumn === 'sla' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('recruiter')}
                    >
                      <div className="flex items-center gap-1">
                        Recrutador
                        {sortColumn === 'recruiter' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('creator')}
                    >
                      <div className="flex items-center gap-1">
                        Gestor
                        {sortColumn === 'creator' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-1">
                        Criado em
                        {sortColumn === 'createdAt' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedJobs && sortedJobs.length > 0 ? (
                    sortedJobs.map((job: any) => (
                      <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                        <TableCell>
                          <div 
                            className="font-bold text-primary cursor-pointer hover:underline" 
                            data-testid={`text-job-code-${job.id}`}
                            onClick={() => handleViewDetails(job.id)}
                            title="Clique para ver detalhes da vaga"
                          >
                            {job.jobCode || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <span>{job.profession?.name || job.title || "Profissão não definida"}</span>
                              {job.createdWithIrregularity && (
                                <span 
                                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700"
                                  title="Vaga criada com irregularidade (excedendo limite de vagas do cliente)"
                                  data-testid="badge-irregularity"
                                >
                                  <i className="fas fa-exclamation-triangle"></i>
                                  Irregularidade
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {job.profession?.category || ""}
                            </div>
                            {job.location && (
                              <div className="text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1" />
                                {job.location}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {job.company?.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {job.client?.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <JobStatusSelect
                            jobId={job.id}
                            currentStatus={job.status}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-medium">
                              {job.applicationsCount || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const sla = calculateSLA(job.startDate, job.admissionDate);
                            if (!sla) {
                              return <span className="text-xs text-muted-foreground">N/A</span>;
                            }
                            return (
                              <div className="flex items-center gap-2">
                                <div 
                                  className="text-sm font-medium px-2 py-1 rounded"
                                  style={{ 
                                    backgroundColor: sla.isWithinSLA ? '#dcfce7' : '#fee2e2',
                                    color: sla.isWithinSLA ? '#166534' : '#991b1b'
                                  }}
                                >
                                  {sla.daysTaken} dias
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {sla.isWithinSLA ? '✓' : '✗'} SLA: {sla.slaLimit}d
                                </div>
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {job.recruiter ? (
                              job.recruiter.firstName && job.recruiter.lastName 
                                ? `${job.recruiter.firstName} ${job.recruiter.lastName}`
                                : job.recruiter.email
                            ) : (
                              <span className="text-muted-foreground">Não atribuído</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {job.creator ? (
                              job.creator.firstName && job.creator.lastName 
                                ? `${job.creator.firstName} ${job.creator.lastName}`
                                : job.creator.email
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(job.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {job.hasDpCandidate && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(`/api/jobs/${job.id}/pdf`, '_blank')}
                                title="Baixar PDF do candidato em Departamento Pessoal"
                                data-testid={`button-pdf-${job.id}`}
                              >
                                <FileText className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOpenGenerateCandidates(job.id)}
                              title="Gerar candidatos aleatórios"
                              data-testid={`button-generate-candidates-${job.id}`}
                            >
                              <UserPlus className="h-4 w-4 text-orange-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleAssignToMe(job.id)}
                              title="Assumir esta vaga"
                              data-testid={`button-assign-${job.id}`}
                            >
                              <Users className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleGoToKanban(job.id)}
                              title="Ver Kanban desta vaga"
                              data-testid={`button-kanban-${job.id}`}
                            >
                              <LayoutDashboard className="h-4 w-4 text-purple-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(job.id)}
                              title="Ver detalhes da vaga"
                              data-testid={`button-details-${job.id}`}
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-12">
                        <div className="text-muted-foreground">
                          <Briefcase className="h-16 w-16 mb-4" />
                          <p className="text-lg font-medium mb-2">Nenhuma vaga encontrada</p>
                          <p className="text-sm">
                            {search
                              ? "Tente ajustar os filtros de busca"
                              : "Comece criando sua primeira vaga"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Job Modal */}
      <JobModal
        isOpen={showJobModal}
        onClose={handleCloseModal}
        initialClientId={initialClientId}
      />

      {/* Job Details Modal */}
      <JobDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        jobId={detailsJobId}
      />

      {/* Generate Candidates Dialog */}
      <Dialog open={showGenerateCandidatesDialog} onOpenChange={setShowGenerateCandidatesDialog}>
        <DialogContent data-testid="dialog-generate-candidates">
          <DialogHeader>
            <DialogTitle>Gerar Candidatos Aleatórios</DialogTitle>
            <DialogDescription>
              Crie candidatos de teste com dados aleatórios para esta vaga. Útil para demonstrações e testes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="candidate-count">Quantidade de Candidatos</Label>
              <Input
                id="candidate-count"
                type="number"
                min="1"
                max="100"
                value={candidateCount}
                onChange={(e) => setCandidateCount(parseInt(e.target.value) || 10)}
                data-testid="input-candidate-count"
              />
              <p className="text-sm text-muted-foreground">
                Digite um número entre 1 e 100
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGenerateCandidatesDialog(false)}
              data-testid="button-cancel-generate"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerateCandidates}
              disabled={generateCandidatesMutation.isPending || candidateCount < 1 || candidateCount > 100}
              data-testid="button-confirm-generate"
            >
              {generateCandidatesMutation.isPending ? "Gerando..." : "Gerar Candidatos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
