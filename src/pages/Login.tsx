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
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Painel esquerdo - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 flex-col items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <Logo size="lg" className="max-w-[300px] mb-12 filter brightness-0 invert" />
          
          <h1 className="text-5xl font-bold mb-6 text-white leading-tight">
            Controle total sobre
            <span className="block text-accent">equipamentos</span>
          </h1>
          
          <p className="text-primary-foreground/90 text-xl max-w-xl leading-relaxed">
            Gerencie computadores, impressoras, equipamentos médicos e manutenções com uma plataforma moderna e intuitiva.
          </p>
          
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm text-primary-foreground/80">Equipamentos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white">99%</div>
              <div className="text-sm text-primary-foreground/80">Uptime</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-primary-foreground/80">Suporte</div>
            </div>
          </div>
        </div>
      </div>

      {/* Painel direito - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Logo size="lg" className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">InvenTech</h1>
            <p className="text-muted-foreground">Sistema de Gestão</p>
          </div>

          <Card className="p-6 sm:p-8 shadow-2xl border border-border/50 backdrop-blur-sm bg-card/95">
            {/* Login Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <img
                  src={LoginIllustration}
                  alt="Login"
                  className="w-10 h-10"
                />
              </div>
            </div>

            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Bem-vindo de volta
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Entre com suas credenciais para acessar o sistema
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="h-11 sm:h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 sm:h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-muted-foreground">Lembrar-me</span>
                </label>
                <a
                  href="#"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Esqueceu a senha?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  "Entrar no Sistema"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/50 text-center">
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
