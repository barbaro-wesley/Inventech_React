import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Search, Edit2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MobiliaForm } from "@/components/MobiliaForm";
import PopupEquip from "@/components/popups/PopupEquip";
import api from "@/lib/api";

// Update the interface to match the /mobilias endpoint data structure
interface Mobilia {
  id: number;
  numeroPatrimonio: string;
  nomeEquipamento: string; // Adjust if the endpoint uses a different field like 'nome'
  estado: string;
  localizacao?: { nome: string };
  setor?: { nome: string };
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
        title: "Erro ao carregar mobilias",
        description: "Não foi possível carregar a lista de mobilias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMobilias();
  }, []);

  const handleFormSubmit = (data: Mobilia) => {
    if (editingMobilia) {
      setMobilias((prev) =>
        prev.map((mobilia) => (mobilia.id === data.id ? data : mobilia))
      );
    } else {
      setMobilias((prev) => [...prev, data]);
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
            Mobilias
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie mobilias do sistema
          </p>
        </div>

        <Button
          className="bg-gradient-brand hover:opacity-90 transition-opacity"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Mobilia
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisar mobilias..." className="pl-9" />
          </div>
          <Button variant="outline">Filtros</Button>
        </div>
      </Card>

      {/* Mobilias List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="h-8 w-20 bg-muted rounded"></div>
              </div>
            </Card>
          ))
        ) : mobilias.length > 0 ? (
          mobilias.map((mobilia) => (
            <Card
              key={mobilia.id}
              className="p-6 hover:shadow-soft transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4 flex-1">
                  <div className="p-3 bg-gradient-brand rounded-lg">
                    <Settings className="h-6 w-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {mobilia.nomeEquipamento || `Mobilia #${mobilia.id}`}
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      {mobilia.estado || "Mobilia"}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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

                <div className="flex gap-2">
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
          <Card className="p-12 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma mobilia encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando a primeira mobilia ao sistema
            </p>
            <Button
              className="bg-gradient-brand hover:opacity-90"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Mobilia
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

      {selectedMobilia && (
        <PopupEquip
          equipamento={selectedMobilia}
          onClose={() => setSelectedMobilia(null)}
          onOptionClick={(tipo) => {
            console.log(`Ação ${tipo} para mobilia ${selectedMobilia.id}`);
            setSelectedMobilia(null);
          }}
        />
      )}
    </div>
  );
};

export default MobiliasPage;