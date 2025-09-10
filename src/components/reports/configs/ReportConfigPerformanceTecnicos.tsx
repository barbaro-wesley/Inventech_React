import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Eye, 
  Clock,
  Target,
  TrendingUp,
  CheckCircle 
} from 'lucide-react';

// Mock API for demonstration
const api = {
  get: async (endpoint) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (endpoint === '/tecnicos') {
      return {
        data: [
          { id: 1, nome: 'João Silva', email: 'joao@empresa.com', ativo: true, grupo: { nome: 'Mecânica' } },
          { id: 2, nome: 'Maria Santos', email: 'maria@empresa.com', ativo: true, grupo: { nome: 'Elétrica' } },
          { id: 3, nome: 'Pedro Costa', email: 'pedro@empresa.com', ativo: true, grupo: { nome: 'Hidráulica' } },
          { id: 4, nome: 'Ana Oliveira', email: 'ana@empresa.com', ativo: true, grupo: { nome: 'Mecânica' } },
          { id: 5, nome: 'Carlos Ferreira', email: 'carlos@empresa.com', ativo: false, grupo: { nome: 'Elétrica' } },
        ]
      };
    }
    
    if (endpoint === '/grupos-manutencao') {
      return {
        data: [
          { id: 1, nome: 'Mecânica', descricao: 'Manutenção mecânica geral' },
          { id: 2, nome: 'Elétrica', descricao: 'Manutenção elétrica e eletrônica' },
          { id: 3, nome: 'Hidráulica', descricao: 'Sistemas hidráulicos e pneumáticos' },
        ]
      };
    }
    
    return { data: [] };
  }
};

interface Tecnico {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  grupo?: {
    nome: string;
  };
}

interface Grupo {
  id: number;
  nome: string;
  descricao?: string;
}

interface ReportConfigPerformanceTecnicosProps {
  onConfigChange: (config: any) => void;
  onGenerate: () => void;
  loading?: boolean;
}

