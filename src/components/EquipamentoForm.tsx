import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface EquipamentoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

interface Setor {
  id: number;
  nome: string;
  localizacoes: Localizacao[];
}

interface Localizacao {
  id: number;
  nome: string;
}

interface TipoEquipamento {
  id: number;
  nome: string;
}

export function EquipamentoForm({ isOpen, onClose, onSubmit, initialData = null }: EquipamentoFormProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    numeroPatrimonio: '',
    identificacao: '',
    numeroSerie: '',
    numeroAnvisa: '',
    nomeEquipamento: '',
    modelo: '',
    fabricante: '',
    valorCompra: '',
    dataCompra: '',
    inicioGarantia: '',
    terminoGarantia: '',
    notaFiscal: '',
    obs: '',
    setorId: '',
    localizacaoId: '',
    tipoEquipamentoId: '',
    arquivos: [] as File[]
  });

  const [fileNames, setFileNames] = useState<string[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [filteredLocalizacoes, setFilteredLocalizacoes] = useState<Localizacao[]>([]);
  const [tiposEquipamentos, setTiposEquipamentos] = useState<TipoEquipamento[]>([]);

  useEffect(() => {
    const fetchSetores = async () => {
      try {
        const response = await api.get('/setor', { withCredentials: true });
        setSetores(response.data);
      } catch (error) {
        console.error('Erro ao buscar setores:', error);
      }
    };

    const fetchTiposEquipamentos = async () => {
      try {
        const response = await api.get('/tipos-equipamento', { withCredentials: true });
        setTiposEquipamentos(response.data);
      } catch (error) {
        console.error('Erro ao buscar tipos de equipamento:', error);
      }
    };

    if (isOpen) {
      fetchSetores();
      fetchTiposEquipamentos();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        numeroPatrimonio: initialData.numeroPatrimonio ?? '',
        identificacao: initialData.identificacao ?? '',
        numeroSerie: initialData.numeroSerie ?? '',
        numeroAnvisa: initialData.numeroAnvisa ?? '',
        nomeEquipamento: initialData.nomeEquipamento ?? '',
        modelo: initialData.modelo ?? '',
        fabricante: initialData.fabricante ?? '',
        valorCompra: initialData.valorCompra ? String(initialData.valorCompra) : '',
        dataCompra: initialData.dataCompra ? initialData.dataCompra.slice(0, 10) : '',
        inicioGarantia: initialData.inicioGarantia ? initialData.inicioGarantia.slice(0, 10) : '',
        terminoGarantia: initialData.terminoGarantia ? initialData.terminoGarantia.slice(0, 10) : '',
        notaFiscal: initialData.notaFiscal ?? '',
        obs: initialData.obs ?? '',
        setorId: initialData.setorId ? String(initialData.setorId) : '',
        localizacaoId: initialData.localizacaoId ?? initialData.localizacao?.id ?? '',
        tipoEquipamentoId: initialData.tipoEquipamentoId ? String(initialData.tipoEquipamentoId) : '',
        arquivos: initialData.arquivos ?? [],
      });
      if (Array.isArray(initialData.arquivos)) {
        const nomes = initialData.arquivos.map((a: string) => a.split('/').pop());
        setFileNames(nomes);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.setorId && setores.length > 0) {
      const selectedSetor = setores.find((setor) => setor.id === parseInt(formData.setorId));
      setFilteredLocalizacoes(selectedSetor ? selectedSetor.localizacoes : []);
      if (
        formData.localizacaoId &&
        selectedSetor &&
        !selectedSetor.localizacoes.some((loc) => loc.id === parseInt(formData.localizacaoId))
      ) {
        setFormData((prev) => ({ ...prev, localizacaoId: '' }));
      }
    } else {
      setFilteredLocalizacoes([]);
      if (setores.length === 0) return;
      setFormData((prev) => ({ ...prev, localizacaoId: '' }));
    }
  }, [formData.setorId, setores]);

  const handleChange = (name: string, value: string | FileList | null) => {
    if (name === 'arquivos' && value instanceof FileList) {
      const files = Array.from(value);
      const names = files.map((file) => file.name);
      setFileNames(names);
      setFormData((prev) => ({ ...prev, arquivos: files }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nomeEquipamento) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o campo obrigatório: Nome do Equipamento.",
        variant: "destructive",
      });
      return;
    }

    const formToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'arquivos') {
        if (value && Array.isArray(value) && value.length > 0) {
          value.forEach((arquivo) => {
            formToSend.append('arquivos', arquivo);
          });
        }
      } else if (key.includes('data') || key.includes('Garantia')) {
        formToSend.append(key, value ? new Date(value as string).toISOString() : '');
      } else {
        formToSend.append(key, value as string || '');
      }
    });

    try {
      let response;
      let equipamentoAtualizado;

      if (initialData?.id) {
        await api.put(`/equipamentos-medicos/${initialData.id}`, formToSend, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const { data } = await api.get(`/equipamentos-medicos/${initialData.id}`);
        equipamentoAtualizado = data;
        toast({
          title: "Sucesso",
          description: "Equipamento atualizado com sucesso!",
        });
      } else {
        response = await api.post('/equipamentos-medicos', formToSend, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        equipamentoAtualizado = response.data;
        toast({
          title: "Sucesso",
          description: "Equipamento cadastrado com sucesso!",
        });
      }

      const setorCompleto = setores.find((s) => s.id === parseInt(formData.setorId)) || { nome: '--' };
      const localizacaoCompleta = filteredLocalizacoes.find((l) => l.id === parseInt(formData.localizacaoId)) || { nome: '--' };
      const tipoEquipamentoCompleto = tiposEquipamentos.find((te) => te.id === parseInt(formData.tipoEquipamentoId)) || { nome: '--' };

      const itemCompleto = {
        ...equipamentoAtualizado,
        setor: setorCompleto,
        localizacao: localizacaoCompleta,
        tipoEquipamento: tipoEquipamentoCompleto,
      };

      onSubmit(itemCompleto);
      onClose();
      
      // Reset form
      setFormData({
        numeroPatrimonio: '',
        identificacao: '',
        numeroSerie: '',
        numeroAnvisa: '',
        nomeEquipamento: '',
        modelo: '',
        fabricante: '',
        valorCompra: '',
        dataCompra: '',
        inicioGarantia: '',
        terminoGarantia: '',
        notaFiscal: '',
        obs: '',
        setorId: '',
        localizacaoId: '',
        tipoEquipamentoId: '',
        arquivos: [],
      });
      setFileNames([]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Tente novamente.';
      toast({
        title: "Erro",
        description: `Erro ao salvar equipamento médico: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {initialData ? 'Editar Equipamento' : 'Novo Equipamento Médico'}
          </SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Identificação */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Identificação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numeroPatrimonio">Número Patrimônio</Label>
                <Input
                  id="numeroPatrimonio"
                  value={formData.numeroPatrimonio}
                  onChange={(e) => handleChange('numeroPatrimonio', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="identificacao">Identificação</Label>
                <Input
                  id="identificacao"
                  value={formData.identificacao}
                  onChange={(e) => handleChange('identificacao', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="numeroSerie">Número Série</Label>
                <Input
                  id="numeroSerie"
                  value={formData.numeroSerie}
                  onChange={(e) => handleChange('numeroSerie', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="numeroAnvisa">Número ANVISA</Label>
                <Input
                  id="numeroAnvisa"
                  value={formData.numeroAnvisa}
                  onChange={(e) => handleChange('numeroAnvisa', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Informações Básicas */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Informações Básicas</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nomeEquipamento">Nome do Equipamento *</Label>
                <Input
                  id="nomeEquipamento"
                  value={formData.nomeEquipamento}
                  onChange={(e) => handleChange('nomeEquipamento', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => handleChange('modelo', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fabricante">Fabricante</Label>
                  <Input
                    id="fabricante"
                    value={formData.fabricante}
                    onChange={(e) => handleChange('fabricante', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Localização */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Localização</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="setorId">Setor</Label>
                <Select value={formData.setorId} onValueChange={(value) => handleChange('setorId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map((setor) => (
                      <SelectItem key={setor.id} value={String(setor.id)}>
                        {setor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="localizacaoId">Localização</Label>
                <Select 
                  value={formData.localizacaoId} 
                  onValueChange={(value) => handleChange('localizacaoId', value)}
                  disabled={!formData.setorId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a localização" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLocalizacoes.map((localizacao) => (
                      <SelectItem key={localizacao.id} value={String(localizacao.id)}>
                        {localizacao.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="tipoEquipamentoId">Tipo de Equipamento</Label>
              <Select value={formData.tipoEquipamentoId} onValueChange={(value) => handleChange('tipoEquipamentoId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposEquipamentos.map((tipo) => (
                    <SelectItem key={tipo.id} value={String(tipo.id)}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Financeiro e Garantia */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Financeiro e Garantia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valorCompra">Valor da Compra</Label>
                <Input
                  id="valorCompra"
                  type="number"
                  step="0.01"
                  value={formData.valorCompra}
                  onChange={(e) => handleChange('valorCompra', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dataCompra">Data da Compra</Label>
                <Input
                  id="dataCompra"
                  type="date"
                  value={formData.dataCompra}
                  onChange={(e) => handleChange('dataCompra', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="inicioGarantia">Início da Garantia</Label>
                <Input
                  id="inicioGarantia"
                  type="date"
                  value={formData.inicioGarantia}
                  onChange={(e) => handleChange('inicioGarantia', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="terminoGarantia">Término da Garantia</Label>
                <Input
                  id="terminoGarantia"
                  type="date"
                  value={formData.terminoGarantia}
                  onChange={(e) => handleChange('terminoGarantia', e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="notaFiscal">Nota Fiscal</Label>
              <Input
                id="notaFiscal"
                value={formData.notaFiscal}
                onChange={(e) => handleChange('notaFiscal', e.target.value)}
              />
            </div>
          </Card>

          {/* Observações e Arquivos */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Observações e Arquivos</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="obs">Observações</Label>
                <Textarea
                  id="obs"
                  value={formData.obs}
                  onChange={(e) => handleChange('obs', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="arquivos">Arquivos</Label>
                <Input
                  id="arquivos"
                  type="file"
                  multiple
                  onChange={(e) => handleChange('arquivos', e.target.files)}
                />
                {fileNames.length > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Arquivos: {fileNames.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-brand hover:opacity-90">
              {initialData ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}