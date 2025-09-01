import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Search, Filter } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
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
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const itemsPerPage = 10;

  const statusOptions = [
    { value: '', label: 'Todos os Status' },
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
        const response = await api.get('/os', { withCredentials: true });

        const prevList = Array.isArray(response.data.preventivas) ? response.data.preventivas : [];
        const corrList = Array.isArray(response.data.corretivas) ? response.data.corretivas : [];

        setPreventivas(prevList);
        setCorretivas(corrList);
      } catch (error) {
        console.error('Erro ao buscar ordens de serviço:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar ordens de serviço",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // Atualiza lista filtrada ao trocar filtros ou aba
  useEffect(() => {
    const sourceList = activeTab === 'preventivas' ? preventivas : corretivas;

    const filtered = sourceList.filter((ordem) => {
      const matchesSearch = ordem.descricao
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus ? ordem.status === filterStatus : true;
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
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Ordens de Serviço</h1>
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Ordem</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo Equipamento</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead>Solicitante</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.length > 0 ? (
                      currentItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">#{item.id}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {item.descricao}
                          </TableCell>
                          <TableCell>{item.tipoEquipamento?.nome || '-'}</TableCell>
                          <TableCell>{item.tecnico?.nome || '-'}</TableCell>
                          <TableCell>
                            <Badge className={`text-white ${getStatusColor(item.status)}`}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.Setor?.nome || '-'}</TableCell>
                          <TableCell>{item.solicitante?.nome || '-'}</TableCell>
                          <TableCell>{formatDate(item.criadoEm)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">
                          Nenhuma ordem de serviço encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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