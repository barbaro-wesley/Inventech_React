import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Search, Wrench, Calendar, Hammer, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AirForm } from "@/components/AirForm";
import { OSForm } from "@/components/OSForm";
import { OSPreventivaForm } from "@/components/forms/OSPreventivaForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import PopupEquip from "@/components/popups/PopupEquip";

interface Condicionado {
  id: number;
  marca?: string;
  modelo?: string;
  BTUS?: string;
  numeroPatrimonio?: string;
  setor?: { nome: string };
}

const Condicionados = () => {
  const [condicionados, setCondicionados] = useState<Condicionado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCondicionado, setEditingCondicionado] = useState<Condicionado | null>(null);
  const [showOSForm, setShowOSForm] = useState(false);
  const [osType, setOsType] = useState<"preventiva" | "corretiva" | null>(null);
  const [selectedCondicionadoForOS, setSelectedCondicionadoForOS] = useState<any>(null);
  const [selectedCondicionado, setSelectedCondicionado] = useState<Condicionado | null>(null);
  const { toast } = useToast();

  const fetchCondicionados = async () => {
    try {
      setLoading(true);
      const response = await api.get("/equipamentos-medicos/tipo/4", {
        withCredentials: true,
      });
      setCondicionados(response.data);
    } catch (error) {
      toast({
        title: "Erro ao carregar condicionadores",
        description: "Não foi possível carregar a lista de condicionadores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCondicionados();
  }, []);

  const handleFormSubmit = (data: Condicionado) => {
    if (editingCondicionado) {
      setCondicionados((prev) =>
        prev.map((eq) => (eq.id === data.id ? data : eq))
      );
    } else {
      setCondicionados((prev) => [...prev, data]);
    }
    setEditingCondicionado(null);
  };

  const handleEdit = (condicionado: Condicionado) => {
    setEditingCondicionado(condicionado);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCondicionado(null);
  };

  const handleMaintenanceClick = (
    condicionado: Condicionado,
    type: "preventiva" | "corretiva"
  ) => {
    setSelectedCondicionadoForOS({
      equipamento: condicionado,
      preventiva: type === "preventiva",
    });
    setOsType(type);
    setShowOSForm(true);
  };

  const handleCloseOSForm = () => {
    setShowOSForm(false);
    setSelectedCondicionadoForOS(null);
    setOsType(null);
  };

  const handleOSSubmit = (data: any) => {
    toast({
      title: "Sucesso",
      description: "Ordem de serviço criada com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-6 sm:h-8 w-6 sm:w-8 text-brand-secondary" />
            Condicionados
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gerencie aparelhos de ar-condicionado
          </p>
        </div>

        <Button
          className="bg-gradient-brand hover:opacity-90 transition-opacity w-full sm:w-auto"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Condicionado
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisar condicionadores..." className="pl-9" />
          </div>
          <Button variant="outline">Filtros</Button>
        </div>
      </Card>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4 sm:p-6 animate-pulse">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="h-8 w-20 bg-muted rounded self-start"></div>
              </div>
            </Card>
          ))
        ) : condicionados.length > 0 ? (
          condicionados.map((condicionado) => (
            <Card
              key={condicionado.id}
              className="p-4 sm:p-6 hover:shadow-soft transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
                <div className="flex gap-4 flex-1">
                  <div className="p-2 sm:p-3 bg-gradient-brand rounded-lg flex-shrink-0">
                    <Settings className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-1">
                      {condicionado.marca || `Condicionado #${condicionado.id}`}
                    </h3>
                    <p className="text-muted-foreground mb-3 text-sm sm:text-base">
                      {condicionado.modelo || "Ar-condicionado"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Setor:</span>
                        <span className="text-muted-foreground ml-1">
                          {condicionado.setor?.nome || "Não informado"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">BTUS:</span>
                        <span className="text-muted-foreground ml-1">
                          {condicionado.BTUS || "Não informado"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Patrimônio:</span>
                        <span className="text-muted-foreground ml-1">
                          {condicionado.numeroPatrimonio || "Não informado"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-row gap-2 self-start">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-[80px] rounded-md hover:bg-gray-100"
                    onClick={() => handleEdit(condicionado)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-[80px] rounded-md hover:bg-gray-100"
                    onClick={() => setSelectedCondicionado(condicionado)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-w-[80px] rounded-md hover:bg-gray-100"
                      >
                        <Wrench className="h-4 w-4 mr-1" />
                        Manutenção
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleMaintenanceClick(condicionado, "preventiva")}
                        className="cursor-pointer"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Preventiva
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleMaintenanceClick(condicionado, "corretiva")}
                        className="cursor-pointer"
                      >
                        <Hammer className="h-4 w-4 mr-2" />
                        Corretiva
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-[80px] rounded-md hover:bg-gray-100"
                  >
                    Histórico
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 sm:p-12 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum condicionado encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando o primeiro ar-condicionado ao sistema
            </p>
            <Button
              className="bg-gradient-brand hover:opacity-90 w-full sm:w-auto"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Condicionado
            </Button>
          </Card>
        )}
      </div>

      <AirForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingCondicionado}
      />

      <OSPreventivaForm
        isOpen={showOSForm && osType === 'preventiva'}
        onClose={handleCloseOSForm}
        onSubmit={handleOSSubmit}
        initialData={selectedCondicionadoForOS} // corrigido
      />
      <OSForm
        isOpen={showOSForm && osType === 'corretiva'}
        onClose={handleCloseOSForm}
        onSubmit={handleOSSubmit}
        initialData={selectedCondicionadoForOS}
      />
      {selectedCondicionado && (
        <PopupEquip
          equipamento={selectedCondicionado}
          onClose={() => setSelectedCondicionado(null)}
          onOptionClick={(tipo) => {
            handleMaintenanceClick(selectedCondicionado, tipo.toLowerCase() as 'preventiva' | 'corretiva');
            setSelectedCondicionado(null);
          }}
        />
      )}
    </div>
  );
};

export default Condicionados;