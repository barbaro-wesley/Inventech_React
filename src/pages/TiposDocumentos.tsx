import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TipoDocumento {
  id: number;
  nome: string;
  descricao: string;
  ativo: boolean;
}

const mockTipos: TipoDocumento[] = [
  {
    id: 1,
    nome: "Treinamento",
    descricao: "Documentos relacionados a treinamentos técnicos e comportamentais",
    ativo: true
  },
  {
    id: 2,
    nome: "Integração",
    descricao: "Documentos do processo de integração de novos funcionários",
    ativo: true
  },
  {
    id: 3,
    nome: "Palestra",
    descricao: "Certificados e registros de palestras corporativas",
    ativo: true
  },
  {
    id: 4,
    nome: "Workshop",
    descricao: "Documentos de workshops e oficinas práticas",
    ativo: true
  },
  {
    id: 5,
    nome: "Certificação",
    descricao: "Certificações profissionais e técnicas",
    ativo: true
  }
];

const TiposDocumentos = () => {
  const [tipos, setTipos] = useState<TipoDocumento[]>(mockTipos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoDocumento | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ativo: true
  });

  const abrirDialog = (tipo?: TipoDocumento) => {
    if (tipo) {
      setTipoSelecionado(tipo);
      setFormData({
        nome: tipo.nome,
        descricao: tipo.descricao,
        ativo: tipo.ativo
      });
    } else {
      setTipoSelecionado(null);
      setFormData({
        nome: "",
        descricao: "",
        ativo: true
      });
    }
    setIsDialogOpen(true);
  };

  const salvarTipo = () => {
    if (tipoSelecionado) {
      // Editar
      setTipos(prev => prev.map(t => 
        t.id === tipoSelecionado.id ? { ...formData, id: t.id } : t
      ));
      toast({ title: "Tipo de documento atualizado com sucesso!" });
    } else {
      // Novo
      const novoTipo = {
        ...formData,
        id: Math.max(...tipos.map(t => t.id)) + 1
      };
      setTipos(prev => [...prev, novoTipo]);
      toast({ title: "Tipo de documento cadastrado com sucesso!" });
    }
    setIsDialogOpen(false);
  };

  const excluirTipo = (id: number) => {
    setTipos(prev => prev.filter(t => t.id !== id));
    toast({ title: "Tipo de documento excluído com sucesso!" });
  };

  const toggleAtivo = (id: number) => {
    setTipos(prev => prev.map(t => 
      t.id === id ? { ...t, ativo: !t.ativo } : t
    ));
    toast({ title: "Status atualizado com sucesso!" });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tipos de Documentos</h1>
            <p className="text-muted-foreground">Gerencie os tipos de documentos de capacitação</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => abrirDialog()} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Tipo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {tipoSelecionado ? "Editar Tipo de Documento" : "Novo Tipo de Documento"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Tipo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Treinamento, Palestra, Workshop..."
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva o tipo de documento..."
                    className="min-h-[80px]"
                  />
                </div>
                <Button onClick={salvarTipo} className="w-full">
                  {tipoSelecionado ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Tipos</p>
                  <p className="text-2xl font-bold">{tipos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold">{tipos.filter(t => t.ativo).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inativos</p>
                  <p className="text-2xl font-bold">{tipos.filter(t => !t.ativo).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Tipos de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tipos.map((tipo) => (
                    <TableRow key={tipo.id}>
                      <TableCell className="font-medium">{tipo.nome}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate" title={tipo.descricao}>
                          {tipo.descricao}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={tipo.ativo ? "default" : "secondary"}
                          size="sm"
                          onClick={() => toggleAtivo(tipo.id)}
                          className="text-xs"
                        >
                          {tipo.ativo ? "Ativo" : "Inativo"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirDialog(tipo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => excluirTipo(tipo.id)}
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

export default TiposDocumentos;