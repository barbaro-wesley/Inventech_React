import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Search, Wrench, Calendar, Hammer, QrCode } from "lucide-react";
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
import { QRCodeLabel } from "@/components/QRCodeLabel";

const EquipamentosTecnico = () => {
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
  const [selectedTipoId, setSelectedTipoId] = useState("all");
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equipmentsResponse, tiposResponse] = await Promise.all([
        api.get("tecnicos/TecnicoEquipamentos", { withCredentials: true }),
        api.get("tecnicos/tipos-equipamentos", { withCredentials: true }),
      ]);

      // Ajusta para a estrutura da resposta { message, equipamentos/tipos }
      setAllEquipments(equipmentsResponse.data.equipamentos || []);
      setEquipments(equipmentsResponse.data.equipamentos || []);
      setTiposEquipamento(tiposResponse.data.tipos || []);

      // Calcula categorias para os cards de contagem
      const formattedCategories = tiposResponse.data.tipos.map((tipo: any, index: number) => ({
        name: tipo.nome.trim(),
        count: equipmentsResponse.data.equipamentos.filter(
          (eq: any) => eq.tipoEquipamentoId === tipo.id
        ).length,
        color: colors[index % colors.length],
      }));
      setCategories(formattedCategories);
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
        equipment.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    fetchData();
  }, []);

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
      setEquipments((prev: any) => prev.map((eq: any) => (eq.id === data.id ? data : eq)));
      setAllEquipments((prev: any) => prev.map((eq: any) => (eq.id === data.id ? data : eq)));
    } else {
      setEquipments((prev: any) => [...prev, data]);
      setAllEquipments((prev: any) => [...prev, data]);
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
      preventiva: type === 'preventiva',
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
            Meus Equipamentos
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie os equipamentos associados ao seu grupo
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
          {(searchTerm || selectedTipoId !== "all") && (
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
        {categories.map((category: any, index: number) => (
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
        ) : equipments.length > 0 ? (
          equipments.map((equipment: any, index: number) => (
            <Card key={index} className="p-4 sm:p-6 hover:shadow-soft transition-shadow">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2 bg-gradient-brand rounded-lg">
                  <Settings className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Ativo
                </span>
              </div>

              <h3 className="font-semibold text-base sm:text-lg mb-2">
                {equipment.nomeEquipamento || `Equipamento #${index + 1}`}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                {equipment.tipoEquipamento?.nome || 'Equipamento Médico'}
              </p>

              <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                <p>Patrimônio: {equipment.numeroPatrimonio || 'Não informado'}</p>
                <p>Modelo: {equipment.modelo || 'Não informado'}</p>
                <p>Série: {equipment.numeroSerie || 'Não informado'}</p>
                <p>Setor: {equipment.setor?.nome || 'Não informado'}</p>
                <p>Localização: {equipment.localizacao?.nome || 'Não informado'}</p>
              </div>

              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[70px] px-2 rounded-md hover:bg-gray-100 text-sm"
                  onClick={() => handleEdit(equipment)}
                >
                  Editar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[70px] px-2 rounded-md hover:bg-gray-100 text-sm"
                  onClick={() => setSelectedEquipment(equipment)}
                >
                  Detalhes
                </Button>

                <QRCodeLabel equipamento={equipment} />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-sm">
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
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 sm:py-12">
            <Settings className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhum equipamento encontrado</h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
              Nenhum equipamento está associado ao seu grupo
            </p>
            <Button
              className="bg-gradient-brand hover:opacity-90 w-full sm:w-auto"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Equipamento
            </Button>
          </div>
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
          onOptionClick={(tipo: string) => {
            handleMaintenanceClick(selectedEquipment, tipo.toLowerCase() as 'preventiva' | 'corretiva');
            setSelectedEquipment(null);
          }}
        />
      )}
    </div>
  );
};

export default EquipamentosTecnico;