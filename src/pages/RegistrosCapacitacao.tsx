import { useState, useEffect } from "react";
import { Plus, Send, Eye, Edit, Trash2, Calendar, MapPin, User, Users, Loader2 } from "lucide-react";
import CreateCapacitacaoForm from "@/components/forms/CreateCapacitacaoForm";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import api from '@/lib/api';

// Tipos baseados na estrutura esperada da API
interface Setor {
  id: number;
  nome: string;
}

interface DocumentType {
  id: number;
  nome: string;
  descricao?: string;
}

interface FuncionarioApi {
  id: number;
  nome: string;
  cpf: string;
  cargo: string;
  setorId: number;
  email: string;
  telefone: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiParticipante {
  id: number;
  capacitacaoId: number;
  funcionarioId: number;
  assinaturaStatus: string;
  assinaturaData: string | null;
  funcionario: FuncionarioApi;
}

interface TrainingRecord {
  id: number;
  titulo: string;
  data: string;
  local: string;
  instrutor: string;
  tipoDocumentoId: number;
  arquivoPdf: string | null;
  arquivoAssinado: string | null;
  status: 'pendente' | 'sent_for_signature' | 'signed' | 'completed';
  createdAt: string;
  updatedAt: string;
  tipoDocumento: DocumentType;
  participantes: ApiParticipante[];
}

interface TrainingFormData {
  titulo: string;
  dataEvento: string;
  local: string;
  instrutor: string;
  tipoDocumentoId: number;
  participantesIds: number[];
}

interface CailunSignatoryData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  requiredAuthenticationtype: number;
  SignAsid: number;
  adidtionalrequiredAuthenticationtype: number;
}

