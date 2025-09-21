import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Key, X } from "lucide-react";
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

interface Modulo {
  id: number;
  nome: string;
  descricao?: string;
}

interface Tecnico {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  matricula: string;
  ativo: boolean;
  grupo: {
    id: number;
    nome: string;
  };
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: string;
  tecnicoId?: number;
  tecnico?: Tecnico;
  modulos?: Array<{
    id: number;
    modulo: Modulo;
  }>;
}

interface TecnicoDisponivel {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  matricula: string;
  ativo: boolean;
  grupo: {
    id: number;
    nome: string;
  };
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tecnicosDisponiveis, setTecnicosDisponiveis] = useState<TecnicoDisponivel[]>([]);
  const [modulosDisponiveis, setModulosDisponiveis] = useState<Modulo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPapel, setFilterPapel] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [passwordUser, setPasswordUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    papel: "",
    tecnicoId: "",
    modulos: [] as number[],
  });
  const [editFormData, setEditFormData] = useState({
    nome: "",
    email: "",
    papel: "",
    tecnicoId: "",
    modulos: [] as number[],
  });
  const [passwordFormData, setPasswordFormData] = useState({
    novaSenha: "",
    confirmarSenha: "",
  });

  const papelOptions = [
    { value: "admin", label: "Administrador" },
    { value: "cadastro", label: "Cadastro" },
    { value: "tecnico", label: "Técnico" },
    { value: "visualizador", label: "Visualizador" },
    { value: "usuario_comum", label: "Usuário Comum" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usuariosResponse, tecnicosResponse, modulosResponse] = await Promise.all([
        api.get("/usuarios"),
        api.get("/usuarios/disponiveis"),
        api.get("/modulos"), // Assumindo que existe um endpoint para buscar módulos
      ]);
      setUsuarios(usuariosResponse.data);
      setTecnicosDisponiveis(tecnicosResponse.data);
      setModulosDisponiveis(modulosResponse.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usuario.tecnico?.nome.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesPapel = filterPapel === "all" || usuario.papel === filterPapel;

    return matchesSearch && matchesPapel;
  });

  const uniquePapeis = [...new Set(usuarios.map((user) => user.papel))];

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await api.delete(`/usuarios/${id}`);
        setUsuarios(usuarios.filter((user) => user.id !== id));
        await fetchData();
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        alert("Erro ao excluir usuário. Tente novamente.");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Função para adicionar módulo na criação
  const handleAddModulo = (moduloId: number) => {
    if (!formData.modulos.includes(moduloId)) {
      setFormData({
        ...formData,
        modulos: [...formData.modulos, moduloId]
      });
    }
  };

  // Função para remover módulo na criação
  const handleRemoveModulo = (moduloId: number) => {
    setFormData({
      ...formData,
      modulos: formData.modulos.filter(id => id !== moduloId)
    });
  };

  // Função para adicionar módulo na edição
  const handleAddModuloEdit = (moduloId: number) => {
    if (!editFormData.modulos.includes(moduloId)) {
      setEditFormData({
        ...editFormData,
        modulos: [...editFormData.modulos, moduloId]
      });
    }
  };

  // Função para remover módulo na edição
  const handleRemoveModuloEdit = (moduloId: number) => {
    setEditFormData({
      ...editFormData,
      modulos: editFormData.modulos.filter(id => id !== moduloId)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/usuarios/cadastro", {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        papel: formData.papel,
        tecnicoId: formData.tecnicoId ? parseInt(formData.tecnicoId) : null,
        modulos: formData.modulos,
      });
      
      await fetchData();
      
      setFormData({ nome: "", email: "", senha: "", papel: "", tecnicoId: "", modulos: [] });
      setIsModalOpen(false);
      alert("Usuário cadastrado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao cadastrar usuário:", error);
      alert(error.response?.data?.error || "Erro ao cadastrar usuário");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario);
    setEditFormData({
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      tecnicoId: usuario.tecnicoId?.toString() || "",
      modulos: usuario.modulos?.map(m => m.modulo.id) || [],
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    try {
      const updateData = {
        nome: editFormData.nome,
        email: editFormData.email,
        papel: editFormData.papel,
        tecnicoId: editFormData.tecnicoId ? parseInt(editFormData.tecnicoId) : null,
        modulos: editFormData.modulos,
      };

      await api.put(`/usuarios/${editingUser.id}`, updateData);
      
      await fetchData();
      
      setIsEditModalOpen(false);
      setEditingUser(null);
      alert("Usuário atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao editar usuário:", error);
      alert(error.response?.data?.error || "Erro ao editar usuário");
    } finally {
      setLoading(false);
    }
  };

  // Funções para redefinir senha
  const handlePasswordReset = (usuario: Usuario) => {
    setPasswordUser(usuario);
    setPasswordFormData({
      novaSenha: "",
      confirmarSenha: "",
    });
    setIsPasswordModalOpen(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData({ ...passwordFormData, [name]: value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser) return;

    // Validações
    if (passwordFormData.novaSenha !== passwordFormData.confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    if (passwordFormData.novaSenha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/usuarios/${passwordUser.id}/redefinir-senha`, {
        novaSenha: passwordFormData.novaSenha,
      });
      
      setIsPasswordModalOpen(false);
      setPasswordUser(null);
      setPasswordFormData({ novaSenha: "", confirmarSenha: "" });
      alert("Senha redefinida com sucesso!");
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      alert(error.response?.data?.error || "Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  // Função para obter todos os técnicos disponíveis (incluindo o técnico atual do usuário sendo editado)
  const getTecnicosParaEdicao = () => {
    if (!editingUser) return tecnicosDisponiveis;
    
    if (editingUser.tecnico) {
      const tecnicoAtual = editingUser.tecnico;
      const jaExisteNaLista = tecnicosDisponiveis.some(t => t.id === tecnicoAtual.id);
      
      if (!jaExisteNaLista) {
        return [...tecnicosDisponiveis, tecnicoAtual];
      }
    }
    
    return tecnicosDisponiveis;
  };

  // Função para obter módulos disponíveis para seleção (excluindo os já selecionados)
  const getModulosDisponiveisParaSelecao = (modulosSelecionados: number[]) => {
    return modulosDisponiveis.filter(modulo => !modulosSelecionados.includes(modulo.id));
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
          disabled={loading}
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
                placeholder="Buscar por nome, email ou técnico..."
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
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Técnico Associado</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Módulos</TableHead>
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
                        {usuario.tecnico ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{usuario.tecnico.nome}</span>
                            <span className="text-xs text-muted-foreground">
                              {usuario.tecnico.matricula}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Nenhum</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {usuario.tecnico?.grupo ? (
                          <Badge variant="outline">
                            {usuario.tecnico.grupo.nome}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {usuario.modulos && usuario.modulos.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {usuario.modulos.map((userModulo) => (
                              <Badge key={userModulo.id} variant="outline" className="text-xs">
                                {userModulo.modulo.nome}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Nenhum</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(usuario)}
                            disabled={loading}
                            title="Editar usuário"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePasswordReset(usuario)}
                            disabled={loading}
                            title="Redefinir senha"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(usuario.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={loading}
                            title="Excluir usuário"
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
          )}
        </CardContent>
      </Card>

      {/* Modal de Cadastro */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cadastrar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Papel</label>
                <Select 
                  name="papel" 
                  value={formData.papel} 
                  onValueChange={(value) => setFormData({ ...formData, papel: value })}
                  disabled={loading}
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
            </div>
            
            <div>
              <label className="text-sm font-medium">Técnico</label>
              <Select
                value={formData.tecnicoId || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, tecnicoId: value === "none" ? "" : value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {tecnicosDisponiveis.map((tecnico) => (
                    <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                      <div className="flex flex-col">
                        <span>{tecnico.nome}</span>
                        <span className="text-xs text-muted-foreground">
                          {tecnico.matricula} - {tecnico.grupo.nome}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Módulos */}
            <div>
              <label className="text-sm font-medium">Módulos</label>
              <div className="space-y-3">
                {/* Módulos Selecionados */}
                {formData.modulos.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Módulos selecionados:</span>
                    <div className="flex flex-wrap gap-2">
                      {formData.modulos.map((moduloId) => {
                        const modulo = modulosDisponiveis.find(m => m.id === moduloId);
                        return (
                          <Badge key={moduloId} variant="default" className="flex items-center gap-1">
                            {modulo?.nome}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => handleRemoveModulo(moduloId)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Seletor de Novos Módulos */}
                <Select
                  onValueChange={(value) => handleAddModulo(parseInt(value))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    {getModulosDisponiveisParaSelecao(formData.modulos).map((modulo) => (
                      <SelectItem key={modulo.id} value={modulo.id.toString()}>
                        <div className="flex flex-col">
                          <span>{modulo.nome}</span>
                          {modulo.descricao && (
                            <span className="text-xs text-muted-foreground">
                              {modulo.descricao}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  type="text"
                  name="nome"
                  value={editFormData.nome}
                  onChange={handleEditChange}
                  required
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Papel</label>
                <Select 
                  name="papel" 
                  value={editFormData.papel} 
                  onValueChange={(value) => setEditFormData({ ...editFormData, papel: value })}
                  disabled={loading}
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
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {getTecnicosParaEdicao().map((tecnico) => (
                      <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                        <div className="flex flex-col">
                          <span>{tecnico.nome}</span>
                          <span className="text-xs text-muted-foreground">
                            {tecnico.matricula} - {tecnico.grupo.nome}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Seleção de Módulos para Edição */}
            <div>
              <label className="text-sm font-medium">Módulos</label>
              <div className="space-y-3">
                {/* Módulos Selecionados */}
                {editFormData.modulos.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Módulos selecionados:</span>
                    <div className="flex flex-wrap gap-2">
                      {editFormData.modulos.map((moduloId) => {
                        const modulo = modulosDisponiveis.find(m => m.id === moduloId);
                        return (
                          <Badge key={moduloId} variant="default" className="flex items-center gap-1">
                            {modulo?.nome}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => handleRemoveModuloEdit(moduloId)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Seletor de Novos Módulos */}
                <Select
                  onValueChange={(value) => handleAddModuloEdit(parseInt(value))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    {getModulosDisponiveisParaSelecao(editFormData.modulos).map((modulo) => (
                      <SelectItem key={modulo.id} value={modulo.id.toString()}>
                        <div className="flex flex-col">
                          <span>{modulo.nome}</span>
                          {modulo.descricao && (
                            <span className="text-xs text-muted-foreground">
                              {modulo.descricao}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Redefinir Senha */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Redefinindo senha para: <strong>{passwordUser?.nome}</strong>
            </p>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nova Senha</label>
              <Input
                type="password"
                name="novaSenha"
                value={passwordFormData.novaSenha}
                onChange={handlePasswordChange}
                required
                minLength={6}
                disabled={loading}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Confirmar Nova Senha</label>
              <Input
                type="password"
                name="confirmarSenha"
                value={passwordFormData.confirmarSenha}
                onChange={handlePasswordChange}
                required
                minLength={6}
                disabled={loading}
                placeholder="Confirme a nova senha"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
                disabled={loading}
              >
                {loading ? "Redefinindo..." : "Redefinir Senha"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}