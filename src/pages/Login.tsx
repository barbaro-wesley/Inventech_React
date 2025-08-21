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
    <div className="flex h-screen w-screen flex-col md:flex-row">
      {/* Painel esquerdo */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-100 text-center p-8 md:p-12">
        <Logo size="lg" className="max-w-[280px] mb-8" />

        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-900 via-blue-600 to-orange-500 bg-clip-text text-transparent">
          Controle total sobre equipamentos
        </h1>
        <p className="text-gray-600 text-lg max-w-md">
          Controle total sobre computadores, impressoras, equipamentos médicos e
          manutenções. Tudo em uma plataforma moderna e intuitiva.
        </p>
      </div>

      {/* Painel direito */}
      <div className="flex flex-1 items-center justify-center bg-blue-50 p-6 md:p-10">
        <div className="w-full max-w-lg">
          <Card className="p-8 shadow-lg border-0 space-y-6">
            {/* Imagem dentro do Card, acima do email */}
            <div className="flex justify-center mb-4">
              <img
                src={LoginIllustration}
                alt="Login Illustration"
                className="w-32 md:w-40"
              />
            </div>

            <div className="text-center space-y-2 mb-4">
              <div className="md:hidden mb-2">
                <Logo size="md" className="mx-auto" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Bem-vindo
              </h2>
              <p className="text-gray-500">
                Faça login para acessar sua conta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-900 via-blue-600 to-orange-500 text-white hover:opacity-90 transition-opacity font-semibold rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="text-center">
              <a
                href="#"
                className="text-sm text-blue-600 hover:underline"
              >
                Esqueceu sua senha?
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
