import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface PrinterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Printer) => void;
  initialData?: Printer | null;
}

interface Printer {
  id?: number;
  numeroPatrimonio: string;
  nPatrimonio: string;
  ip: string;
  modelo: string;
  marca: string;
  setorId?: number;
  localizacaoId?: number;
  tipoEquipamentoId?: number;
  setor?: { nome: string };
  localizacao?: { nome: string };
  tipoEquipamento?: { nome: string };
}

interface Localizacao {
  id: number;
  nome: string;
  setorId?: number;
  setor?: { nome: string };
}

interface TipoEquipamento {
  id: number;
  nome: string;
}

export function PrinterForm({ isOpen, onClose, onSubmit, initialData = null }: PrinterFormProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    numeroPatrimonio: initialData?.nPatrimonio || '',
    ip: initialData?.ip || '',
    modelo: initialData?.modelo || '',
    marca: initialData?.marca || '',
    setorId: initialData?.setorId ? String(initialData.setorId) : '',
    localizacaoId: initialData?.localizacaoId ? String(initialData.localizacaoId) : '',
    tipoEquipamentoId: initialData?.tipoEquipamentoId ? String(initialData.tipoEquipamentoId) : '',
  });

  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [tiposImpressora, setTiposImpressora] = useState<TipoEquipamento[]>([]);
  const [setorNome, setSetorNome] = useState<string>('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const localizacoesRes = await api.get('/localizacao', { withCredentials: true });
        const tiposRes = await api.get('/tipos-equipamento', { withCredentials: true });

        setLocalizacoes(localizacoesRes.data);
        setTiposImpressora(tiposRes.data);

        if (initialData?.localizacaoId) {
          const selectedLoc = localizacoesRes.data.find(
            (loc: Localizacao) => loc.id === Number(initialData.localizacaoId)
          );
          if (selectedLoc?.setor?.nome) {
            setSetorNome(selectedLoc.setor.nome);
          }
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as opções.",
          variant: "destructive",
        });
      }
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen, initialData, toast]);

  const handleChange = (name: string, value: string) => {
    if (name === 'localizacaoId') {
      const selectedLoc = localizacoes.find((loc) => loc.id === Number(value));
      setFormData((prev) => ({
        ...prev,
        localizacaoId: value,
        setorId: selectedLoc?.setorId ? String(selectedLoc.setorId) : '',
      }));
      setSetorNome(selectedLoc?.setor?.nome || '');
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.numeroPatrimonio|| !formData.ip || !formData.modelo || !formData.marca) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      numeroPatrimonio: formData.numeroPatrimonio,
      ip: formData.ip,
      modelo: formData.modelo,
      marca: formData.marca,
      setorId: formData.setorId ? Number(formData.setorId) : undefined,
      localizacaoId: formData.localizacaoId ? Number(formData.localizacaoId) : undefined,
      tipoEquipamentoId: formData.tipoEquipamentoId ? Number(formData.tipoEquipamentoId) : undefined,
    };

    try {
      let response;
      let printerData;

      if (initialData?.id) {
        response = await api.put(`/equipamentos-medicos/${initialData.id}`, payload, {
          withCredentials: true,
        });
        printerData = response.data;
        toast({
          title: "Sucesso",
          description: "Impressora atualizada com sucesso!",
        });
      } else {
        response = await api.post('/equipamentos-medicos/', payload, {
          withCredentials: true,
        });
        printerData = response.data;
        toast({
          title: "Sucesso",
          description: "Impressora cadastrada com sucesso!",
        });
      }
      const selectedLoc = localizacoes.find((loc) => loc.id === Number(formData.localizacaoId));
      const selectedTipo = tiposImpressora.find((tipo) => tipo.id === Number(formData.tipoEquipamentoId));

      const itemCompleto: Printer = {
        ...printerData,
        setor: selectedLoc?.setor ? { nome: selectedLoc.setor.nome } : undefined,
        localizacao: selectedLoc ? { nome: selectedLoc.nome } : undefined,
        tipoEquipamento: selectedTipo ? { nome: selectedTipo.nome } : undefined,
      };

      onSubmit(itemCompleto);
      onClose();

      setFormData({
        numeroPatrimonio: '',
        ip: '',
        modelo: '',
        marca: '',
        setorId: '',
        localizacaoId: '',
        tipoEquipamentoId: '',
      });
      setSetorNome('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Tente novamente.';
      toast({
        title: "Erro",
        description: `Erro ao salvar impressora: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-[90vw] sm:max-w-[600px] overflow-y-auto p-4 sm:p-6">
        <SheetHeader>
          <SheetTitle className="text-base sm:text-lg">
            {initialData ? 'Editar Impressora' : 'Nova Impressora'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card className="p-3 sm:p-4">
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Informações da Impressora</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="numeroPatrimonio" className="text-xs sm:text-sm">Número Patrimônio *</Label>
                <Input
                  id="numeroPatrimonio"
                  value={formData.numeroPatrimonio}
                  onChange={(e) => handleChange('numeroPatrimonio', e.target.value)}
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="ip" className="text-xs sm:text-sm">IP *</Label>
                <Input
                  id="ip"
                  value={formData.ip}
                  onChange={(e) => handleChange('ip', e.target.value)}
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="modelo" className="text-xs sm:text-sm">Modelo *</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => handleChange('modelo', e.target.value)}
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="marca" className="text-xs sm:text-sm">Marca *</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => handleChange('marca', e.target.value)}
                  required
                  className="text-sm"
                />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Localização</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="localizacaoId" className="text-xs sm:text-sm">Localização *</Label>
                <Select
                  value={formData.localizacaoId}
                  onValueChange={(value) => handleChange('localizacaoId', value)}
                  required
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Selecione a localização" />
                  </SelectTrigger>
                  <SelectContent>
                    {localizacoes.map((loc) => (
                      <SelectItem key={loc.id} value={String(loc.id)} className="text-sm">
                        {loc.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="setorId" className="text-xs sm:text-sm">Setor</Label>
                <Input
                  id="setorId"
                  value={setorNome}
                  disabled
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="tipoEquipamentoId" className="text-xs sm:text-sm">Tipo de Equipamento *</Label>
                <Select
                  value={formData.tipoEquipamentoId}
                  onValueChange={(value) => handleChange('tipoEquipamentoId', value)}
                  required
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposImpressora.map((tipo) => (
                      <SelectItem key={tipo.id} value={String(tipo.id)} className="text-sm">
                        {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-[70px] px-2 rounded-md hover:bg-gray-100 text-sm"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="min-w-[70px] px-2 rounded-md bg-gradient-brand hover:opacity-90 text-sm"
            >
              {initialData ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}