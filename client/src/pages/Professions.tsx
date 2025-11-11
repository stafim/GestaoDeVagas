import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profession } from "@shared/schema";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Download, RefreshCw } from "lucide-react";

export default function Professions() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: professions, isLoading } = useQuery<Profession[]>({
    queryKey: ["/api/professions"],
  });

  const importProfessionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest<{
        success: boolean;
        imported: number;
        updated: number;
        skipped: number;
        total: number;
        message: string;
      }>("POST", "/api/senior-integration/import-professions");
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/professions"] });
      toast({
        title: "Importação concluída",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na importação",
        description: error.message || "Erro ao importar profissões da Senior HCM",
        variant: "destructive",
      });
    },
  });

  const filteredProfessions = professions?.filter((profession) =>
    profession.name.toLowerCase().includes(search.toLowerCase()) ||
    profession.cboCode?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const importedFromSenior = professions?.filter(p => p.importedFromSenior).length || 0;
  const totalProfessions = professions?.length || 0;

  return (
    <>
      <TopBar
        title="Cadastro de Profissões"
        subtitle={`${totalProfessions} profissões cadastradas (${importedFromSenior} da Senior HCM)`}
      />

      <div className="space-y-6">
        {/* Search and Actions */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Buscar profissões ou código CBO..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-professions"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => importProfessionsMutation.mutate()}
                disabled={importProfessionsMutation.isPending}
                data-testid="button-import-professions"
              >
                {importProfessionsMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Importar da Senior HCM
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        {importProfessionsMutation.data && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-green-600 dark:text-green-400"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Importação concluída com sucesso!
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {importProfessionsMutation.data.imported} profissões importadas, 
                    {' '}{importProfessionsMutation.data.updated} atualizadas,
                    {' '}{importProfessionsMutation.data.skipped} já existentes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Professions Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredProfessions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[400px]">Profissão</TableHead>
                    <TableHead className="w-[150px]">Código CBO</TableHead>
                    <TableHead className="w-[150px]">Categoria</TableHead>
                    <TableHead className="w-[120px]">Origem</TableHead>
                    <TableHead className="text-center w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessions.map((profession) => (
                    <TableRow key={profession.id} data-testid={`row-profession-${profession.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium" data-testid={`text-profession-name-${profession.id}`}>
                              {profession.name}
                            </div>
                            {profession.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {profession.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {profession.cboCode ? (
                          <Badge variant="outline" className="font-mono">
                            {profession.cboCode}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {profession.category ? (
                          <Badge variant="secondary">
                            {profession.category}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {profession.importedFromSenior ? (
                          <Badge variant="default" className="bg-purple-600">
                            Senior HCM
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Manual
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {profession.isActive ? (
                          <Badge variant="default" className="bg-green-600">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma profissão encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {search
                    ? "Nenhuma profissão corresponde à sua busca"
                    : "Comece importando profissões da Senior HCM"}
                </p>
                {!search && (
                  <Button
                    variant="default"
                    onClick={() => importProfessionsMutation.mutate()}
                    disabled={importProfessionsMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Importar da Senior HCM
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
