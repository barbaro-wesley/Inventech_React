import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Search, Wrench, Calendar, Hammer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { EquipamentoForm } from "@/components/EquipamentoForm";
import { OSForm } from "@/components/OSForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import PopupEquip from "@/components/popups/PopupEquip";


const Equipamentos = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [showOSForm, setShowOSForm] = useState(false);
  const [selectedEquipmentForOS, setSelectedEquipmentForOS] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const { toast } = useToast();

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/equipamentos-medicos', {
        withCredentials: true,
      });
      setEquipments(response.data);
    } catch (error) {
      toast({
        title: "Erro ao carregar equipamentos",
        description: "Não foi possível carregar a lista de equipamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

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
    setShowOSForm(true);
  };

  const handleCloseOSForm = () => {
    setShowOSForm(false);
    setSelectedEquipmentForOS(null);
  };

  const handleOSSubmit = (data: any) => {
    toast({
      title: "Sucesso",
      description: "Ordem de serviço criada com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8 text-brand-secondary" />
            Equipamentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie equipamentos médicos e outros dispositivos
          </p>
        </div>
        
        <Button 
          className="bg-gradient-brand hover:opacity-90 transition-opacity"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Equipamento
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar equipamentos..." 
              className="pl-9"
            />
          </div>
          <Button variant="outline">Filtros</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { name: "Médicos", count: 45, color: "text-red-600" },
          { name: "Laboratorio", count: 23, color: "text-blue-600" },
          { name: "Diagnóstico", count: 12, color: "text-green-600" },
          { name: "Outros", count: 8, color: "text-purple-600" }
        ].map((category, index) => (
          <Card key={index} className="p-4 hover:shadow-soft transition-shadow cursor-pointer">
            <div className="text-center">
              <div className={`text-2xl font-bold ${category.color}`}>
                {category.count}
              </div>
              <div className="text-sm text-muted-foreground">
                {category.name}
              </div>
            </div>
          </Card>
        ))}
      </div>

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
        ) : equipments.length > 0 ? (
          equipments.map((equipment: any, index) => (
            <Card key={index} className="p-6 hover:shadow-soft transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 flex-1">
                  <div className="p-3 bg-gradient-brand rounded-lg">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {equipment.nomeEquipamento || `Equipamento #${index + 1}`}
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      {equipment.tipoEquipamento?.nome || 'Equipamento Médico'}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(equipment)}
                  >
                    Editar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedEquipment(equipment)}
                  >
                    Detalhes
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
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
                  
                  <Button variant="outline" size="sm">
                    Histórico
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum equipamento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando o primeiro equipamento ao sistema
            </p>
            <Button 
              className="bg-gradient-brand hover:opacity-90"
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