import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, GitBranch, Edit, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { ApprovalWorkflow, ApprovalWorkflowStep } from "@shared/schema";

export default function Workflow() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [isEditingWorkflow, setIsEditingWorkflow] = useState(false);

  const { data: workflows, isLoading } = useQuery<ApprovalWorkflow[]>({
    queryKey: ["/api/workflows"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows de Aprovação</h1>
          <p className="text-muted-foreground mt-1">
            Configure fluxos de aprovação para vagas com dupla alçada, aprovação por usuário ou permissão
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          data-testid="button-create-workflow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Workflow
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando workflows...</div>
        </div>
      ) : !workflows || workflows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum workflow configurado
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Crie seu primeiro workflow de aprovação para gerenciar a aprovação de vagas com múltiplas alçadas
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="hover-elevate">
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-primary" />
                    <span className="truncate">{workflow.name}</span>
                  </CardTitle>
                  {workflow.description && (
                    <CardDescription className="mt-1 text-sm line-clamp-2">
                      {workflow.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-1">
                  {workflow.isDefault && (
                    <Badge variant="default" className="text-xs">
                      Padrão
                    </Badge>
                  )}
                  {workflow.isActive ? (
                    <Badge variant="outline" className="text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <X className="h-3 w-3 mr-1" />
                      Inativo
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedWorkflow(workflow);
                      setIsEditingWorkflow(true);
                    }}
                    data-testid={`button-edit-workflow-${workflow.id}`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Workflow</DialogTitle>
            <DialogDescription>
              Configure um fluxo de aprovação para vagas com múltiplas etapas e alçadas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Funcionalidade em desenvolvimento. Em breve você poderá criar workflows personalizados
              com aprovação dupla alçada, aprovação por usuário específico ou por tipo de permissão.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
