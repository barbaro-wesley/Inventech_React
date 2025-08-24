import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
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
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import api from "@/lib/api";

interface Localizacao {
    id: string;
    nome: string;
    setorId: string;
    setorNome?: string;
}

interface Setor {
    id: string;
    nome: string;
}

interface FormData {
    nome: string;
    setorId: string;
}

export default function Localizacoes() {
    const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
    const [setores, setSetores] = useState<Setor[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocalizacao, setEditingLocalizacao] = useState<Localizacao | null>(null);
    const [formData, setFormData] = useState<FormData>({ nome: "", setorId: "" });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [localizacoesResponse, setoresResponse] = await Promise.all([
                    api.get("/localizacao", { withCredentials: true }),
                    api.get("/setor", { withCredentials: true }),
                ]);
                setLocalizacoes(localizacoesResponse.data);
                setSetores(setoresResponse.data);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (editingLocalizacao) {
            setFormData({
                nome: editingLocalizacao.nome,
                setorId: editingLocalizacao.setorId ? String(editingLocalizacao.setorId) : "",
            });
        } else {
            setFormData({ nome: "", setorId: "" });
        }
    }, [editingLocalizacao]);

    const filteredLocalizacoes = localizacoes.filter((localizacao) =>
        localizacao.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir esta localização?")) {
            try {
                await api.delete(`/localizacao/${id}`, { withCredentials: true });
                setLocalizacoes(localizacoes.filter((loc) => loc.id !== id));
            } catch (error) {
                console.error("Erro ao excluir localização:", error);
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
            const payload = {
                nome: formData.nome,
                setorId: formData.setorId ? Number(formData.setorId) : null,
            };

            if (editingLocalizacao?.id) {
                const response = await api.put(`/localizacao/${editingLocalizacao.id}`, payload, {
                    withCredentials: true,
                });
                setLocalizacoes(
                    localizacoes.map((loc) => (loc.id === editingLocalizacao.id ? response.data : loc))
                );
            } else {
                const response = await api.post("/localizacao", payload, {
                    withCredentials: true,
                });
                setLocalizacoes([...localizacoes, response.data]);
            }

            setFormData({ nome: "", setorId: "" });
            setEditingLocalizacao(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao salvar localização:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Localizações</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie as localizações do sistema
                    </p>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    onClick={() => {
                        setEditingLocalizacao(null);
                        setIsModalOpen(true);
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Localização
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
                        Lista de Localizações ({filteredLocalizacoes.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Setor</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLocalizacoes.map((localizacao) => (
                                    <TableRow key={localizacao.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">{localizacao.nome}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {localizacao.setor?.nome || "Nenhum"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingLocalizacao(localizacao);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(localizacao.id)}
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
                if (!open) setEditingLocalizacao(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingLocalizacao ? "Editar Localização" : "Cadastrar Localização"}</DialogTitle>
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
                            <label className="text-sm font-medium">Setor</label>
                            <Select
                                value={formData.setorId || "none"}
                                onValueChange={(v) =>
                                    setFormData({ ...formData, setorId: v === "none" ? "" : v })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um setor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhum</SelectItem>
                                    {setores.map((setor) => (
                                        <SelectItem key={setor.id} value={String(setor.id)}>
                                            {setor.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingLocalizacao(null);
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