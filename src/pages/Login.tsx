import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Substitua pelo caminho da sua imagem
import LoginIllustration from "@/assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao InvenTech",
      });
      setTimeout(() => {
        navigate("/modules");
      }, 100);
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Verifique suas credenciais e tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Painel esquerdo - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5"></div>
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <Logo size="lg" className="max-w-[320px] mb-0 filter brightness-0 invert" />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Sistema de Gestão
              <span className="block text-accent-foreground">InvenTech</span>
            </h1>
            
            <p className="text-white/90 text-xl max-w-xl leading-relaxed">
              Controle completo de equipamentos, manutenções e documentos em uma plataforma integrada e moderna.
            </p>
          </div>
        </div>
      </div>

      {/* Painel direito - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-10">
            <div className="bg-primary/10 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-primary/20">
              <Logo size="lg" className="mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">InvenTech</h1>
            <p className="text-muted-foreground text-lg">Sistema de Gestão Integrada</p>
          </div>

          <Card className="p-8 shadow-2xl border border-border/50 backdrop-blur-sm bg-card/80 rounded-2xl">
            {/* Header do formulário */}
            <div className="text-center space-y-4 mb-8">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <img
                  src={LoginIllustration}
                  alt="Login"
                  className="w-12 h-12 object-contain"
                />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Bem-vindo
                </h2>
                <p className="text-muted-foreground">
                  Acesse sua conta para continuar
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="h-12 border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary focus:ring-primary/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary focus:ring-primary/20 transition-all duration-200"
                />
              </div>


              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  "Entrar no Sistema"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/30 text-center">
              <p className="text-xs text-muted-foreground">
                © 2025 InvenTech. Todos os direitos reservados.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
