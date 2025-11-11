import { useQuery } from "@tanstack/react-query";
import type { 
  DashboardMetrics, 
  JobsByStatusResponse, 
  ApplicationsByMonthResponse, 
  JobsListResponse,
  OpenJobsByMonthResponse,
  JobsByCreatorResponse,
  JobsByCompanyResponse,
  JobsSLAResponse,
  JobsByWorkPositionResponse,
  JobsByCostCenterResponse
} from "@shared/schema";
import { useState } from "react";
import Layout from "@/components/Layout";
import MetricsCard from "@/components/MetricsCard";
import JobModal from "@/components/JobModal";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { 
  Briefcase, 
  CheckCircle, 
  UserPlus,
  Users, 
  Building2, 
  Search,
  Eye,
  Calendar,
  ChevronDown,
  X
} from "lucide-react";

const statusColors: Record<string, string> = {
  "Nova Vaga": '#1e3a8a',
  "Aprovada": '#1e40af',
  "Em Recrutamento": '#2563eb',
  "Em DP": '#3b82f6',
  "Em Admissão": '#60a5fa',
  "Admitido": '#1d4ed8',
  "Cancelada": '#1e40af'
};

const statusLabels: Record<string, string> = {
  aberto: "Abertas",
  aprovada: "Aprovadas",
  em_recrutamento: "Em Recrutamento",
  em_documentacao: "Em Documentação",
  dp: "DP",
  closed: "Fechadas"
};

const divisions = [
  "Facilities",
  "Engenharia",
  "Manutenção",
  "Indústria",
  "Mobilidade",
  "Administrativo"
];

