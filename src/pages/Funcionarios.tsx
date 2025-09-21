import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from '@/lib/api';

// Tipos baseados na documentação da API
interface Setor {
  id: number;
  nome: string;
}

interface Employee {
  id: number;
  nome: string;
  cpf: string;
  cargo: string;
  setorId: number;
  email: string;
  telefone: string;
  createdAt: string;
  updatedAt: string;
  setor: Setor;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
}

interface ApiError {
  error: string;
}

// Form data para criar/editar funcionário
interface EmployeeFormData {
  nome: string;
  cpf: string;
  cargo: string;
  setorId: string;
  email: string;
  telefone: string;
}

export default function Funcionarios() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCargo, setFilterCargo] = useState("all");
  const [filterSetor, setFilterSetor] = useState("all");
  const [error, setError] = useState<string | null>(null);
  
  // Estados para os modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Estados para os setores (para os selects)
  const [setores, setSetores] = useState<Setor[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<EmployeeFormData>({
    nome: '',
    cpf: '',
    cargo: '',
    setorId: '',
    email: '',
    telefone: ''
  });

  // Carregar setores da API
  const loadSetores = async () => {
    try {
      const response = await api.get<Setor[]>('/setor');
      setSetores(response.data); // A resposta é diretamente um array
    } catch (error: any) {
      console.error('Erro ao carregar setores:', error);
      // Se não conseguir carregar setores, usa os dos funcionários existentes
      const uniqueSetoresFromEmployees = employees.reduce((acc: Setor[], emp) => {
        if (!acc.find(s => s.id === emp.setor.id)) {
          acc.push(emp.setor);
        }
        return acc;
      }, []);
      setSetores(uniqueSetoresFromEmployees);
    }
  };

  // Carregar funcionários da API
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Monta query params para filtros
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('nome', searchTerm);
      }
      if (filterSetor !== 'all') {
        params.append('setorId', filterSetor);
      }
      if (filterCargo !== 'all') {
        params.append('cargo', filterCargo);
      }

      const queryString = params.toString();
      const endpoint = `/funcionarios${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get<ApiResponse<Employee[]>>(endpoint);
      setEmployees(response.data.data);
    } catch (error: any) {
      setError(error.response?.data?.error || error.message || 'Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  // Carregar funcionários quando o componente monta ou filtros mudam
  useEffect(() => {
    loadEmployees();
    loadSetores();
  }, []);

  // Aplicar filtros localmente (ou recarregar da API se preferir)
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = searchTerm === '' || (
      employee.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.cpf.includes(searchTerm) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesCargo = filterCargo === "all" || employee.cargo === filterCargo;
    const matchesSetor = filterSetor === "all" || employee.setor.id.toString() === filterSetor;

    return matchesSearch && matchesCargo && matchesSetor;
  });

  // Extrair valores únicos para os filtros
  const uniqueCargos = [...new Set(employees.map((emp) => emp.cargo))];
  // Use os setores da API ao invés de extrair dos funcionários
  const uniqueSetores = setores;

  // Função para deletar funcionário
  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este funcionário?")) {
      return;
    }

    try {
      await api.delete(`/funcionarios/${id}`);

      // Remove o funcionário da lista local
      setEmployees(employees.filter((emp) => emp.id !== id));
      
      // Ou recarrega a lista da API
      // await loadEmployees();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Erro ao excluir funcionário');
    }
  };

  // Função para buscar com debounce
  const handleSearch = () => {
    loadEmployees();
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setFilterCargo("all");
    setFilterSetor("all");
    // Recarrega sem filtros
    setTimeout(() => loadEmployees(), 100);
  };

  // Limpar e resetar form
  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      cargo: '',
      setorId: '',
      email: '',
      telefone: ''
    });
    setEditingEmployee(null);
  };

  // Abrir modal de criação
  const handleCreateClick = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  // Abrir modal de edição
  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      nome: employee.nome,
      cpf: employee.cpf,
      cargo: employee.cargo,
      setorId: employee.setorId.toString(),
      email: employee.email,
      telefone: employee.telefone
    });
    setIsEditModalOpen(true);
  };

  // Criar funcionário
  const handleCreateEmployee = async () => {
    if (!formData.nome || !formData.cpf || !formData.email) {
      alert('Nome, CPF e email são obrigatórios');
      return;
    }

    try {
      setFormLoading(true);
      const response = await api.post<ApiResponse<Employee>>('/funcionarios', {
        ...formData,
        setorId: parseInt(formData.setorId)
      });
      
      // Adiciona o novo funcionário à lista
      setEmployees([...employees, response.data.data]);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Erro ao criar funcionário');
    } finally {
      setFormLoading(false);
    }
  };

  // Atualizar funcionário
  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;
    
    if (!formData.nome || !formData.cpf || !formData.email) {
      alert('Nome, CPF e email são obrigatórios');
      return;
    }

    try {
      setFormLoading(true);
      const response = await api.put<ApiResponse<Employee>>(`/funcionarios/${editingEmployee.id}`, {
        ...formData,
        setorId: parseInt(formData.setorId)
      });
      
      // Atualiza o funcionário na lista
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id ? response.data.data : emp
      ));
      setIsEditModalOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Erro ao atualizar funcionário');
    } finally {
      setFormLoading(false);
    }
  };

  // Fechar modais
  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    resetForm();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Funcionários</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os funcionários da empresa
            </p>
          </div>
        </div>
        
        <Card className="shadow-medium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">Erro: {error}</p>
              <Button onClick={loadEmployees}>
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Funcionários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os funcionários da empresa
          </p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover shadow-medium" onClick={handleCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCargo} onValueChange={setFilterCargo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cargos</SelectItem>
                {uniqueCargos.map((cargo) => (
                  <SelectItem key={cargo} value={cargo}>
                    {cargo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSetor} onValueChange={setFilterSetor}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os setores</SelectItem>
                {uniqueSetores.map((setor) => (
                  <SelectItem key={setor.id} value={setor.id.toString()}>
                    {setor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Funcionários ({filteredEmployees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando funcionários...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum funcionário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{employee.nome}</TableCell>
                        <TableCell className="font-mono text-sm">{employee.cpf}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{employee.cargo}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{employee.setor.nome}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {employee.email}
                        </TableCell>
                        <TableCell className="text-sm">{employee.telefone}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(employee)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(employee.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Funcionário</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo funcionário
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="funcionario@empresa.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                  placeholder="Ex: Operador"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="setorId">Setor</Label>
              <Select value={formData.setorId} onValueChange={(value) => setFormData({...formData, setorId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {setores && setores.length > 0 ? setores.map((setor) => (
                    <SelectItem key={setor.id} value={setor.id.toString()}>
                      {setor.nome}
                    </SelectItem>
                  )) : (
                    <SelectItem value="" disabled>Carregando setores...</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>
              Cancelar
            </Button>
            <Button onClick={handleCreateEmployee} disabled={formLoading}>
              {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar Funcionário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Funcionário</DialogTitle>
            <DialogDescription>
              Atualize os dados do funcionário
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-nome">Nome *</Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="edit-cpf">CPF *</Label>
                <Input
                  id="edit-cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="funcionario@empresa.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-cargo">Cargo</Label>
                <Input
                  id="edit-cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                  placeholder="Ex: Operador"
                />
              </div>
              <div>
                <Label htmlFor="edit-telefone">Telefone</Label>
                <Input
                  id="edit-telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-setorId">Setor</Label>
              <Select value={formData.setorId} onValueChange={(value) => setFormData({...formData, setorId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {setores && setores.length > 0 ? setores.map((setor) => (
                    <SelectItem key={setor.id} value={setor.id.toString()}>
                      {setor.nome}
                    </SelectItem>
                  )) : (
                    <SelectItem value="" disabled>Carregando setores...</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateEmployee} disabled={formLoading}>
              {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Atualizar Funcionário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}