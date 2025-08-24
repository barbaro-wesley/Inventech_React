import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Calendar, CalendarIcon, Paperclip, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface OSPreventivaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  initialData?: any;
}

interface TipoEquipamento {
  id: number;
  nome: string;
  grupo?: { id: number; nome: string };
}

interface Tecnico {
  id: number;
  nome: string;
  grupo?: { id: number; nome: string };
}

interface Equipamento {
  id: number;
  tipoEquipamentoId: number;
  setor?: { id: number; nome: string };
  nomeEquipamento?: string;
  numeroPatrimonio?: string;
}

const recorrencias = [
  { value: 'DIARIA', label: 'Diariamente' },
  { value: 'SEMANAL', label: 'Semanalmente' },
  { value: 'QUINZENAL', label: 'A cada 15 dias' },
  { value: 'MENSAL', label: 'Mensalmente' },
  { value: 'ANUAL', label: 'Anual' },
];

export const OSPreventivaForm: React.FC<OSPreventivaFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    descricao: '',
    tipoEquipamentoId: '',
    equipamentoId: '',
    tecnicoId: '',
    setorId: '',
    preventiva: true,
    dataAgendada: undefined as Date | undefined,
    recorrencia: '',
    intervaloDias: '',
    arquivos: [] as File[],
  });

  const [tiposEquipamento, setTiposEquipamento] = useState<TipoEquipamento[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [filteredTecnicos, setFilteredTecnicos] = useState<Tecnico[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [grupo, setGrupo] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState(false);
  const { toast } = useToast();

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
        console.error('Erro ao buscar dados:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados",
          variant: "destructive",
        });
      }
    }
    fetchOptions();
  }, [toast]);

  useEffect(() => {
    if (initialData && initialData.equipamento) {
      const eq = initialData.equipamento;
      setFormData(prev => ({
        ...prev,
        tipoEquipamentoId: String(eq.tipoEquipamentoId || ''),
        equipamentoId: String(eq.id || ''),
        setorId: eq.setor?.id || '',
        preventiva: !!initialData.preventiva,
      }));

      setEquipamentos([eq]);

      // Fetch additional equipment for the same tipoEquipamentoId
      const tipoId = String(eq.tipoEquipamentoId || '');
      (async () => {
        try {
          setLoadingEquipamentos(true);
          const res = await api.get('/equipamentos-medicos', {
            withCredentials: true,
            params: { tipoEquipamentoId: tipoId },
          });
          const filteredEquipamentos = res.data.filter((e: Equipamento) => String(e.tipoEquipamentoId) === tipoId);
          setEquipamentos(prev => {
            const allEquipamentos = [...prev, ...filteredEquipamentos];
            return Array.from(new Map(allEquipamentos.map(e => [e.id, e])).values());
          });
        } catch (error) {
          console.error('Erro ao buscar equipamentos:', error);
          toast({
            title: "Erro",
            description: "Erro ao carregar equipamentos",
            variant: "destructive",
          });
        } finally {
          setLoadingEquipamentos(false);
        }
      })();

      // Set grupo and filter técnicos based on tipoEquipamentoId
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

  const handleChange = async (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'tipoEquipamentoId') {
      const tipoId = String(value);
      const tipo = tiposEquipamento.find((t) => t.id === parseInt(tipoId));
      setGrupo(tipo?.grupo?.nome || '');

      // Filtrar técnicos
      if (tipo?.grupo?.id) {
        const filtered = tecnicos.filter(t => t.grupo?.id === tipo.grupo.id);
        setFilteredTecnicos(filtered);
        if (!filtered.some(t => t.id === parseInt(formData.tecnicoId))) {
          setFormData(prev => ({ ...prev, tecnicoId: '' }));
        }
      } else {
        setFilteredTecnicos(tecnicos);
        setFormData(prev => ({ ...prev, tecnicoId: '' }));
      }

      // Buscar equipamentos
      try {
        setLoadingEquipamentos(true);
        setEquipamentos([]);
        const res = await api.get('/equipamentos-medicos', {
          withCredentials: true,
          params: { tipoEquipamentoId: tipoId },
        });
        const filteredEquipamentos = res.data.filter((e: Equipamento) => String(e.tipoEquipamentoId) === tipoId);
        setEquipamentos(filteredEquipamentos);
        setFormData(prev => ({ ...prev, equipamentoId: '', setorId: '' }));
      } catch (error) {
        console.error('Erro ao buscar equipamentos:', error);
        setEquipamentos([]);
        toast({
          title: "Erro",
          description: "Erro ao carregar equipamentos",
          variant: "destructive",
        });
      } finally {
        setLoadingEquipamentos(false);
      }
    }

    if (name === 'equipamentoId') {
      const equipamento = equipamentos.find((e) => e.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        setorId: equipamento?.setor?.id ? String(equipamento.setor.id) : '',
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setFormData(prev => ({ ...prev, arquivos: filesArray }));
      setFileNames(filesArray.map(file => file.name));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = formData.arquivos.filter((_, i) => i !== index);
    const newFileNames = fileNames.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, arquivos: newFiles }));
    setFileNames(newFileNames);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formData.arquivos.forEach((file) => formDataToSend.append('arquivos', file));
      formDataToSend.append('descricao', formData.descricao);
      formDataToSend.append('tipoEquipamentoId', Number(formData.tipoEquipamentoId).toString());
      formDataToSend.append('equipamentoId', Number(formData.equipamentoId).toString());
      formDataToSend.append('tecnicoId', Number(formData.tecnicoId).toString());
      formDataToSend.append('status', 'ABERTA');
      formDataToSend.append('preventiva', 'true');
      if (formData.setorId) formDataToSend.append('setorId', Number(formData.setorId).toString());
      formDataToSend.append('dataAgendada', formData.dataAgendada ? formData.dataAgendada.toISOString() : '');
      formDataToSend.append('recorrencia', formData.recorrencia || 'NENHUMA');
      if (formData.intervaloDias) formDataToSend.append('intervaloDias', Number(formData.intervaloDias).toString());

      const response = await api.post('/os', formDataToSend, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast({
        title: "Sucesso",
        description: "OS preventiva cadastrada com sucesso!",
      });

      if (onSubmit) onSubmit(response.data);
      onClose();

      // Reset form
      setFormData({
        descricao: '',
        tipoEquipamentoId: '',
        equipamentoId: '',
        tecnicoId: '',
        setorId: '',
        preventiva: true,
        dataAgendada: undefined,
        recorrencia: '',
        intervaloDias: '',
        arquivos: [],
      });
      setFileNames([]);
      setGrupo('');
      setFilteredTecnicos(tecnicos);
      setEquipamentos([]);
    } catch (error) {
      console.error('Erro ao cadastrar OS preventiva:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar OS preventiva",
        variant: "destructive",
      });
    }
  };

  const getEquipamentoNome = (equipamento: Equipamento) => {
    return `${equipamento.numeroPatrimonio || 'Sem Nº de Patrimônio'} - ${equipamento.nomeEquipamento || 'Sem Nome'}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Cadastro de OS Preventiva</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              rows={4}
              required
              placeholder="Descreva a manutenção preventiva..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Equipamento */}
            <div className="space-y-2">
              <Label htmlFor="tipoEquipamentoId">Tipo de Equipamento *</Label>
              <Select value={formData.tipoEquipamentoId} onValueChange={(value) => handleChange('tipoEquipamentoId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {tiposEquipamento.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipamento */}
            <div className="space-y-2">
              <Label htmlFor="equipamentoId">Equipamento *</Label>
              <Select 
                value={formData.equipamentoId} 
                onValueChange={(value) => handleChange('equipamentoId', value)}
                disabled={loadingEquipamentos || equipamentos.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um equipamento" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {equipamentos.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id.toString()}>
                      {getEquipamentoNome(eq)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Técnico Responsável */}
            <div className="space-y-2">
              <Label htmlFor="tecnicoId">Técnico Responsável *</Label>
              <Select value={formData.tecnicoId} onValueChange={(value) => handleChange('tecnicoId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {filteredTecnicos.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grupo do Técnico */}
            <div className="space-y-2">
              <Label htmlFor="grupo">Grupo</Label>
              <Input
                id="grupo"
                value={filteredTecnicos.find((t) => t.id === parseInt(formData.tecnicoId))?.grupo?.nome || grupo}
                readOnly
                className="bg-muted"
              />
            </div>

            {/* Data Agendada */}
            <div className="space-y-2">
              <Label>Data Agendada *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dataAgendada && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dataAgendada ? format(formData.dataAgendada, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background border z-50" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.dataAgendada}
                    onSelect={(date) => handleChange('dataAgendada', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Recorrência */}
            <div className="space-y-2">
              <Label htmlFor="recorrencia">Recorrência (opcional)</Label>
              <Select value={formData.recorrencia} onValueChange={(value) => handleChange('recorrencia', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {recorrencias.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Intervalo Dias */}
            <div className="space-y-2">
              <Label htmlFor="intervaloDias">Intervalo Dias (opcional)</Label>
              <Input
                id="intervaloDias"
                type="number"
                value={formData.intervaloDias}
                onChange={(e) => handleChange('intervaloDias', e.target.value)}
                min={1}
                placeholder="Informe intervalo em dias"
              />
            </div>
          </div>

          {/* Upload de Arquivos */}
          <div className="space-y-2">
            <Label htmlFor="arquivos">
              <Paperclip className="w-4 h-4 inline mr-2" />
              Arquivos (Imagens)
            </Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
              <input
                type="file"
                id="arquivos"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="arquivos" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Paperclip className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Clique ou arraste arquivos aqui
                  </span>
                </div>
              </label>
            </div>
            
            {fileNames.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Arquivos selecionados:</p>
                <div className="space-y-1">
                  {fileNames.map((name, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm truncate">{name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(idx)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};