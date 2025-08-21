import { Card } from "@/components/ui/card";
import { Monitor, Wrench, FileText, Users, TrendingUp, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Total de Equipamentos",
      value: "1,247",
      icon: Monitor,
      trend: "+12% este mês",
      color: "text-brand-primary"
    },
    {
      title: "Manutenções Pendentes",
      value: "23",
      icon: Wrench,
      trend: "-8% desde ontem",
      color: "text-accent"
    },
    {
      title: "Chamados Abertos",
      value: "45",
      icon: AlertTriangle,
      trend: "+5% esta semana",
      color: "text-destructive"
    },
    {
      title: "Técnicos Ativos",
      value: "18",
      icon: Users,
      trend: "Estável",
      color: "text-brand-secondary"
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Visão geral do sistema de gestão de equipamentos InvenTech
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 md:p-6 hover:shadow-soft transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">
                  {stat.title}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {stat.trend}
                </p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full bg-gradient-subtle ${stat.color} flex-shrink-0`}>
                <stat.icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-brand-primary" />
            Ações Rápidas
          </h3>
          <div className="space-y-2 md:space-y-3">
            <button className="w-full text-left p-2 md:p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="font-medium text-sm md:text-base">Cadastrar Novo Equipamento</div>
              <div className="text-xs md:text-sm text-muted-foreground">Adicionar equipamento ao inventário</div>
            </button>
            <button className="w-full text-left p-2 md:p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="font-medium text-sm md:text-base">Abrir Chamado</div>
              <div className="text-xs md:text-sm text-muted-foreground">Registrar nova solicitação de manutenção</div>
            </button>
            <button className="w-full text-left p-2 md:p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="font-medium text-sm md:text-base">Agendar Manutenção</div>
              <div className="text-xs md:text-sm text-muted-foreground">Programar manutenção preventiva</div>
            </button>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 md:h-5 md:w-5 text-brand-secondary" />
            Atividades Recentes
          </h3>
          <div className="space-y-2 md:space-y-3">
            <div className="p-2 md:p-3 border-l-4 border-brand-primary bg-gradient-subtle rounded-r-lg">
              <div className="font-medium text-sm md:text-base">Computador #1247 - Manutenção Concluída</div>
              <div className="text-xs md:text-sm text-muted-foreground">Há 2 horas</div>
            </div>
            <div className="p-2 md:p-3 border-l-4 border-accent bg-gradient-subtle rounded-r-lg">
              <div className="font-medium text-sm md:text-base">Novo Técnico Cadastrado</div>
              <div className="text-xs md:text-sm text-muted-foreground">Há 4 horas</div>
            </div>
            <div className="p-2 md:p-3 border-l-4 border-brand-secondary bg-gradient-subtle rounded-r-lg">
              <div className="font-medium text-sm md:text-base">Impressora #89 - Chamado Aberto</div>
              <div className="text-xs md:text-sm text-muted-foreground">Há 6 horas</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;