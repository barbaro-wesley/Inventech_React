import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import api from "@/lib/api";

interface Setor {
  id: string;
  nome: string;
}

interface FormData {
  nome: string;
}

export default function Setores() {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetor, setEditingSetor] = useState<Setor | null>(null);
  const [formData, setFormData] = useState<FormData>({ nome: "" });

  useEffect(() => {
    const fetchSetores = async () => {
      try {
        const response = await api.get("/setor", { withCredentials: true });
        setSetores(response.data);
      } catch (error) {
        console.error("Erro ao buscar setores:", error);
      }
    };
    fetchSetores();
  }, []);

  useEffect(() => {
    if (editingSetor) {
      setFormData({ nome: editingSetor.nome });
    } else {
      setFormData({ nome: "" });
    }
  }, [editingSetor]);

  const filteredSetores = setores.filter((setor) =>
    setor.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este setor?")) {
      try {
        await api.delete(`/setor/${id}`, { withCredentials: true });
        setSetores(setores.filter((setor) => setor.id !== id));
      } catch (error) {
        console.error("Erro ao excluir setor:", error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { nome: formData.nome };

      if (editingSetor?.id) {
        const response = await api.put(`/setor/${editingSetor.id}`, payload, {
          withCredentials: true,
        });
        setSetores(setores.map((setor) => (setor.id === editingSetor.id ? response.data : setor)));
      } else {
        const response = await api.post("/setor", payload, {
          withCredentials: true,
        });
        setSetores([...setores, response.data]);
      }

      setFormData({ nome: "" });
      setEditingSetor(null);
      setIsModalOpen(false);
    } catch (error) {
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Setores</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os setores do sistema
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          onClick={() => {
            setEditingSetor(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Setor
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
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
            >
              Limpar Filtro
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Setores ({filteredSetores.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSetores.map((setor) => (
                  <TableRow key={setor.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{setor.nome}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingSetor(setor);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(setor.id)}
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

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) setEditingSetor(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSetor ? "Editar Setor" : "Cadastrar Setor"}</DialogTitle>
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSetor(null);
                }}
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
    </div>
  );
}