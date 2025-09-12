import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import api from '@/lib/api';

interface TipoEquipamento {
  id: string;
  nome: string;
}

interface GrupoManutencao {
  id: string;
  nome: string;
  descricao?: string;
  tipos?: TipoEquipamento[];
}

interface FormData {
  nome: string;
  descricao: string;
  tiposIds: string[];
}

export default function GrupoManutencao() {
  const [grupos, setGrupos] = useState<GrupoManutencao[]>([]);
  const [tiposOptions, setTiposOptions] = useState<TipoEquipamento[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGrupo, setEditingGrupo] = useState<GrupoManutencao | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    descricao: '',
    tiposIds: [],
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 10;

  // Fetch grupos
  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const response = await api.get('/grupos-manutencao', { withCredentials: true });
        setGrupos(response.data);
      } catch (error) {
        console.error('Erro ao buscar grupos de manutenção:', error);
      }
    };
    fetchGrupos();
  }, []);

  // Fetch tipos for form
  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const response = await api.get('/tipos-equipamento', { withCredentials: true });
        setTiposOptions(response.data);
      } catch (error) {
        console.error('Erro ao buscar tipos de equipamento:', error);
      }
    };
    fetchTipos();
  }, []);

  // Update form data when editing
  useEffect(() => {
    if (editingGrupo) {
      setFormData({
        nome: editingGrupo.nome,
        descricao: editingGrupo.descricao || '',
        tiposIds: editingGrupo.tipos?.map((tipo) => tipo.id) || [],
      });
    } else {
      setFormData({ nome: '', descricao: '', tiposIds: [] });
    }
  }, [editingGrupo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
    setFormData({ ...formData, tiposIds: selectedOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao || null,
        tiposIds: formData.tiposIds.map(Number),
      };

      if (editingGrupo?.id) {
        const response = await api.put(`/grupos-manutencao/${editingGrupo.id}`, payload, {
          withCredentials: true,
        });
        setGrupos(grupos.map((grupo) => (grupo.id === editingGrupo.id ? response.data : grupo)));
      } else {
        const response = await api.post('/grupos-manutencao', payload, {
          withCredentials: true,
        });
        setGrupos([...grupos, response.data]);
      }

      setFormData({ nome: '', descricao: '', tiposIds: [] });
      setEditingGrupo(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar grupo de manutenção:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este grupo de manutenção?')) {
      try {
        await api.delete(`/grupos-manutencao/${id}`, { withCredentials: true });
        setGrupos(grupos.filter((grupo) => grupo.id !== id));
      } catch (error) {
        console.error('Erro ao excluir grupo de manutenção:', error);
      }
    }
  };

  const handleEdit = (grupo: GrupoManutencao) => {
    setEditingGrupo(grupo);
    setIsModalOpen(true);
  };

  // Pagination
  const totalPages = Math.ceil(grupos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = grupos.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const filteredGrupos = grupos.filter((grupo) =>
    grupo.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Grupos de Manutenção</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os grupos de manutenção do sistema
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          onClick={() => {
            setEditingGrupo(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              Limpar Filtro
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Grupos de Manutenção ({filteredGrupos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipos de Equipamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((grupo) => (
                  <TableRow key={grupo.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{grupo.nome}</TableCell>
                    <TableCell>{grupo.descricao || '-'}</TableCell>
                    <TableCell>
                      {grupo.tipos?.length > 0 ? grupo.tipos.map((tipo) => tipo.nome).join(', ') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(grupo)}
                        className="mr-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(grupo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingGrupo(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGrupo ? 'Editar Grupo de Manutenção' : 'Cadastrar Grupo de Manutenção'}
            </DialogTitle>
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
              <label className="text-sm font-medium">Descrição</label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipos de Equipamento</label>
              <select
                multiple
                name="tiposIds"
                value={formData.tiposIds}
                onChange={handleMultiSelectChange}
                className="w-full border rounded-md px-3 py-2"
              >
                {tiposOptions.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingGrupo(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}