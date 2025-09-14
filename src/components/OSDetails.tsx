import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Settings, MapPin, FileText, Clock, DollarSign } from 'lucide-react';
import api from '@/lib/api';

interface OSDetailsData {
  id: number;
  descricao: string;
  tipoEquipamentoId: number;
  equipamentoId: number;
  tecnicoId: number;
  solicitanteId: number;
  status: string;
  prioridade: string;
  criadoEm: string;
  finalizadoEm: string | null;
  iniciadaEm: string | null;
  canceladaEm: string | null;
  valorManutencao: number | null;
  resolucao: string | null;
  arquivos: any[];
  preventiva: boolean;
  dataAgendada: string | null;
  recorrencia: string | null;
  intervaloDias: number | null;
  setorId: number;
  tipoEquipamento?: {
    id: number;
    nome: string;
    grupoId: number;
    taxaDepreciacao: number | null;
  } | null;
  tecnico?: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    matricula: string;
    admissao: string;
    ativo: boolean;
    telegramChatId: string;
    grupoId: number;
  } | null;
  Setor?: {
    id: number;
    nome: string;
  } | null;
  solicitante?: {
    nome: string;
  } | null;
  equipamento?: {
    nomeEquipamento: string;
    marca: string | null;
    modelo: string;
    numeroSerie: string;
  } | null;
}

interface OSDetailsProps {
  osId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const OSDetails: React.FC<OSDetailsProps> = ({ osId, isOpen, onClose }) => {
  const [osData, setOsData] = useState<OSDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (osId && isOpen) {
      fetchOSDetails();
    }
  }, [osId, isOpen]);

  const fetchOSDetails = async () => {
    if (!osId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/os/${osId}`);
      setOsData(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar detalhes da OS:', error);
      setError(error.response?.data?.message || 'Erro ao carregar detalhes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABERTA': return 'bg-yellow-500';
      case 'EM_ANDAMENTO': return 'bg-blue-500';
      case 'CONCLUIDA': return 'bg-green-500';
      case 'CANCELADA': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ALTA': return 'bg-red-500';
      case 'MEDIO': return 'bg-yellow-500';
      case 'BAIXA': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para verificar se um valor é válido (não nulo, não vazio, não undefined)
  const isValidValue = (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carregando detalhes...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{error}</p>
        </DialogContent>
      </Dialog>
    );
  }

  if (!osData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>OS #{osData.id}</span>
            <Badge className={`text-white ${getStatusColor(osData.status)}`}>
              {osData.status}
            </Badge>
            <Badge className={`text-white ${getPriorityColor(osData.prioridade)}`}>
              {osData.prioridade}
            </Badge>
            {osData.preventiva && (
              <Badge variant="outline">PREVENTIVA</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Descrição</h4>
                <p className="text-sm">{osData.descricao || '-'}</p>
              </div>
              {isValidValue(osData.resolucao) && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Resolução</h4>
                  <p className="text-sm">{osData.resolucao}</p>
                </div>
              )}
              {isValidValue(osData.valorManutencao) && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Valor da Manutenção</h4>
                  <p className="text-sm font-medium">{formatCurrency(osData.valorManutencao)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipamento */}
          {osData.equipamento && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Equipamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {isValidValue(osData.equipamento.nomeEquipamento) && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Nome do Equipamento</h4>
                      <p className="text-sm">{osData.equipamento.nomeEquipamento}</p>
                    </div>
                  )}
                  {osData.tipoEquipamento?.nome && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Tipo</h4>
                      <p className="text-sm">{osData.tipoEquipamento.nome}</p>
                    </div>
                  )}
                  {isValidValue(osData.equipamento.marca) && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Marca</h4>
                      <p className="text-sm">{osData.equipamento.marca}</p>
                    </div>
                  )}
                  {isValidValue(osData.equipamento.modelo) && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Modelo</h4>
                      <p className="text-sm">{osData.equipamento.modelo}</p>
                    </div>
                  )}
                  {isValidValue(osData.equipamento.numeroSerie) && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Número de Série</h4>
                      <p className="text-sm">{osData.equipamento.numeroSerie}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pessoas Envolvidas */}
          {(osData.tecnico || osData.solicitante) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Pessoas Envolvidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {osData.tecnico && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Técnico Responsável</h4>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{osData.tecnico.nome || '-'}</p>
                        {isValidValue(osData.tecnico.email) && (
                          <p className="text-xs text-muted-foreground">{osData.tecnico.email}</p>
                        )}
                        {isValidValue(osData.tecnico.telefone) && (
                          <p className="text-xs text-muted-foreground">{osData.tecnico.telefone}</p>
                        )}
                        {isValidValue(osData.tecnico.matricula) && (
                          <p className="text-xs text-muted-foreground">Matrícula: {osData.tecnico.matricula}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {osData.solicitante && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Solicitante</h4>
                      <p className="text-sm font-medium">{osData.solicitante.nome || '-'}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Localização */}
          {osData.Setor && isValidValue(osData.Setor.nome) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Setor</h4>
                  <p className="text-sm">{osData.Setor.nome}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Datas e Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isValidValue(osData.criadoEm) && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Criado em</h4>
                    <p className="text-sm">{formatDate(osData.criadoEm)}</p>
                  </div>
                )}
                {isValidValue(osData.dataAgendada) && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Data Agendada</h4>
                    <p className="text-sm">{formatDate(osData.dataAgendada)}</p>
                  </div>
                )}
                {isValidValue(osData.iniciadaEm) && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Iniciado em</h4>
                    <p className="text-sm">{formatDate(osData.iniciadaEm)}</p>
                  </div>
                )}
                {isValidValue(osData.finalizadoEm) && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Finalizado em</h4>
                    <p className="text-sm">{formatDate(osData.finalizadoEm)}</p>
                  </div>
                )}
                {isValidValue(osData.canceladaEm) && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Cancelado em</h4>
                    <p className="text-sm">{formatDate(osData.canceladaEm)}</p>
                  </div>
                )}
              </div>
              {osData.preventiva && isValidValue(osData.recorrencia) && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Recorrência</h4>
                  <p className="text-sm">{osData.recorrencia}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Arquivos */}
          {osData.arquivos && osData.arquivos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Arquivos Anexados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {osData.arquivos.length} arquivo(s) anexado(s)
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OSDetails;