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
import api from '@/lib/api';

interface Tecnico {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  matricula: string;
  admissao: string;
  ativo: boolean;
  telegramChatId: string;
  grupoId: number;
  grupo: {
    id: number;
    nome: string;
    descricao: string;
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
        setTecnicos([]);
        setGrupos([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Função para preparar configuração
  const prepareConfig = () => {
    const tecnicosNomes = config.tecnicos
      .map(id => tecnicos.find(t => t.id === id)?.nome)
      .filter(Boolean)
      .join(', ');

    return {
      inicio: config.inicio,
      fim: config.fim,
      detalhes: config.detalhes,
      tecnicosNomes,
      tecnicos: config.tecnicos.join(',')
    };
  };

  // Filtrar técnicos
  const tecnicosFiltrados = tecnicos.filter(tecnico => {
    const matchesSearch = searchTecnico === '' || 
      tecnico.nome.toLowerCase().includes(searchTecnico.toLowerCase()) ||
      tecnico.email.toLowerCase().includes(searchTecnico.toLowerCase()) ||
      tecnico.matricula.toLowerCase().includes(searchTecnico.toLowerCase());
    
    const matchesGroup = filtroGrupo === 'all' || 
      tecnico.grupo.nome === filtroGrupo;
    
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

  const handleGenerate = () => {
    const finalConfig = prepareConfig();
    console.log('Configuração final enviada:', finalConfig);
    
    onConfigChange(finalConfig);
    onGenerate();
  };

  const isFormValid = config.inicio && config.fim;
  const canGenerate = isFormValid && !loading;

  // Calcular período em dias
  const getPeriodoDias = () => {
    if (!config.inicio || !config.fim) return 0;
    const inicio = new Date(config.inicio);
    const fim = new Date(config.fim);
    return Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const periodoDias = getPeriodoDias();

  const gruposUnicos = grupos.length > 0 ? grupos : [
    ...new Map(tecnicos.map(t => [t.grupo.id, t.grupo])).values()
  ];

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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="searchTecnico" className="text-xs text-muted-foreground">
                Buscar por nome, email ou matrícula
              </Label>
              <Input
                id="searchTecnico"
                placeholder="Nome, email ou matrícula..."
                value={searchTecnico}
                onChange={(e) => setSearchTecnico(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Filtrar por Grupo
              </Label>
              <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Todos os grupos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os grupos</SelectItem>
                  {gruposUnicos.map((grupo) => (
                    <SelectItem key={grupo.id} value={grupo.nome}>
                      {grupo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
                      onCheckedChange={() => handleTecnicoToggle(tecnico.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {tecnico.nome}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {tecnico.grupo.nome}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{tecnico.email}</span>
                        <span>•</span>
                        <span>Mat: {tecnico.matricula}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-4">
                {searchTecnico || filtroGrupo !== 'all' 
                  ? 'Nenhum técnico encontrado com os filtros aplicados' 
                  : 'Nenhum técnico ativo encontrado'
                }
              </div>
            )}
          </div>

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
            <Label htmlFor="detalhes" className="text-sm cursor-pointer">
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

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            variant="default"
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            {loading ? 'Gerando Relatório...' : 'Gerar Relatório'}
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-50 p-3 rounded text-xs">
            <strong>Debug:</strong><br />
            Técnicos selecionados: {config.tecnicos.join(', ') || 'nenhum'}<br />
            Config atual: {JSON.stringify(prepareConfig(), null, 2)}
          </div>
        )}

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
              👥 Nenhum técnico selecionado. O relatório incluirá todos os técnicos ativos do período.
            </p>
          </div>
        )}

        {periodoDias > 365 && isFormValid && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              ⚠️ Período muito extenso ({periodoDias} dias). Considere reduzir o período para melhor performance.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ReportConfigPerformanceTecnicos;