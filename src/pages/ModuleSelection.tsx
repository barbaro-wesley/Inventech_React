import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, FileText, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";

interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  available: boolean;
}

const modules: Module[] = [
  {
    id: "inventory",
    name: "Controle de Inventário",
    description: "Gerencie equipamentos, computadores, condicionadores e impressoras",
    icon: Package,
    color: "bg-primary/10 text-primary border-primary/20",
    available: true,
  },
  {
    id: "documents",
    name: "Gestão de Documentos",
    description: "Controle e organize documentos e arquivos da empresa",
    icon: FileText,
    color: "bg-secondary/10 text-secondary border-secondary/20",
    available: true,
  },
];

export const ModuleSelection = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleModuleSelect = async (moduleId: string) => {
    setIsLoading(true);
    localStorage.setItem("selectedModule", moduleId);

    setTimeout(() => {
      if (moduleId === "inventory") {
        navigate("/dashboard");
      } else if (moduleId === "documents") {
        navigate("/dashboard");
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Bem-vindo, {user?.nome}!
          </h1>
          <p className="text-muted-foreground">
            Selecione o módulo que deseja acessar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => (
            <Card
              key={module.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                selectedModule === module.id
                  ? "border-primary shadow-lg scale-105"
                  : "border-border hover:border-muted-foreground/30"
              } ${!module.available ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => module.available && setSelectedModule(module.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full ${module.color}`}>
                    <module.icon className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-xl">{module.name}</CardTitle>
                <CardDescription className="text-sm">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between items-center">
                  <Badge 
                    variant={module.available ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {module.available ? "Disponível" : "Em breve"}
                  </Badge>
                  {selectedModule === module.id && (
                    <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedModule && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => handleModuleSelect(selectedModule)}
              disabled={isLoading}
              size="lg"
              className="min-w-[200px]"
            >
              {isLoading ? (
                "Carregando..."
              ) : (
                <>
                  Acessar Módulo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Você pode trocar de módulo a qualquer momento nas configurações
          </p>
        </div>
      </div>
    </div>
  );
};