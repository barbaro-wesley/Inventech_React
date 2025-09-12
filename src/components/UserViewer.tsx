import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Search, Filter, Calendar, RefreshCw, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface OS {
  id: number;
  descricao: string;
  status: string;
  criadoEm: string;
  iniciadaEm?: string | null;
  finalizadoEm?: string | null;
  canceladaEm?: string | null;
  dataAgendada?: string | null;
  prioridade: string;
  preventiva: boolean;
  valorManutencao?: number | null;
  resolucao?: string | null;
  tipoEquipamento?: {
    id: number;
    nome: string;
  } | null;
  tecnico?: {
    id: number;
    nome: string;
  } | null;
  solicitante?: {
    nome: string;
  } | null;
  Setor?: {
    id: number;
    nome: string;
  } | null;
  equipamento?: {
    nomeEquipamento: string;
    marca: string;
    modelo: string;
    numeroSerie: string;
    numeroPatrimonio: string;
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

interface MinhasOSData {
  ordens: OS[];
  estatisticas: Estatisticas;
  filtrosAplicados: {
    status: string;
    dataInicio: string | null;
    dataFim: string | null;
    preventiva: string | null;
  };
}

const UserViewer = () => {
  const [data, setData] = useState<MinhasOSData | null>(null);
  const [filteredOrdens, setFilteredOrdens] = useState<OS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODAS');
  const [filterTipo, setFilterTipo] = useState('TODAS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Função para buscar dados
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Constrói os parâmetros da query
      const params = new URLSearchParams();
      
      if (filterStatus !== 'TODAS') params.append('status', filterStatus);
      if (filterTipo !== 'TODAS') params.append('preventiva', filterTipo);
      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);

      const queryString = params.toString();
      const url = queryString ? `/os/minhas-os?${queryString}` : '/os/minhas-os';

      const response = await api.get(url, { withCredentials: true });

      if (response.data?.success && response.data?.data) {
        setData(response.data.data);
      } else {
        throw new Error('Formato de resposta inválido');
      }

    } catch (error: any) {
      console.error('Erro ao buscar minhas OS:', error);
      setError(error.response?.data?.message || 'Erro ao carregar suas ordens de serviço');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Carrega dados inicialmente
  useEffect(() => {
    fetchData();
  }, [filterStatus, filterTipo, dataInicio, dataFim]);

  // Filtra ordens localmente por termo de busca
  useEffect(() => {
    if (!data) {
      setFilteredOrdens([]);
      return;
    }

    const filtered = data.ordens.filter((ordem) => {
      const matchesSearch = ordem.descricao
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        ordem.equipamento?.nomeEquipamento
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        ordem.tecnico?.nome
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    setFilteredOrdens(filtered);
    setCurrentPage(1);
  }, [searchTerm, data]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABERTA': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'EM_ANDAMENTO': return 'bg-blue-500 hover:bg-blue-600';
      case 'CONCLUIDA': return 'bg-green-500 hover:bg-green-600';
      case 'CANCELADA': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'BAIXO': return 'bg-green-500 hover:bg-green-600';
      case 'MEDIO': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'ALTO': return 'bg-orange-500 hover:bg-orange-600';
      case 'URGENTE': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      // A data já vem formatada do backend
      return dateString;
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('TODAS');
    setFilterTipo('TODAS');
    setDataInicio('');
    setDataFim('');
  };

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{data.estatisticas.total}</p>
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
                  <p className="text-2xl font-bold">{data.estatisticas.abertas}</p>
                  <p className="text-xs text-muted-foreground">Abertas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{data.estatisticas.emAndamento}</p>
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
                  <p className="text-2xl font-bold">{data.estatisticas.concluidas}</p>
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
                  <p className="text-2xl font-bold">{data.estatisticas.canceladas}</p>
                  <p className="text-xs text-muted-foreground">Canceladas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{data.estatisticas.preventivas}</p>
                  <p className="text-xs text-muted-foreground">Preventivas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{data.estatisticas.corretivas}</p>
                  <p className="text-xs text-muted-foreground">Corretivas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Descrição, equipamento, técnico..."
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

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Ordens de Serviço</CardTitle>
          <CardDescription>
            {filteredOrdens.length} ordem(ns) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-3 text-left font-medium text-foreground">N° OS</th>
                  <th className="p-3 text-left font-medium text-foreground">Descrição</th>
                  <th className="p-3 text-left font-medium text-foreground">Equipamento</th>
                  <th className="p-3 text-left font-medium text-foreground">Técnico</th>
                  <th className="p-3 text-left font-medium text-foreground">Status</th>
                  <th className="p-3 text-left font-medium text-foreground">Prioridade</th>
                  <th className="p-3 text-left font-medium text-foreground">Tipo</th>
                  <th className="p-3 text-left font-medium text-foreground">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">#{item.id}</td>
                      <td className="p-3 max-w-[200px]">
                        <div className="truncate" title={item.descricao}>
                          {item.descricao || '-'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div className="font-medium">
                            {item.equipamento?.nomeEquipamento || '-'}
                          </div>
                          <div className="text-muted-foreground">
                            {item.equipamento?.numeroPatrimonio || ''}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{item.tecnico?.nome || 'Não atribuído'}</td>
                      <td className="p-3">
                        <Badge className={`text-white ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={`text-white ${getPrioridadeColor(item.prioridade)}`}>
                          {item.prioridade}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={item.preventiva ? "default" : "secondary"}>
                          {item.preventiva ? 'Preventiva' : 'Corretiva'}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{formatDate(item.criadoEm)}</td>
                      
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-muted-foreground">
                      {searchTerm || filterStatus !== 'TODAS' || filterTipo !== 'TODAS' || dataInicio || dataFim
                        ? 'Nenhuma ordem de serviço encontrada com os filtros aplicados.'
                        : 'Você ainda não criou nenhuma ordem de serviço.'
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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

export default UserViewer;