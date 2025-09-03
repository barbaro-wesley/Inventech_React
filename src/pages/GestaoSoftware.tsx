import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CalendarDays, Plus, Search, Trash2, Edit, AlertTriangle, BarChart3 } from "lucide-react";
import api from "@/lib/api";

interface Equipamento {
  id: number;
  nomeEquipamento: string;
  ip: string;
}

interface GestaoSoftware {
  id: number;
  equipamentoId: number;
  equipamento?: Equipamento;
  software: string;
  versao: string;
  dataInstalacao: string;
  responsavel: string;
  licencaSerial: string;
  statusLicenca: 'ATIVA' | 'EXPIRADA' | 'PENDENTE';
  dataExpiracao: string;
  motivoInstalacao: string;
  observacoes: string;
}

const statusColors = {
  ATIVA: "bg-green-100 text-green-800",
  EXPIRADA: "bg-red-100 text-red-800",
  PENDENTE: "bg-yellow-100 text-yellow-800"
};

export default function GestaoSoftware() {
  const [softwares, setSoftwares] = useState<GestaoSoftware[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<GestaoSoftware | null>(null);
  const [searchSoftware, setSearchSoftware] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [licencasExpirando, setLicencasExpirando] = useState<GestaoSoftware[]>([]);
  const [showExpiring, setShowExpiring] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    equipamentoId: "",
    software: "",
    versao: "",
    dataInstalacao: "",
    responsavel: "",
    licencaSerial: "",
    statusLicenca: "ATIVA" as 'ATIVA' | 'EXPIRADA' | 'PENDENTE',
    dataExpiracao: "",
    motivoInstalacao: "",
    observacoes: ""
  });

  useEffect(() => {
    fetchSoftwares();
    fetchEquipamentos();
    fetchLicencasExpirando();
  }, [currentPage, searchSoftware, filterStatus]);

  const fetchSoftwares = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10"
      });
      
      if (searchSoftware) params.append("software", searchSoftware);
      if (filterStatus) params.append("statusLicenca", filterStatus);
      
      const response = await api.get(`/api/gestao-software?${params}`);
      
      if (response.data.success) {
        setSoftwares(response.data.data.items || response.data.data);
        setTotalPages(response.data.data.totalPages || 1);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar gestões de software",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipamentos = async () => {
    try {
      const response = await api.get("/equipamentos-medicos/tipo/1");
      if (response.data.success) {
        setEquipamentos(response.data.data);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar equipamentos",
        variant: "destructive"
      });
    }
  };

  const fetchLicencasExpirando = async () => {
    try {
      const response = await api.get("/api/gestao-software/licencas-expirando?dias=30");
      if (response.data.success) {
        setLicencasExpirando(response.data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar licenças expirando:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        equipamentoId: parseInt(formData.equipamentoId),
        dataInstalacao: new Date(formData.dataInstalacao).toISOString(),
        dataExpiracao: new Date(formData.dataExpiracao).toISOString()
      };

      if (editingSoftware) {
        await api.put(`/api/gestao-software/${editingSoftware.id}`, payload);
        toast({
          title: "Sucesso",
          description: "Gestão de software atualizada com sucesso"
        });
      } else {
        await api.post("/api/gestao-software", payload);
        toast({
          title: "Sucesso",
          description: "Gestão de software criada com sucesso"
        });
      }
      
      handleCloseForm();
      fetchSoftwares();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar gestão de software",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (software: GestaoSoftware) => {
    setEditingSoftware(software);
    setFormData({
      equipamentoId: software.equipamentoId.toString(),
      software: software.software,
      versao: software.versao,
      dataInstalacao: software.dataInstalacao.split('T')[0],
      responsavel: software.responsavel,
      licencaSerial: software.licencaSerial,
      statusLicenca: software.statusLicenca,
      dataExpiracao: software.dataExpiracao.split('T')[0],
      motivoInstalacao: software.motivoInstalacao,
      observacoes: software.observacoes
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta gestão de software?")) {
      try {
        await api.delete(`/api/gestao-software/${id}`);
        toast({
          title: "Sucesso",
          description: "Gestão de software excluída com sucesso"
        });
        fetchSoftwares();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir gestão de software",
          variant: "destructive"
        });
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSoftware(null);
    setFormData({
      equipamentoId: "",
      software: "",
      versao: "",
      dataInstalacao: "",
      responsavel: "",
      licencaSerial: "",
      statusLicenca: "ATIVA",
      dataExpiracao: "",
      motivoInstalacao: "",
      observacoes: ""
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Gestão de Software</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowExpiring(!showExpiring)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Licenças Expirando ({licencasExpirando.length})
          </Button>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Gestão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSoftware ? "Editar Gestão de Software" : "Nova Gestão de Software"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="equipamentoId">Equipamento</Label>
                    <Select
                      value={formData.equipamentoId}
                      onValueChange={(value) => setFormData({...formData, equipamentoId: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um equipamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipamentos.map((equipamento) => (
                          <SelectItem key={equipamento.id} value={equipamento.id.toString()}>
                            {equipamento.nomeEquipamento} - {equipamento.ip}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="software">Software</Label>
                    <Input
                      id="software"
                      value={formData.software}
                      onChange={(e) => setFormData({...formData, software: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="versao">Versão</Label>
                    <Input
                      id="versao"
                      value={formData.versao}
                      onChange={(e) => setFormData({...formData, versao: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Input
                      id="responsavel"
                      value={formData.responsavel}
                      onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataInstalacao">Data de Instalação</Label>
                    <Input
                      id="dataInstalacao"
                      type="date"
                      value={formData.dataInstalacao}
                      onChange={(e) => setFormData({...formData, dataInstalacao: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataExpiracao">Data de Expiração</Label>
                    <Input
                      id="dataExpiracao"
                      type="date"
                      value={formData.dataExpiracao}
                      onChange={(e) => setFormData({...formData, dataExpiracao: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licencaSerial">Licença/Serial</Label>
                    <Input
                      id="licencaSerial"
                      value={formData.licencaSerial}
                      onChange={(e) => setFormData({...formData, licencaSerial: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="statusLicenca">Status da Licença</Label>
                    <Select
                      value={formData.statusLicenca}
                      onValueChange={(value: 'ATIVA' | 'EXPIRADA' | 'PENDENTE') => 
                        setFormData({...formData, statusLicenca: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATIVA">Ativa</SelectItem>
                        <SelectItem value="EXPIRADA">Expirada</SelectItem>
                        <SelectItem value="PENDENTE">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="motivoInstalacao">Motivo da Instalação</Label>
                  <Textarea
                    id="motivoInstalacao"
                    value={formData.motivoInstalacao}
                    onChange={(e) => setFormData({...formData, motivoInstalacao: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingSoftware ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alertas de Licenças Expirando */}
      {showExpiring && licencasExpirando.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Licenças Expirando nos Próximos 30 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {licencasExpirando.map((software) => (
                <div key={software.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium">{software.software}</span>
                    <span className="text-gray-500 ml-2">v{software.versao}</span>
                  </div>
                  <Badge variant="destructive">
                    Expira em {formatDate(software.dataExpiracao)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Buscar Software</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Nome do software..."
                  value={searchSoftware}
                  onChange={(e) => setSearchSoftware(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="ATIVA">Ativa</SelectItem>
                  <SelectItem value="EXPIRADA">Expirada</SelectItem>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => fetchSoftwares()}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : softwares.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma gestão de software encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Software</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiração</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {softwares.map((software) => (
                  <TableRow key={software.id}>
                    <TableCell className="font-medium">{software.software}</TableCell>
                    <TableCell>{software.versao}</TableCell>
                    <TableCell>
                      {software.equipamento?.nomeEquipamento || `Equipamento ${software.equipamentoId}`}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[software.statusLicenca]}>
                        {software.statusLicenca}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(software.dataExpiracao)}</TableCell>
                    <TableCell>{software.responsavel}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(software)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(software.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}