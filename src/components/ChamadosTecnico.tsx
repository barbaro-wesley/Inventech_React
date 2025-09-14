import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircle, ChevronDown, ChevronUp, Upload, X, FileText, Download, 
  Calendar, User, MapPin, Wrench, Clock, Settings, AlertTriangle,
  Search, Filter, RefreshCw, TrendingUp, XCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/api';

interface OS {
  id: number;
  descricao: string;
  status: string;
  criadoEm: string;
  finalizadoEm?: string | null;
  prioridade: string;
  iniciadaEm?: string | null;
  preventiva: boolean;
  dataAgendada?: string | null;
  arquivos?: string[]; 
  tipoEquipamento?: {
    nome: string;
  } | null;
  tecnico: {
    id: number;
    nome: string;
  };
  solicitante?: {
    nome: string;
  } | null;
  Setor?: {
    nome: string;
  } | null;
  equipamento?: {
    nomeEquipamento: string | null;
    numeroSerie: string | null;
    marca?: string | null;
    modelo?: string | null;
  } | null;
}

interface Estatisticas {
  total: number;
  abertas: number;
  emAndamento: number;
  concluidas: number;
  canceladas: number;
  preventivas: number;
  corretivas: number;
  valorTotal: number;
}

const ChamadosTecnico = () => {
  const [ordens, setOrdens] = useState<OS[]>([]);
  const [filteredOrdens, setFilteredOrdens] = useState<OS[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    total: 0,
    abertas: 0,
    emAndamento: 0,
    concluidas: 0,
    canceladas: 0,
    preventivas: 0,
    corretivas: 0,
    valorTotal: 0
  });

  const [aberto, setAberto] = useState<number | null>(null);
  const [resolucao, setResolucao] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [valorManutencao, setValorManutencao] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODAS');
  const [filterTipo, setFilterTipo] = useState('TODAS');
  const [filterPrioridade, setFilterPrioridade] = useState('TODAS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { toast } = useToast();

  const statusOptions = [
    { value: 'TODAS', label: 'Todos os Status' },
    { value: 'ABERTA', label: 'Abertas' },
    { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { value: 'CONCLUIDA', label: 'Concluídas' },
    { value: 'CANCELADA', label: 'Canceladas' },
  ];

  const tipoOptions = [
    { value: 'TODAS', label: 'Todos os Tipos' },
    { value: 'true', label: 'Preventivas' },
    { value: 'false', label: 'Corretivas' },
  ];

  const prioridadeOptions = [
    { value: 'TODAS', label: 'Todas as Prioridades' },
    { value: 'BAIXO', label: 'Baixa' },
    { value: 'MEDIO', label: 'Média' },
    { value: 'ALTO', label: 'Alta' },
    { value: 'URGENTE', label: 'Urgente' },
  ];

  // Função para buscar dados com filtros
  const fetchChamados = async () => {
    try {
      setLoading(true);
      setError(null);

      // Constrói os parâmetros da query
      const params = new URLSearchParams();
      
      if (filterStatus !== 'TODAS') params.append('status', filterStatus);
      if (filterTipo !== 'TODAS') params.append('preventiva', filterTipo);
      if (filterPrioridade !== 'TODAS') params.append('prioridade', filterPrioridade);
      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);

      const queryString = params.toString();
      const url = queryString ? `/os/tecnico?${queryString}` : '/os/tecnico';

      const { data } = await api.get(url, { withCredentials: true });
      
      setOrdens(data || []);
      calcularEstatisticas(data || []);

    } catch (error: any) {
      console.error('Erro ao buscar chamados:', error);
      setError(error.response?.data?.message || 'Erro ao carregar ordens de serviço');
      toast({
        title: "Erro",
        description: "Erro ao carregar chamados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas dos dados carregados
  const calcularEstatisticas = (data: OS[]) => {
    const stats = {
      total: data.length,
      abertas: data.filter(os => os.status === 'ABERTA').length,
      emAndamento: data.filter(os => os.status === 'EM_ANDAMENTO').length,
      concluidas: data.filter(os => os.status === 'CONCLUIDA').length,
      canceladas: data.filter(os => os.status === 'CANCELADA').length,
      preventivas: data.filter(os => os.preventiva).length,
      corretivas: data.filter(os => !os.preventiva).length,
      valorTotal: 0 // Será implementado se necessário
    };
    setEstatisticas(stats);
  };

  // Carrega dados quando filtros mudam
  useEffect(() => {
    fetchChamados();
  }, [filterStatus, filterTipo, filterPrioridade, dataInicio, dataFim]);

  // Filtra ordens localmente por termo de busca
  useEffect(() => {
    const filtered = ordens.filter((ordem) => {
      const matchesSearch = ordem.descricao
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        ordem.equipamento?.nomeEquipamento
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        ordem.solicitante?.nome
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    setFilteredOrdens(filtered);
    setCurrentPage(1);
  }, [searchTerm, ordens]);

  const handleRefresh = () => {
    fetchChamados();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('TODAS');
    setFilterTipo('TODAS');
    setFilterPrioridade('TODAS');
    setDataInicio('');
    setDataFim('');
  };

  // Abrir/Fechar Collapsible
  const handleAbrir = (id: number) => {
    setAberto(aberto === id ? null : id);
    setResolucao('');
    setArquivos([]);
    setFileNames([]);
    setValorManutencao('');
  };

  // Upload de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setArquivos(filesArray);
      setFileNames(filesArray.map(file => file.name));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = arquivos.filter((_, i) => i !== index);
    const newFileNames = fileNames.filter((_, i) => i !== index);
    setArquivos(newFiles);
    setFileNames(newFileNames);
  };

  // Função para extrair nome do arquivo do caminho
  const getFileNameFromPath = (filePath: string) => {
    return filePath.split(/[\\/]/).pop() || filePath;
  };

  // Função para fazer download do arquivo
  const handleDownloadFile = (filePath: string) => {
    try {
      const filename = getFileNameFromPath(filePath);
      const isPdf = filename.toLowerCase().endsWith('.pdf');
      
      const fileUrl = isPdf 
        ? `${import.meta.env.VITE_API_URL2}/uploads/pdfs/${filename.replace(/^uploads[\/\\]pdfs[\/\\]/i, '')}`
        : `${import.meta.env.VITE_API_URL2}/uploads/${filename.replace(/^uploads[\/\\]pdfs[\/\\]/i, '')}`;
      
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao fazer download do arquivo:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer download do arquivo",
        variant: "destructive",
      });
    }
  };

  // Mudar status sem resolver (EM_ANDAMENTO ou CANCELADA)
  const handleMudarStatus = async (osId: number, status: string) => {
    try {
      const statusMap: Record<string, string> = {
        "EM_ANDAMENTO": "iniciar",
        "CONCLUIDA": "concluir",
        "CANCELADA": "cancelar",
      };

      const endpoint = statusMap[status];
      if (!endpoint) {
        toast({
          title: "Erro",
          description: "Status inválido.",
          variant: "destructive",
        });
        return;
      }

      await api.put(`/os/${osId}/${endpoint}`);
      toast({
        title: "Sucesso",
        description: `OS alterada para ${status.replace('_', ' ')} com sucesso!`,
      });

      // Recarrega os dados
      fetchChamados();

    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status da OS. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Concluir OS com resolução, valor e arquivos
  const handleFinalizar = async (os: OS) => {
    if (!resolucao.trim()) {
      toast({
        title: "Aviso",
        description: "Descreva a resolução.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('resolucao', resolucao);
    formData.append('tecnicoId', String(os.tecnico.id));
    formData.append('finalizadoEm', new Date().toISOString());
    formData.append('valorManutencao', valorManutencao);
    arquivos.forEach((file) => formData.append('arquivos', file));

    try {
      await api.put(`/os/${os.id}/concluir`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      toast({
        title: "Sucesso",
        description: "Chamado finalizado com sucesso!",
      });

      setAberto(null);
      setResolucao('');
      setArquivos([]);
      setFileNames([]);
      setValorManutencao('');

      // Recarrega os dados
      fetchChamados();
    } catch (error) {
      console.error('Erro ao finalizar chamado:', error);
      toast({
        title: "Erro",
        description: "Erro ao finalizar chamado.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABERTA': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'EM_ANDAMENTO': return 'bg-blue-500 hover:bg-blue-600';
      case 'CONCLUIDA': return 'bg-green-500 hover:bg-green-600';
      case 'CANCELADA': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENTE': return 'bg-red-600 hover:bg-red-700';
      case 'ALTO': return 'bg-orange-500 hover:bg-orange-600';
      case 'MEDIO': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'BAIXO': return 'bg-green-600 hover:bg-green-700';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      // Se já estiver formatado (dd/mm/yyyy hh:mm), retorna como está
      if (dateString.includes('/')) return dateString;
      
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  function formatDateOnly(dateString: string) {
    if (!dateString) return "";
    const [dia, mes, ano] = dateString.split("/");
    return `${dia}/${mes}/${ano}`;
  }

  // Paginação
  const totalPages = Math.ceil(filteredOrdens.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrdens.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Minhas Ordens de Serviço</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Minhas Ordens de Serviço</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Erro ao carregar dados
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Minhas Ordens de Serviço</h1>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{estatisticas.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{estatisticas.abertas}</p>
                <p className="text-xs text-muted-foreground">Abertas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{estatisticas.emAndamento}</p>
                <p className="text-xs text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{estatisticas.concluidas}</p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{estatisticas.canceladas}</p>
                <p className="text-xs text-muted-foreground">Canceladas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{estatisticas.preventivas}</p>
                <p className="text-xs text-muted-foreground">Preventivas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{estatisticas.corretivas}</p>
                <p className="text-xs text-muted-foreground">Corretivas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Descrição, equipamento, solicitante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  {tipoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  {prioridadeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de OS */}
      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço</CardTitle>
          <CardDescription>
            {filteredOrdens.length} ordem(ns) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterStatus !== 'TODAS' || filterTipo !== 'TODAS' || filterPrioridade !== 'TODAS' || dataInicio || dataFim
                ? 'Nenhuma ordem de serviço encontrada com os filtros aplicados.'
                : 'Nenhuma ordem de serviço encontrada.'
              }
            </div>
          ) : (
            <div className="space-y-4">
              {currentItems.map((os) => (
                <Card key={os.id} className={`overflow-hidden border-l-4 ${
                  os.preventiva ? 'border-l-blue-500' : 'border-l-orange-500'
                }`}>
                  <Collapsible open={aberto === os.id} onOpenChange={() => handleAbrir(os.id)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            {/* Cabeçalho com badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-lg font-semibold">OS #{os.id}</CardTitle>
                              <Badge className={`text-white ${getStatusColor(os.status)}`}>
                                {os.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={`text-white ${getPriorityColor(os.prioridade)}`}>
                                {os.prioridade}
                              </Badge>
                              {os.preventiva ? (
                                <Badge className="bg-blue-100 text-blue-800">
                                  <Settings className="w-3 h-3 mr-1" />
                                  Preventiva
                                </Badge>
                              ) : (
                                <Badge className="bg-orange-100 text-orange-800">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Corretiva
                                </Badge>
                              )}
                              {os.arquivos && os.arquivos.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {os.arquivos.length} arquivo{os.arquivos.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>

                            {/* Descrição em destaque */}
                            <div className="bg-muted/30 p-3 rounded-lg">
                              <p className="text-sm font-medium text-foreground">{os.descricao}</p>
                            </div>

                            {/* Data agendada em destaque */}
                            {os.dataAgendada && (
                              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-blue-600" />
                                  <span className="font-semibold text-blue-800">Agendado para:</span>
                                  <span className="text-blue-700 font-medium">
                                    {formatDateOnly(os.dataAgendada)}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Informações organizadas em grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                              {/* Informações do equipamento */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-1 text-muted-foreground font-medium">
                                  <Wrench className="w-3 h-3" />
                                  Equipamento
                                </div>
                                <div className="pl-4 space-y-1">
                                  {os.tipoEquipamento && (
                                    <div><span className="font-medium">Tipo:</span> {os.tipoEquipamento.nome}</div>
                                  )}
                                  {os.equipamento ? (
                                    <>
                                      <div><span className="font-medium">Nome:</span> {os.equipamento.nomeEquipamento || "N/I"}</div>
                                      <div><span className="font-medium">Série:</span> {os.equipamento.numeroSerie || "N/I"}</div>
                                      {os.equipamento.marca && (
                                        <div><span className="font-medium">Marca:</span> {os.equipamento.marca}</div>
                                      )}
                                      {os.equipamento.modelo && (
                                        <div><span className="font-medium">Modelo:</span> {os.equipamento.modelo}</div>
                                      )}
                                    </>
                                  ) : (
                                    <div>N/I</div>
                                  )}
                                </div>
                              </div>

                              {/* Informações de pessoas e local */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-1 text-muted-foreground font-medium">
                                  <User className="w-3 h-3" />
                                  Responsáveis
                                </div>
                                <div className="pl-4 space-y-1">
                                  {os.solicitante && (
                                    <div><span className="font-medium">Solicitante:</span> {os.solicitante.nome}</div>
                                  )}
                                  <div><span className="font-medium">Técnico:</span> {os.tecnico.nome}</div>
                                  {os.Setor && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      <span className="font-medium">Setor:</span> {os.Setor.nome}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Informações de tempo */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-1 text-muted-foreground font-medium">
                                  <Clock className="w-3 h-3" />
                                  Histórico
                                </div>
                                <div className="pl-4 space-y-1">
                                  <div><span className="font-medium">Criado:</span> {formatDate(os.criadoEm)}</div>

                                  {os.iniciadaEm && (
                                    <div><span className="font-medium">Iniciado:</span> {formatDate(os.iniciadaEm)}</div>
                                  )}

                                  {os.finalizadoEm && (
                                    <div><span className="font-medium">Finalizado:</span> {formatDate(os.finalizadoEm)}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <CheckCircle className="h-5 w-5 text-muted-foreground" />
                            {aberto === os.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="space-y-4 border-t">
                        {/* Seção de arquivos existentes */}
                        {os.arquivos && os.arquivos.length > 0 && (
                          <div className="space-y-3">
                            <Label className="font-medium text-base">Arquivos anexados:</Label>
                            <div className="space-y-2">
                              {os.arquivos.map((arquivo, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-muted p-3 rounded-lg text-sm">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span className="truncate">{getFileNameFromPath(arquivo)}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownloadFile(arquivo)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Só mostra resolução e arquivos se OS não estiver concluída */}
                        {os.status !== 'CONCLUIDA' && os.status !== 'CANCELADA' && (
                          <>
                            {/* Resolução */}
                            {os.status === 'EM_ANDAMENTO' && (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="resolucao" className="text-base font-medium">Resolução *</Label>
                                  <Textarea
                                    id="resolucao"
                                    rows={4}
                                    placeholder="Descreva detalhadamente a resolução do problema..."
                                    value={resolucao}
                                    onChange={(e) => setResolucao(e.target.value)}
                                    className="resize-none"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="valorManutencao" className="text-base font-medium">Valor da manutenção (R$)</Label>
                                  <Input
                                    id="valorManutencao"
                                    type="number"
                                    step="0.01"
                                    placeholder="Ex: 150.50"
                                    value={valorManutencao}
                                    onChange={(e) => setValorManutencao(e.target.value)}
                                  />
                                </div>

                                {/* Arquivos */}
                                <div className="space-y-2">
                                  <Label htmlFor="arquivos" className="text-base font-medium">
                                    <Upload className="w-4 h-4 inline mr-2" />
                                    Anexar novos arquivos
                                  </Label>
                                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                                    <input
                                      type="file"
                                      id="arquivos"
                                      multiple
                                      accept="image/*,.pdf"
                                      onChange={handleFileChange}
                                      className="hidden"
                                    />
                                    <label htmlFor="arquivos" className="cursor-pointer">
                                      <div className="flex flex-col items-center gap-2">
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Clique para selecionar arquivos</span>
                                        <span className="text-xs text-muted-foreground">Aceita imagens e PDFs</span>
                                      </div>
                                    </label>
                                  </div>

                                  {fileNames.length > 0 && (
                                    <div className="space-y-2">
                                      {fileNames.map((name, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-muted p-3 rounded-lg text-sm">
                                          <span className="truncate">{name}</span>
                                          <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(idx)} className="h-8 w-8 p-0">
                                            <X className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <Button
                                  onClick={() => handleFinalizar(os)}
                                  className="w-full bg-green-600 hover:bg-green-700"
                                  disabled={!resolucao.trim()}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Confirmar Finalização
                                </Button>
                              </>
                            )}

                            {/* Botão para iniciar a OS se estiver ABERTA */}
                            {os.status === 'ABERTA' && (
                              <div className="space-y-2">
                                <Button
                                  onClick={() => handleMudarStatus(os.id, 'EM_ANDAMENTO')}
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Iniciar OS
                                </Button>

                                <Button
                                  onClick={() => handleMudarStatus(os.id, 'CANCELADA')}
                                  variant="outline"
                                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancelar OS
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredOrdens.length)} de {filteredOrdens.length} resultados
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChamadosTecnico;