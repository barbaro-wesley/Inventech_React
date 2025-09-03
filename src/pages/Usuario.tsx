import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";


interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: string;
  tecnicoId?: string;
  tecnicoNome?: string;
}

interface Tecnico {
  id: string;
  nome: string;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPapel, setFilterPapel] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    papel: "",
    tecnicoId: "",
  });
  const [editFormData, setEditFormData] = useState({
    nome: "",
    email: "",
    papel: "",
    tecnicoId: "",
    senha: "",
  });

  const papelOptions = [
    { value: "admin", label: "Administrador" },
    { value: "cadastro", label: "Cadastro" },
    { value: "tecnico", label: "Técnico" },
    { value: "visualizador", label: "Visualizador" },
    { value: "usuario_comum", label: "Usuário Comum" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuariosResponse, tecnicosResponse] = await Promise.all([
          api.get("/usuarios"),
          api.get("/tecnicos"),
        ]);
        setUsuarios(usuariosResponse.data);
        setTecnicos(tecnicosResponse.data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };
    fetchData();
  }, []);

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPapel = filterPapel === "all" || usuario.papel === filterPapel;

    return matchesSearch && matchesPapel;
  });

  const uniquePapeis = [...new Set(usuarios.map((user) => user.papel))];

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await api.delete(`/usuarios/${id}`);
        setUsuarios(usuarios.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/usuarios/cadastro", {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        papel: formData.papel,
        tecnicoId: formData.tecnicoId || null,
      });
      setUsuarios([...usuarios, response.data]);
      setFormData({ nome: "", email: "", senha: "", papel: "", tecnicoId: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario);
    setEditFormData({
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      tecnicoId: usuario.tecnicoId || "",
      senha: "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updateData: any = {
        nome: editFormData.nome,
        email: editFormData.email,
        papel: editFormData.papel,
        tecnicoId: editFormData.tecnicoId || null,
      };
      
      // Só inclui a senha se foi preenchida
      if (editFormData.senha.trim() !== "") {
        updateData.senha = editFormData.senha;
      }

      const response = await api.put(`/usuarios/${editingUser.id}`, updateData);
      setUsuarios(usuarios.map(user => 
        user.id === editingUser.id ? response.data : user
      ));
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os usuários do sistema
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPapel} onValueChange={setFilterPapel}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os papéis</SelectItem>
                {uniquePapeis.map((papel) => (
                  <SelectItem key={papel} value={papel}>
                    {papelOptions.find((opt) => opt.value === papel)?.label || papel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setFilterPapel("all");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Usuários ({filteredUsuarios.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Técnico Associado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {usuario.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {papelOptions.find((opt) => opt.value === usuario.papel)?.label ||
                          usuario.papel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {usuario.tecnicoNome || "Nenhum"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(usuario)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(usuario.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Papel</label>
              <Select name="papel" value={formData.papel} onValueChange={(value) => setFormData({ ...formData, papel: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent>
                  {papelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Técnico</label>
              <Select
                value={formData.tecnicoId || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, tecnicoId: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {tecnicos.map((tecnico) => (
                    <SelectItem key={tecnico.id} value={tecnico.id}>
                      {tecnico.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                type="text"
                name="nome"
                value={editFormData.nome}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nova Senha (opcional)</label>
              <Input
                type="password"
                name="senha"
                value={editFormData.senha}
                onChange={handleEditChange}
                placeholder="Deixe em branco para manter a atual"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                name="email"
                value={editFormData.email}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Papel</label>
              <Select 
                name="papel" 
                value={editFormData.papel} 
                onValueChange={(value) => setEditFormData({ ...editFormData, papel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent>
                  {papelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Técnico</label>
              <Select
                value={editFormData.tecnicoId || "none"}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, tecnicoId: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {tecnicos.map((tecnico) => (
                    <SelectItem key={tecnico.id} value={tecnico.id}>
                      {tecnico.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}