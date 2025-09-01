import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Search, Filter } from 'lucide-react';
import api from '@/lib/api';

interface OS {
  id: number;
  descricao: string;
  status: string;
  criadoEm: string;
  finalizadoEm?: string | null;
  iniciadaEm?: string | null;
  preventiva: boolean;
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
}

const OSViewer = () => {
  const [preventivas, setPreventivas] = useState<OS[]>([]);
  const [corretivas, setCorretivas] = useState<OS[]>([]);
  const [filteredOrdens, setFilteredOrdens] = useState<OS[]>([]);
  const [activeTab, setActiveTab] = useState('corretivas');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 10;

  const statusOptions = [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'ABERTA', label: 'Aberta' },
    { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { value: 'CONCLUIDA', label: 'Concluída' },
    { value: 'CANCELADA', label: 'Cancelada' },
  ];

  // Busca dados da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/os', { withCredentials: true });
        
        // Verifica se a resposta tem a estrutura esperada
        if (response.data) {
          const prevList = Array.isArray(response.data.preventivas) ? response.data.preventivas : [];
          const corrList = Array.isArray(response.data.corretivas) ? response.data.corretivas : [];
          
          setPreventivas(prevList);
          setCorretivas(corrList);
        } else {
          // Caso a API retorne um array único, separamos por tipo
          const allOrdens = Array.isArray(response.data) ? response.data : [];
          const prevList = allOrdens.filter((os: OS) => os.preventiva === true);
          const corrList = allOrdens.filter((os: OS) => os.preventiva === false);
          
          setPreventivas(prevList);
          setCorretivas(corrList);
        }
        
      } catch (error: any) {
        console.error('Erro ao buscar ordens de serviço:', error);
        setError(error.response?.data?.message || 'Erro ao carregar dados');
        setPreventivas([]);
        setCorretivas([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Atualiza lista filtrada ao trocar filtros ou aba
  useEffect(() => {
    const sourceList = activeTab === 'preventivas' ? preventivas : corretivas;

    const filtered = sourceList.filter((ordem) => {
      const matchesSearch = ordem.descricao
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'todos' ? true : ordem.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    setFilteredOrdens(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, activeTab, preventivas, corretivas]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABERTA': return 'bg-yellow-500';
      case 'EM_ANDAMENTO': return 'bg-blue-500';
      case 'CONCLUIDA': return 'bg-green-500';
      case 'CANCELADA': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
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

  const totalPages = Math.ceil(filteredOrdens.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrdens.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Ordens de Serviço</h1>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Ordens de Serviço</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao carregar dados</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} variant="outline">
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
        <h1 className="text-2xl font-bold text-foreground">Ordens de Serviço</h1>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          Atualizar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="corretivas">
            Corretivas ({corretivas.length})
          </TabsTrigger>
          <TabsTrigger value="preventivas">
            Preventivas ({preventivas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Pesquisar por descrição</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Digite a descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <Label htmlFor="status">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
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
              </div>
            </CardContent>
          </Card>

          {/* Tabela */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'preventivas' ? 'Ordens Preventivas' : 'Ordens Corretivas'}
              </CardTitle>
              <CardDescription>
                {filteredOrdens.length} ordem(ns) encontrada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="p-3 text-left font-medium text-foreground">N° Ordem</th>
                      <th className="p-3 text-left font-medium text-foreground">Descrição</th>
                      <th className="p-3 text-left font-medium text-foreground">Tipo Equipamento</th>
                      <th className="p-3 text-left font-medium text-foreground">Técnico</th>
                      <th className="p-3 text-left font-medium text-foreground">Status</th>
                      <th className="p-3 text-left font-medium text-foreground">Setor</th>
                      <th className="p-3 text-left font-medium text-foreground">Solicitante</th>
                      <th className="p-3 text-left font-medium text-foreground">Criado em</th>
                      <th className="p-3 text-left font-medium text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">#{item.id}</td>
                          <td className="p-3 max-w-[200px] truncate" title={item.descricao}>
                            {item.descricao || '-'}
                          </td>
                          <td className="p-3">{item.tipoEquipamento?.nome || '-'}</td>
                          <td className="p-3">{item.tecnico?.nome || '-'}</td>
                          <td className="p-3">
                            <Badge className={`text-white ${getStatusColor(item.status)}`}>
                              {item.status}
                            </Badge>
                          </td>
                          <td className="p-3">{item.Setor?.nome || '-'}</td>
                          <td className="p-3">{item.solicitante?.nome || '-'}</td>
                          <td className="p-3">{formatDate(item.criadoEm)}</td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-muted-foreground">
                          {searchTerm || filterStatus !== 'todos' 
                            ? 'Nenhuma ordem de serviço encontrada com os filtros aplicados.' 
                            : 'Nenhuma ordem de serviço encontrada.'
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
                      onClick={goToPrevPage}
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
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OSViewer;