export default function Capacitacao() {
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sendingForSignature, setSendingForSignature] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carregar registros de capacitação da API
  const loadTrainingRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<TrainingRecord[]>('/capacitacao');
      setTrainingRecords(response.data || []);
    } catch (error: any) {
      setError(error.response?.data?.error || error.message || 'Erro ao carregar registros de capacitação');
      setTrainingRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente monta
  useEffect(() => {
    loadTrainingRecords();
  }, []);

  // Deletar registro de capacitação
  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este registro de capacitação?")) {
      return;
    }

    try {
      await api.delete(`/capacitacao/${id}`);
      
      // Remove o registro da lista local
      setTrainingRecords(trainingRecords.filter(record => record.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Erro ao excluir registro');
    }
  };

  // Enviar para assinatura via Cailun
  const handleSendForSignature = async (record: TrainingRecord) => {
    if (!record.participantes || record.participantes.length === 0) {
      alert("Este registro não possui participantes para envio de assinatura.");
      return;
    }

    try {
      setSendingForSignature(record.id);
      
      // Preparar dados dos signatários
      const signatories: CailunSignatoryData[] = record.participantes.map((part) => {
        const participant = part.funcionario;
        return {
          name: participant.nome,
          cpf: participant.cpf.replace(/\D/g, ''), // Remove formatação do CPF
          email: participant.email,
          phone: participant.telefone.replace(/\D/g, ''), // Remove formatação do telefone
          requiredAuthenticationtype: 11,
          SignAsid: 1,
          adidtionalrequiredAuthenticationtype: 5
        };
      });

      // Preparar FormData
      const formData = new FormData();
      
      // Dados básicos
      formData.append('folderId', '89021');
      
      // Data limite (3 dias a partir de hoje)
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() + 3);
      formData.append('signatureLimitDate', format(limitDate, 'yyyy-MM-dd HH:mm:ss'));
      
      formData.append('reminder', 'true');
      formData.append('reminderDays', '3');
      formData.append('notificationDescription', 'Lembrete assinatura');
      formData.append('notificationDate', format(new Date(), 'yyyy-MM-dd'));
      formData.append('message', record.titulo); // Título da capacitação como mensagem
      
      // Signatários
      signatories.forEach((signatory, index) => {
        formData.append(`signatories[${index}][name]`, signatory.name);
        formData.append(`signatories[${index}][cpf]`, signatory.cpf);
        formData.append(`signatories[${index}][email]`, signatory.email);
        formData.append(`signatories[${index}][phone]`, signatory.phone);
        formData.append(`signatories[${index}][requiredAuthenticationtype]`, signatory.requiredAuthenticationtype.toString());
        formData.append(`signatories[${index}][SignAsid]`, signatory.SignAsid.toString());
        formData.append(`signatories[${index}][adidtionalrequiredAuthenticationtype]`, signatory.adidtionalrequiredAuthenticationtype.toString());
      });

      // Aqui você pode gerar o PDF do certificado e anexá-lo
      // Por enquanto, vamos simular que o PDF já existe ou será gerado pela API
      // formData.append('file', pdfFile);

      // Fazer a requisição para o Cailun
      await api.post('/cailun/subscription-flow', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Atualizar status local
      setTrainingRecords(trainingRecords.map(tr => 
        tr.id === record.id 
          ? { ...tr, status: 'sent_for_signature' }
          : tr
      ));

      alert("Documento enviado para assinatura via Cailun!");
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Erro ao enviar para assinatura');
    } finally {
      setSendingForSignature(null);
    }
  };

  const getStatusBadge = (status: TrainingRecord['status']) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'sent_for_signature':
        return <Badge className="bg-yellow-100 text-yellow-800">Enviado p/ Assinatura</Badge>;
      case 'signed':
        return <Badge className="bg-blue-100 text-blue-800">Assinado</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getStatusStats = () => {
    const stats = trainingRecords.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      pendente: stats.pendente || 0,
      sent_for_signature: stats.sent_for_signature || 0,
      signed: stats.signed || 0,
      completed: stats.completed || 0,
    };
  };

  const stats = getStatusStats();

  const handleCreateTraining = async (formData: TrainingFormData) => {
    try {
      const response = await api.post<TrainingRecord>('/capacitacao', formData);
      setTrainingRecords([response.data, ...trainingRecords]);
      setShowCreateForm(false);
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Erro ao criar registro de capacitação');
    }
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-background p-6">
        <CreateCapacitacaoForm 
          onSubmit={handleCreateTraining}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Registros de Capacitação</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie treinamentos, workshops e certificações
            </p>
          </div>
        </div>
        
        <Card className="shadow-medium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">Erro: {error}</p>
              <Button onClick={loadTrainingRecords}>
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
          <h1 className="text-3xl font-bold text-foreground">Registros de Capacitação</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie treinamentos, workshops e certificações
          </p>
        </div>
        <Button 
          className="bg-gradient-primary hover:bg-primary-hover shadow-medium"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Registro
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Edit className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-foreground">{stats.pendente}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enviados</p>
                <p className="text-2xl font-bold text-foreground">{stats.sent_for_signature}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assinados</p>
                <p className="text-2xl font-bold text-foreground">{stats.signed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Registros ({trainingRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando registros de capacitação...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Instrutor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainingRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum registro de capacitação encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    trainingRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium max-w-xs">
                          <div>
                            <p className="font-semibold">{record.titulo}</p>
                            <p className="text-xs text-muted-foreground">
                              {record.tipoDocumento?.nome || 'Sem tipo de documento'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {format(new Date(record.data), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="max-w-xs truncate">{record.local}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {record.instrutor}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.tipoDocumento?.nome || 'Sem tipo de documento'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            {record.participantes.length} pessoa{record.participantes.length > 1 ? 's' : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(record.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" title="Visualizar">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Editar">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {record.status === 'pendente' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleSendForSignature(record)}
                                className="text-primary hover:text-primary hover:bg-primary/10"
                                title="Enviar para Assinatura"
                                disabled={sendingForSignature === record.id}
                              >
                                {sendingForSignature === record.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Excluir"
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
    </div>
  );
}