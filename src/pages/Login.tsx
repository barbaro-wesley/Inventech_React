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
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Painel esquerdo - Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-center p-8 lg:p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.15)_1px,_transparent_0)] bg-[length:20px_20px]"></div>
        </div>
        
        <div className="relative z-10 max-w-lg space-y-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <Logo size="lg" className="max-w-[280px] mb-0" />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-blue-900 via-blue-600 to-orange-500 bg-clip-text text-transparent">
              Controle total sobre equipamentos
            </h1>
            
            <p className="text-gray-600 text-lg sm:text-xl leading-relaxed max-w-md mx-auto">
              Controle total sobre computadores, impressoras, equipamentos médicos e
              manutenções. Tudo em uma plataforma moderna e intuitiva.
            </p>
          </div>
        </div>
      </div>

      {/* Painel direito - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-blue-25 to-indigo-50">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-white/30">
              <Logo size="lg" className="mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">InvenTech</h1>
            <p className="text-gray-600">Sistema de Gestão Integrada</p>
          </div>

          <Card className="p-6 sm:p-8 shadow-2xl border-0 backdrop-blur-sm bg-white/95 rounded-3xl">
            {/* Header do formulário */}
            <div className="text-center space-y-4 mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-orange-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg border border-white/30">
                <img
                  src={LoginIllustration}
                  alt="Login"
                  className="w-14 h-14 object-contain"
                />
              </div>
              
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  Bem-vindo
                </h2>
                <p className="text-gray-500 text-base">
                  Faça login para acessar sua conta
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="h-12 border-gray-200 bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 border-gray-200 bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-900 via-blue-600 to-orange-500 text-white hover:opacity-90 hover:scale-[1.02] transition-all duration-300 font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  "Entrar no Sistema"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200/50 text-center">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200 font-medium"
              >
                Esqueceu sua senha?
              </a>
              
              <p className="text-xs text-gray-400 mt-4">
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