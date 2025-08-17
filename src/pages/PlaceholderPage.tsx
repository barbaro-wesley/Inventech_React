import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PlaceholderPage = ({ title, description, icon: Icon }: PlaceholderPageProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Icon className="h-8 w-8 text-brand-primary" />
          {title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {description}
        </p>
      </div>

      <Card className="p-12 text-center">
        <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
        <h2 className="text-2xl font-semibold mb-4">Página em Desenvolvimento</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Esta funcionalidade está sendo desenvolvida e estará disponível em breve. 
          Entre em contato com a equipe de desenvolvimento para mais informações.
        </p>
        <Button className="bg-gradient-brand hover:opacity-90">
          Voltar ao Dashboard
        </Button>
      </Card>
    </div>
  );
};

export default PlaceholderPage;