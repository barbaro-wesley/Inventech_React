import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Eye, Filter, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentoEncontrado {
  id: number;
  titulo: string;
  data: string;
  local: string;
  instrutor: string;
  tipoDocumento: string;
  participantes: string[];
  statusAssinatura: "pendente" | "enviado" | "assinado";
  arquivoPDF?: string;
}

const mockDocumentos: DocumentoEncontrado[] = [
  {
    id: 1,
    titulo: "Treinamento de Segurança do Trabalho",
    data: "2024-01-15",
    local: "Sala de Treinamento A",
    instrutor: "Carlos Oliveira",
    tipoDocumento: "Treinamento",
    participantes: ["João Silva", "Maria Santos"],
    statusAssinatura: "assinado",
    arquivoPDF: "seguranca-trabalho.pdf"
  },
  {
    id: 2,
    titulo: "Workshop de Comunicação",
    data: "2024-01-20",
    local: "Auditório Principal", 
    instrutor: "Ana Costa",
    tipoDocumento: "Workshop",
    participantes: ["João Silva"],
    statusAssinatura: "assinado",
    arquivoPDF: "workshop-comunicacao.pdf"
  },
  {
    id: 3,
    titulo: "Palestra sobre Liderança",
    data: "2024-02-05",
    local: "Sala de Reuniões",
    instrutor: "Pedro Santos",
    tipoDocumento: "Palestra",
    participantes: ["Maria Santos", "Ana Oliveira"],
    statusAssinatura: "enviado"
  },
  {
    id: 4,
    titulo: "Certificação em Excel Avançado",
    data: "2024-02-10",
    local: "Laboratório de Informática",
    instrutor: "Fernanda Lima",
    tipoDocumento: "Certificação",
    participantes: ["João Silva", "Pedro Costa"],
    statusAssinatura: "assinado",
    arquivoPDF: "certificacao-excel.pdf"
  }
];

const mockFuncionarios = ["João Silva", "Maria Santos", "Pedro Costa", "Ana Oliveira"];
const mockTiposDocumento = ["Treinamento", "Integração", "Palestra", "Workshop", "Certificação"];
const mockInstrutores = ["Carlos Oliveira", "Ana Costa", "Pedro Santos", "Fernanda Lima"];

const PesquisarDocumentos = () => {
  const [documentos] = useState<DocumentoEncontrado[]>(mockDocumentos);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroFuncionario, setFiltroFuncionario] = useState("todos");
  const [filtroInstrutor, setFiltroInstrutor] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const { toast } = useToast();

  const documentosFiltrados = documentos.filter(doc => {
    const matchSearch = doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       doc.instrutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       doc.local.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchTipo = filtroTipo === "todos" || doc.tipoDocumento === filtroTipo;
    const matchFuncionario = filtroFuncionario === "todos" || doc.participantes.includes(filtroFuncionario);
    const matchInstrutor = filtroInstrutor === "todos" || doc.instrutor === filtroInstrutor;
    const matchStatus = filtroStatus === "todos" || doc.statusAssinatura === filtroStatus;
    
    let matchData = true;
    if (dataInicio && dataFim) {
      const docData = new Date(doc.data);
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      matchData = docData >= inicio && docData <= fim;
    }
    
    return matchSearch && matchTipo && matchFuncionario && matchInstrutor && matchStatus && matchData;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="secondary">Pendente</Badge>;
      case "enviado":
        return <Badge className="bg-blue-100 text-blue-800">Enviado</Badge>;
      case "assinado":
        return <Badge className="bg-green-100 text-green-800">Assinado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const baixarDocumento = (documento: DocumentoEncontrado) => {
    if (documento.arquivoPDF) {
      toast({ title: `Baixando ${documento.arquivoPDF}...` });
      // Aqui seria implementado o download real
    } else {
      toast({ title: "Documento não disponível para download", variant: "destructive" });
    }
  };

  const visualizarDocumento = (documento: DocumentoEncontrado) => {
    if (documento.arquivoPDF) {
      toast({ title: `Abrindo ${documento.titulo}...` });
      // Aqui seria implementada a visualização do PDF
    } else {
      toast({ title: "Documento não disponível para visualização", variant: "destructive" });
    }
  };

  const limparFiltros = () => {
    setSearchTerm("");
    setFiltroTipo("todos");
    setFiltroFuncionario("todos");
    setFiltroInstrutor("todos");
    setFiltroStatus("todos");
    setDataInicio("");
    setDataFim("");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pesquisar Documentos</h1>
            <p className="text-muted-foreground">Encontre e gerencie documentos de capacitação</p>
          </div>
          <Button variant="outline" onClick={limparFiltros} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>

        {/* Barra de Busca */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, instrutor, local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filtros Avançados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avançados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Tipo de Documento</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    {mockTiposDocumento.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Funcionário</Label>
                <Select value={filtroFuncionario} onValueChange={setFiltroFuncionario}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os funcionários" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os funcionários</SelectItem>
                    {mockFuncionarios.map(funcionario => (
                      <SelectItem key={funcionario} value={funcionario}>{funcionario}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Instrutor</Label>
                <Select value={filtroInstrutor} onValueChange={setFiltroInstrutor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os instrutores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os instrutores</SelectItem>
                    {mockInstrutores.map(instrutor => (
                      <SelectItem key={instrutor} value={instrutor}>{instrutor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="assinado">Assinado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Período</Label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    placeholder="Data início"
                  />
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    placeholder="Data fim"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle>
              Resultados da Pesquisa ({documentosFiltrados.length} {documentosFiltrados.length === 1 ? 'documento encontrado' : 'documentos encontrados'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Instrutor</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentosFiltrados.map((documento) => (
                    <TableRow key={documento.id}>
                      <TableCell className="font-medium">{documento.titulo}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(documento.data).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>{documento.tipoDocumento}</TableCell>
                      <TableCell>{documento.instrutor}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {documento.participantes.slice(0, 2).map(participante => (
                            <Badge key={participante} variant="outline" className="text-xs">
                              {participante.split(' ')[0]}
                            </Badge>
                          ))}
                          {documento.participantes.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{documento.participantes.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(documento.statusAssinatura)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {documento.statusAssinatura === "assinado" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => visualizarDocumento(documento)}
                                title="Visualizar PDF"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => baixarDocumento(documento)}
                                title="Baixar PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {documentosFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum documento encontrado com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

const Label = ({ className, children, ...props }: any) => (
  <label className={className} {...props}>{children}</label>
);

export default PesquisarDocumentos;