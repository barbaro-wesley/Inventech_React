import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      {/* Hero Section - Desktop/Tablet */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white p-12 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250px_250px] animate-pulse"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10 max-w-2xl text-center space-y-8">
          {/* Logo Container */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-500">
            <Logo size="lg" className="max-w-[320px] filter drop-shadow-lg" />
          </div>
          
          {/* Hero Content */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-black leading-tight bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
              Controle Total
            </h1>
            
            <h2 className="text-xl lg:text-2xl font-semibold text-blue-100 mb-6">
              sobre seus equipamentos
            </h2>
            
            <p className="text-slate-300 text-lg lg:text-xl leading-relaxed max-w-lg mx-auto">
              Gerencie computadores, impressoras, equipamentos médicos e 
              manutenções em uma plataforma moderna e intuitiva.
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <span className="text-sm font-medium text-blue-200">🖥️ Gestão de TI</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <span className="text-sm font-medium text-blue-200">🏥 Equipamentos Médicos</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <span className="text-sm font-medium text-blue-200">🔧 Manutenções</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-gradient-to-br from-slate-50 via-white to-gray-50 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Hero */}
          <div className="lg:hidden text-center mb-8 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-6 shadow-2xl">
              <Logo size="md" className="mx-auto filter brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 mb-2 bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent">
                InvenTech
              </h1>
              <p className="text-slate-600 text-sm">Sistema de Gestão Integrada</p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="p-6 sm:p-8 lg:p-10 shadow-2xl border-0 backdrop-blur-sm bg-white/95 rounded-3xl hover:shadow-3xl transition-shadow duration-500">
            {/* Form Header */}
            <div className="text-center space-y-4 mb-8">
              <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300">
                <img
                  src={LoginIllustration}
                  alt="Login"
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain filter brightness-0 invert"
                />
              </div>
              
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                  Bem-vindo de volta
                </h2>
                <p className="text-slate-500 text-sm sm:text-base">
                  Entre com suas credenciais para continuar
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span>📧</span>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="h-12 sm:h-14 border-slate-200 bg-white/90 backdrop-blur-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl text-base hover:bg-white group-hover:shadow-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span>🔒</span>
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 sm:h-14 border-slate-200 bg-white/90 backdrop-blur-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl text-base hover:bg-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Entrar no Sistema</span>
                    <span>→</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200/60 space-y-4">
              
              <div className="text-center space-y-2">
                <p className="text-xs text-slate-400">
                  © 2025 InvenTech. Todos os direitos reservados.
                </p>
                <div className="flex justify-center gap-4 text-xs text-slate-400">
                  <a href="#" className="hover:text-blue-600 transition-colors">Privacidade</a>
                  <span>•</span>
                  <a href="#" className="hover:text-blue-600 transition-colors">Termos</a>
                  <span>•</span>
                  <a href="#" className="hover:text-blue-600 transition-colors">Suporte</a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;