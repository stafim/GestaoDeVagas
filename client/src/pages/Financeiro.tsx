import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, FileText, Calendar, TrendingUp, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Invoice, Organization } from "@shared/schema";

type InvoiceWithOrganization = Invoice & {
  organization?: Organization;
};

export default function Financeiro() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  
  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery<InvoiceWithOrganization[]>({
    queryKey: ['/api/invoices'],
  });

  const { data: organizations = [], isLoading: isLoadingOrgs } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: { organizationId: string; amount: number; dueDate: Date; description?: string }) => {
      return await apiRequest('/api/invoices', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      setIsDialogOpen(false);
      toast({
        title: "Fatura criada com sucesso",
        description: "A fatura foi criada e está aguardando pagamento.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar fatura",
        description: error.message || "Ocorreu um erro ao criar a fatura.",
        variant: "destructive",
      });
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async ({ id, paidDate, paymentMethod }: { id: string; paidDate: Date; paymentMethod: string }) => {
      return await apiRequest(`/api/invoices/${id}/mark-paid`, 'POST', { paidDate, paymentMethod });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Fatura marcada como paga",
        description: "A fatura foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar fatura",
        description: error.message || "Ocorreu um erro ao atualizar a fatura.",
        variant: "destructive",
      });
    },
  });

  const handleCreateInvoice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createInvoiceMutation.mutate({
      organizationId: formData.get('organizationId') as string,
      amount: parseFloat(formData.get('amount') as string),
      dueDate: new Date(formData.get('dueDate') as string),
      description: formData.get('description') as string || undefined,
    });
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    markAsPaidMutation.mutate({
      id: invoiceId,
      paidDate: new Date(),
      paymentMethod: 'boleto',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      paid: { label: 'Pago', variant: 'default' as const, icon: CheckCircle2 },
      overdue: { label: 'Vencido', variant: 'destructive' as const, icon: AlertCircle },
      cancelled: { label: 'Cancelado', variant: 'outline' as const, icon: AlertCircle },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1" data-testid={`badge-status-${status}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.amount as any), 0);
  const pendingRevenue = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + parseFloat(inv.amount as any), 0);
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;
  const paidCount = invoices.filter(inv => inv.status === 'paid').length;

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    return org?.name || 'Organização desconhecida';
  };

  if (isLoadingInvoices || isLoadingOrgs) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-financeiro">Financeiro</h1>
          <p className="text-muted-foreground">Gerencie faturas e pagamentos das organizações</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-nova-fatura">
              <Plus className="mr-2 h-4 w-4" />
              Nova Fatura
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Fatura</DialogTitle>
              <DialogDescription>
                Emita uma nova fatura para uma organização cliente
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <Label htmlFor="organizationId">Organização</Label>
                <Select name="organizationId" required>
                  <SelectTrigger data-testid="select-organization">
                    <SelectValue placeholder="Selecione a organização" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id} data-testid={`option-org-${org.id}`}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  data-testid="input-amount"
                />
              </div>

              <div>
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  required
                  data-testid="input-due-date"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Ex: Mensalidade referente a Janeiro/2025"
                  data-testid="input-description"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createInvoiceMutation.isPending}
                  data-testid="button-submit-invoice"
                >
                  {createInvoiceMutation.isPending ? 'Criando...' : 'Criar Fatura'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-revenue">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {paidCount} faturas pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-revenue">
              R$ {pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Faturas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Faturas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-invoices">
              {invoices.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Todas as faturas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturas Vencidas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-overdue-count">
              {overdueCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faturas Recentes</CardTitle>
          <CardDescription>Histórico completo de faturas emitidas</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma fatura encontrada</p>
              <p className="text-sm">Clique em "Nova Fatura" para começar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                    <TableCell className="font-mono text-xs" data-testid={`text-id-${invoice.id}`}>
                      {invoice.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell data-testid={`text-org-${invoice.id}`}>
                      {getOrganizationName(invoice.organizationId)}
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`text-amount-${invoice.id}`}>
                      R$ {parseFloat(invoice.amount as any).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell data-testid={`text-due-${invoice.id}`}>
                      {invoice.dueDate ? format(new Date(invoice.dueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '-'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status || 'pending')}
                    </TableCell>
                    <TableCell>
                      {invoice.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsPaid(invoice.id)}
                          disabled={markAsPaidMutation.isPending}
                          data-testid={`button-mark-paid-${invoice.id}`}
                        >
                          <CheckCircle2 className="mr-2 h-3 w-3" />
                          Marcar como Pago
                        </Button>
                      )}
                      {invoice.status === 'paid' && invoice.paidDate && (
                        <span className="text-xs text-muted-foreground" data-testid={`text-paid-date-${invoice.id}`}>
                          Pago em {format(new Date(invoice.paidDate), "dd/MM/yyyy")}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
