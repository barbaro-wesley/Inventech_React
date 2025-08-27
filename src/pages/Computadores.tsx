import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Computer, Plus, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import PopupEquip from "@/components/popups/PopupEquip";
import { FormPc } from "@/components/FormPc";

const Computadores = () => {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComputer, setSelectedComputer] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchComputers = async () => {
      try {
        const { data } = await api.get("/equipamentos-medicos/tipo/1", {
          withCredentials: true,
        });
        setComputers(data);
      } catch (error) {
        toast({
          title: "Erro ao carregar computadores",
          description: "Não foi possível carregar a lista de computadores",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchComputers();
  }, [toast]);

  const handleAddComputer = () => {
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleFormSubmit = (newComputer: any) => {
    setComputers((prev) => [...prev, newComputer]);
    toast({
      title: "Sucesso",
      description: "Computador cadastrado com sucesso!",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Computer className="h-6 sm:h-8 w-6 sm:w-8 text-brand-primary" />
            Computadores
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gerencie todos os computadores da organização
          </p>
        </div>

        <Button
          className="bg-gradient-brand hover:opacity-90 transition-opacity w-full sm:w-auto"
          onClick={handleAddComputer}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Computador
        </Button>
      </div>

      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar computadores..."
              className="pl-8 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Filtros
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </Card>
          ))
        ) : computers.length > 0 ? (
          computers.map((computer: any) => (
            <Card key={computer.id} className="p-4 sm:p-6 hover:shadow-soft transition-shadow">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2 bg-gradient-brand rounded-lg">
                  <Computer className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Ativo
                </span>
              </div>

              <h3 className="font-semibold text-base sm:text-lg mb-2">{computer.nomeEquipamento}</h3>

              <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                <p>Patrimônio: {computer.numeroPatrimonio}</p>
                <p>Hostname: {computer.nomeEquipamento}</p>
                <p>IP: {computer.ip}</p>
                <p>Setor: {computer.setor?.nome || "-"}</p>
                <p>Localização: {computer.localizacao?.nome || "-"}</p>
                <p>Sistema Operacional: {computer.sistemaOperacional}</p>
              </div>

              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[70px] px-2 rounded-md hover:bg-gray-100 text-sm"
                  onClick={() => {
                    setSelectedComputer(computer);
                    setIsFormOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[70px] px-2 rounded-md hover:bg-gray-100 text-sm"
                  onClick={() => setSelectedComputer(computer)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Detalhes
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 sm:py-12">
            <Computer className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhum computador encontrado</h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
              Comece adicionando o primeiro computador ao sistema
            </p>
            <Button
              className="bg-gradient-brand hover:opacity-90 w-full sm:w-auto"
              onClick={handleAddComputer}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Computador
            </Button>
          </div>
        )}
      </div>

      {selectedComputer && !isFormOpen && (
        <PopupEquip
          equipamento={selectedComputer}
          onClose={() => setSelectedComputer(null)}
          onOptionClick={(tipo) => {
            console.log(`Ação ${tipo} para computador ${selectedComputer.id}`);
            setSelectedComputer(null);
          }}
        />
      )}

      <FormPc
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedComputer}
      />
    </div>
  );
};

export default Computadores;