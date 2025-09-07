import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Calendar, CalendarIcon, Paperclip, X, AlertTriangle, Info, Repeat } from "lucide-react";
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
  { value: 'NENHUMA', label: 'Sem recorrência', description: 'OS única, não será repetida' },
  { value: 'DIARIA', label: 'Diariamente', description: 'Repetir todos os dias' },
  { value: 'SEMANAL', label: 'Semanalmente', description: 'Repetir toda semana' },
  { value: 'QUINZENAL', label: 'A cada 15 dias', description: 'Repetir quinzenalmente' },
  { value: 'MENSAL', label: 'Mensalmente', description: 'Repetir todo mês' },
  { value: 'ANUAL', label: 'Anual', description: 'Repetir anualmente' },
  { value: 'PERSONALIZADA', label: 'Personalizada', description: 'Definir intervalo customizado' },
];

const prioridades = [
  { 
    value: 'BAIXO', 
    label: 'Baixa', 
    emoji: '🟢', 
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Não urgente' 
  },
  { 
    value: 'MEDIO', 
    label: 'Média', 
    emoji: '🟡', 
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    description: 'Normal' 
  },
  { 
    value: 'ALTO', 
    label: 'Alta', 
    emoji: '🟠', 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'Importante' 
  },
  { 
    value: 'URGENTE', 
    label: 'Urgente', 
    emoji: '🔴', 
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Imediato' 
  },
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
    prioridade: 'MEDIO',
    preventiva: true,
    dataAgendada: undefined as Date | undefined,
    recorrencia: 'NENHUMA',
    intervaloDias: '',
    quantidadeOcorrencias: '12',
    arquivos: [] as File[],
  });

  const [tiposEquipamento, setTiposEquipamento] = useState<TipoEquipamento[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [filteredTecnicos, setFilteredTecnicos] = useState<Tecnico[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [grupo, setGrupo] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        setDataLoaded(true);
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
    if (initialData && initialData.equipamento && dataLoaded) {
      const eq = initialData.equipamento;
      setFormData(prev => ({
        ...prev,
        tipoEquipamentoId: String(eq.tipoEquipamentoId || ''),
        equipamentoId: String(eq.id || ''),
        setorId: eq.setor?.id || '',
        prioridade: initialData.prioridade || 'MEDIO',
        preventiva: !!initialData.preventiva,
        recorrencia: initialData.recorrencia || 'NENHUMA',
        intervaloDias: initialData.intervaloDias ? String(initialData.intervaloDias) : '',
        quantidadeOcorrencias: '12',
      }));

      setEquipamentos([eq]);

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

      const selectedTipo = tiposEquipamento.find(t => t.id === parseInt(tipoId));
      setGrupo(selectedTipo?.grupo?.nome || '');
      if (selectedTipo?.grupo?.id) {
        const filtered = tecnicos.filter(t => t.grupo?.id === selectedTipo.grupo.id);
        setFilteredTecnicos(filtered);
      } else {
        setFilteredTecnicos(tecnicos);
      }
    }
  }, [initialData, dataLoaded, toast, tiposEquipamento, tecnicos]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        descricao: '',
        tipoEquipamentoId: '',
        equipamentoId: '',
        tecnicoId: '',
        setorId: '',
        prioridade: 'MEDIO',
        preventiva: true,
        dataAgendada: undefined,
        recorrencia: 'NENHUMA',
        intervaloDias: '',
        quantidadeOcorrencias: '12',
        arquivos: [],
      });
      setFileNames([]);
      setGrupo('');
      setFilteredTecnicos(tecnicos);
      setEquipamentos([]);
    }
  }, [isOpen, tecnicos]);

  const handleChange = async (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'recorrencia' && value !== 'PERSONALIZADA') {
      setFormData(prev => ({ ...prev, intervaloDias: '' }));
    }

    if (name === 'tipoEquipamentoId') {
      const tipoId = String(value);
      const tipo = tiposEquipamento.find((t) => t.id === parseInt(tipoId));
      setGrupo(tipo?.grupo?.nome || '');

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
    
    if (formData.recorrencia === 'PERSONALIZADA' && (!formData.intervaloDias || parseInt(formData.intervaloDias) < 1)) {
      toast({
        title: "Erro de validação",
        description: "Para recorrência personalizada, é obrigatório informar o intervalo de dias (mínimo 1)",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formData.arquivos.forEach((file) => formDataToSend.append('arquivos', file));
      formDataToSend.append('descricao', formData.descricao);
      formDataToSend.append('tipoEquipamentoId', Number(formData.tipoEquipamentoId).toString());
      formDataToSend.append('equipamentoId', Number(formData.equipamentoId).toString());
      formDataToSend.append('tecnicoId', Number(formData.tecnicoId).toString());
      formDataToSend.append('status', 'ABERTA');
      formDataToSend.append('prioridade', formData.prioridade);
      formDataToSend.append('preventiva', 'true');
      if (formData.setorId) formDataToSend.append('setorId', Number(formData.setorId).toString());
      formDataToSend.append('dataAgendada', formData.dataAgendada ? formData.dataAgendada.toISOString() : '');
      
      // Converter 'NENHUMA' para string vazia para o servidor
      const recorrenciaValue = formData.recorrencia === 'NENHUMA' ? '' : formData.recorrencia;
      formDataToSend.append('recorrencia', recorrenciaValue);
      
      if (formData.intervaloDias) formDataToSend.append('intervaloDias', Number(formData.intervaloDias).toString());
      if (formData.quantidadeOcorrencias) formDataToSend.append('quantidadeOcorrencias', Number(formData.quantidadeOcorrencias).toString());

      const response = await api.post('/os', formDataToSend, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast({
        title: "Sucesso",
        description: formData.recorrencia === 'NENHUMA' 
          ? "OS preventiva cadastrada com sucesso!" 
          : `OS preventiva criada com recorrência ${formData.recorrencia.toLowerCase()}. Múltiplas OSs foram geradas automaticamente!`,
      });

      if (onSubmit) onSubmit(response.data);
      onClose();
    } catch (error: any) {
      console.error('Erro ao cadastrar OS preventiva:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao cadastrar OS preventiva",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEquipamentoNome = (equipamento: Equipamento) => {
    return `${equipamento.numeroPatrimonio || 'Sem Nº de Patrimônio'} - ${equipamento.nomeEquipamento || 'Sem Nome'}`;
  };

  const getPrioridadeInfo = (value: string) => {
    return prioridades.find(p => p.value === value) || prioridades[1];
  };

  const getRecorrenciaInfo = (value: string) => {
    return recorrencias.find(r => r.value === value) || recorrencias[0];
  };

  const selectedPrioridade = getPrioridadeInfo(formData.prioridade);
  const selectedRecorrencia = getRecorrenciaInfo(formData.recorrencia);

  const calcularEstimativaOSs = () => {
    if (formData.recorrencia === 'NENHUMA') return 1;
    const quantidade = parseInt(formData.quantidadeOcorrencias) || 12;
    return Math.min(quantidade, 50);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Cadastro de OS Preventiva</SheetTitle>
        </SheetHeader>

        {isSubmitting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-8 rounded-lg shadow-lg text-center max-w-sm mx-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Processando...</h3>
              <p className="text-muted-foreground">Criando OS preventiva e enviando notificações por email. Aguarde um momento.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="space-y-3">
            <Label htmlFor="prioridade" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Prioridade *
            </Label>
            
            <div className={cn(
              "p-3 rounded-lg border-2 transition-all",
              selectedPrioridade.bgColor
            )}>
              <div className={cn("flex items-center gap-3", selectedPrioridade.color)}>
                <span className="text-xl">{selectedPrioridade.emoji}</span>
                <div>
                  <div className="font-medium">{selectedPrioridade.label}</div>
                  <div className="text-sm opacity-75">{selectedPrioridade.description}</div>
                </div>
              </div>
            </div>

            <Select value={formData.prioridade} onValueChange={(value) => handleChange('prioridade', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                {prioridades.map((p) => (
                  <SelectItem key={p.value} value={p.value} className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{p.emoji}</span>
                      <div>
                        <div className="font-medium">{p.label}</div>
                        <div className="text-xs text-muted-foreground">{p.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="grupo">Grupo</Label>
              <Input
                id="grupo"
                value={filteredTecnicos.find((t) => t.id === parseInt(formData.tecnicoId))?.grupo?.nome || grupo}
                readOnly
                className="bg-muted"
              />
            </div>

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
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Repeat className="w-5 h-5 text-blue-600" />
                Configuração de Recorrência
              </CardTitle>
              <CardDescription>
                Configure se esta manutenção deve ser repetida automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg border bg-background">
                <div className="flex items-center gap-3">
                  <Repeat className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">{selectedRecorrencia.label}</div>
                    <div className="text-sm text-muted-foreground">{selectedRecorrencia.description}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recorrencia">Tipo de Recorrência</Label>
                  <Select value={formData.recorrencia} onValueChange={(value) => handleChange('recorrencia', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a recorrência" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      {recorrencias.map((r) => (
                        <SelectItem key={r.value} value={r.value} className="py-3">
                          <div>
                            <div className="font-medium">{r.label}</div>
                            <div className="text-xs text-muted-foreground">{r.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.recorrencia && formData.recorrencia !== 'NENHUMA' && (
                  <div className="space-y-2">
                    <Label htmlFor="quantidadeOcorrencias">Quantidade de OSs</Label>
                    <Input
                      id="quantidadeOcorrencias"
                      type="number"
                      value={formData.quantidadeOcorrencias}
                      onChange={(e) => handleChange('quantidadeOcorrencias', e.target.value)}
                      min={1}
                      max={50}
                      placeholder="12"
                    />
                  </div>
                )}
              </div>

              {formData.recorrencia === 'PERSONALIZADA' && (
                <div className="space-y-2">
                  <Label htmlFor="intervaloDias">Intervalo em Dias *</Label>
                  <Input
                    id="intervaloDias"
                    type="number"
                    value={formData.intervaloDias}
                    onChange={(e) => handleChange('intervaloDias', e.target.value)}
                    min={1}
                    required
                    placeholder="Exemplo: 30 (para repetir a cada 30 dias)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Informe o número de dias entre cada manutenção
                  </p>
                </div>
              )}

              {formData.recorrencia && formData.recorrencia !== 'NENHUMA' && (
                <div className="flex items-start gap-2 p-3 bg-blue-100 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <div className="font-medium">Resumo:</div>
                    <div>
                      Serão criadas <strong>{calcularEstimativaOSs()}</strong> ordens de serviço automaticamente, 
                      começando na data agendada e seguindo a recorrência {selectedRecorrencia.label.toLowerCase()}.
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Cancelar
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};