import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface OSFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  initialData?: any;
}

export const OSForm = ({ isOpen, onClose, onSubmit, initialData }: OSFormProps) => {
  const [formData, setFormData] = useState({
    arquivos: [] as File[],
    descricao: '',
    tipoEquipamentoId: '',
    tecnicoId: '',
    status: 'ABERTA',
    preventiva: false,
    setorId: '',
    equipamentoId: '',
  });

  const [tiposEquipamento, setTiposEquipamento] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [filteredTecnicos, setFilteredTecnicos] = useState<any[]>([]);
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [grupo, setGrupo] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState(false);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'ABERTA', label: 'Aberta' },
    { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { value: 'CONCLUIDA', label: 'Concluída' },
  ];

  const endpointPorTipo: { [key: string]: string } = {
    '1': '/hcr-computers',
    '2': '/printers',
    '3': '/equipamentos-medicos',
    '4': '/condicionadores',
    '5': '/equipamentos-medicos',
    '6': '/hcr-mobilia',
  };

  useEffect(() => {
    async function fetchOptions() {
      try {
        const [tiposRes, tecnicosRes] = await Promise.all([
          api.get('/tipos-equipamento', { withCredentials: true }),
          api.get('/tecnicos', { withCredentials: true }),
        ]);
        setTiposEquipamento(tiposRes.data);
        setTecnicos(tecnicosRes.data);
        setFilteredTecnicos(tecnicosRes.data);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar opções do formulário",
          variant: "destructive",
        });
      }
    }
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen, toast]);

  useEffect(() => {
    if (initialData && initialData.equipamento) {
      const eq = initialData.equipamento;
      setFormData({
        arquivos: [],
        descricao: '',
        tipoEquipamentoId: String(eq.tipoEquipamentoId || ''),
        tecnicoId: '',
        status: 'ABERTA',
        preventiva: !!initialData.preventiva,
        setorId: eq.setor?.id || '',
        equipamentoId: String(eq.id || ''),
      });
      setEquipamentos([eq]);
      const tipoId = String(eq.tipoEquipamentoId || '');
      const endpoint = endpointPorTipo[tipoId];
      if (endpoint) {
        (async () => {
          try {
            setLoadingEquipamentos(true);
            const res = await api.get(endpoint, {
              withCredentials: true,
              params: { tipoEquipamentoId: tipoId },
            });
            const filteredEquipamentos = res.data.filter((e: any) => String(e.tipoEquipamentoId) === tipoId);
            setEquipamentos(prev => {
              const allEquipamentos = [...prev, ...filteredEquipamentos];
              return Array.from(new Map(allEquipamentos.map((e: any) => [e.id, e])).values());
            });
          } catch (error) {
            toast({
              title: "Erro",
              description: "Erro ao carregar equipamentos",
              variant: "destructive",
            });
          } finally {
            setLoadingEquipamentos(false);
          }
        })();
      }
      const selectedTipo = tiposEquipamento.find(t => t.id === parseInt(tipoId));
      setGrupo(selectedTipo?.grupo?.nome || '');
      if (selectedTipo?.grupo?.id) {
        const filtered = tecnicos.filter(t => t.grupo?.id === selectedTipo.grupo.id);
        setFilteredTecnicos(filtered);
      } else {
        setFilteredTecnicos(tecnicos);
      }
    }
  }, [initialData, tiposEquipamento, tecnicos, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setFormData({ ...formData, arquivos: filesArray });
      setFileNames(filesArray.map((file) => file.name));
    }
  };

  const handleTipoEquipamentoChange = async (value: string) => {
    const tipoId = String(value);
    const selectedTipo = tiposEquipamento.find((t) => t.id === parseInt(value));
    setGrupo(selectedTipo?.grupo?.nome || '');

    if (selectedTipo?.grupo?.id) {
      const filtered = tecnicos.filter(t => t.grupo?.id === selectedTipo.grupo.id);
      setFilteredTecnicos(filtered);
      if (!filtered.some(t => t.id === parseInt(formData.tecnicoId))) {
        setFormData(prev => ({ ...prev, tecnicoId: '' }));
      }
    } else {
      setFilteredTecnicos(tecnicos);
      setFormData(prev => ({ ...prev, tecnicoId: '' }));
    }

    const endpoint = endpointPorTipo[tipoId];
    if (endpoint) {
      try {
        setLoadingEquipamentos(true);
        setEquipamentos([]);
        const res = await api.get(endpoint, {
          withCredentials: true,
          params: { tipoEquipamentoId: tipoId }
        });
        const filteredEquipamentos = res.data.filter((e: any) => String(e.tipoEquipamentoId) === tipoId);
        setEquipamentos(filteredEquipamentos);
        setFormData((prev) => ({ ...prev, tipoEquipamentoId: value, equipamentoId: '', setorId: '' }));
      } catch (error) {
        setEquipamentos([]);
        toast({
          title: "Erro",
          description: "Erro ao carregar equipamentos",
          variant: "destructive",
        });
      } finally {
        setLoadingEquipamentos(false);
      }
    } else {
      setEquipamentos([]);
      setFormData((prev) => ({ ...prev, tipoEquipamentoId: value, equipamentoId: '', setorId: '' }));
      toast({
        title: "Aviso",
        description: "Nenhum endpoint configurado para este tipo de equipamento",
        variant: "destructive",
      });
    }
  };

  const handleEquipamentoChange = (value: string) => {
    const selectedEquipamento = equipamentos.find((e) => e.id === parseInt(value));
    setFormData({
      ...formData,
      equipamentoId: value,
      setorId: selectedEquipamento?.setor?.id || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formData.arquivos.forEach((file) => formDataToSend.append('arquivos', file));
      formDataToSend.append('descricao', formData.descricao);
      formDataToSend.append('tipoEquipamentoId', formData.tipoEquipamentoId);
      formDataToSend.append('tecnicoId', formData.tecnicoId);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('preventiva', formData.preventiva ? 'true' : 'false');
      if (formData.setorId) formDataToSend.append('setorId', formData.setorId);
      formDataToSend.append('equipamentoId', formData.equipamentoId);

      const response = await api.post('/os', formDataToSend, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast({
        title: "Sucesso",
        description: "Ordem de Serviço cadastrada com sucesso!",
      });

      if (onSubmit) {
        onSubmit(response.data);
      }

      setFormData({
        arquivos: [],
        descricao: '',
        tipoEquipamentoId: '',
        tecnicoId: '',
        status: 'ABERTA',
        preventiva: false,
        setorId: '',
        equipamentoId: '',
      });
      setGrupo('');
      setFilteredTecnicos(tecnicos);
      setEquipamentos([]);
      setFileNames([]);
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar Ordem de Serviço",
        variant: "destructive",
      });
    }
  };

  const getEquipamentoNome = (equipamento: any, tipoEquipamentoId: string) => {
    switch (tipoEquipamentoId) {
      case '1':
        return `${equipamento.nomePC || 'Sem Nome'} - ${equipamento.ip || 'Sem IP'}`;
      case '2':
        return `${equipamento.ip || 'Sem Nome'} - ${equipamento.marca || 'Sem Marca'}`;
      case '3':
      case '5':
        return `${equipamento.numeroSerie || 'Sem Nº de Série'} - ${equipamento.nomeEquipamento || 'Sem Modelo'}`;
      case '4':
        return `${equipamento.marca || 'Sem Marca'} - ${equipamento.nPatrimonio || 'Sem Patrimônio'}`;
      case '6':
        return `${equipamento.nPatrimonio || 'Sem Marca'} - ${equipamento.nome || 'Sem Patrimônio'}`;
      case '7':
        return `${equipamento.nPatrimonio || 'Sem Marca'} - ${equipamento.nome || 'Sem Patrimônio'}`;
      default:
        return 'Equipamento não identificado';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastro de Ordem de Serviço</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipoEquipamento">Tipo de Equipamento</Label>
            <Select
              value={formData.tipoEquipamentoId}
              onValueChange={handleTipoEquipamentoChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {tiposEquipamento.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipamento">Equipamento</Label>
            <Select
              value={formData.equipamentoId}
              onValueChange={handleEquipamentoChange}
              required
              disabled={loadingEquipamentos || !formData.tipoEquipamentoId}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingEquipamentos ? 'Carregando...' : 'Selecione'} />
              </SelectTrigger>
              <SelectContent>
                {equipamentos.map((e) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {getEquipamentoNome(e, formData.tipoEquipamentoId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tecnico">Técnico Responsável</Label>
            <Select
              value={formData.tecnicoId}
              onValueChange={(value) => setFormData({ ...formData, tecnicoId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {filteredTecnicos.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.nome} {t.matricula ? `(${t.matricula})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grupo">Grupo</Label>
            <Input
              value={
                filteredTecnicos.find((t) => t.id === parseInt(formData.tecnicoId))?.grupo?.nome || ""
              }
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grupoEquipamento">Grupo do Equipamento</Label>
            <Input value={grupo} readOnly />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="arquivos" className="flex items-center gap-2">
              <Paperclip size={18} />
              Arquivos (Imagens)
            </Label>
            <Input
              type="file"
              name="arquivos"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {fileNames.length > 0 && (
              <ul className="text-sm text-muted-foreground">
                {fileNames.map((name, idx) => (
                  <li key={idx}>• {name}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              name="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="col-span-2 flex gap-2 pt-4">
            <Button type="submit" className="bg-gradient-brand hover:opacity-90">
              Salvar
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};