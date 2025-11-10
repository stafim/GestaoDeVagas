import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrganizationSchema, insertOrganizationWithAdminSchema, type InsertOrganization, type InsertOrganizationWithAdmin, type Organization } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Building2, Edit, Trash2, Plus } from "lucide-react";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

// Schema estendido com confirmação de senha
const createOrganizationFormSchema = insertOrganizationWithAdminSchema.extend({
  confirmPassword: z.string().min(6, { message: "Confirmação de senha obrigatória" }),
}).refine((data) => data.adminPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type CreateOrganizationForm = z.infer<typeof createOrganizationFormSchema>;

export default function Organizations() {
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const { toast } = useToast();

  // Fetch organizations
  const { data: organizations, isLoading } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
  });

  // Form for creating/editing organization
  const form = useForm<CreateOrganizationForm | Partial<InsertOrganization>>({
    resolver: zodResolver(editingOrg ? insertOrganizationSchema : createOrganizationFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      cnpj: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      logo: "",
      isActive: true,
      maxUsers: 50,
      planType: "basic",
      adminEmail: "",
      adminPassword: "",
      confirmPassword: "",
      adminFirstName: "",
      adminLastName: "",
    },
  });

  // Create organization mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertOrganization) => {
      return await apiRequest("POST", "/api/organizations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      toast({
        title: "Sucesso",
        description: "Organização criada com sucesso!",
      });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar organização.",
        variant: "destructive",
      });
    },
  });

  // Update organization mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertOrganization> }) => {
      return await apiRequest("PUT", `/api/organizations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      toast({
        title: "Sucesso",
        description: "Organização atualizada com sucesso!",
      });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar organização.",
        variant: "destructive",
      });
    },
  });

  // Delete organization mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/organizations/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      toast({
        title: "Sucesso",
        description: "Organização excluída com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao excluir organização.",
        variant: "destructive",
      });
    },
  });

  const handleOpenModal = (org?: Organization) => {
    if (org) {
      setEditingOrg(org);
      form.reset({
        name: org.name,
        slug: org.slug,
        cnpj: org.cnpj || "",
        contactName: org.contactName || "",
        contactEmail: org.contactEmail || "",
        contactPhone: org.contactPhone || "",
        address: org.address || "",
        logo: org.logo || "",
        isActive: org.isActive ?? true,
        maxUsers: org.maxUsers ?? 50,
        planType: org.planType || "basic",
      });
    } else {
      setEditingOrg(null);
      form.reset({
        name: "",
        slug: "",
        cnpj: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        logo: "",
        isActive: true,
        maxUsers: 50,
        planType: "basic",
        adminEmail: "",
        adminPassword: "",
        confirmPassword: "",
        adminFirstName: "",
        adminLastName: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOrg(null);
    form.reset();
  };

  const handleSubmit = (data: any) => {
    if (editingOrg) {
      // Ao editar, não enviamos os campos do admin
      updateMutation.mutate({ id: editingOrg.id, data });
    } else {
      // Ao criar, removemos confirmPassword antes de enviar
      const { confirmPassword, ...createData } = data;
      createMutation.mutate(createData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta organização?")) {
      deleteMutation.mutate(id);
    }
  };

  const getPlanBadgeVariant = (planType: string | null): "default" | "secondary" | "outline" => {
    switch (planType) {
      case "enterprise":
        return "default";
      case "professional":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPlanLabel = (planType: string | null): string => {
    switch (planType) {
      case "enterprise":
        return "Enterprise";
      case "professional":
        return "Professional";
      default:
        return "Basic";
    }
  };

  if (isLoading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Organizações
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerencie as organizações clientes do sistema
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} data-testid="button-new-organization">
          <Plus className="h-4 w-4 mr-2" />
          Nova Organização
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Lista de Organizações
          </CardTitle>
          <CardDescription>
            Total de {organizations?.length || 0} organizações cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Max Usuários</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations && organizations.length > 0 ? (
                organizations.map((org) => (
                  <TableRow key={org.id} data-testid={`row-organization-${org.id}`}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {org.slug}
                      </code>
                    </TableCell>
                    <TableCell>{org.cnpj || "-"}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{org.contactName || "-"}</div>
                        <div className="text-gray-500 text-xs">{org.contactEmail || "-"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPlanBadgeVariant(org.planType)}>
                        {getPlanLabel(org.planType)}
                      </Badge>
                    </TableCell>
                    <TableCell>{org.maxUsers || 50}</TableCell>
                    <TableCell>
                      {org.isActive ? (
                        <Badge className="bg-green-500">Ativa</Badge>
                      ) : (
                        <Badge variant="secondary">Inativa</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(org)}
                        data-testid={`button-edit-organization-${org.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(org.id)}
                        data-testid={`button-delete-organization-${org.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    Nenhuma organização cadastrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Organization Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrg ? "Editar Organização" : "Nova Organização"}
            </DialogTitle>
            <DialogDescription>
              {editingOrg
                ? "Atualize as informações da organização"
                : "Preencha os dados para criar uma nova organização"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Acme Corp" data-testid="input-organization-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="acme-corp" data-testid="input-organization-slug" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="00.000.000/0000-00" data-testid="input-organization-cnpj" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="planType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Plano</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "basic"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-plan-type">
                            <SelectValue placeholder="Selecione o plano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="João Silva" data-testid="input-contact-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Contato</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="contato@acme.com"
                          data-testid="input-contact-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone do Contato</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(11) 99999-9999" data-testid="input-contact-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Rua, número, bairro, cidade" data-testid="input-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxUsers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de Usuários</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-max-users"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Logo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." data-testid="input-logo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Campos do Administrador - apenas ao criar nova organização */}
              {!editingOrg && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Dados do Administrador da Organização
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Crie o login e senha do primeiro administrador desta organização
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="adminFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Admin</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="João" data-testid="input-admin-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="adminLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobrenome do Admin</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Silva" data-testid="input-admin-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de Login do Admin *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="admin@acme.com"
                            data-testid="input-admin-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="adminPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Mínimo 6 caracteres"
                              data-testid="input-admin-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Digite a senha novamente"
                              data-testid="input-confirm-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

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
                  data-testid="button-submit"
                >
                  {editingOrg ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
