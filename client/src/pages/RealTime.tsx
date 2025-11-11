import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Briefcase, TrendingUp, Clock, CheckCircle, XCircle, Activity, Calendar, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocation } from "wouter";

const CHART_COLORS = [
  "#1e3a8a",
  "#1e40af",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
];

interface RealTimeData {
  client: {
    id: string;
    name: string;
    cnpj: string;
    jobLimit: number | null;
  };
  metrics: {
    totalJobs: number;
    openJobs: number;
    closedJobs: number;
    averageTimeToClose: number;
  };
  statusDistribution: Array<{
    status: string;
    count: number;
  }>;
  recentJobs: Array<{
    id: string;
    title: string;
    openingDate: string;
    admissionDate: string | null;
  }>;
  kanbanDistribution: Array<{
    stageName: string;
    stageColor: string;
    candidateCount: number;
    jobTitle: string;
  }>;
}

export default function RealTime() {
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [, setLocation] = useLocation();

  // Fetch all clients
  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ["/api/clients"],
  });

  // Fetch real-time data for selected client
  const { data: realtimeData, isLoading } = useQuery<RealTimeData>({
    queryKey: ["/api/realtime/client", selectedClientId],
    enabled: !!selectedClientId,
  });

  const handleNewJob = () => {
    if (selectedClientId) {
      // Navigate to Jobs page with pre-filled client
      setLocation(`/jobs?clientId=${selectedClientId}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" style={{ color: '#2563eb' }} />
            Dashboard em Tempo Real
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe as vagas e métricas do cliente em tempo real
          </p>
        </div>
        {selectedClientId && (
          <Button 
            onClick={handleNewJob} 
            size="lg"
            className="gap-2"
            data-testid="button-new-job"
          >
            <Plus className="h-5 w-5" />
            Nova Vaga
          </Button>
        )}
      </div>

      {/* Client Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione um Cliente</CardTitle>
          <CardDescription>Escolha o cliente para visualizar suas vagas e métricas</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-full" data-testid="select-client">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client: any) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} - {client.cnpj}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Dashboard Content */}
      {selectedClientId && !isLoading && realtimeData && (
        <div className="space-y-6">
          {/* Client Information */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {realtimeData.client.name}
              </CardTitle>
              <CardDescription>
                CNPJ: {realtimeData.client.cnpj} | Limite de Vagas: {realtimeData.client.jobLimit || "Ilimitado"}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-total-jobs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Vagas</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{realtimeData.metrics.totalJobs}</div>
                <p className="text-xs text-muted-foreground">
                  Todas as vagas do cliente
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-open-jobs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vagas Abertas</CardTitle>
                <TrendingUp className="h-4 w-4" style={{ color: '#1e40af' }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: '#1e40af' }}>{realtimeData.metrics.openJobs}</div>
                <p className="text-xs text-muted-foreground">
                  Em processo de recrutamento
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-closed-jobs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vagas Fechadas</CardTitle>
                <CheckCircle className="h-4 w-4" style={{ color: '#2563eb' }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: '#2563eb' }}>{realtimeData.metrics.closedJobs}</div>
                <p className="text-xs text-muted-foreground">
                  Com admissão realizada
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-avg-time">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Clock className="h-4 w-4" style={{ color: '#3b82f6' }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: '#3b82f6' }}>
                  {realtimeData.metrics.averageTimeToClose > 0 
                    ? `${realtimeData.metrics.averageTimeToClose} dias`
                    : "N/A"
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Tempo médio de fechamento
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Tables */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Status Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>Quantidade de vagas em cada status</CardDescription>
              </CardHeader>
              <CardContent>
                {realtimeData.statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={realtimeData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count }) => `${status}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {realtimeData.statusDistribution.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Vagas Recentes</CardTitle>
                <CardDescription>Últimas 5 vagas abertas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realtimeData.recentJobs.length > 0 ? (
                    realtimeData.recentJobs.map((job: any) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                        data-testid={`job-${job.id}`}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{job.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(job.openingDate), "dd/MM/yyyy", { locale: ptBR })}
                            </Badge>
                            {job.admissionDate ? (
                              <Badge variant="default" className="text-xs" style={{ backgroundColor: '#2563eb' }}>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Fechada
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <Activity className="h-3 w-3 mr-1" />
                                Aberta
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      Nenhuma vaga cadastrada
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kanban Distribution (if available) */}
          {realtimeData.kanbanDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Etapas do Kanban</CardTitle>
                <CardDescription>Distribuição de vagas pelas etapas do pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {realtimeData.kanbanDistribution.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-accent/30 transition-colors"
                      style={{ borderColor: item.stageColor }}
                      data-testid={`kanban-stage-${index}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="inline-block px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${item.stageColor}20`,
                            color: item.stageColor,
                          }}
                        >
                          {item.stageName}
                        </div>
                        <Badge variant="secondary" className="gap-1">
                          <Users className="h-3 w-3" />
                          {item.candidateCount || 0}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">{item.jobTitle}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Indicators */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realtimeData.client.jobLimit
                    ? `${Math.round((realtimeData.metrics.totalJobs / realtimeData.client.jobLimit) * 100)}%`
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {realtimeData.metrics.totalJobs} de {realtimeData.client.jobLimit || "∞"} vagas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: '#2563eb' }}>
                  {realtimeData.metrics.totalJobs > 0
                    ? `${Math.round((realtimeData.metrics.closedJobs / realtimeData.metrics.totalJobs) * 100)}%`
                    : "0%"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Vagas concluídas com sucesso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Vagas em Andamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: '#1e40af' }}>
                  {realtimeData.metrics.openJobs}
                </div>
                <p className="text-xs text-muted-foreground">
                  {realtimeData.metrics.totalJobs > 0
                    ? `${Math.round((realtimeData.metrics.openJobs / realtimeData.metrics.totalJobs) * 100)}% do total`
                    : "Nenhuma vaga"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedClientId && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Activity className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Selecione um Cliente</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Escolha um cliente acima para visualizar o dashboard em tempo real com métricas detalhadas e informações sobre as vagas.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {selectedClientId && isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Carregando dados do cliente...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
