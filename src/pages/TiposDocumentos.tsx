import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import api from '@/lib/api';

// Tipos baseados na estrutura esperada da API
interface DocumentType {
  id: number;
  nome: string;
  descricao?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
}

interface DocumentTypeFormData {
  nome: string;
  descricao: string;
}

export default function TiposDocumento() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para os modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDocumentType, setEditingDocumentType] = useState<DocumentType | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<DocumentTypeFormData>({
    nome: '',
    descricao: ''
  });

  // Carregar tipos de documento da API
  const loadDocumentTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<DocumentType[]>('/tipos-documento');
      setDocumentTypes(response.data || []); // A resposta é diretamente um array
    } catch (error: any) {
      setError(error.response?.data?.error || error.message || 'Erro ao carregar tipos de documento');
      setDocumentTypes([]); // Define array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente monta
  useEffect(() => {
    loadDocumentTypes();
  }, []);

  // Limpar e resetar form
  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: ''
    });
    setEditingDocumentType(null);
  };

  // Abrir modal de criação
  const handleCreateClick = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  // Abrir modal de edição
  const handleEditClick = (docType: DocumentType) => {
    setEditingDocumentType(docType);
    setFormData({
      nome: docType.nome,
      descricao: docType.descricao || ''
    });
    setIsEditModalOpen(true);
  };

  // Criar tipo de documento
  const handleCreateDocumentType = async () => {
    if (!formData.nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      setFormLoading(true);
      const response = await api.post<DocumentType>('/tipos-documento', formData);
      
      // Adiciona o novo tipo à lista - response.data é diretamente o objeto criado
      setDocumentTypes([...documentTypes, response.data]);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Erro ao criar tipo de documento');
    } finally {
      setFormLoading(false);
    }
  };

  // Atualizar tipo de documento
  const handleUpdateDocumentType = async () => {
    if (!editingDocumentType) return;
    
    if (!formData.nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      setFormLoading(true);
      const response = await api.put<DocumentType>(`/tipos-documento/${editingDocumentType.id}`, formData);
      
      // Atualiza o tipo na lista - response.data é diretamente o objeto atualizado
      setDocumentTypes(documentTypes.map(docType => 
        docType.id === editingDocumentType.id ? response.data : docType
      ));
      setIsEditModalOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Erro ao atualizar tipo de documento');
    } finally {
      setFormLoading(false);
    }
  };

  // Deletar tipo de documento
  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este tipo de documento?")) {
      return;
    }

    try {
      await api.delete(`/tipos-documento/${id}`);
      
      // Remove o tipo da lista local
      setDocumentTypes(documentTypes.filter(docType => docType.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Erro ao excluir tipo de documento');
    }
  };

  // Fechar modais
  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    resetForm();
  };

  const getTypeIcon = (nome: string) => {
    switch (nome.toLowerCase()) {
      case 'treinamento':
        return '🎓';
      case 'integração':
        return '👋';
      case 'palestra':
        return '🎤';
      case 'workshop':
        return '🛠️';
      case 'certificação':
        return '🏆';
      default:
        return '📄';
    }
  };

  const getTypeColor = (nome: string) => {
    switch (nome.toLowerCase()) {
      case 'treinamento':
        return 'bg-blue-100 text-blue-800';
      case 'integração':
        return 'bg-green-100 text-green-800';
      case 'palestra':
        return 'bg-purple-100 text-purple-800';
      case 'workshop':
        return 'bg-orange-100 text-orange-800';
      case 'certificação':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tipos de Treinamento</h1>
            <p className="text-muted-foreground mt-1">
              Configure os tipos de Treinamentos
            </p>
          </div>
        </div>
        
        <Card className="shadow-medium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">Erro: {error}</p>
              <Button onClick={loadDocumentTypes}>
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
          <h1 className="text-3xl font-bold text-foreground">Tipos de Treinamento</h1>
          <p className="text-muted-foreground mt-1">
            Configure os tipos de Treinamentos
          </p>
        </div>
        <Button 
          className="bg-gradient-primary hover:bg-primary-hover shadow-medium"
          onClick={handleCreateClick}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Tipo
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Carregando tipos de documento...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentTypes.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Nenhum tipo de documento encontrado
              </div>
            ) : (
              documentTypes.map((docType) => (
                <Card key={docType.id} className="shadow-medium hover:shadow-strong transition-smooth">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getTypeIcon(docType.nome)}</div>
                        <div>
                          <CardTitle className="text-lg">{docType.nome}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Criado em {format(new Date(docType.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <Badge className={getTypeColor(docType.nome)}>
                        Ativo
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {docType.descricao || "Nenhuma descrição disponível"}
                    </p>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(docType)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(docType.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Lista Detalhada ({documentTypes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentTypes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum tipo de documento encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      documentTypes.map((docType) => (
                        <TableRow key={docType.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getTypeIcon(docType.nome)}</span>
                              <Badge className={getTypeColor(docType.nome)}>
                                {docType.nome}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{docType.nome}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs">
                            {docType.descricao || "Nenhuma descrição"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(docType.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditClick(docType)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDelete(docType.id)}
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
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Tipo de Documento</DialogTitle>
            <DialogDescription>
              Crie um novo tipo de documento/treinamento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Ex: Treinamento, Palestra, Workshop"
              />
            </div>
            
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descreva o tipo de documento..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>
              Cancelar
            </Button>
            <Button onClick={handleCreateDocumentType} disabled={formLoading}>
              {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar Tipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Tipo de Documento</DialogTitle>
            <DialogDescription>
              Atualize os dados do tipo de documento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nome">Nome *</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Ex: Treinamento, Palestra, Workshop"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descreva o tipo de documento..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateDocumentType} disabled={formLoading}>
              {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Atualizar Tipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}