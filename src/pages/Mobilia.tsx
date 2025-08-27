import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Search, Edit2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MobiliaForm } from "@/components/MobiliaForm";
import PopupEquip from "@/components/popups/PopupEquip";
import api from "@/lib/api";

interface Mobilia {
  id: number;
  numeroPatrimonio: string;
  nomeEquipamento: string;
  estado: string;
  localizacao?: { nome: string };
  setor?: { nome: string };
  valorCompra?: string;
  dataCompra?: string;
  inicioGarantia?: string;
  terminoGarantia?: string;
  notaFiscal?: string;
}

const MobiliasPage = () => {
  const [mobilias, setMobilias] = useState<Mobilia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMobilia, setEditingMobilia] = useState<Mobilia | null>(null);
  const [selectedMobilia, setSelectedMobilia] = useState<Mobilia | null>(null);
  const { toast } = useToast();

  const fetchMobilias = async () => {
    try {
      setLoading(true);
      const response = await api.get("/equipamentos-medicos/tipo/6", {
        withCredentials: true,
      });
      setMobilias(response.data);
    } catch (error) {
      toast({
        title: "Erro ao carregar mobiliários",
        description: "Não foi possível carregar a lista de mobiliários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMobilias();
  }, [toast]);

  const handleFormSubmit = (data: Mobilia) => {
    if (editingMobilia) {
      setMobilias((prev) =>
        prev.map((mobilia) => (mobilia.id === data.id ? data : mobilia))
      );
      toast({
        title: "Sucesso",
        description: "Mobiliário atualizado com sucesso!",
      });
    } else {
      setMobilias((prev) => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Mobiliário cadastrado com sucesso!",
      });
    }
    setEditingMobilia(null);
    setShowForm(false);
  };

  const handleEdit = (mobilia: Mobilia) => {
    setEditingMobilia(mobilia);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMobilia(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8 text-brand-secondary" />
            Mobiliários
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie mobiliários do sistema
          </p>
        </div>

        <Button
          className="bg-gradient-brand hover:opacity-90 transition-opacity"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Mobília
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisar mobiliários..." className="pl-9" />
          </div>
          <Button variant="outline">Filtros</Button>
        </div>
      </Card>

      {/* Mobilias List */}
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
        ) : mobilias.length > 0 ? (
          mobilias.map((mobilia) => (
            <Card
              key={mobilia.id}
              className="p-4 sm:p-6 hover:shadow-soft transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
                <div className="flex gap-4 flex-1">
                  <div className="p-3 bg-gradient-brand rounded-lg">
                    <Settings className="h-6 w-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {mobilia.nomeEquipamento || `Mobiliário #${mobilia.id}`}
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Estado: {mobilia.estado || "Não informado"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Nº Patrimônio:</span>
                        <span className="text-muted-foreground ml-1">
                          {mobilia.numeroPatrimonio || "Não informado"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Setor:</span>
                        <span className="text-muted-foreground ml-1">
                          {mobilia.setor?.nome || "Não informado"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Localização:</span>
                        <span className="text-muted-foreground ml-1">
                          {mobilia.localizacao?.nome || "Não informado"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 self-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(mobilia)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMobilia(mobilia)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 sm:p-12 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum mobiliário encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando o primeiro mobiliário ao sistema
            </p>
            <Button
              className="bg-gradient-brand hover:opacity-90"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Mobília
            </Button>
          </Card>
        )}
      </div>

      <MobiliaForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingMobilia}
      />

      {selectedMobilia && !showForm && (
        <PopupEquip
          equipamento={selectedMobilia}
          onClose={() => setSelectedMobilia(null)}
          onOptionClick={(tipo) => {
            console.log(`Ação ${tipo} para mobiliário ${selectedMobilia.id}`);
            setSelectedMobilia(null);
          }}
        />
      )}
    </div>
  );
};

export default MobiliasPage;