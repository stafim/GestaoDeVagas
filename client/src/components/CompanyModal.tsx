import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCompanySchema, type InsertCompany, type CompanyWithCostCenters } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDUSTRY_TYPES } from "@shared/constants";

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string;
}

export default function CompanyModal({ isOpen, onClose, companyId }: CompanyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!companyId;

  const { data: companyData } = useQuery<CompanyWithCostCenters>({
    queryKey: ["/api/companies", companyId],
    enabled: isEditing,
  });

  // 20 cores predefinidas para seleção
  const AVAILABLE_COLORS = [
    { value: "#ef4444", label: "Vermelho" },
    { value: "#f97316", label: "Laranja" },
    { value: "#eab308", label: "Amarelo" },
    { value: "#84cc16", label: "Lima" },
    { value: "#10b981", label: "Verde" },
    { value: "#14b8a6", label: "Turquesa" },
    { value: "#06b6d4", label: "Ciano" },
    { value: "#0ea5e9", label: "Azul Claro" },
    { value: "#3b82f6", label: "Azul" },
    { value: "#6366f1", label: "Índigo" },
    { value: "#8b5cf6", label: "Violeta" },
    { value: "#a855f7", label: "Roxo" },
    { value: "#d946ef", label: "Fúcsia" },
    { value: "#ec4899", label: "Rosa" },
    { value: "#f43f5e", label: "Rosa Forte" },
    { value: "#64748b", label: "Cinza" },
    { value: "#78716c", label: "Marrom" },
    { value: "#dc2626", label: "Vermelho Escuro" },
    { value: "#ea580c", label: "Laranja Escuro" },
    { value: "#059669", label: "Verde Escuro" },
  ];

  const companyFormSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    cnpj: z.string().optional().default(""),
    contactPerson: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    industryType: z.string().optional().default(""),
    description: z.string().optional().default(""),
    website: z.string().optional().default(""),
    color: z.string().default("#10b981"),
  });

  const form = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      contactPerson: "",
      phone: "",
      email: "",
      industryType: "",
      description: "",
      website: "",
      color: "#10b981",
    },
  });

  // Update form when company data is loaded
  React.useEffect(() => {
    if (isEditing && companyData && !form.formState.isDirty) {
      form.reset({
        name: companyData?.name || "",
        cnpj: companyData?.cnpj || "",
        contactPerson: companyData?.contactPerson || "",
        phone: companyData?.phone || "",
        email: companyData?.email || "",
        industryType: companyData?.industryType || "",
        description: companyData?.description || "",
        website: companyData?.website || "",
        color: companyData?.color || "#10b981",
      });
    }
  }, [isEditing, companyData, form]);

  const createCompanyMutation = useMutation({
    mutationFn: async (data: InsertCompany) => {
      const response = await apiRequest("POST", "/api/companies", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar empresa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: Partial<InsertCompany>) => {
      const response = await apiRequest("PUT", `/api/companies/${companyId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId] });
      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar empresa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCompany) => {
    if (isEditing) {
      updateCompanyMutation.mutate(data);
    } else {
      createCompanyMutation.mutate(data);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: TechCorp Ltda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} data-testid="input-cnpj" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pessoa de Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável" {...field} data-testid="input-contact-person" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contato@empresa.com.br" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="industryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Indústria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} data-testid="select-industry-type">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor de atuação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDUSTRY_TYPES.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.empresa.com.br" {...field} data-testid="input-website" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição da empresa, ramo de atividade, missão..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor para Gráficos</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} data-testid="select-color">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: field.value }}
                            />
                            <span>{AVAILABLE_COLORS.find(c => c.value === field.value)?.label || "Selecione uma cor"}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AVAILABLE_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: color.value }}
                            />
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-4">
              <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}
                data-testid="button-save"
              >
                {(createCompanyMutation.isPending || updateCompanyMutation.isPending) && (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                )}
                {isEditing ? "Atualizar Empresa" : "Criar Empresa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
