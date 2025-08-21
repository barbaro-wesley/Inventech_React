import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  cargo: string;
  setor: string;
  email: string;
  telefone: string;
}

const mockFuncionarios: Funcionario[] = [
  {
    id: 1,
    nome: "João Silva",
    cpf: "123.456.789-01",
    cargo: "Analista",
    setor: "TI",
    email: "joao@empresa.com",
    telefone: "(11) 99999-9999"
  },
  {
    id: 2,
    nome: "Maria Santos",
    cpf: "987.654.321-02", 
    cargo: "Gerente",
    setor: "RH",
    email: "maria@empresa.com",
    telefone: "(11) 88888-8888"
  }
];

const Funcionarios = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(mockFuncionarios);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<Funcionario | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    cargo: "",
    setor: "",
    email: "",
    telefone: ""
  });

  const funcionariosFiltrados = funcionarios.filter(func => {
    const matchSearch = func.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       func.cpf.includes(searchTerm) ||
                       func.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSetor = filtroSetor === "todos" || func.setor === filtroSetor;
    return matchSearch && matchSetor;
  });

  const setores = [...new Set(funcionarios.map(f => f.setor))];

  const abrirDialog = (funcionario?: Funcionario) => {
    if (funcionario) {
      setFuncionarioSelecionado(funcionario);
      setFormData(funcionario);
    } else {
      setFuncionarioSelecionado(null);
      setFormData({
        nome: "",
        cpf: "",
        cargo: "",
        setor: "",
        email: "",
        telefone: ""
      });
    }
    setIsDialogOpen(true);
  };

  const salvarFuncionario = () => {
    if (funcionarioSelecionado) {
      // Editar
      setFuncionarios(prev => prev.map(f => 
        f.id === funcionarioSelecionado.id ? { ...formData, id: f.id } : f
      ));
      toast({ title: "Funcionário atualizado com sucesso!" });
    } else {
      // Novo
      const novoFuncionario = {
        ...formData,
        id: Math.max(...funcionarios.map(f => f.id)) + 1
      };
      setFuncionarios(prev => [...prev, novoFuncionario]);
      toast({ title: "Funcionário cadastrado com sucesso!" });
    }
    setIsDialogOpen(false);
  };

  const excluirFuncionario = (id: number) => {
    setFuncionarios(prev => prev.filter(f => f.id !== id));
    toast({ title: "Funcionário excluído com sucesso!" });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Funcionários</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => abrirDialog()} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {funcionarioSelecionado ? "Editar Funcionário" : "Novo Funcionário"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Digite o nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                    placeholder="Digite o cargo"
                  />
                </div>
                <div>
                  <Label htmlFor="setor">Setor</Label>
                  <Input
                    id="setor"
                    value={formData.setor}
                    onChange={(e) => setFormData(prev => ({ ...prev, setor: e.target.value }))}
                    placeholder="Digite o setor"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="funcionario@empresa.com"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <Button onClick={salvarFuncionario} className="w-full">
                  {funcionarioSelecionado ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, CPF ou cargo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Select value={filtroSetor} onValueChange={setFiltroSetor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os setores</SelectItem>
                    {setores.map(setor => (
                      <SelectItem key={setor} value={setor}>{setor}</SelectItem>
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
            <CardTitle>Lista de Funcionários ({funcionariosFiltrados.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funcionariosFiltrados.map((funcionario) => (
                    <TableRow key={funcionario.id}>
                      <TableCell className="font-medium">{funcionario.nome}</TableCell>
                      <TableCell>{funcionario.cpf}</TableCell>
                      <TableCell>{funcionario.cargo}</TableCell>
                      <TableCell>{funcionario.setor}</TableCell>
                      <TableCell>{funcionario.email}</TableCell>
                      <TableCell>{funcionario.telefone}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirDialog(funcionario)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => excluirFuncionario(funcionario.id)}
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

export default Funcionarios;