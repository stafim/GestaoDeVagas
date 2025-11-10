import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Mail, MessageCircle } from "lucide-react";

export default function Notifications() {
  const { toast } = useToast();

  const { data: statusSettings, isLoading } = useQuery({
    queryKey: ["/api/status-notification-settings"],
  });

  const updateNotificationMutation = useMutation({
    mutationFn: async ({ 
      statusId, 
      emailEnabled, 
      whatsappEnabled 
    }: { 
      statusId: string; 
      emailEnabled?: boolean; 
      whatsappEnabled?: boolean;
    }) => {
      const payload: any = {};
      if (emailEnabled !== undefined) payload.emailNotificationEnabled = emailEnabled;
      if (whatsappEnabled !== undefined) payload.whatsappNotificationEnabled = whatsappEnabled;
      
      return await apiRequest("PUT", `/api/status-notification-settings/${statusId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/status-notification-settings"] });
      toast({
        title: "Sucesso",
        description: "Configuração de notificação atualizada!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração de notificação.",
        variant: "destructive",
      });
    },
  });

  const handleEmailToggle = (statusId: string, currentValue: boolean) => {
    updateNotificationMutation.mutate({
      statusId,
      emailEnabled: !currentValue,
    });
  };

  const handleWhatsAppToggle = (statusId: string, currentValue: boolean) => {
    updateNotificationMutation.mutate({
      statusId,
      whatsappEnabled: !currentValue,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Notificações</h1>
        <p className="text-muted-foreground">
          Configure quais mudanças de status devem disparar notificações por Email ou WhatsApp
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Notificação de Status</CardTitle>
          <CardDescription>
            Ative ou desative notificações quando uma vaga mudar para cada status abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(statusSettings) && statusSettings.length > 0 ? (
              statusSettings.map((status: any) => (
                <div
                  key={status.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  data-testid={`notification-setting-${status.key}`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {status.color && (
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: status.color }}
                      />
                    )}
                    <div className="flex-1">
                      <Label className="text-base font-medium">
                        {status.label}
                      </Label>
                      {status.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {status.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                    <div className="flex items-center justify-between p-3 bg-background border rounded-md">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <Label 
                          htmlFor={`email-${status.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          Email
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {status.emailNotificationEnabled ? "Ativado" : "Desativado"}
                        </span>
                        <Switch
                          id={`email-${status.id}`}
                          checked={status.emailNotificationEnabled || false}
                          onCheckedChange={() => handleEmailToggle(status.id, status.emailNotificationEnabled)}
                          disabled={updateNotificationMutation.isPending}
                          data-testid={`switch-email-${status.key}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-background border rounded-md">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <Label 
                          htmlFor={`whatsapp-${status.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          WhatsApp
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {status.whatsappNotificationEnabled ? "Ativado" : "Desativado"}
                        </span>
                        <Switch
                          id={`whatsapp-${status.id}`}
                          checked={status.whatsappNotificationEnabled || false}
                          onCheckedChange={() => handleWhatsAppToggle(status.id, status.whatsappNotificationEnabled)}
                          disabled={updateNotificationMutation.isPending}
                          data-testid={`switch-whatsapp-${status.key}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <i className="fas fa-inbox text-4xl mb-3 block"></i>
                <p>Nenhum status encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <i className="fas fa-info-circle"></i>
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 dark:text-blue-300 space-y-2">
          <p>
            • <strong>Email:</strong> Quando ativado, um email será enviado automaticamente 
            sempre que uma vaga mudar para o status configurado
          </p>
          <p>
            • <strong>WhatsApp:</strong> Quando ativado, uma mensagem de WhatsApp será enviada automaticamente 
            (requer configuração do serviço de WhatsApp)
          </p>
          <p>
            • <strong>Destinatários:</strong> As notificações serão enviadas para o recrutador responsável pela vaga 
            e para o gestor que criou a vaga
          </p>
          <p>
            • <strong>Conteúdo:</strong> As notificações incluem informações sobre a vaga, o status anterior e o novo status
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
