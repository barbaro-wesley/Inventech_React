import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface OSFormProps {
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
  marca?: string;
  modelo?: string;
  nPatrimonio?: string;
  nomePC?: string;
  ip?: string;
  numeroSerie?: string;
  nome?: string;
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

  const [tiposEquipamento, setTiposEquipamento] = useState<TipoEquipamento[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [filteredTecnicos, setFilteredTecnicos] = useState<Tecnico[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [grupo, setGrupo] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'ABERTA', label: 'Aberta' },
    { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { value: 'CONCLUIDA', label: 'ConcluÃ­da' },
  ];

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
          description: "Erro ao carregar opÃ§Ãµes do formulÃ¡rio",
          variant: "destructive",
        });
      }
    }
    fetchOptions();
  }, [toast]);

  // Novo useEffect para sincronizar equipamento selecionado quando equipamentos mudam
  useEffect(() => {
    if (formData.equipamentoId && equipamentos.length > 0) {
      const equipamentoExists = equipamentos.find(e => e.id.toString() === formData.equipamentoId);
     
    }
  }, [equipamentos, formData.equipamentoId]);

  // Separar o useEffect para pré-preenchimento
  useEffect(() => {
    if (isOpen && initialData && dataLoaded) {
      // Extrair equipamento de diferentes estruturas possíveis
      const eq = initialData.equipamento || initialData;
      
      // Verificar se temos um equipamento válido
      if (!eq || !eq.id) {
        console.log('Nenhum equipamento válido encontrado:', { initialData });
        return;
      }

      const tipoId = String(eq.tipoEquipamentoId || '4');


      // Pre-fill form data ANTES de definir equipamentos
      const newFormData = {
        ...formData,
        arquivos: [],
        descricao: '',
        tipoEquipamentoId: tipoId,
        tecnicoId: '',
        status: 'ABERTA',
        preventiva: !!initialData.preventiva,
        setorId: eq.setor?.id ? String(eq.setor.id) : '',
        equipamentoId: String(eq.id),
      };
      
      setFormData(newFormData);

      // DEPOIS definir equipamentos
      setEquipamentos([eq]);
      
      console.log('Estados definidos:', { 
        equipamentoId: String(eq.id), 
        formData: newFormData,
        equipamento: eq 
      });

      // Background fetch para equipamentos adicionais
      const fetchAdditionalEquipamentos = async () => {
        try {
          setLoadingEquipamentos(true);
          const res = await api.get('/equipamentos-medicos', {
            withCredentials: true,
            params: { tipoEquipamentoId: tipoId },
          });
          const filteredEquipamentos = res.data.filter((e: Equipamento) => String(e.tipoEquipamentoId) === tipoId);
          
          // Garantir que o equipamento inicial esteja incluído
          const equipamentoInicial = eq;
          const todosEquipamentos = [equipamentoInicial, ...filteredEquipamentos.filter((e: Equipamento) => e.id !== equipamentoInicial.id)];
          
          setEquipamentos(todosEquipamentos);
        } catch (error) {
          console.error('Erro ao buscar equipamentos:', error);
          // Manter pelo menos o equipamento inicial em caso de erro
          setEquipamentos([eq]);
          toast({
            title: "Erro",
            description: "Erro ao carregar equipamentos",
            variant: "destructive",
          });
        } finally {
          setLoadingEquipamentos(false);
        }
      };

      fetchAdditionalEquipamentos();

      // Definir grupo e filtrar técnicos
      const selectedTipo = tiposEquipamento.find(t => t.id === parseInt(tipoId));
      if (selectedTipo) {
        setGrupo(selectedTipo.grupo?.nome || '');
        if (selectedTipo.grupo?.id) {
          const filtered = tecnicos.filter(t => t.grupo?.id === selectedTipo.grupo.id);
          setFilteredTecnicos(filtered);
        } else {
          setFilteredTecnicos(tecnicos);
        }
      }
    }
  }, [isOpen, initialData, dataLoaded, tiposEquipamento, tecnicos, toast]);

  // Reset form quando fechar
  useEffect(() => {
    if (!isOpen) {
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
    }
  }, [isOpen, tecnicos]);

  const handleChange = async (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));

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
    try {
      const formDataToSend = new FormData();
      formData.arquivos.forEach((file) => formDataToSend.append('arquivos', file));
      formDataToSend.append('descricao', formData.descricao);
      formDataToSend.append('tipoEquipamentoId', Number(formData.tipoEquipamentoId).toString());
      formDataToSend.append('equipamentoId', Number(formData.equipamentoId).toString());
      formDataToSend.append('tecnicoId', Number(formData.tecnicoId).toString());
      formDataToSend.append('status', formData.status);
      formDataToSend.append('preventiva', formData.preventiva ? 'true' : 'false');
      if (formData.setorId) formDataToSend.append('setorId', Number(formData.setorId).toString());

      const response = await api.post('/os', formDataToSend, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast({
        title: "Sucesso",
        description: "Ordem de ServiÃ§o cadastrada com sucesso!",
      });

      if (onSubmit) {
        onSubmit(response.data);
      }

      onClose();
    } catch (error) {
      console.error('Erro ao cadastrar OS:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar Ordem de ServiÃ§o",
        variant: "destructive",
      });
    }
  };

  const getEquipamentoNome = (equipamento: Equipamento) => {
    return `${equipamento.numeroPatrimonio || 'Sem NÂº de PatrimÃ´nio'} - ${equipamento.nomeEquipamento || equipamento.marca || 'Sem Nome'}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto" aria-describedby="os-form-description">
        <SheetHeader className="mb-6">
          <SheetTitle>Cadastro de Ordem de ServiÃ§o Corretiva</SheetTitle>
          <div id="os-form-description" className="sr-only">
            FormulÃ¡rio para registrar uma ordem de serviÃ§o corretiva, incluindo detalhes do equipamento e descriÃ§Ã£o do problema.
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoEquipamento">Tipo de Equipamento *</Label>
              <Select
                value={formData.tipoEquipamentoId}
                onValueChange={(value) => handleChange('tipoEquipamentoId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione">
                    {formData.tipoEquipamentoId && tiposEquipamento.length > 0
                      ? tiposEquipamento.find(t => t.id.toString() === formData.tipoEquipamentoId)?.nome
                      : "Selecione"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {tiposEquipamento.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipamento">Equipamento *</Label>
              {formData.tipoEquipamentoId && equipamentos.length > 0 ? (
                <Select
                  key={`equipamento-${formData.equipamentoId}-${equipamentos.length}`} // Force re-render
                  value={formData.equipamentoId}
                  onValueChange={(value) => handleChange('equipamentoId', value)}
                  disabled={loadingEquipamentos}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {equipamentos.map((e) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {getEquipamentoNome(e)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingEquipamentos ? 'Carregando...' : 'Selecione o tipo primeiro'} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tecnico">TÃ©cnico ResponsÃ¡vel *</Label>
              <Select
                value={formData.tecnicoId}
                onValueChange={(value) => handleChange('tecnicoId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {filteredTecnicos.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.nome}
                    </SelectItem>
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
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
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
              <Input
                id="grupoEquipamento"
                value={grupo}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">DescriÃ§Ã£o *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              rows={4}
              required
              placeholder="Descreva o problema ou manutenÃ§Ã£o necessÃ¡ria..."
            />
          </div>

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