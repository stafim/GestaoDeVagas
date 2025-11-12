import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { queryClient } from "@/lib/queryClient";
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import logoImage from "@assets/Logo Gente&Pessoas_1762462398758.png";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type LoginForm = z.infer<typeof loginSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function Landing() {
  const { isLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleLogin = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/auth/login", data);

      toast({
        title: "Login realizado com sucesso",
        description: "Redirecionando para o dashboard...",
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Verifique suas credenciais",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordForm) => {
    setIsResetting(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", data);

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });

      setShowResetDialog(false);
      resetForm.reset();
    } catch (error: any) {
      toast({
        title: "Erro ao solicitar reset",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col justify-center text-white space-y-8 p-8">
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-6">
              <img 
                src={logoImage} 
                alt="Gente & Pessoas Logo" 
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>

          <div className="space-y-6 mt-12">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Gestão Completa de Vagas</h3>
                <p className="text-white/80">Controle total do processo de recrutamento</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Dashboard Analítico</h3>
                <p className="text-white/80">Métricas e relatórios em tempo real</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Controle de Permissões</h3>
                <p className="text-white/80">Gestão segura e hierarquizada</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login/Register Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              {/* Mobile logo */}
              <div className="lg:hidden flex justify-center">
                <img 
                  src={logoImage} 
                  alt="Gente & Pessoas Logo" 
                  className="w-40 h-40 object-contain"
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Bem-vindo de volta!
                </h2>
                <p className="text-gray-600 mt-2">
                  Acesse sua conta para continuar
                </p>
              </div>
            </CardHeader>

            <CardContent className="pb-8">
              <div className="space-y-5">
                {/* Login Form */}
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...loginForm.register("email")}
                        data-testid="input-email"
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...loginForm.register("password")}
                        data-testid="input-password"
                      />
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowResetDialog(true)}
                        className="text-sm text-[#2563eb] hover:text-[#1e3a8a] hover:underline transition-colors"
                        data-testid="button-forgot-password"
                      >
                        Esqueceu sua senha?
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1e3a8a] hover:to-[#2563eb] text-white font-medium shadow-lg hover:shadow-xl transition-all"
                    data-testid="button-login"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Entrando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Entrar
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
            <DialogDescription>
              Digite seu email e enviaremos um link para redefinir sua senha.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-gray-700 font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  {...resetForm.register("email")}
                  data-testid="input-reset-email"
                />
              </div>
              {resetForm.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {resetForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResetDialog(false)}
                className="flex-1"
                data-testid="button-cancel-reset"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isResetting}
                className="flex-1 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1e3a8a] hover:to-[#2563eb] text-white"
                data-testid="button-submit-reset"
              >
                {isResetting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </span>
                ) : (
                  "Enviar"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
