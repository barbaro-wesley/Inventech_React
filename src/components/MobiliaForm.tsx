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
  // IDs selecionados via Select
  setor?: string;
  localizacao?: string;
  valorCompra?: string;
  dataCompra?: string;
  inicioGarantia?: string;
  terminoGarantia?: string;
  notaFiscal?: string;
}

interface MobiliaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
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
    valorCompra: "",
    dataCompra: "",
    inicioGarantia: "",
    terminoGarantia: "",
    notaFiscal: "",
  });
  const [setores, setSetores] = useState<Setor[]>([]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        numeroPatrimonio: initialData.numeroPatrimonio ?? "",
        nomeEquipamento: initialData.nomeEquipamento ?? "",
        estado: initialData.estado ?? "",
        setor: initialData.setorId ? initialData.setorId.toString() : "",
        localizacao: initialData.localizacaoId ? initialData.localizacaoId.toString() : "",
        valorCompra: initialData.valorCompra ?? "",
        dataCompra: initialData.dataCompra ? initialData.dataCompra.slice(0, 10) : "",
        inicioGarantia: initialData.inicioGarantia ? initialData.inicioGarantia.slice(0, 10) : "",
        terminoGarantia: initialData.terminoGarantia ? initialData.terminoGarantia.slice(0, 10) : "",
        notaFiscal: initialData.notaFiscal ?? "",
      });
    } else {
      setFormData({
        numeroPatrimonio: "",
        nomeEquipamento: "",
        estado: "",
        setor: "",
        localizacao: "",
        valorCompra: "",
        dataCompra: "",
        inicioGarantia: "",
        terminoGarantia: "",
        notaFiscal: "",
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
      const response = await api.get("/setor", { withCredentials: true });
      setSetores(response.data);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
    }
  };

  const fetchLocalizacoes = async () => {
    try {
      const response = await api.get("/localizacao", { withCredentials: true });
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

    // monta payload somente com o que o backend precisa
    const submitData = {
      numeroPatrimonio: formData.numeroPatrimonio,
      nomeEquipamento: formData.nomeEquipamento,
      estado: formData.estado,
      setorId: formData.setor ? parseInt(formData.setor) : undefined,
      localizacaoId: formData.localizacao ? parseInt(formData.localizacao) : undefined,
      tipoEquipamentoId: 6, // fixo pra mobilia
      valorCompra: formData.valorCompra || null,
      dataCompra: formData.dataCompra || null,
      inicioGarantia: formData.inicioGarantia || null,
      terminoGarantia: formData.terminoGarantia || null,
      notaFiscal: formData.notaFiscal || null,
    };

    let response;
    if (initialData?.id) {
      response = await api.put(`/equipamentos-medicos/${initialData.id}`, submitData, {
        withCredentials: true,
      });
      toast({
        title: "Sucesso",
        description: "Mobilia atualizada com sucesso!",
      });
    } else {
      response = await api.post("/equipamentos-medicos", submitData, {
        withCredentials: true,
      });
      toast({
        title: "Sucesso",
        description: "Mobilia criada com sucesso!",
      });
    }

    onSubmit(response.data);
    onClose();
  } catch (error: any) {
    console.error("Erro ao salvar mobilia:", error.response?.data || error.message);
    toast({
      title: "Erro",
      description: error.response?.data?.message || error.message || "Erro ao salvar mobilia",
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
      <DialogContent className="w-full sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Mobilia" : "Nova Mobilia"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-base sm:text-lg">Identificação</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base sm:text-lg">Localização</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="setor">Setor</Label>
                <Select
                  value={formData.setor}
                  onValueChange={(value) => handleInputChange("setor", value)}
                >
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
                <Select
                  value={formData.localizacao}
                  onValueChange={(value) => handleInputChange("localizacao", value)}
                >
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
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base sm:text-lg">Financeiro e Garantia</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valorCompra">Valor da Compra</Label>
                <Input
                  id="valorCompra"
                  type="number"
                  step="0.01"
                  value={formData.valorCompra}
                  onChange={(e) => handleInputChange("valorCompra", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataCompra">Data da Compra</Label>
                <Input
                  id="dataCompra"
                  type="date"
                  value={formData.dataCompra}
                  onChange={(e) => handleInputChange("dataCompra", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inicioGarantia">Início da Garantia</Label>
                <Input
                  id="inicioGarantia"
                  type="date"
                  value={formData.inicioGarantia}
                  onChange={(e) => handleInputChange("inicioGarantia", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terminoGarantia">Término da Garantia</Label>
                <Input
                  id="terminoGarantia"
                  type="date"
                  value={formData.terminoGarantia}
                  onChange={(e) => handleInputChange("terminoGarantia", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notaFiscal">Nota Fiscal</Label>
              <Input
                id="notaFiscal"
                value={formData.notaFiscal}
                onChange={(e) => handleInputChange("notaFiscal", e.target.value)}
              />
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