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

interface TipoEquipamento {
  id: string;
  nome: string;
}

interface FormData {
  nome: string;
}

export default function TiposEquipamento() {
  const [tipos, setTipos] = useState<TipoEquipamento[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoEquipamento | null>(null);
  const [formData, setFormData] = useState<FormData>({ nome: "" });

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const response = await api.get("/tipos-equipamento", { withCredentials: true });
        setTipos(response.data);
      } catch (error) {
        console.error("Erro ao buscar tipos de equipamento:", error);
      }
    };
    fetchTipos();
  }, []);

  useEffect(() => {
    if (editingTipo) {
      setFormData({ nome: editingTipo.nome });
    } else {
      setFormData({ nome: "" });
    }
  }, [editingTipo]);

  const filteredTipos = tipos.filter((tipo) =>
    tipo.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este tipo de equipamento?")) {
      try {
        await api.delete(`/tipos-equipamento/${id}`, { withCredentials: true });
        setTipos(tipos.filter((tipo) => tipo.id !== id));
      } catch (error) {
        console.error("Erro ao excluir tipo de equipamento:", error);
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

      if (editingTipo?.id) {
        const response = await api.put(`/tipos-equipamento/${editingTipo.id}`, payload, {
          withCredentials: true,
        });
        setTipos(tipos.map((tipo) => (tipo.id === editingTipo.id ? response.data : tipo)));
      } else {
        const response = await api.post("/tipos-equipamento", payload, {
          withCredentials: true,
        });
        setTipos([...tipos, response.data]);
      }

      setFormData({ nome: "" });
      setEditingTipo(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar tipo de equipamento:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tipos de Equipamento</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os tipos de equipamento do sistema
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          onClick={() => {
            setEditingTipo(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Tipo
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
            Lista de Tipos de Equipamento ({filteredTipos.length})
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
                {filteredTipos.map((tipo) => (
                  <TableRow key={tipo.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{tipo.nome}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTipo(tipo);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tipo.id)}
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
        if (!open) setEditingTipo(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTipo ? "Editar Tipo de Equipamento" : "Cadastrar Tipo de Equipamento"}</DialogTitle>
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
                  setEditingTipo(null);
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