export function ReportConfigPerformanceTecnicos({
  onConfigChange,
  onGenerate,
  loading = false
}: ReportConfigPerformanceTecnicosProps) {
  const [config, setConfig] = useState({
    inicio: '',
    fim: '',
    tecnicos: [] as number[],
    detalhes: false,
    tecnicosNomes: '',
  });

  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [filtroGrupo, setFiltroGrupo] = useState<string>('all');
  const [searchTecnico, setSearchTecnico] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [tecnicosResponse, gruposResponse] = await Promise.all([
          api.get('/tecnicos'),
          api.get('/grupos-manutencao'),
        ]);

        setTecnicos(tecnicosResponse.data || []);
        setGrupos(gruposResponse.data || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Notificar mudanças na configuração
  useEffect(() => {
    const tecnicosNomes = config.tecnicos
      .map(id => tecnicos.find(t => t.id === id)?.nome)
      .filter(Boolean)
      .join(', ');

    const updatedConfig = {
      ...config,
      tecnicosNomes,
      tecnicos: config.tecnicos.length > 0 ? config.tecnicos.join(',') : undefined,
    };

    onConfigChange(updatedConfig);
  }, [config, tecnicos, onConfigChange]);

  // Filtrar técnicos
  const tecnicosFiltrados = tecnicos.filter(tecnico => {
    const matchesSearch = searchTecnico === '' || 
      tecnico.nome.toLowerCase().includes(searchTecnico.toLowerCase()) ||
      tecnico.email.toLowerCase().includes(searchTecnico.toLowerCase());
    
    const matchesGroup = filtroGrupo === 'all' || 
      tecnico.grupo?.nome === filtroGrupo;
    
    return matchesSearch && matchesGroup && tecnico.ativo;
  });

  const handleTecnicoToggle = (tecnicoId: number) => {
    setConfig(prev => ({
      ...prev,
      tecnicos: prev.tecnicos.includes(tecnicoId)
        ? prev.tecnicos.filter(id => id !== tecnicoId)
        : [...prev.tecnicos, tecnicoId]
    }));
  };

  const selectAllTecnicos = () => {
    setConfig(prev => ({
      ...prev,
      tecnicos: tecnicosFiltrados.map(t => t.id)
    }));
  };

  const clearAllTecnicos = () => {
    setConfig(prev => ({
      ...prev,
      tecnicos: []
    }));
  };

  const isFormValid = config.inicio && config.fim;
  const canGenerate = isFormValid && !loading;

  // Calcular período em dias
  const getPeriodoDias = () => {
    if (!config.inicio || !config.fim) return 0;
    const inicio = new Date(config.inicio);
    const fim = new Date(config.fim);
    return Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  };

  const periodoDias = getPeriodoDias();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance dos Técnicos
        </CardTitle>
        <CardDescription>
          Análise detalhada da performance dos técnicos com métricas de produtividade
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Período */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Período de Análise
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="inicio" className="text-xs text-muted-foreground">
                Data Início
              </Label>
              <Input
                id="inicio"
                type="date"
                value={config.inicio}
                onChange={(e) => setConfig(prev => ({ ...prev, inicio: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="fim" className="text-xs text-muted-foreground">
                Data Fim
              </Label>
              <Input
                id="fim"
                type="date"
                value={config.fim}
                onChange={(e) => setConfig(prev => ({ ...prev, fim: e.target.value }))}
                className="text-sm"
              />
            </div>
          </div>
          {periodoDias > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{periodoDias} dias de análise</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Filtros de Técnicos */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Seleção de Técnicos
          </Label>

          {/* Filtros */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="searchTecnico" className="text-xs text-muted-foreground">
                Buscar Técnico
              </Label>
              <Input
                id="searchTecnico"
                placeholder="Nome ou email..."
                value={searchTecnico}
                onChange={(e) => setSearchTecnico(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="filtroGrupo" className="text-xs text-muted-foreground">
                Filtrar por Grupo
              </Label>
              <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Todos os grupos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os grupos</SelectItem>
                  {grupos.map((grupo) => (
                    <SelectItem key={grupo.id} value={grupo.nome}>
                      {grupo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ações de seleção */}
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={selectAllTecnicos}
              disabled={loadingData || tecnicosFiltrados.length === 0}
            >
              Selecionar Todos
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={clearAllTecnicos}
              disabled={config.tecnicos.length === 0}
            >
              Limpar Seleção
            </Button>
          </div>

          {/* Lista de técnicos */}
          <div className="border rounded-lg p-3 max-h-64 overflow-y-auto">
            {loadingData ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                Carregando técnicos...
              </div>
            ) : tecnicosFiltrados.length > 0 ? (
              <div className="space-y-2">
                {tecnicosFiltrados.map((tecnico) => (
                  <div 
                    key={tecnico.id}
                    className="flex items-center space-x-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleTecnicoToggle(tecnico.id)}
                  >
                    <Checkbox
                      checked={config.tecnicos.includes(tecnico.id)}
                      onChange={() => handleTecnicoToggle(tecnico.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {tecnico.nome}
                        </span>
                        {tecnico.grupo && (
                          <Badge variant="secondary" className="text-xs">
                            {tecnico.grupo.nome}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {tecnico.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-4">
                Nenhum técnico encontrado
              </div>
            )}
          </div>

          {/* Contador de selecionados */}
          {config.tecnicos.length > 0 && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {config.tecnicos.length === 1 
                ? '1 técnico selecionado' 
                : `${config.tecnicos.length} técnicos selecionados`}
            </div>
          )}
        </div>

        <Separator />

        {/* Opções do Relatório */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Opções do Relatório
          </Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="detalhes"
              checked={config.detalhes}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, detalhes: checked as boolean }))
              }
            />
            <Label htmlFor="detalhes" className="text-sm">
              Incluir histórico detalhado das ordens
            </Label>
          </div>
          
          <p className="text-xs text-muted-foreground pl-6">
            {config.detalhes 
              ? 'O relatório incluirá lista completa de ordens por técnico (pode aumentar o tempo de geração)'
              : 'Relatório com estatísticas resumidas e análise por tipo de equipamento'
            }
          </p>
        </div>

        <Separator />

        {/* Métricas que serão analisadas */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Métricas Incluídas
          </Label>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Taxa de Sucesso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Tempo Médio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>Valor das Manutenções</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>Análise por Tipo</span>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={canGenerate}
            disabled={!canGenerate}
            variant="outline"
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            {loading ? 'Carregando...' : 'Gerar Relatório'}
          </Button>
        </div>

        {/* Alertas */}
        {!isFormValid && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              📅 Selecione o período de análise para continuar
            </p>
          </div>
        )}

        {config.tecnicos.length === 0 && isFormValid && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              👥 Nenhum técnico selecionado. O relatório incluirá todos os técnicos ativos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ReportConfigPerformanceTecnicos;