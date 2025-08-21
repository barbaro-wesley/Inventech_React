import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Upload, Send, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegistroCapacitacao {
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

const mockRegistros: RegistroCapacitacao[] = [
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
    statusAssinatura: "enviado"
  }
];

const mockFuncionarios = ["João Silva", "Maria Santos", "Pedro Costa", "Ana Oliveira"];
const mockTiposDocumento = ["Treinamento", "Integração", "Palestra", "Workshop", "Certificação"];

const RegistrosCapacitacao = () => {
  const [registros, setRegistros] = useState<RegistroCapacitacao[]>(mockRegistros);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState<RegistroCapacitacao | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    titulo: "",
    data: "",
    local: "",
    instrutor: "",
    tipoDocumento: "",
    participantes: [] as string[]
  });

  const abrirDialog = (registro?: RegistroCapacitacao) => {
    if (registro) {
      setRegistroSelecionado(registro);
      setFormData({
        titulo: registro.titulo,
        data: registro.data,
        local: registro.local,
        instrutor: registro.instrutor,
        tipoDocumento: registro.tipoDocumento,
        participantes: registro.participantes
      });
    } else {
      setRegistroSelecionado(null);
      setFormData({
        titulo: "",
        data: "",
        local: "",
        instrutor: "",
        tipoDocumento: "",
        participantes: []
      });
    }
    setIsDialogOpen(true);
  };

  const salvarRegistro = () => {
    if (registroSelecionado) {
      // Editar
      setRegistros(prev => prev.map(r => 
        r.id === registroSelecionado.id ? { 
          ...r, 
          ...formData,
          statusAssinatura: r.statusAssinatura 
        } : r
      ));
      toast({ title: "Registro atualizado com sucesso!" });
    } else {
      // Novo
      const novoRegistro: RegistroCapacitacao = {
        ...formData,
        id: Math.max(...registros.map(r => r.id)) + 1,
        statusAssinatura: "pendente"
      };
      setRegistros(prev => [...prev, novoRegistro]);
      toast({ title: "Registro cadastrado com sucesso!" });
    }
    setIsDialogOpen(false);
  };

  const excluirRegistro = (id: number) => {
    setRegistros(prev => prev.filter(r => r.id !== id));
    toast({ title: "Registro excluído com sucesso!" });
  };

  const enviarParaAssinatura = (id: number) => {
    setRegistros(prev => prev.map(r => 
      r.id === id ? { ...r, statusAssinatura: "enviado" as const } : r
    ));
    toast({ title: "Documento enviado para assinatura via Cailun!" });
  };

  const handleParticipanteChange = (funcionario: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      participantes: checked 
        ? [...prev.participantes, funcionario]
        : prev.participantes.filter(p => p !== funcionario)
    }));
  };

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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Registros de Capacitação</h1>
            <p className="text-muted-foreground">Gerencie treinamentos e documentos de capacitação</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => abrirDialog()} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {registroSelecionado ? "Editar Registro" : "Novo Registro de Capacitação"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titulo">Título do Evento</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Ex: Treinamento de Segurança..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="local">Local</Label>
                    <Input
                      id="local"
                      value={formData.local}
                      onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
                      placeholder="Ex: Sala de Treinamento A"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instrutor">Instrutor/Responsável</Label>
                    <Input
                      id="instrutor"
                      value={formData.instrutor}
                      onChange={(e) => setFormData(prev => ({ ...prev, instrutor: e.target.value }))}
                      placeholder="Nome do instrutor"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
                  <Select value={formData.tipoDocumento} onValueChange={(value) => setFormData(prev => ({ ...prev, tipoDocumento: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTiposDocumento.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Participantes</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 p-3 border rounded-lg max-h-32 overflow-y-auto">
                    {mockFuncionarios.map(funcionario => (
                      <div key={funcionario} className="flex items-center space-x-2">
                        <Checkbox
                          id={funcionario}
                          checked={formData.participantes.includes(funcionario)}
                          onCheckedChange={(checked) => handleParticipanteChange(funcionario, checked as boolean)}
                        />
                        <Label htmlFor={funcionario} className="text-sm">{funcionario}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="arquivo">Upload do PDF (Certificado/Ata)</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="arquivo"
                      type="file"
                      accept=".pdf"
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                </div>

                <Button onClick={salvarRegistro} className="w-full">
                  {registroSelecionado ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{registros.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Upload className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{registros.filter(r => r.statusAssinatura === "pendente").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enviados</p>
                  <p className="text-2xl font-bold">{registros.filter(r => r.statusAssinatura === "enviado").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Download className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assinados</p>
                  <p className="text-2xl font-bold">{registros.filter(r => r.statusAssinatura === "assinado").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Instrutor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-40">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registros.map((registro) => (
                    <TableRow key={registro.id}>
                      <TableCell className="font-medium">{registro.titulo}</TableCell>
                      <TableCell>{new Date(registro.data).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{registro.local}</TableCell>
                      <TableCell>{registro.instrutor}</TableCell>
                      <TableCell>{registro.tipoDocumento}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {registro.participantes.slice(0, 2).map(participante => (
                            <Badge key={participante} variant="outline" className="text-xs">
                              {participante.split(' ')[0]}
                            </Badge>
                          ))}
                          {registro.participantes.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{registro.participantes.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(registro.statusAssinatura)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirDialog(registro)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {registro.statusAssinatura === "pendente" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => enviarParaAssinatura(registro.id)}
                              title="Enviar para Assinatura"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {registro.statusAssinatura === "assinado" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Ver PDF Assinado"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => excluirRegistro(registro.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RegistrosCapacitacao;