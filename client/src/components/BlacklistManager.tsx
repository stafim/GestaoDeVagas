import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Ban } from "lucide-react";
import { z } from "zod";

const blacklistCandidateFormSchema = z.object({
  fullName: z.string().min(3, "Nome completo deve ter no mínimo 3 caracteres"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato 000.000.000-00"),
  reason: z.string().min(10, "Motivo deve ter no mínimo 10 caracteres"),
  organizationId: z.string(),
  createdBy: z.string().optional(),
});

type BlacklistCandidateFormData = z.infer<typeof blacklistCandidateFormSchema>;

type BlacklistCandidate = {
  id: string;
  fullName: string;
  cpf: string;
  reason: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

export function BlacklistManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<BlacklistCandidate | null>(null);
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | undefined>();
  const { toast } = useToast();

  const form = useForm<BlacklistCandidateFormData>({
    resolver: zodResolver(blacklistCandidateFormSchema),
    defaultValues: {
      fullName: "",
      cpf: "",
      reason: "",
      organizationId: "demo-org-id",
      createdBy: "demo-user-bypass",
    },
  });

  const { data: blacklistCandidates = [], isLoading } = useQuery<BlacklistCandidate[]>({
    queryKey: ["/api/blacklist-candidates"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlacklistCandidateFormData) => {
      const response = await apiRequest("POST", "/api/blacklist-candidates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blacklist-candidates"] });
      toast({
        title: "Sucesso",
        description: "Candidato adicionado à blacklist com sucesso!",
      });
      setIsModalOpen(false);
      form.reset();
      setEditingCandidate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar candidato à blacklist.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BlacklistCandidateFormData> }) => {
      const response = await apiRequest("PATCH", `/api/blacklist-candidates/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blacklist-candidates"] });
      toast({
        title: "Sucesso",
        description: "Candidato atualizado com sucesso!",
      });
      setIsModalOpen(false);
      form.reset();
      setEditingCandidate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar candidato.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/blacklist-candidates/${id}`, {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blacklist-candidates"] });
      toast({
        title: "Sucesso",
        description: "Candidato removido da blacklist com sucesso!",
      });
      setDeletingCandidateId(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover candidato.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BlacklistCandidateFormData) => {
    if (editingCandidate) {
      updateMutation.mutate({ id: editingCandidate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (candidate: BlacklistCandidate) => {
    setEditingCandidate(candidate);
    form.reset({
      fullName: candidate.fullName,
      cpf: candidate.cpf,
      reason: candidate.reason,
      organizationId: "demo-org-id",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCandidate(null);
    form.reset({
      fullName: "",
      cpf: "",
      reason: "",
      organizationId: "demo-org-id",
      createdBy: "demo-user-bypass",
    });
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Blacklist de Candidatos
          </CardTitle>
          <CardDescription>
            Gerencie candidatos que não podem ser contratados
          </CardDescription>
        </div>
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-blacklist-candidate">
              <Plus className="mr-2 h-4 w-4" />
              Novo Candidato na Blacklist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCandidate ? "Editar Candidato" : "Adicionar Candidato à Blacklist"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="João da Silva" data-testid="input-fullname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="000.000.000-00"
                          data-testid="input-cpf"
                          onChange={(e) => {
                            const formatted = formatCPF(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo do Cadastro na Blacklist</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descreva o motivo pelo qual este candidato está sendo adicionado à blacklist..."
                          rows={4}
                          data-testid="textarea-reason"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-blacklist-candidate"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Salvando..."
                      : editingCandidate
                      ? "Atualizar"
                      : "Adicionar à Blacklist"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : blacklistCandidates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum candidato na blacklist. Clique em "Novo Candidato na Blacklist" para adicionar.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Completo</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blacklistCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">{candidate.fullName}</TableCell>
                  <TableCell>{candidate.cpf}</TableCell>
                  <TableCell className="max-w-xs truncate">{candidate.reason}</TableCell>
                  <TableCell>{new Date(candidate.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(candidate)}
                        data-testid={`button-edit-${candidate.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCandidateId(candidate.id)}
                        data-testid={`button-delete-${candidate.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <AlertDialog
          open={!!deletingCandidateId}
          onOpenChange={(open) => !open && setDeletingCandidateId(undefined)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá remover o candidato da blacklist. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingCandidateId && deleteMutation.mutate(deletingCandidateId)}
                data-testid="button-confirm-delete"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
