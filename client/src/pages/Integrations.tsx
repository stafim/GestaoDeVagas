import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, MessageSquare, Save, Eye, EyeOff } from "lucide-react";
import type { IntegrationSetting } from "@shared/schema";

export default function Integrations() {
  const { toast } = useToast();
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const { data: emailSettings = [], isLoading: emailLoading } = useQuery<IntegrationSetting[]>({
    queryKey: ['/api/integration-settings', 'email'],
    queryFn: async () => {
      const response = await fetch('/api/integration-settings?type=email');
      if (!response.ok) throw new Error('Failed to fetch email settings');
      return response.json();
    }
  });

  const { data: whatsappSettings = [], isLoading: whatsappLoading } = useQuery<IntegrationSetting[]>({
    queryKey: ['/api/integration-settings', 'whatsapp'],
    queryFn: async () => {
      const response = await fetch('/api/integration-settings?type=whatsapp');
      if (!response.ok) throw new Error('Failed to fetch whatsapp settings');
      return response.json();
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { integrationType: string; configKey: string; configValue: string }) => {
      return await apiRequest('POST', '/api/integration-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integration-settings'] });
      toast({
        title: "Sucesso",
        description: "Configuração salva com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração",
        variant: "destructive",
      });
    }
  });

  const getSettingValue = (settings: IntegrationSetting[], key: string) => {
    const setting = settings.find(s => s.configKey === key);
    return setting?.configValue || '';
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const configs = [
      { key: 'smtp_host', value: formData.get('smtp_host') as string },
      { key: 'smtp_port', value: formData.get('smtp_port') as string },
      { key: 'smtp_user', value: formData.get('smtp_user') as string },
      { key: 'smtp_password', value: formData.get('smtp_password') as string },
      { key: 'smtp_from', value: formData.get('smtp_from') as string },
    ];

    for (const config of configs) {
      if (config.value) {
        await saveMutation.mutateAsync({
          integrationType: 'email',
          configKey: config.key,
          configValue: config.value
        });
      }
    }
  };

  const handleWhatsAppSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const configs = [
      { key: 'account_sid', value: formData.get('account_sid') as string },
      { key: 'auth_token', value: formData.get('auth_token') as string },
      { key: 'phone_number', value: formData.get('phone_number') as string },
    ];

    for (const config of configs) {
      if (config.value) {
        await saveMutation.mutateAsync({
          integrationType: 'whatsapp',
          configKey: config.key,
          configValue: config.value
        });
      }
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (emailLoading || whatsappLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Integrações</h1>
        <p className="text-muted-foreground mt-2">
          Configure as credenciais de serviços externos para envio de notificações
        </p>
      </div>

      <div className="grid gap-6">
        {/* Email/SMTP Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <CardTitle>Configuração de Email (SMTP)</CardTitle>
            </div>
            <CardDescription>
              Configure o servidor SMTP para envio de emails de notificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">Host SMTP</Label>
                  <Input
                    id="smtp_host"
                    name="smtp_host"
                    placeholder="smtp.gmail.com"
                    defaultValue={getSettingValue(emailSettings, 'smtp_host')}
                    data-testid="input-smtp-host"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_port">Porta</Label>
                  <Input
                    id="smtp_port"
                    name="smtp_port"
                    type="number"
                    placeholder="587"
                    defaultValue={getSettingValue(emailSettings, 'smtp_port')}
                    data-testid="input-smtp-port"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_user">Usuário/Email</Label>
                <Input
                  id="smtp_user"
                  name="smtp_user"
                  type="email"
                  placeholder="seu-email@exemplo.com"
                  defaultValue={getSettingValue(emailSettings, 'smtp_user')}
                  data-testid="input-smtp-user"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_password">Senha</Label>
                <div className="relative">
                  <Input
                    id="smtp_password"
                    name="smtp_password"
                    type={showPasswords.smtp_password ? "text" : "password"}
                    placeholder="••••••••"
                    defaultValue={getSettingValue(emailSettings, 'smtp_password')}
                    data-testid="input-smtp-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility('smtp_password')}
                    data-testid="button-toggle-smtp-password"
                  >
                    {showPasswords.smtp_password ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_from">Email Remetente</Label>
                <Input
                  id="smtp_from"
                  name="smtp_from"
                  type="email"
                  placeholder="noreply@exemplo.com"
                  defaultValue={getSettingValue(emailSettings, 'smtp_from')}
                  data-testid="input-smtp-from"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={saveMutation.isPending}
                  data-testid="button-save-email"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* WhatsApp Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <CardTitle>Configuração do WhatsApp</CardTitle>
            </div>
            <CardDescription>
              Configure as credenciais da API do Twilio WhatsApp Business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account_sid">Account SID</Label>
                <div className="relative">
                  <Input
                    id="account_sid"
                    name="account_sid"
                    type={showPasswords.account_sid ? "text" : "password"}
                    placeholder="AC..."
                    defaultValue={getSettingValue(whatsappSettings, 'account_sid')}
                    data-testid="input-account-sid"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility('account_sid')}
                    data-testid="button-toggle-account-sid"
                  >
                    {showPasswords.account_sid ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth_token">Auth Token</Label>
                <div className="relative">
                  <Input
                    id="auth_token"
                    name="auth_token"
                    type={showPasswords.auth_token ? "text" : "password"}
                    placeholder="••••••••"
                    defaultValue={getSettingValue(whatsappSettings, 'auth_token')}
                    data-testid="input-auth-token"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility('auth_token')}
                    data-testid="button-toggle-auth-token"
                  >
                    {showPasswords.auth_token ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Número do WhatsApp</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  placeholder="+5511999999999"
                  defaultValue={getSettingValue(whatsappSettings, 'phone_number')}
                  data-testid="input-phone-number"
                />
                <p className="text-sm text-muted-foreground">
                  Formato: +[código do país][DDD][número]
                </p>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={saveMutation.isPending}
                  data-testid="button-save-whatsapp"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>Email (SMTP):</strong>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-muted-foreground">
                <li>Para Gmail, use smtp.gmail.com na porta 587</li>
                <li>Ative a autenticação de dois fatores e use uma senha de app</li>
                <li>Para outros provedores, consulte a documentação SMTP</li>
              </ul>
            </div>
            <div>
              <strong>WhatsApp (Twilio):</strong>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-muted-foreground">
                <li>Crie uma conta no Twilio (twilio.com)</li>
                <li>Configure o WhatsApp Business API</li>
                <li>Copie o Account SID e Auth Token do painel</li>
                <li>Use o número de telefone do Twilio no formato internacional</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
