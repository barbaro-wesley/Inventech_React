import { useState } from "react";
import { Plus, Upload, Send, Download, Eye, Edit, Trash2, Calendar, MapPin, User, Users } from "lucide-react";
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
import { mockTrainingRecords } from "@/data/mockData";
import { TrainingRecord } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Capacitacao() {
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>(mockTrainingRecords);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este registro de capacitação?")) {
      setTrainingRecords(trainingRecords.filter(record => record.id !== id));
    }
  };

  const handleSendForSignature = (id: string) => {
    setTrainingRecords(trainingRecords.map(record => 
      record.id === id 
        ? { ...record, status: 'sent_for_signature' as const }
        : record
    ));
    // Aqui seria a integração com Cailun
    alert("Documento enviado para assinatura via Cailun!");
  };

  const getStatusBadge = (status: TrainingRecord['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
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
      draft: stats.draft || 0,
      sent_for_signature: stats.sent_for_signature || 0,
      signed: stats.signed || 0,
      completed: stats.completed || 0,
    };
  };

  const stats = getStatusStats();

  const handleCreateTraining = (newTraining: Omit<TrainingRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const training: TrainingRecord = {
      ...newTraining,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTrainingRecords([training, ...trainingRecords]);
    setShowCreateForm(false);
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
                <p className="text-sm text-muted-foreground">Rascunhos</p>
                <p className="text-2xl font-bold text-foreground">{stats.draft}</p>
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
                <Upload className="w-5 h-5 text-blue-600" />
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
                <Download className="w-5 h-5 text-green-600" />
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
                {trainingRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium max-w-xs">
                      <div>
                        <p className="font-semibold">{record.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.tipoDocumento.nome}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {format(record.data, "dd/MM/yyyy", { locale: ptBR })}
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
                      <Badge variant="outline">{record.tipoDocumento.nome}</Badge>
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
                        {record.certificadoUrl && (
                          <Button variant="ghost" size="sm" title="Baixar PDF">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {record.status === 'draft' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSendForSignature(record.id)}
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            title="Enviar para Assinatura"
                          >
                            <Send className="w-4 h-4" />
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}