export default function Dashboard() {
  const [showJobModal, setShowJobModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [selectedRecruiters, setSelectedRecruiters] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  
  // Gerar lista dos últimos 12 meses
  const getMonthOptions = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7); // YYYY-MM
      const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      months.push({ 
        value, 
        label: label.charAt(0).toUpperCase() + label.slice(1) 
      });
    }
    
    return months;
  };

  // Fetch companies for filter
  const { data: companies } = useQuery<any[]>({
    queryKey: ["/api/companies"],
  });

  // Fetch users (recruiters) for filter
  const { data: users } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const { data: metrics, isLoading: metricsLoading} = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics", selectedMonths, selectedCompanies, selectedDivisions, selectedRecruiters, selectedJobTypes],
    queryFn: async () => {
      const params = new URLSearchParams();
      selectedMonths.forEach(month => params.append("month", month));
      selectedCompanies.forEach(company => params.append("companyId", company));
      selectedDivisions.forEach(div => params.append("division", div));
      selectedRecruiters.forEach(rec => params.append("recruiterId", rec));
      selectedJobTypes.forEach(type => params.append("jobType", type));
      const res = await fetch(`/api/dashboard/metrics?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return await res.json();
    }
  });

  const { data: jobsByStatus, isLoading: jobsByStatusLoading } = useQuery<JobsByStatusResponse>({
    queryKey: ["/api/dashboard/jobs-by-status", selectedMonths, selectedCompanies, selectedDivisions, selectedRecruiters, selectedJobTypes],
    queryFn: async () => {
      const params = new URLSearchParams();
      selectedMonths.forEach(month => params.append("month", month));
      selectedCompanies.forEach(company => params.append("companyId", company));
      selectedDivisions.forEach(div => params.append("division", div));
      selectedRecruiters.forEach(rec => params.append("recruiterId", rec));
      selectedJobTypes.forEach(type => params.append("jobType", type));
      const res = await fetch(`/api/dashboard/jobs-by-status?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch jobs by status');
      return await res.json();
    }
  });

  const { data: applicationsByMonth, isLoading: applicationsByMonthLoading } = useQuery<ApplicationsByMonthResponse>({
    queryKey: ["/api/dashboard/applications-by-month"],
  });

  const { data: openJobsByMonth, isLoading: openJobsByMonthLoading } = useQuery<OpenJobsByMonthResponse>({
    queryKey: ["/api/dashboard/open-jobs-by-month"],
  });

  const { data: jobsByCreator, isLoading: jobsByCreatorLoading } = useQuery<JobsByCreatorResponse>({
    queryKey: ["/api/dashboard/jobs-by-creator", selectedMonths, selectedCompanies, selectedDivisions, selectedRecruiters, selectedJobTypes],
    queryFn: async () => {
      const params = new URLSearchParams();
      selectedMonths.forEach(month => params.append("month", month));
      selectedCompanies.forEach(company => params.append("companyId", company));
      selectedDivisions.forEach(div => params.append("division", div));
      selectedRecruiters.forEach(rec => params.append("recruiterId", rec));
      selectedJobTypes.forEach(type => params.append("jobType", type));
      const res = await fetch(`/api/dashboard/jobs-by-creator?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch jobs by creator');
      return await res.json();
    }
  });

  const { data: jobsByCompany, isLoading: jobsByCompanyLoading } = useQuery<JobsByCompanyResponse>({
    queryKey: ["/api/dashboard/jobs-by-company", selectedMonths, selectedCompanies, selectedDivisions, selectedRecruiters, selectedJobTypes],
    queryFn: async () => {
      const params = new URLSearchParams();
      selectedMonths.forEach(month => params.append("month", month));
      selectedCompanies.forEach(company => params.append("companyId", company));
      selectedDivisions.forEach(div => params.append("division", div));
      selectedRecruiters.forEach(rec => params.append("recruiterId", rec));
      selectedJobTypes.forEach(type => params.append("jobType", type));
      const res = await fetch(`/api/dashboard/jobs-by-company?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch jobs by company');
      return await res.json();
    }
  });

  const { data: jobsByClient, isLoading: jobsByClientLoading } = useQuery<Array<{ clientId: string; clientName: string; count: number }>>({
    queryKey: ["/api/dashboard/jobs-by-client", selectedMonths, selectedCompanies, selectedDivisions, selectedRecruiters, selectedJobTypes],
    queryFn: async () => {
      const params = new URLSearchParams();
      selectedMonths.forEach(month => params.append("month", month));
      selectedCompanies.forEach(company => params.append("companyId", company));
      selectedDivisions.forEach(div => params.append("division", div));
      selectedRecruiters.forEach(rec => params.append("recruiterId", rec));
      selectedJobTypes.forEach(type => params.append("jobType", type));
      const res = await fetch(`/api/dashboard/jobs-by-client?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch jobs by client');
      return await res.json();
    }
  });

  const { data: jobsSLA, isLoading: jobsSLALoading } = useQuery<JobsSLAResponse>({
    queryKey: ["/api/dashboard/jobs-sla", selectedMonths, selectedCompanies, selectedDivisions, selectedRecruiters, selectedJobTypes],
    queryFn: async () => {
      const params = new URLSearchParams();
      selectedMonths.forEach(month => params.append("month", month));
      selectedCompanies.forEach(company => params.append("companyId", company));
      selectedDivisions.forEach(div => params.append("division", div));
      selectedRecruiters.forEach(rec => params.append("recruiterId", rec));
      selectedJobTypes.forEach(type => params.append("jobType", type));
      const res = await fetch(`/api/dashboard/jobs-sla?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch jobs SLA');
      return await res.json();
    }
  });

  const { data: jobsProductivity, isLoading: jobsProductivityLoading } = useQuery<{ productive: number; unproductive: number }>({
    queryKey: ["/api/dashboard/jobs-productivity", selectedMonths, selectedCompanies, selectedDivisions, selectedRecruiters, selectedJobTypes],
    queryFn: async () => {
      const params = new URLSearchParams();
      selectedMonths.forEach(month => params.append("month", month));
      selectedCompanies.forEach(company => params.append("companyId", company));
      selectedDivisions.forEach(div => params.append("division", div));
      selectedRecruiters.forEach(rec => params.append("recruiterId", rec));
      selectedJobTypes.forEach(type => params.append("jobType", type));
      const res = await fetch(`/api/dashboard/jobs-productivity?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch jobs productivity');
      return await res.json();
    }
  });

  const { data: allJobsByCreator, isLoading: allJobsByCreatorLoading } = useQuery<JobsByCreatorResponse>({
    queryKey: ["/api/dashboard/all-jobs-by-creator", selectedMonths, selectedCompanies, selectedDivisions, selectedRecruiters, selectedJobTypes],
    queryFn: async () => {
      const params = new URLSearchParams();
      selectedMonths.forEach(month => params.append("month", month));
      selectedCompanies.forEach(company => params.append("companyId", company));
      selectedDivisions.forEach(div => params.append("division", div));
      selectedRecruiters.forEach(rec => params.append("recruiterId", rec));
      selectedJobTypes.forEach(type => params.append("jobType", type));
      const res = await fetch(`/api/dashboard/all-jobs-by-creator?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch all jobs by creator');
      return await res.json();
    }
  });

  const { data: jobsByWorkPosition, isLoading: jobsByWorkPositionLoading } = useQuery<JobsByWorkPositionResponse>({
    queryKey: ["/api/dashboard/jobs-by-work-position", selectedMonths, selectedCompanies, selectedDivisions, selectedRecruiters, selectedJobTypes],
    queryFn: async () => {
      const params = new URLSearchParams();
      selectedMonths.forEach(month => params.append("month", month));
      selectedCompanies.forEach(company => params.append("companyId", company));
      selectedDivisions.forEach(div => params.append("division", div));
      selectedRecruiters.forEach(rec => params.append("recruiterId", rec));
      selectedJobTypes.forEach(type => params.append("jobType", type));
      const res = await fetch(`/api/dashboard/jobs-by-work-position?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch jobs by work position');
      return await res.json();
    }
  });

  const { data: jobsByCostCenter, isLoading: jobsByCostCenterLoading } = useQuery<JobsByCostCenterResponse>({
    queryKey: ["/api/dashboard/jobs-by-cost-center", selectedMonths, selectedCompanies, selectedDivisions, selectedRecruiters, selectedJobTypes],
    queryFn: async () => {
      const params = new URLSearchParams();
      selectedMonths.forEach(month => params.append("month", month));
      selectedCompanies.forEach(company => params.append("companyId", company));
      selectedDivisions.forEach(div => params.append("division", div));
      selectedRecruiters.forEach(rec => params.append("recruiterId", rec));
      selectedJobTypes.forEach(type => params.append("jobType", type));
      const res = await fetch(`/api/dashboard/jobs-by-cost-center?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch jobs by cost center');
      return await res.json();
    }
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery<JobsListResponse>({
    queryKey: ["/api/jobs", search],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "10",
        offset: "0",
        ...(search && { search })
      });
      const res = await fetch(`/api/jobs?${params}`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error('Failed to fetch jobs');
      return await res.json();
    }
  });

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    closed: "default",
    aberto: "default",
    aprovada: "default",
    em_recrutamento: "outline",
    em_documentacao: "secondary"
  };

  const formatSalary = (min?: string, max?: string) => {
    if (!min && !max) return "Não informado";
    if (!min) return `Até R$ ${parseFloat(max!).toLocaleString()}`;
    if (!max) return `R$ ${parseFloat(min).toLocaleString()}`;
    return `R$ ${parseFloat(min).toLocaleString()} - ${parseFloat(max).toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <>
      <TopBar
        title="Dashboard"
        showCreateButton
        onCreateClick={() => setShowJobModal(true)}
        createButtonText="Nova Vaga"
      />

      <div className="space-y-8">
        {/* Filtros */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Filtro por Período */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Período de Análise</h3>
                    <p className="text-xs text-muted-foreground">Escolha um ou mais períodos</p>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-between"
                      data-testid="select-month-filter"
                    >
                      <span className="truncate">
                        {selectedMonths.length === 0
                          ? "Todos os períodos"
                          : `${selectedMonths.length} período(s)`}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="end">
                    <div className="flex items-center justify-between border-b px-3 py-2">
                      <span className="text-sm font-medium">Períodos</span>
                      {selectedMonths.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setSelectedMonths([])}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {getMonthOptions().map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                          onClick={() => {
                            setSelectedMonths((prev) =>
                              prev.includes(option.value)
                                ? prev.filter((m) => m !== option.value)
                                : [...prev, option.value]
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedMonths.includes(option.value)}
                            onCheckedChange={(checked) => {
                              setSelectedMonths((prev) =>
                                checked
                                  ? [...prev, option.value]
                                  : prev.filter((m) => m !== option.value)
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-sm">{option.label}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Filtro por Empresa */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Filtrar por Empresa</h3>
                    <p className="text-xs text-muted-foreground">Escolha uma ou mais empresas</p>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-between"
                      data-testid="select-company-filter"
                    >
                      <span className="truncate">
                        {selectedCompanies.length === 0
                          ? "Todas as empresas"
                          : `${selectedCompanies.length} empresa(s)`}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-0" align="end">
                    <div className="flex items-center justify-between border-b px-3 py-2">
                      <span className="text-sm font-medium">Empresas</span>
                      {selectedCompanies.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setSelectedCompanies([])}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {companies?.map((company: any) => (
                        <div
                          key={company.id}
                          className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                          onClick={() => {
                            setSelectedCompanies((prev) =>
                              prev.includes(company.id)
                                ? prev.filter((c) => c !== company.id)
                                : [...prev, company.id]
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedCompanies.includes(company.id)}
                            onCheckedChange={(checked) => {
                              setSelectedCompanies((prev) =>
                                checked
                                  ? [...prev, company.id]
                                  : prev.filter((c) => c !== company.id)
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-sm">{company.name}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Filtro por Divisão */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Filtrar por Divisão</h3>
                    <p className="text-xs text-muted-foreground">Escolha uma ou mais divisões</p>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-between"
                      data-testid="select-division-filter"
                    >
                      <span className="truncate">
                        {selectedDivisions.length === 0
                          ? "Todas as divisões"
                          : `${selectedDivisions.length} selecionada(s)`}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-0" align="end">
                    <div className="flex items-center justify-between border-b px-3 py-2">
                      <span className="text-sm font-medium">Divisões</span>
                      {selectedDivisions.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setSelectedDivisions([])}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {divisions.map((division) => (
                        <div
                          key={division}
                          className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                          onClick={() => {
                            setSelectedDivisions((prev) =>
                              prev.includes(division)
                                ? prev.filter((d) => d !== division)
                                : [...prev, division]
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedDivisions.includes(division)}
                            onCheckedChange={(checked) => {
                              setSelectedDivisions((prev) =>
                                checked
                                  ? [...prev, division]
                                  : prev.filter((d) => d !== division)
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-sm">{division}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Filtro por Recrutador */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Filtrar por Recrutador</h3>
                    <p className="text-xs text-muted-foreground">Escolha um ou mais recrutadores</p>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-between"
                      data-testid="select-recruiter-filter"
                    >
                      <span className="truncate">
                        {selectedRecruiters.length === 0
                          ? "Todos os recrutadores"
                          : `${selectedRecruiters.length} selecionado(s)`}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-0" align="end">
                    <div className="flex items-center justify-between border-b px-3 py-2">
                      <span className="text-sm font-medium">Recrutadores</span>
                      {selectedRecruiters.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setSelectedRecruiters([])}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {users?.map((user: any) => {
                        const userName = user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.email;
                        return (
                          <div
                            key={user.id}
                            className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                            onClick={() => {
                              setSelectedRecruiters((prev) =>
                                prev.includes(user.id)
                                  ? prev.filter((id) => id !== user.id)
                                  : [...prev, user.id]
                              );
                            }}
                          >
                            <Checkbox
                              checked={selectedRecruiters.includes(user.id)}
                              onCheckedChange={(checked) => {
                                setSelectedRecruiters((prev) =>
                                  checked
                                    ? [...prev, user.id]
                                    : prev.filter((id) => id !== user.id)
                                );
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-sm">{userName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Filtro por Tipo de Vaga */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Tipo de Vaga</h3>
                    <p className="text-xs text-muted-foreground">Produtivas ou Improdutivas</p>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-between"
                      data-testid="select-job-type-filter"
                    >
                      <span className="truncate">
                        {selectedJobTypes.length === 0
                          ? "Todos os tipos"
                          : selectedJobTypes.length === 1
                          ? selectedJobTypes[0] === "produtiva"
                            ? "Produtivas"
                            : "Improdutivas"
                          : "Ambos"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-0" align="end">
                    <div className="flex items-center justify-between border-b px-3 py-2">
                      <span className="text-sm font-medium">Tipo de Vaga</span>
                      {selectedJobTypes.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setSelectedJobTypes([])}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {[
                        { value: "produtiva", label: "Produtivas" },
                        { value: "improdutiva", label: "Improdutivas" }
                      ].map((type) => (
                        <div
                          key={type.value}
                          className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                          onClick={() => {
                            setSelectedJobTypes((prev) =>
                              prev.includes(type.value)
                                ? prev.filter((t) => t !== type.value)
                                : [...prev, type.value]
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedJobTypes.includes(type.value)}
                            onCheckedChange={(checked) => {
                              setSelectedJobTypes((prev) =>
                                checked
                                  ? [...prev, type.value]
                                  : prev.filter((t) => t !== type.value)
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-sm">{type.label}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metricsLoading ? (
            <>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </>
          ) : (
            <>
              <MetricsCard
                title="Vagas abertas no mês"
                value={metrics?.totalJobs || 0}
                icon={Briefcase}
                iconBgColor="bg-blue-100 dark:bg-blue-900/30"
                iconColor="text-blue-600 dark:text-blue-400"
                description="Vagas abertas no período selecionado"
              />
              <MetricsCard
                title="Total de vagas em aberto"
                value={metrics?.openJobsCurrentMonth || 0}
                icon={CheckCircle}
                iconBgColor="bg-blue-100 dark:bg-blue-900/30"
                iconColor="text-blue-700 dark:text-blue-300"
                description="Vagas sem data de admissão"
              />
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2563eb' }}></div>
                Vagas por Status
              </CardTitle>
              <CardDescription>Distribuição das vagas por situação atual</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsByStatusLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={jobsByStatus?.map((item) => ({
                        name: item.status,
                        value: item.count
                      })) || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent, value }) => `${name} (${value}) ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {jobsByStatus?.map((entry, index: number) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#6b7280'} />
                      )) || []}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                Vagas e SLA
              </CardTitle>
              <CardDescription>Distribuição de vagas dentro e fora do prazo</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsSLALoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="flex items-center justify-around h-64">
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-2" style={{ color: '#3B82F6' }}>
                      {jobsSLA?.withinSLA || 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Dentro do SLA
                    </div>
                  </div>
                  <div className="h-32 w-px bg-border"></div>
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-2" style={{ color: '#1D4ED8' }}>
                      {jobsSLA?.outsideSLA || 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Fora do SLA
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2563eb' }}></div>
                Produtividade das Vagas
              </CardTitle>
              <CardDescription>Vagas produtivas vs improdutivas</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsProductivityLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="flex items-center justify-around h-64">
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-2" style={{ color: '#2563eb' }}>
                      {jobsProductivity?.productive || 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Produtivas
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Com contratação
                    </div>
                  </div>
                  <div className="h-32 w-px bg-border"></div>
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-2" style={{ color: '#60a5fa' }}>
                      {jobsProductivity?.unproductive || 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Improdutivas
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Sem contratação
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-5 rounded-full"></div>
                Taxa de Produtividade
              </CardTitle>
              <CardDescription>Percentual de vagas que resultaram em contratação</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsProductivityLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Produtivas', value: jobsProductivity?.productive || 0 },
                        { name: 'Improdutivas', value: jobsProductivity?.unproductive || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent, value }) => `${name} (${value}) ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="hsl(var(--chart-5))"
                      dataKey="value"
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                Vagas em Recrutamento por Usuário
              </CardTitle>
              <CardDescription>Top 5 usuários com mais vagas em recrutamento</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsByCreatorLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart 
                    data={jobsByCreator?.slice(0, 5).map((item) => ({
                      name: item.creatorName,
                      value: item.count
                    })) || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                      {jobsByCreator?.slice(0, 5).map((_, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#60A5FA', '#2563EB', '#10b981', '#5B9FED'][index % 5]} />
                      )) || []}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
                Vagas Abertas por Empresa
              </CardTitle>
              <CardDescription>Top 5 empresas com mais vagas abertas</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsByCompanyLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={jobsByCompany?.slice(0, 5).map((item) => ({
                        name: item.companyName,
                        value: item.count
                      })) || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="hsl(var(--chart-4))"
                      dataKey="value"
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {jobsByCompany?.slice(0, 5).map((item, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={item.companyColor || '#10b981'} 
                        />
                      )) || []}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vagas por Solicitante */}
        <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Vagas por Solicitante (Gestor)
            </CardTitle>
            <CardDescription>Quantidade de vagas criadas por cada gestor solicitante</CardDescription>
          </CardHeader>
          <CardContent>
            {allJobsByCreatorLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart 
                  data={allJobsByCreator?.slice(0, 10).map((item) => ({
                    name: item.creatorName,
                    value: item.count
                  })) || []} 
                  layout="horizontal"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0, 8, 8, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Vagas por Cliente */}
        <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
              Vagas por Cliente
            </CardTitle>
            <CardDescription>Top 5 clientes com mais vagas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {jobsByClientLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : !jobsByClient || jobsByClient.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">Nenhum dado disponível</p>
                  <p className="text-sm mt-2">Cadastre clientes e vincule-os às vagas</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart 
                  data={jobsByClient?.slice(0, 5).map((item) => ({
                    name: item.clientName,
                    value: item.count
                  })) || []} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} barSize={80} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Novos gráficos: Posto de Trabalho e Centro de Custos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vagas por Posto de Trabalho */}
          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
                Vagas por Posto de Trabalho
              </CardTitle>
              <CardDescription>Top 10 postos de trabalho com mais vagas abertas</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsByWorkPositionLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : !jobsByWorkPosition || jobsByWorkPosition.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">Nenhum dado disponível</p>
                    <p className="text-sm mt-2">Cadastre vagas com postos de trabalho</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart 
                    data={jobsByWorkPosition?.slice(0, 10).map((item) => ({
                      name: item.workPosition,
                      value: item.count
                    })) || []} 
                    layout="horizontal"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[0, 8, 8, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Vagas por Centro de Custos */}
          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                Vagas por Centro de Custos
              </CardTitle>
              <CardDescription>Top 10 centros de custo com mais vagas abertas</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsByCostCenterLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : !jobsByCostCenter || jobsByCostCenter.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">Nenhum dado disponível</p>
                    <p className="text-sm mt-2">Cadastre vagas com centros de custo</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart 
                    data={jobsByCostCenter?.slice(0, 10).map((item) => ({
                      name: item.costCenterName,
                      value: item.count
                    })) || []} 
                    layout="horizontal"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Jobs Table */}
        <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                  Vagas Recentes
                </CardTitle>
                <CardDescription>Últimas vagas cadastradas no sistema</CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input
                    placeholder="Buscar vagas..."
                    className="pl-10 w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="input-search-jobs"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">

            {jobsLoading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Candidatos</TableHead>
                    <TableHead>Salário</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(jobs) && jobs.length > 0 ? (
                    jobs.map((job: any) => (
                      <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground" data-testid={`text-job-title-${job.id}`}>
                              {job.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {job.department || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div 
                            className="text-sm font-medium"
                            style={{
                              color: job.company?.color || 'inherit'
                            }}
                          >
                            {job.company?.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {job.status === "closed" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white border" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}>
                              {statusLabels[job.status] || job.status}
                            </span>
                          ) : (
                            <Badge variant={statusVariants[job.status] || "secondary"}>
                              {statusLabels[job.status] || job.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2" data-testid={`text-applications-count-${job.id}`}>
                              {job.applicationsCount || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(job.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" data-testid={`button-edit-job-${job.id}`}>
                              <Eye className="h-4 w-4" style={{ color: '#2563eb' }} />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Users className="h-4 w-4" style={{ color: '#2563eb' }} />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground text-center">
                          <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <p>Nenhuma vaga encontrada</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          </CardContent>
        </Card>
      </div>

      <JobModal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
      />
    </>
  );
}
