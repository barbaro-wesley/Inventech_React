import { useState } from "react";
import { DocumentosLayout } from "@/components/layouts/DocumentosLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EPI {
  id: string;
  nome: string;
  tipo: string;
  categoria: string;
  marca: string;
  modelo: string;
  certificadoCA: string;
  validadeCA?: string;
  estoque: number;
  estoqueMinimo: number;
  observacoes?: string;
}

export default function CadastroEPI() {
  const { toast } = useToast();
  const [epis, setEpis] = useState<EPI[]>([
    {
      id: "1",
      nome: "Capacete Branco",
      tipo: "Capacete de Segurança",
      categoria: "Proteção da Cabeça",
      marca: "3M",
      modelo: "H-700",
      certificadoCA: "31469",
      validadeCA: "2025-12-31",
      estoque: 50,
      estoqueMinimo: 10,
      observacoes: "Para uso geral"
    }
  ]);

  const [editingEPI, setEditingEPI] = useState<EPI | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "",
    categoria: "",
    marca: "",
    modelo: "",
    certificadoCA: "",
    validadeCA: "",
    estoque: 0,
    estoqueMinimo: 0,
    observacoes: ""
  });

  const tiposEPI = [
    "Capacete de Segurança",
    "Luva de Proteção",
    "Óculos de Segurança",
    "Protetor Auricular",
    "Máscara Respiratória",
    "Calçado de Segurança",
    "Cinto de Segurança"
  ];

  const categorias = [
    "Proteção da Cabeça",
    "Proteção das Mãos",
    "Proteção dos Olhos",
    "Proteção Auditiva",
    "Proteção Respiratória",
    "Proteção dos Pés",
    "Proteção contra Quedas"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEPI) {
      setEpis(prev => prev.map(epi => 
        epi.id === editingEPI.id 
          ? { ...epi, ...formData }
          : epi
      ));
      toast({
        title: "EPI atualizado",
        description: "As informações foram atualizadas com sucesso.",
      });
    } else {
      const newEPI: EPI = {
        id: Date.now().toString(),
        ...formData
      };
      setEpis(prev => [...prev, newEPI]);
      toast({
        title: "EPI cadastrado",
        description: "O novo EPI foi adicionado com sucesso.",
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      tipo: "",
      categoria: "",
      marca: "",
      modelo: "",
      certificadoCA: "",
      validadeCA: "",
      estoque: 0,
      estoqueMinimo: 0,
      observacoes: ""
    });
    setEditingEPI(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (epi: EPI) => {
    setEditingEPI(epi);
    setFormData({
      nome: epi.nome,
      tipo: epi.tipo,
      categoria: epi.categoria,
      marca: epi.marca,
      modelo: epi.modelo,
      certificadoCA: epi.certificadoCA,
      validadeCA: epi.validadeCA || "",
      estoque: epi.estoque,
      estoqueMinimo: epi.estoqueMinimo,
      observacoes: epi.observacoes || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este EPI?")) {
      setEpis(prev => prev.filter(epi => epi.id !== id));
      toast({
        title: "EPI excluído",
        description: "O EPI foi removido com sucesso.",
      });
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Cadastro de EPI</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo EPI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEPI ? "Editar EPI" : "Novo EPI"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposEPI.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="marca">Marca</Label>
                    <Input
                      id="marca"
                      value={formData.marca}
                      onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input
                      id="modelo"
                      value={formData.modelo}
                      onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="certificadoCA">Certificado de Aprovação (CA)</Label>
                    <Input
                      id="certificadoCA"
                      value={formData.certificadoCA}
                      onChange={(e) => setFormData(prev => ({ ...prev, certificadoCA: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="validadeCA">Validade do CA</Label>
                    <Input
                      id="validadeCA"
                      type="date"
                      value={formData.validadeCA}
                      onChange={(e) => setFormData(prev => ({ ...prev, validadeCA: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estoque">Estoque Atual</Label>
                    <Input
                      id="estoque"
                      type="number"
                      value={formData.estoque}
                      onChange={(e) => setFormData(prev => ({ ...prev, estoque: parseInt(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                    <Input
                      id="estoqueMinimo"
                      type="number"
                      value={formData.estoqueMinimo}
                      onChange={(e) => setFormData(prev => ({ ...prev, estoqueMinimo: parseInt(e.target.value) || 0 }))}
                      required
                    />
                  </div>
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
                    {editingEPI ? "Atualizar" : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              EPIs Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>CA</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {epis.map((epi) => (
                  <TableRow key={epi.id}>
                    <TableCell>{epi.nome}</TableCell>
                    <TableCell>{epi.tipo}</TableCell>
                    <TableCell>{epi.marca} - {epi.modelo}</TableCell>
                    <TableCell>{epi.certificadoCA}</TableCell>
                    <TableCell>{epi.estoque}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        epi.estoque <= epi.estoqueMinimo 
                          ? "bg-red-100 text-red-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {epi.estoque <= epi.estoqueMinimo ? "Estoque Baixo" : "OK"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(epi)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(epi.id)}>
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
  );
}