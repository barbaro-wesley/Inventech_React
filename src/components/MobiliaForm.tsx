import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Mobilia {
  id?: number;
  numeroPatrimonio: string;
  nomeEquipamento: string;
  estado: string;
  localizacao?: { nome: string };
  setor?: { nome: string };
}

interface MobiliaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Mobilia) => void;
  initialData?: Mobilia | null;
}

interface Setor {
  id: number;
  nome: string;
}

interface Localizacao {
  id: number;
  nome: string;
}

export const MobiliaForm = ({ isOpen, onClose, onSubmit, initialData }: MobiliaFormProps) => {
  const [formData, setFormData] = useState<Mobilia>({
    numeroPatrimonio: "",
    nomeEquipamento: "",
    estado: "",
  });
  const [setores, setSetores] = useState<Setor[]>([]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        numeroPatrimonio: "",
        nomeEquipamento: "",
        estado: "",
      });
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchSetores();
      fetchLocalizacoes();
    }
  }, [isOpen]);

  const fetchSetores = async () => {
    try {
      const response = await api.get("/setores", { withCredentials: true });
      setSetores(response.data);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
    }
  };

  const fetchLocalizacoes = async () => {
    try {
      const response = await api.get("/localizacoes", { withCredentials: true });
      setLocalizacoes(response.data);
    } catch (error) {
      console.error("Erro ao carregar localizações:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.numeroPatrimonio || !formData.nomeEquipamento) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        tipoEquipamentoId: 6, // ID para mobilias
      };

      if (initialData?.id) {
        await api.put(`/equipamentos-medicos/${initialData.id}`, submitData, {
          withCredentials: true,
        });
        toast({
          title: "Sucesso",
          description: "Mobilia atualizada com sucesso!",
        });
      } else {
        const response = await api.post("/equipamentos-medicos", submitData, {
          withCredentials: true,
        });
        toast({
          title: "Sucesso",
          description: "Mobilia criada com sucesso!",
        });
      }
      
      onSubmit(formData);
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar mobilia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Mobilia, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Mobilia" : "Nova Mobilia"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numeroPatrimonio">Número de Patrimônio *</Label>
              <Input
                id="numeroPatrimonio"
                value={formData.numeroPatrimonio}
                onChange={(e) => handleInputChange("numeroPatrimonio", e.target.value)}
                placeholder="Ex: 001234"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nomeEquipamento">Nome do Mobiliário *</Label>
              <Input
                id="nomeEquipamento"
                value={formData.nomeEquipamento}
                onChange={(e) => handleInputChange("nomeEquipamento", e.target.value)}
                placeholder="Ex: Mesa de Escritório"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Novo">Novo</SelectItem>
                <SelectItem value="Bom">Bom</SelectItem>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Ruim">Ruim</SelectItem>
                <SelectItem value="Descartado">Descartado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="setor">Setor</Label>
              <Select onValueChange={(value) => handleInputChange("setor", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {setores.map((setor) => (
                    <SelectItem key={setor.id} value={setor.id.toString()}>
                      {setor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização</Label>
              <Select onValueChange={(value) => handleInputChange("localizacao", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a localização" />
                </SelectTrigger>
                <SelectContent>
                  {localizacoes.map((localizacao) => (
                    <SelectItem key={localizacao.id} value={localizacao.id.toString()}>
                      {localizacao.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-brand hover:opacity-90"
            >
              {loading ? "Salvando..." : initialData ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};