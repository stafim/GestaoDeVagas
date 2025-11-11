import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Database, CheckCircle2, XCircle, Loader2, RefreshCw, Save } from "lucide-react";

const seniorIntegrationFormSchema = z.object({
  apiUrl: z.string().url("URL da API deve ser válida"),
  apiKey: z.string().min(10, "API Key deve ter no mínimo 10 caracteres"),
  isActive: z.boolean().default(true),
  autoSync: z.boolean().default(false),
  syncInterval: z.number().min(5, "Intervalo mínimo é de 5 minutos").max(1440, "Intervalo máximo é de 24 horas").default(60),
});

type SeniorIntegrationFormData = z.infer<typeof seniorIntegrationFormSchema>;

type SeniorIntegrationSetting = {
  id: string;
  organizationId: string;
  apiUrl: string;
  apiKey: string;
  isActive: boolean;
  autoSync: boolean;
  syncInterval: number;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  lastSyncError?: string;
  createdAt: string;
  updatedAt: string;
};

export function SeniorIntegrationSettings() {
  const { toast } = useToast();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<any>(null);

  const form = useForm<SeniorIntegrationFormData>({
    resolver: zodResolver(seniorIntegrationFormSchema),
    defaultValues: {
      apiUrl: "https://senior-sql.acelera-it.io",
      apiKey: "",
      isActive: true,
      autoSync: false,
      syncInterval: 60,
    },
  });

  // Query para buscar configurações existentes
  const { data: settings, isLoading } = useQuery<SeniorIntegrationSetting | null>({
    queryKey: ["/api/senior-integration/settings"],
    onSuccess: (data) => {
      if (data) {
        form.reset({
          apiUrl: data.apiUrl,
          apiKey: data.apiKey === '***' ? '' : data.apiKey, // Se vier mascarado, deixa vazio
          isActive: data.isActive,
          autoSync: data.autoSync,
          syncInterval: data.syncInterval,
        });
      }
    },
  });

  // Mutation para salvar configurações
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: SeniorIntegrationFormData) => {
      const response = await apiRequest("POST", "/api/senior-integration/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/senior-integration/settings"] });
      toast({
        title: "Sucesso",
        description: "Configurações da integração Senior salvas com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar configurações",
        variant: "destructive",
      });
    },
  });

  // Função para testar conexão
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);

    try {
      const response = await fetch("/api/senior-integration/test-connection", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();
      setConnectionTestResult(result);

      if (result.success) {
        toast({
          title: "Conexão bem-sucedida!",
          description: `Conectado com sucesso. ${result.employeesCount} colaboradores encontrados.`,
        });
      } else {
        toast({
          title: "Falha na conexão",
          description: result.error || "Não foi possível conectar à API Senior",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao testar conexão",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Função para sincronizar dados
  const handleSync = async () => {
    setIsSyncing(true);

    try {
      const response = await fetch("/api/senior-integration/sync", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Sincronização completa!",
          description: result.message,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/senior-integration/settings"] });
      } else {
        toast({
          title: "Falha na sincronização",
          description: result.error || "Não foi possível sincronizar dados",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao sincronizar dados",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const onSubmit = (data: SeniorIntegrationFormData) => {
    saveSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Integração Senior HCM</CardTitle>
              <CardDescription>
                Configure a conexão com o banco de dados do HCM Senior
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="apiUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da API</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://senior-sql.acelera-it.io" data-testid="input-senior-api-url" />
                    </FormControl>
                    <FormDescription>
                      Endereço da API de integração do HCM Senior
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password" 
                        placeholder="Digite sua API Key"
                        data-testid="input-senior-api-key"
                      />
                    </FormControl>
                    <FormDescription>
                      Chave de autenticação para acessar a API Senior (será armazenada de forma segura)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Ativar Integração</FormLabel>
                        <FormDescription>
                          Habilitar ou desabilitar a integração com Senior
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-senior-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoSync"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Sincronização Automática</FormLabel>
                        <FormDescription>
                          Sincronizar dados automaticamente
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-senior-auto-sync"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("autoSync") && (
                <FormField
                  control={form.control}
                  name="syncInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intervalo de Sincronização (minutos)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min={5} 
                          max={1440}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-senior-sync-interval"
                        />
                      </FormControl>
                      <FormDescription>
                        Intervalo em minutos entre sincronizações automáticas (5-1440 minutos)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={saveSettingsMutation.isPending} data-testid="button-save-senior-settings">
                  {saveSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={isTestingConnection || !settings}
                  data-testid="button-test-senior-connection"
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Testar Conexão
                    </>
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleSync}
                  disabled={isSyncing || !settings || !settings.isActive}
                  data-testid="button-sync-senior-data"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sincronizar Agora
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Status da Conexão */}
      {connectionTestResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Teste de Conexão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {connectionTestResult.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">Conexão bem-sucedida!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-600">Falha na conexão</span>
                  </>
                )}
              </div>

              {connectionTestResult.success && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Status da API</p>
                    <p className="text-lg font-semibold">
                      {connectionTestResult.health ? "Online" : "Offline"}
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Tabelas Encontradas</p>
                    <p className="text-lg font-semibold">{connectionTestResult.tablesCount}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Colaboradores Ativos</p>
                    <p className="text-lg font-semibold">{connectionTestResult.employeesCount}</p>
                  </div>
                </div>
              )}

              {connectionTestResult.error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm font-medium text-red-900 dark:text-red-200">Erro:</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{connectionTestResult.error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status da Última Sincronização */}
      {settings && settings.lastSyncAt && (
        <Card>
          <CardHeader>
            <CardTitle>Última Sincronização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data e Hora:</span>
                <span className="font-medium">{new Date(settings.lastSyncAt).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={settings.lastSyncStatus === 'success' ? 'default' : 'destructive'}>
                  {settings.lastSyncStatus === 'success' ? 'Sucesso' : 'Erro'}
                </Badge>
              </div>
              {settings.lastSyncError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm font-medium text-red-900 dark:text-red-200">Erro na última sincronização:</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{settings.lastSyncError}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
