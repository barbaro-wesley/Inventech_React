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
    cpf: Herr;
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
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Técnicos</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Gerencie os técnicos do sistema
                    </p>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
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
                    <CardTitle className="text-base sm:text-lg">Filtros de Busca</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome, email, CPF ou matrícula..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 text-sm"
                            />
                        </div>
                        <Select value={filterGrupo} onValueChange={setFilterGrupo}>
                            <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Filtrar por grupo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-sm">Todos os grupos</SelectItem>
                                {uniqueGrupos.map((grupoId) => {
                                    const grupo = grupos.find((g) => String(g.id) === String(grupoId));
                                    return (
                                        <SelectItem key={String(grupoId)} value={String(grupoId)} className="text-sm">
                                            {grupo?.nome || String(grupoId)}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-sm"
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
                    <CardTitle className="text-base sm:text-lg">
                        Lista de Técnicos ({filteredTecnicos.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                    <div className="overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs sm:text-sm">Nome</TableHead>
                                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Email</TableHead>
                                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Telefone</TableHead>
                                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">CPF</TableHead>
                                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Matrícula</TableHead>
                                    <TableHead className="text-xs sm:text-sm">Grupo</TableHead>
                                    <TableHead className="text-xs sm:text-sm text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTecnicos.map((tecnico) => (
                                    <TableRow key={tecnico.id} className="hover:bg-muted/50 block sm:table-row">
                                        <TableCell className="font-medium text-xs sm:text-sm block sm:table-cell">
                                            <span className="sm:hidden font-bold">Nome: </span>{tecnico.nome}
                                        </TableCell>
                                        <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                                            <span className="sm:hidden font-bold">Email: </span>{tecnico.email}
                                        </TableCell>
                                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                                            <span className="md:hidden font-bold">Telefone: </span>{tecnico.telefone}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs sm:text-sm hidden lg:table-cell">
                                            <span className="lg:hidden font-bold">CPF: </span>{tecnico.cpf}
                                        </TableCell>
                                        <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                                            <span className="lg:hidden font-bold">Matrícula: </span>{tecnico.matricula}
                                        </TableCell>
                                        <TableCell className="text-xs sm:text-sm">
                                            <span className="sm:hidden font-bold">Grupo: </span>
                                            <Badge variant="outline">{tecnico.grupo?.nome || "Nenhum"}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-xs sm:text-sm block sm:table-cell">
                                            <span className="sm:hidden font-bold block mb-1">Ações: </span>
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="min-w-[60px] px-1 sm:px-2 text-xs sm:text-sm"
                                                    onClick={() => {
                                                        setEditingTecnico(tecnico);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <Edit className="w-3 sm:w-4 h-3 sm:h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="min-w-[60px] px-1 sm:px-2 text-xs sm:text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(tecnico.id)}
                                                >
                                                    <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
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
                <DialogContent className="w-full max-w-[90vw] sm:max-w-[500px] p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">
                            {editingTecnico ? "Editar Técnico" : "Cadastrar Técnico"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <div>
                            <label className="text-xs sm:text-sm font-medium">Nome</label>
                            <Input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                required
                                className="text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium">Telefone</label>
                            <Input
                                type="text"
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleChange}
                                required
                                className="text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium">CPF</label>
                            <Input
                                type="text"
                                name="cpf"
                                value={formData.cpf}
                                onChange={handleChange}
                                required
                                className="text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium">Matrícula</label>
                            <Input
                                type="text"
                                name="matricula"
                                value={formData.matricula}
                                onChange={handleChange}
                                required
                                className="text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium">Data de Admissão</label>
                            <Input
                                type="date"
                                name="admissao"
                                value={formData.admissao}
                                onChange={handleChange}
                                required
                                className="text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium">Grupo</label>
                            <Select
                                name="grupoId"
                                value={formData.grupoId || "none"}
                                onValueChange={(v) =>
                                    setFormData({ ...formData, grupoId: v === "none" ? "" : v })
                                }
                            >
                                <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Selecione um grupo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none" className="text-sm">Nenhum</SelectItem>
                                    {grupos.map((grupo) => (
                                        <SelectItem key={grupo.id} value={String(grupo.id)} className="text-sm">
                                            {grupo.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium">Telegram Chat ID</label>
                            <Input
                                type="text"
                                name="telegramChatId"
                                value={formData.telegramChatId}
                                onChange={handleChange}
                                className="text-sm"
                            />
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="min-w-[60px] px-2 sm:px-3 rounded-md text-xs sm:text-sm"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingTecnico(null);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                className="min-w-[60px] px-2 sm:px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
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