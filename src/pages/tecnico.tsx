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

interface Tecnico {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    grupoId?: string;
    grupoNome?: string;
    cpf: string;
    matricula: string;
    admissao: string;
    telegramChatId?: string;
}

interface Grupo {
    id: string;
    nome: string;
}

interface FormData {
    nome: string;
    email: string;
    telefone: string;
    grupoId: string;
    cpf: string;
    matricula: string;
    admissao: string;
    telegramChatId: string;
}

export default function Tecnicos() {
    const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterGrupo, setFilterGrupo] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTecnico, setEditingTecnico] = useState<Tecnico | null>(null);
    const [formData, setFormData] = useState<FormData>({
        nome: "",
        email: "",
        telefone: "",
        grupoId: "",
        cpf: "",
        matricula: "",
        admissao: "",
        telegramChatId: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tecnicosResponse, gruposResponse] = await Promise.all([
                    api.get("/tecnicos", { withCredentials: true }),
                    api.get("/grupos-manutencao", { withCredentials: true }),
                ]);
                setTecnicos(tecnicosResponse.data);
                setGrupos(gruposResponse.data);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (editingTecnico) {
            setFormData({
                nome: editingTecnico.nome || "",
                email: editingTecnico.email || "",
                telefone: editingTecnico.telefone || "",
                grupoId: editingTecnico.grupoId ? String(editingTecnico.grupoId) : "",
                cpf: editingTecnico.cpf || "",
                matricula: editingTecnico.matricula || "",
                admissao: editingTecnico.admissao ? editingTecnico.admissao.slice(0, 10) : "",
                telegramChatId: editingTecnico.telegramChatId || "",
            });
        } else {
            setFormData({
                nome: "",
                email: "",
                telefone: "",
                grupoId: "",
                cpf: "",
                matricula: "",
                admissao: "",
                telegramChatId: "",
            });
        }
    }, [editingTecnico]);

    const filteredTecnicos = tecnicos.filter((tecnico) => {
        const matchesSearch =
            tecnico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tecnico.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tecnico.cpf.includes(searchTerm) ||
            tecnico.matricula.includes(searchTerm);

        const matchesGrupo = filterGrupo === "all" || tecnico.grupoId === filterGrupo;

        return matchesSearch && matchesGrupo;
    });
    const uniqueGrupos = [...new Set(
        tecnicos.map(t => t.grupoId).filter(Boolean).map(String)
    )];

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir este técnico?")) {
            try {
                await api.delete(`/tecnicos/${id}`, { withCredentials: true });
                setTecnicos(tecnicos.filter((tec) => tec.id !== id));
            } catch (error) {
                console.error("Erro ao excluir técnico:", error);
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
                email: formData.email,
                telefone: formData.telefone,
                grupoId: formData.grupoId ? Number(formData.grupoId) : null,
                cpf: formData.cpf,
                matricula: formData.matricula,
                admissao: formData.admissao ? new Date(formData.admissao).toISOString() : null,
                telegramChatId: formData.telegramChatId || null,
            };

            if (editingTecnico?.id) {
                const response = await api.put(`/tecnicos/${editingTecnico.id}`, payload, {
                    withCredentials: true,
                });
                setTecnicos(tecnicos.map((tec) => (tec.id === editingTecnico.id ? response.data : tec)));
            } else {
                const response = await api.post("/tecnicos", payload, { withCredentials: true });
                setTecnicos([...tecnicos, response.data]);
            }

            setFormData({
                nome: "",
                email: "",
                telefone: "",
                grupoId: "",
                cpf: "",
                matricula: "",
                admissao: "",
                telegramChatId: "",
            });
            setEditingTecnico(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao salvar técnico:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Técnicos</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie os técnicos do sistema
                    </p>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    onClick={() => {
                        setEditingTecnico(null);
                        setIsModalOpen(true);
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Técnico
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
                                placeholder="Buscar por nome, email, CPF ou matrícula..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterGrupo} onValueChange={setFilterGrupo}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por grupo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os grupos</SelectItem>
                                {uniqueGrupos.map((grupoId) => {
                                    const grupo = grupos.find((g) => String(g.id) === String(grupoId));
                                    return (
                                        <SelectItem key={String(grupoId)} value={String(grupoId)}>
                                            {grupo?.nome || String(grupoId)}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                                setFilterGrupo("all");
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
                        Lista de Técnicos ({filteredTecnicos.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>CPF</TableHead>
                                    <TableHead>Matrícula</TableHead>
                                    <TableHead>Grupo</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTecnicos.map((tecnico) => (
                                    <TableRow key={tecnico.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">{tecnico.nome}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {tecnico.email}
                                        </TableCell>
                                        <TableCell className="text-sm">{tecnico.telefone}</TableCell>
                                        <TableCell className="font-mono text-sm">{tecnico.cpf}</TableCell>
                                        <TableCell className="text-sm">{tecnico.matricula}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{tecnico.grupo?.nome || "Nenhum"}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingTecnico(tecnico);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(tecnico.id)}
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
                if (!open) setEditingTecnico(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTecnico ? "Editar Técnico" : "Cadastrar Técnico"}</DialogTitle>
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
                            <label className="text-sm font-medium">Telefone</label>
                            <Input
                                type="text"
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">CPF</label>
                            <Input
                                type="text"
                                name="cpf"
                                value={formData.cpf}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Matrícula</label>
                            <Input
                                type="text"
                                name="matricula"
                                value={formData.matricula}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Data de Admissão</label>
                            <Input
                                type="date"
                                name="admissao"
                                value={formData.admissao}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Grupo</label>
                            <Select
                                name="grupoId"
                                value={formData.grupoId || "none"}
                                onValueChange={(v) =>
                                    setFormData({ ...formData, grupoId: v === "none" ? "" : v })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um grupo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhum</SelectItem>
                                    {grupos.map((grupo) => (
                                        <SelectItem key={grupo.id} value={String(grupo.id)}>
                                            {grupo.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Telegram Chat ID</label>
                            <Input
                                type="text"
                                name="telegramChatId"
                                value={formData.telegramChatId}
                                onChange={handleChange}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingTecnico(null);
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