// src/pages/SobreAvisoPage.tsx
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
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import SobreAvisoForm from "@/components/forms/SobreAvisoForm";
interface SobreAviso {
    id: number;
    data: string;
    horaInicio: string;
    horaFim: string;
    motivo: string;
    aSerFeito: string;
    observacoes?: string;
}

export default function SobreAvisoPage() {
    const { toast } = useToast();
    const [sobreAvisos, setSobreAvisos] = useState<SobreAviso[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedSobreAviso, setSelectedSobreAviso] = useState<SobreAviso | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get('/sobreaviso', { withCredentials: true });
                setSobreAvisos(response.data);
            } catch (error) {
                console.error('Erro ao buscar sobre avisos:', error);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleAddClick = () => {
        setSelectedSobreAviso(null);
        setShowForm(true);
    };

    const handleEditClick = (item: SobreAviso) => {
        setSelectedSobreAviso(item);
        setShowForm(true);
    };

    const handleFormSubmit = (data: SobreAviso) => {
        if (selectedSobreAviso?.id) {
            setSobreAvisos(prev => prev.map(p => p.id === data.id ? data : p));
        } else {
            setSobreAvisos([...sobreAvisos, data]);
        }
        setShowForm(false);
        setSelectedSobreAviso(null);
    };
    function parseIsoParts(iso?: string) {
        if (!iso) return null;
        const clean = iso.replace(/Z$/, ""); // tira o UTC
        const [d, t] = clean.split("T");
        if (!d || !t) return null;

        const [Y, M, D] = d.split("-");
        const [h, m] = t.split(":");
        const s = t.split(":")[2]?.slice(0, 2) ?? "00"; // segundos, se precisar
        return { Y, M, D, h, m, s };
    }

    function formatDBDate(iso?: string) {
        const p = parseIsoParts(iso);
        if (!p) return "-";
        return `${p.D}/${p.M}/${p.Y}`; // DD/MM/AAAA
    }

    function formatDBTime(iso?: string, withSeconds = false) {
        const p = parseIsoParts(iso);
        if (!p) return "-";
        return withSeconds ? `${p.h}:${p.m}:${p.s}` : `${p.h}:${p.m}`; // HH:mm
    }
    const handleDelete = async (id: number) => {
        if (confirm("Tem certeza que deseja excluir este sobre aviso?")) {
            try {
                await api.delete(`/sobreaviso/${id}`, { withCredentials: true });
                setSobreAvisos(sobreAvisos.filter(emp => emp.id !== id));
                toast({
                    title: "Sucesso",
                    description: "Sobre Aviso excluído com sucesso!",
                });
            } catch (error) {
                toast({
                    title: "Erro",
                    description: "Não foi possível excluir o sobre aviso.",
                    variant: "destructive",
                });
            }
        }
    };

    const filteredSobreAvisos = sobreAvisos.filter((item) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
            item.motivo.toLowerCase().includes(lowerSearch) ||
            item.aSerFeito.toLowerCase().includes(lowerSearch) ||
            (item.observacoes?.toLowerCase().includes(lowerSearch) || false)
        );
    });

    const totalPages = Math.ceil(filteredSobreAvisos.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSobreAvisos.slice(indexOfFirstItem, indexOfLastItem);

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Gestão de Sobre Avisos</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie os sobre avisos
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg" onClick={handleAddClick}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Sobre Aviso
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
                                placeholder="Buscar por motivo, a ser feito ou observações..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                            }}
                        >
                            Limpar Filtro
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-medium">
                <CardHeader>
                    <CardTitle className="text-lg">
                        Lista de Sobre Avisos ({filteredSobreAvisos.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Hora Início</TableHead>
                                    <TableHead>Hora Fim</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead>A Ser Feito</TableHead>
                                    <TableHead>Observações</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">{formatDBDate(item.data)}</TableCell>
                                        <TableCell>{formatDBTime(item.horaInicio)}</TableCell>
                                        <TableCell>{formatDBTime(item.horaFim)}</TableCell>
                                        <TableCell>{item.motivo}</TableCell>
                                        <TableCell>{item.aSerFeito}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {item.observacoes || "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(item.id)}
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
                    <div className="flex items-center justify-between mt-4">
                        <Button
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={goToPrevPage}
                        >
                            Anterior
                        </Button>
                        <span>
                            Página {currentPage} de {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={currentPage === totalPages}
                            onClick={goToNextPage}
                        >
                            Próxima
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <SobreAvisoForm
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    setSelectedSobreAviso(null);
                }}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}