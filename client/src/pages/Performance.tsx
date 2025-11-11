import { useQuery } from "@tanstack/react-query";
import type { DashboardMetrics, JobsByStatusResponse, ApplicationsByMonthResponse } from "@shared/schema";
import Layout from "@/components/Layout";
import TopBar from "@/components/TopBar";
import MetricsCard from "@/components/MetricsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Star, 
  Target, 
  Users, 
  BarChart3, 
  Lightbulb, 
  CheckCircle, 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle
} from "lucide-react";

const COLORS = ['#1e3a8a', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa'];

export default function Performance() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: jobsByStatus, isLoading: jobsByStatusLoading } = useQuery<JobsByStatusResponse>({
    queryKey: ["/api/dashboard/jobs-by-status"],
  });

  const { data: applicationsByMonth, isLoading: applicationsByMonthLoading } = useQuery<ApplicationsByMonthResponse>({
    queryKey: ["/api/dashboard/applications-by-month"],
  });

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <>
      <TopBar title="Desempenho" />
      
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metricsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))
          ) : (
            <>
              <MetricsCard
                title="Taxa de Conversão"
                value="24.5%"
                icon={TrendingUp}
                iconBgColor="bg-blue-100 dark:bg-blue-900/30"
                iconColor="text-blue-600 dark:text-blue-400"
                description="Candidatos convertidos em contratações"
                trend={{ value: "+2.1%", isPositive: true }}
                subtitle="vs. período anterior"
              />
              <MetricsCard
                title="Tempo Médio p/ Contratação"
                value="18 dias"
                icon={Clock}
                iconBgColor="bg-warning/10"
                iconColor="text-warning"
                description="Do início ao término do processo"
                trend={{ value: "-3 dias", isPositive: true }}
              />
              <MetricsCard
                title="Custo por Contratação"
                value="R$ 1.250"
                icon={DollarSign}
                iconBgColor="bg-success/10"
                iconColor="text-success"
                description="Investimento total por contratação"
                trend={{ value: "-5.2%", isPositive: true }}
              />
              <MetricsCard
                title="Satisfação do Candidato"
                value="4.2/5"
                icon={Star}
                iconBgColor="bg-warning/10"
                iconColor="text-warning"
                description="Avaliação média dos candidatos"
                trend={{ value: "+0.3", isPositive: true }}
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Candidaturas</CardTitle>
            </CardHeader>
            <CardContent>
              {applicationsByMonthLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={applicationsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      name="Candidaturas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Job Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Status das Vagas</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsByStatusLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={jobsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#2563eb"
                      dataKey="count"
                    >
                      {jobsByStatus?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" style={{ color: '#2563eb' }} />
                Eficiência do Recrutamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Vagas preenchidas</span>
                <span className="text-lg font-bold" style={{ color: '#1e40af' }}>78%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="h-2 rounded-full" style={{ width: '78%', backgroundColor: '#1e40af' }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Dentro do prazo</span>
                <span className="text-lg font-bold" style={{ color: '#2563eb' }}>82%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="h-2 rounded-full" style={{ width: '82%', backgroundColor: '#2563eb' }}></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" style={{ color: '#2563eb' }} />
                Qualidade dos Candidatos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#2563eb' }}>8.4</div>
                <p className="text-sm text-muted-foreground">Score médio de qualificação</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Perfil ideal</span>
                  <span className="text-sm font-medium">34%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Qualificado</span>
                  <span className="text-sm font-medium">52%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Em desenvolvimento</span>
                  <span className="text-sm font-medium">14%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" style={{ color: '#2563eb' }} />
                Métricas de Engajamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de resposta</span>
                  <span className="text-sm font-bold" style={{ color: '#1e40af' }}>+15%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tempo de resposta</span>
                  <span className="text-sm font-bold" style={{ color: '#2563eb' }}>2.3h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Abandono no processo</span>
                  <span className="text-sm font-bold" style={{ color: '#3b82f6' }}>12%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Net Promoter Score</span>
                  <span className="text-sm font-bold" style={{ color: '#2563eb' }}>72</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights and Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" style={{ color: '#60a5fa' }} />
              Insights e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center" style={{ color: '#1e40af' }}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Pontos Fortes
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <ArrowUp className="h-4 w-4 mr-2 mt-1" style={{ color: '#2563eb' }} />
                    Taxa de conversão 23% acima da média do setor
                  </li>
                  <li className="flex items-start">
                    <ArrowUp className="h-4 w-4 mr-2 mt-1" style={{ color: '#2563eb' }} />
                    Tempo médio de contratação reduziu em 18% este mês
                  </li>
                  <li className="flex items-start">
                    <ArrowUp className="h-4 w-4 mr-2 mt-1" style={{ color: '#2563eb' }} />
                    Alta satisfação dos candidatos (4.2/5)
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium flex items-center" style={{ color: '#3b82f6' }}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Oportunidades de Melhoria
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <ArrowDown className="h-4 w-4 mr-2 mt-1" style={{ color: '#60a5fa' }} />
                    Reduzir taxa de abandono no processo de candidatura
                  </li>
                  <li className="flex items-start">
                    <ArrowDown className="h-4 w-4 mr-2 mt-1" style={{ color: '#60a5fa' }} />
                    Melhorar tempo de resposta para candidatos
                  </li>
                  <li className="flex items-start">
                    <ArrowDown className="h-4 w-4 mr-2 mt-1" style={{ color: '#60a5fa' }} />
                    Aumentar diversidade nas contratações
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
