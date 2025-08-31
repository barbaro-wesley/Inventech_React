import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Search, Wrench, Calendar, Hammer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { EquipamentoForm } from "@/components/EquipamentoForm";
import { OSForm } from "@/components/OSForm";
import { OSPreventivaForm } from "@/components/forms/OSPreventivaForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import PopupEquip from "@/components/popups/PopupEquip";

const Equipamentos = () => {
  const [equipments, setEquipments] = useState([]);
  const [allEquipments, setAllEquipments] = useState([]);
  const [tiposEquipamento, setTiposEquipamento] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [showOSForm, setShowOSForm] = useState(false);
  const [showOSPreventivaForm, setShowOSPreventivaForm] = useState(false);
  const [selectedEquipmentForOS, setSelectedEquipmentForOS] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipoId, setSelectedTipoId] = useState("3");
  const { toast } = useToast();

  const colors = [
    "text-red-600",
    "text-blue-600",
    "text-green-600",
    "text-purple-600",
    "text-yellow-600",
    "text-pink-600",
    "text-indigo-600",
  ];

  const fetchEquipments = async (tipoId: string = "all") => {
    try {
      setLoading(true);
      const url =
        tipoId === "all"
          ? "/equipamentos-medicos"
          : `/equipamentos-medicos/tipo/${tipoId}`;

      const [equipmentsResponse, tiposResponse, contagemResponse] = await Promise.all([
        api.get(url, { withCredentials: true }),
        api.get("/tipos-equipamento", { withCredentials: true }),
        api.get("/tipos-equipamento/contagem", { withCredentials: true }),
      ]);

      setAllEquipments(equipmentsResponse.data);
      setEquipments(equipmentsResponse.data);
      setTiposEquipamento(tiposResponse.data);

      if (contagemResponse.data.success) {
        const formattedCategories = contagemResponse.data.data.map((item, index) => ({
          name: item.tipoNome.trim(),
          count: item.quantidade,
          color: colors[index % colors.length],
        }));
        setCategories(formattedCategories);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar equipamentos ou tipos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEquipments = () => {
    let filtered = allEquipments;

    if (searchTerm) {
      filtered = filtered.filter((equipment: any) =>
        equipment.nomeEquipamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.numeroPatrimonio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase()) || // 🔑 aqui
        equipment.tipoEquipamento?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTipoId && selectedTipoId !== "all") {
      filtered = filtered.filter((equipment: any) =>
        String(equipment.tipoEquipamentoId) === selectedTipoId
      );
    }

    setEquipments(filtered);
  };

  useEffect(() => {
    fetchEquipments("3"); // carrega tipo 3 ao montar
  }, []);

  useEffect(() => {
    if (selectedTipoId) {
      fetchEquipments(selectedTipoId);
    }
  }, [selectedTipoId]);
  useEffect(() => {
  filterEquipments();
}, [searchTerm, selectedTipoId, allEquipments]);
useEffect(() => {
  if (selectedEquipmentForOS) {
    if (selectedEquipmentForOS.preventiva) {
      setShowOSPreventivaForm(true);
    } else {
      setShowOSForm(true);
    }
  }
}, [selectedEquipmentForOS]);

  const handleFormSubmit = (data: any) => {
    if (editingEquipment) {
      setEquipments(prev => prev.map((eq: any) => eq.id === data.id ? data : eq));
    } else {
      setEquipments(prev => [...prev, data]);
    }
    setEditingEquipment(null);
  };

  const handleEdit = (equipment: any) => {
    setEditingEquipment(equipment);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEquipment(null);
  };

 const handleMaintenanceClick = (equipment: any, type: 'preventiva' | 'corretiva') => {
  setSelectedEquipmentForOS({
    equipamento: equipment,
    preventiva: type === 'preventiva'
  });
};

  const handleCloseOSForm = () => {
    setShowOSForm(false);
    setSelectedEquipmentForOS(null);
  };

  const handleCloseOSPreventivaForm = () => {
    setShowOSPreventivaForm(false);
    setSelectedEquipmentForOS(null);
  };

  const handleOSSubmit = (data: any) => {
    toast({
      title: "Sucesso",
      description: "Ordem de serviço criada com sucesso!",
    });
  };

  return (
    <div className="container mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-brand-secondary" />
            Equipamentos
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie equipamentos e outros dispositivos
          </p>
        </div>

        <Button
          className="bg-gradient-brand hover:opacity-90 transition-opacity w-full sm:w-auto"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Equipamento
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar equipamentos..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedTipoId} onValueChange={setSelectedTipoId}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Tipo de equipamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {tiposEquipamento.map((tipo: any) => (
                <SelectItem key={tipo.id} value={String(tipo.id)}>
                  {tipo.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(searchTerm || selectedTipoId) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedTipoId("all");
              }}
              className="w-full sm:w-auto"
            >
              Limpar
            </Button>
          )}
        </div>
      </Card>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {categories.map((category, index) => (
          <Card key={index} className="p-4 hover:shadow-soft transition-shadow cursor-pointer">
            <div className="text-center">
              <div className={`text-xl sm:text-2xl font-bold ${category.color}`}>
                {category.count}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {category.name}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Equipment List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4 sm:p-6 animate-pulse">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="h-8 w-20 bg-muted rounded"></div>
              </div>
            </Card>
          ))
        ) : equipments.length > 0 ? (
          equipments.map((equipment: any, index) => (
            <Card key={index} className="p-4 sm:p-6 hover:shadow-soft transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="p-3 bg-gradient-brand rounded-lg">
                    <Settings className="h-6 w-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-1">
                      {equipment.nomeEquipamento || `Equipamento #${index + 1}`}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                      {equipment.tipoEquipamento?.nome || 'Equipamento Médico'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="font-medium">Setor:</span>
                        <span className="text-muted-foreground ml-1">
                          {equipment.setor?.nome || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Modelo:</span>
                        <span className="text-muted-foreground ml-1">
                          {equipment.modelo || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Patrimônio:</span>
                        <span className="text-muted-foreground ml-1">
                          {equipment.numeroPatrimonio || 'Não informado'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => handleEdit(equipment)}
                  >
                    Editar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setSelectedEquipment(equipment)}
                  >
                    Detalhes
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Wrench className="h-4 w-4 mr-1" />
                        Manutenção
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleMaintenanceClick(equipment, 'preventiva')}
                        className="cursor-pointer"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Preventiva
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleMaintenanceClick(equipment, 'corretiva')}
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
                    className="w-full sm:w-auto"
                  >
                    Histórico
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 sm:p-12 text-center">
            <Settings className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhum equipamento encontrado</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Comece adicionando o primeiro equipamento ao sistema
            </p>
            <Button
              className="bg-gradient-brand hover:opacity-90 w-full sm:w-auto"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Equipamento
            </Button>
          </Card>
        )}
      </div>

      <EquipamentoForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingEquipment}
      />

      <OSForm
        isOpen={showOSForm}
        onClose={handleCloseOSForm}
        onSubmit={handleOSSubmit}
        initialData={selectedEquipmentForOS}
      />

      <OSPreventivaForm
        isOpen={showOSPreventivaForm}
        onClose={handleCloseOSPreventivaForm}
        onSubmit={handleOSSubmit}
        initialData={selectedEquipmentForOS}
      />

      {selectedEquipment && (
        <PopupEquip
          equipamento={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onOptionClick={(tipo) => {
            handleMaintenanceClick(selectedEquipment, tipo.toLowerCase() as 'preventiva' | 'corretiva');
            setSelectedEquipment(null);
          }}
        />
      )}
    </div>
  );
};

export default Equipamentos;