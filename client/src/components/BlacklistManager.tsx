import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Ban, Upload, Download, FileText } from "lucide-react";
import { z } from "zod";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const blacklistCandidateFormSchema = z.object({
  fullName: z.string().min(3, "Nome completo deve ter no mínimo 3 caracteres"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato 000.000.000-00"),
  reason: z.string().min(10, "Motivo deve ter no mínimo 10 caracteres"),
  organizationId: z.string(),
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<BlacklistCandidate | null>(null);
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | undefined>();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<BlacklistCandidateFormData>({
    resolver: zodResolver(blacklistCandidateFormSchema),
    defaultValues: {
      fullName: "",
      cpf: "",
      reason: "",
      organizationId: "demo-org-id",
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

  const batchImportMutation = useMutation({
    mutationFn: async (candidates: any[]) => {
      const response = await apiRequest("POST", "/api/blacklist-candidates/batch", { candidates });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blacklist-candidates"] });
      toast({
        title: "Importação Concluída",
        description: data.message,
      });
      setIsImportModalOpen(false);
      setCsvFile(null);
      setImportPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao importar candidatos.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCSV = file.name.endsWith('.csv');
    const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isCSV && !isXLSX) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV ou XLSX válido",
        variant: "destructive",
      });
      return;
    }

    setCsvFile(file);
    setIsProcessing(true);

    if (isCSV) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setIsProcessing(false);
          const parsed = results.data.map((row: any) => ({
            fullName: row.nome || row.name || row.fullName || "",
            cpf: formatCPF(row.cpf || ""),
            reason: row.motivo || row.reason || "",
            organizationId: "demo-org-id",
          }));
          setImportPreview(parsed);
        },
        error: (error) => {
          setIsProcessing(false);
          toast({
            title: "Erro ao processar CSV",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    } else if (isXLSX) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          
          if (!data) {
            throw new Error("Arquivo vazio ou inválido");
          }
          
          // Usar ArrayBuffer para melhor compatibilidade com .xls e .xlsx
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error("Arquivo Excel não contém planilhas");
          }
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            throw new Error("A planilha está vazia");
          }
          
          const parsed = jsonData.map((row: any, index: number) => {
            const fullName = row.nome || row.name || row.fullName || row.Nome || row.Name || "";
            const cpf = String(row.cpf || row.CPF || "");
            const reason = row.motivo || row.reason || row.Motivo || row.Reason || "";
            
            if (!fullName || !cpf || !reason) {
              console.warn(`Linha ${index + 2}: dados incompletos`, row);
            }
            
            return {
              fullName,
              cpf: formatCPF(cpf),
              reason,
              organizationId: "demo-org-id",
            };
          });
          
          setImportPreview(parsed);
          setIsProcessing(false);
        } catch (error) {
          console.error("Erro ao processar XLSX:", error);
          setIsProcessing(false);
          toast({
            title: "Erro ao processar arquivo Excel",
            description: error instanceof Error ? error.message : "Erro desconhecido ao processar arquivo Excel",
            variant: "destructive",
          });
        }
      };
      reader.onerror = (error) => {
        console.error("Erro ao ler arquivo:", error);
        setIsProcessing(false);
        toast({
          title: "Erro ao ler arquivo",
          description: "Não foi possível ler o arquivo Excel. Verifique se o arquivo não está corrompido.",
          variant: "destructive",
        });
      };
      // Usar readAsArrayBuffer para melhor suporte a .xls e .xlsx
      reader.readAsArrayBuffer(file);
    }
  };

  const handleImport = () => {
    if (importPreview.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum candidato para importar",
        variant: "destructive",
      });
      return;
    }

    batchImportMutation.mutate(importPreview);
  };

  const downloadTemplate = () => {
    const csvContent = "nome,cpf,motivo\nJoão da Silva,123.456.789-00,Motivo do cadastro na blacklist";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_blacklist.csv';
    link.click();
  };

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

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingCandidate(null);
      form.reset({
        fullName: "",
        cpf: "",
        reason: "",
        organizationId: "demo-org-id",
      });
    }
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            data-testid="button-download-template"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar Modelo CSV
          </Button>
          <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-import-csv">
                <Upload className="mr-2 h-4 w-4" />
                Importar Arquivo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Importar Candidatos via CSV ou XLSX</DialogTitle>
                <DialogDescription>
                  Carregue um arquivo CSV ou Excel (XLSX) com as colunas: nome, cpf e motivo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    data-testid="input-csv-file"
                  />
                  {csvFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {csvFile.name}
                    </div>
                  )}
                </div>

                {isProcessing && (
                  <div className="text-center py-4">Processando arquivo...</div>
                )}

                {importPreview.length > 0 && !isProcessing && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Pré-visualização ({importPreview.length} candidatos)</h4>
                    <div className="max-h-96 overflow-y-auto border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>Motivo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importPreview.slice(0, 10).map((candidate, index) => (
                            <TableRow key={index}>
                              <TableCell>{candidate.fullName}</TableCell>
                              <TableCell>{candidate.cpf}</TableCell>
                              <TableCell className="max-w-xs truncate">{candidate.reason}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {importPreview.length > 10 && (
                        <div className="text-center py-2 text-sm text-muted-foreground">
                          ... e mais {importPreview.length - 10} candidatos
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setCsvFile(null);
                    setImportPreview([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  data-testid="button-cancel-import"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={importPreview.length === 0 || batchImportMutation.isPending}
                  data-testid="button-confirm-import"
                >
                  {batchImportMutation.isPending ? "Importando..." : `Importar ${importPreview.length} Candidatos`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-blacklist-candidate">
                <Plus className="mr-2 h-4 w-4" />
                Novo Candidato
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
                    onClick={() => handleOpenChange(false)}
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
        </div>
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
