import { useState } from "react";
import { DocumentosLayout } from "@/components/layouts/DocumentosLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TipoEPI {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  validadeObrigatoria: boolean;
  observacoes?: string;
}

export default function TiposEPI() {
  const { toast } = useToast();
  const [tiposEPI, setTiposEPI] = useState<TipoEPI[]>([
    {
      id: "1",
      nome: "Capacete de Segurança",
      categoria: "Proteção da Cabeça",
      descricao: "Capacete para proteção contra impactos",
      validadeObrigatoria: true,
      observacoes: "Verificar CA anualmente"
    },
    {
      id: "2", 
      nome: "Luva de Proteção",
      categoria: "Proteção das Mãos",
      descricao: "Luvas para proteção das mãos",
      validadeObrigatoria: false
    }
  ]);

  const [editingTipo, setEditingTipo] = useState<TipoEPI | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    descricao: "",
    validadeObrigatoria: false,
    observacoes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTipo) {
      setTiposEPI(prev => prev.map(tipo => 
        tipo.id === editingTipo.id 
          ? { ...tipo, ...formData }
          : tipo
      ));
      toast({
        title: "Tipo de EPI atualizado",
        description: "As informações foram atualizadas com sucesso.",
      });
    } else {
      const newTipo: TipoEPI = {
        id: Date.now().toString(),
        ...formData
      };
      setTiposEPI(prev => [...prev, newTipo]);
      toast({
        title: "Tipo de EPI cadastrado",
        description: "O novo tipo foi adicionado com sucesso.",
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      categoria: "",
      descricao: "",
      validadeObrigatoria: false,
      observacoes: ""
    });
    setEditingTipo(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (tipo: TipoEPI) => {
    setEditingTipo(tipo);
    setFormData({
      nome: tipo.nome,
      categoria: tipo.categoria,
      descricao: tipo.descricao,
      validadeObrigatoria: tipo.validadeObrigatoria,
      observacoes: tipo.observacoes || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este tipo de EPI?")) {
      setTiposEPI(prev => prev.filter(tipo => tipo.id !== id));
      toast({
        title: "Tipo de EPI excluído",
        description: "O tipo foi removido com sucesso.",
      });
    }
  };

  return (
    <DocumentosLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tipos e Categorias de EPI</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Tipo de EPI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTipo ? "Editar Tipo de EPI" : "Novo Tipo de EPI"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do EPI</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                    placeholder="ex: Proteção da Cabeça, Proteção das Mãos"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="validadeObrigatoria"
                    checked={formData.validadeObrigatoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, validadeObrigatoria: e.target.checked }))}
                  />
                  <Label htmlFor="validadeObrigatoria">Validade Obrigatória</Label>
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTipo ? "Atualizar" : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de EPI Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Validade Obrigatória</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiposEPI.map((tipo) => (
                  <TableRow key={tipo.id}>
                    <TableCell>{tipo.nome}</TableCell>
                    <TableCell>{tipo.categoria}</TableCell>
                    <TableCell>{tipo.descricao}</TableCell>
                    <TableCell>{tipo.validadeObrigatoria ? "Sim" : "Não"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(tipo)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(tipo.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DocumentosLayout>
  );
}