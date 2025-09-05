import { useState } from "react";
import { DocumentosLayout } from "@/components/layouts/DocumentosLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Search, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegistroEntrega {
  id: string;
  funcionario: {
    nome: string;
    matricula: string;
    cpf: string;
    setor: string;
    funcao: string;
  };
  epi: {
    nome: string;
    tipo: string;
    marca: string;
    modelo: string;
    certificadoCA: string;
    quantidade: number;
    condicao: string;
  };
  entrega: {
    dataEntrega: string;
    responsavelEntrega: string;
    motivo: string;
    observacoes?: string;
    assinaturaFuncionario: boolean;
    assinaturaResponsavel: boolean;
  };
}

export default function RegistroEntregaEPI() {
  const { toast } = useToast();
  const [registros, setRegistros] = useState<RegistroEntrega[]>([
    {
      id: "1",
      funcionario: {
        nome: "João Silva",
        matricula: "12345",
        cpf: "123.456.789-00",
        setor: "Produção",
        funcao: "Operador"
      },
      epi: {
        nome: "Capacete Branco",
        tipo: "Capacete de Segurança",
        marca: "3M",
        modelo: "H-700",
        certificadoCA: "31469",
        quantidade: 1,
        condicao: "Novo"
      },
      entrega: {
        dataEntrega: "2024-01-15",
        responsavelEntrega: "Maria Santos",
        motivo: "Primeira entrega",
        observacoes: "EPI em perfeitas condições",
        assinaturaFuncionario: true,
        assinaturaResponsavel: true
      }
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSetor, setFilterSetor] = useState("");
  const [formData, setFormData] = useState({
    funcionarioNome: "",
    funcionarioMatricula: "",
    funcionarioCpf: "",
    funcionarioSetor: "",
    funcionarioFuncao: "",
    epiNome: "",
    epiTipo: "",
    epiMarca: "",
    epiModelo: "",
    epiCA: "",
    epiQuantidade: 1,
    epiCondicao: "Novo",
    dataEntrega: new Date().toISOString().split('T')[0],
    responsavelEntrega: "",
    motivo: "",
    observacoes: ""
  });

  const setores = ["Produção", "Manutenção", "Administração", "Segurança", "Limpeza"];
  const epis = [
    { nome: "Capacete Branco", tipo: "Capacete de Segurança", marca: "3M", modelo: "H-700", ca: "31469" },
    { nome: "Luva Látex", tipo: "Luva de Proteção", marca: "Uvex", modelo: "60570", ca: "28931" }
  ];
  const condicoes = ["Novo", "Substituição", "Devolução"];
  const motivos = ["Primeira entrega", "Reposição por desgaste", "Troca de tamanho", "Perda/Extravio", "Devolução"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novoRegistro: RegistroEntrega = {
      id: Date.now().toString(),
      funcionario: {
        nome: formData.funcionarioNome,
        matricula: formData.funcionarioMatricula,
        cpf: formData.funcionarioCpf,
        setor: formData.funcionarioSetor,
        funcao: formData.funcionarioFuncao
      },
      epi: {
        nome: formData.epiNome,
        tipo: formData.epiTipo,
        marca: formData.epiMarca,
        modelo: formData.epiModelo,
        certificadoCA: formData.epiCA,
        quantidade: formData.epiQuantidade,
        condicao: formData.epiCondicao
      },
      entrega: {
        dataEntrega: formData.dataEntrega,
        responsavelEntrega: formData.responsavelEntrega,
        motivo: formData.motivo,
        observacoes: formData.observacoes,
        assinaturaFuncionario: true,
        assinaturaResponsavel: true
      }
    };

    setRegistros(prev => [...prev, novoRegistro]);
    toast({
      title: "Entrega registrada",
      description: "O registro de entrega foi salvo com sucesso.",
    });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      funcionarioNome: "",
      funcionarioMatricula: "",
      funcionarioCpf: "",
      funcionarioSetor: "",
      funcionarioFuncao: "",
      epiNome: "",
      epiTipo: "",
      epiMarca: "",
      epiModelo: "",
      epiCA: "",
      epiQuantidade: 1,
      epiCondicao: "Novo",
      dataEntrega: new Date().toISOString().split('T')[0],
      responsavelEntrega: "",
      motivo: "",
      observacoes: ""
    });
    setIsDialogOpen(false);
  };

  const handleEPISelect = (epiNome: string) => {
    const epi = epis.find(e => e.nome === epiNome);
    if (epi) {
      setFormData(prev => ({
        ...prev,
        epiNome: epi.nome,
        epiTipo: epi.tipo,
        epiMarca: epi.marca,
        epiModelo: epi.modelo,
        epiCA: epi.ca
      }));
    }
  };

  const filteredRegistros = registros.filter(registro => {
    const matchesSearch = registro.funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registro.funcionario.matricula.includes(searchTerm) ||
                         registro.epi.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSetor = !filterSetor || registro.funcionario.setor === filterSetor;
    return matchesSearch && matchesSetor;
  });

  return (
    <DocumentosLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Registro de Entrega de EPI</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Entrega
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Registro de Entrega de EPI</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Identificação do Funcionário */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Identificação do Funcionário</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="funcionarioNome">Nome Completo</Label>
                        <Input
                          id="funcionarioNome"
                          value={formData.funcionarioNome}
                          onChange={(e) => setFormData(prev => ({ ...prev, funcionarioNome: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="funcionarioMatricula">Matrícula</Label>
                        <Input
                          id="funcionarioMatricula"
                          value={formData.funcionarioMatricula}
                          onChange={(e) => setFormData(prev => ({ ...prev, funcionarioMatricula: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="funcionarioCpf">CPF</Label>
                        <Input
                          id="funcionarioCpf"
                          value={formData.funcionarioCpf}
                          onChange={(e) => setFormData(prev => ({ ...prev, funcionarioCpf: e.target.value }))}
                          placeholder="000.000.000-00"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="funcionarioSetor">Setor</Label>
                        <Select value={formData.funcionarioSetor} onValueChange={(value) => setFormData(prev => ({ ...prev, funcionarioSetor: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o setor" />
                          </SelectTrigger>
                          <SelectContent>
                            {setores.map((setor) => (
                              <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="funcionarioFuncao">Função</Label>
                        <Input
                          id="funcionarioFuncao"
                          value={formData.funcionarioFuncao}
                          onChange={(e) => setFormData(prev => ({ ...prev, funcionarioFuncao: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dados do EPI */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dados do EPI</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="epiNome">Nome do EPI</Label>
                        <Select value={formData.epiNome} onValueChange={handleEPISelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o EPI" />
                          </SelectTrigger>
                          <SelectContent>
                            {epis.map((epi) => (
                              <SelectItem key={epi.nome} value={epi.nome}>{epi.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="epiTipo">Tipo/Categoria</Label>
                        <Input
                          id="epiTipo"
                          value={formData.epiTipo}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="epiMarca">Marca</Label>
                        <Input
                          id="epiMarca"
                          value={formData.epiMarca}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <Label htmlFor="epiModelo">Modelo</Label>
                        <Input
                          id="epiModelo"
                          value={formData.epiModelo}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <Label htmlFor="epiCA">Certificado de Aprovação (CA)</Label>
                        <Input
                          id="epiCA"
                          value={formData.epiCA}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="epiQuantidade">Quantidade Entregue</Label>
                        <Input
                          id="epiQuantidade"
                          type="number"
                          min="1"
                          value={formData.epiQuantidade}
                          onChange={(e) => setFormData(prev => ({ ...prev, epiQuantidade: parseInt(e.target.value) || 1 }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="epiCondicao">Condição</Label>
                        <Select value={formData.epiCondicao} onValueChange={(value) => setFormData(prev => ({ ...prev, epiCondicao: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {condicoes.map((condicao) => (
                              <SelectItem key={condicao} value={condicao}>{condicao}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Registro da Entrega */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Registro da Entrega</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dataEntrega">Data da Entrega</Label>
                        <Input
                          id="dataEntrega"
                          type="date"
                          value={formData.dataEntrega}
                          onChange={(e) => setFormData(prev => ({ ...prev, dataEntrega: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="responsavelEntrega">Responsável pela Entrega</Label>
                        <Input
                          id="responsavelEntrega"
                          value={formData.responsavelEntrega}
                          onChange={(e) => setFormData(prev => ({ ...prev, responsavelEntrega: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="motivo">Motivo da Entrega</Label>
                      <Select value={formData.motivo} onValueChange={(value) => setFormData(prev => ({ ...prev, motivo: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o motivo" />
                        </SelectTrigger>
                        <SelectContent>
                          {motivos.map((motivo) => (
                            <SelectItem key={motivo} value={motivo}>{motivo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                        placeholder="Observações adicionais sobre a entrega..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Registrar Entrega
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Filtros de Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="searchTerm">Buscar por nome, matrícula ou EPI</Label>
                <Input
                  id="searchTerm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite para pesquisar..."
                />
              </div>
              <div>
                <Label htmlFor="filterSetor">Filtrar por setor</Label>
                <Select value={filterSetor} onValueChange={setFilterSetor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os setores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os setores</SelectItem>
                    {setores.map((setor) => (
                      <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Registros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Registros de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>EPI</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Data Entrega</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistros.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{registro.funcionario.nome}</div>
                        <div className="text-sm text-muted-foreground">Mat: {registro.funcionario.matricula}</div>
                      </div>
                    </TableCell>
                    <TableCell>{registro.funcionario.setor}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{registro.epi.nome}</div>
                        <div className="text-sm text-muted-foreground">CA: {registro.epi.certificadoCA}</div>
                      </div>
                    </TableCell>
                    <TableCell>{registro.epi.quantidade}</TableCell>
                    <TableCell>{new Date(registro.entrega.dataEntrega).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{registro.entrega.responsavelEntrega}</TableCell>
                    <TableCell>{registro.entrega.motivo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DocumentosLayout>
  );
}