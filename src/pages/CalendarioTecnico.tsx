import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, User, Wrench, Settings, AlertTriangle } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/lib/api';

interface OSEvent {
  id: number;
  titulo: string;
  tipo: 'preventiva' | 'corretiva';
  tecnico: string;
  equipamento: string;
  setor: string;
  hora: string;
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
  data: Date;
  prioridade: string;
  recorrencia?: string;
  numeroSerie?: string;
  marca?: string;
  modelo?: string;
}

interface OS {
  id: number;
  descricao: string;
  tipoEquipamentoId: number;
  equipamentoId: number;
  tecnicoId: number;
  solicitanteId: number;
  status: string;
  criadoEm: string;
  finalizadoEm: string | null;
  valorManutencao: number | null;
  resolucao: string | null;
  arquivos: any[];
  preventiva: boolean;
  dataAgendada: string | null;
  recorrencia: string;
  intervaloDias: number | null;
  setorId: number | null;
  prioridade: string;
  tipoEquipamento: {
    id: number;
    nome: string;
    grupoId: number;
  };
  tecnico: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    matricula: string;
    admissao: string;
    ativo: boolean;
    telegramChatId: string | null;
    grupoId: number;
  };
  Setor: { id: number; nome: string } | null;
  solicitante: { nome: string };
  equipamento?: {
    nomeEquipamento: string | null;
    numeroSerie: string | null;
    marca?: string | null;
    modelo?: string | null;
  } | null;
}

interface ApiResponse {
  preventivas: OS[];
  corretivas: OS[];
  totalManutencao?: number;
}

const Calendariotecnico = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvents, setSelectedEvents] = useState<OSEvent[]>([]);
  const [events, setEvents] = useState<OSEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<string>("ABERTA");

  const endpointMap: Record<string, string> = {
    "ABERTA": "/os/tecnico",
    "EM_ANDAMENTO": "/os/tecnico/em-andamento",
    "CONCLUIDA": "/os/tecnico/concluidos",
    "CANCELADA": "/os/tecnico/cancelados",
  };

  useEffect(() => {
    const fetchPreventivas = async () => {
      try {
        setLoading(true);
        const endpoint = endpointMap[statusFiltro];
        const response = await api.get(endpoint, { withCredentials: true });
        const data: ApiResponse = response.data;

        // Garante que data.preventivas e data.corretivas são arrays
        const preventivas: OS[] = Array.isArray(data.preventivas) ? data.preventivas : [];
        const corretivas: OS[] = Array.isArray(data.corretivas) ? data.corretivas : [];

        // Mapeia tanto preventivas quanto corretivas que têm data agendada
        const mappedEvents: OSEvent[] = [
          ...preventivas
            .filter((item) => item.dataAgendada)
            .map((item) => ({
              id: item.id,
              titulo: item.descricao,
              tipo: 'preventiva' as const,
              tecnico: item.tecnico.nome,
              equipamento: item.equipamento?.nomeEquipamento || item.tipoEquipamento.nome,
              setor: item.Setor ? item.Setor.nome : 'Sem setor',
              hora: item.dataAgendada
                ? format(new Date(item.dataAgendada), 'HH:mm', { locale: ptBR })
                : 'N/A',
              status: item.status === 'ABERTA' ? 'agendada' as const : 
                     item.status === 'CONCLUIDA' ? 'concluida' as const : 
                     item.status === 'CANCELADA' ? 'cancelada' as const : 'em_andamento' as const,
              data: item.dataAgendada ? new Date(item.dataAgendada) : new Date(),
              prioridade: item.prioridade,
              recorrencia: item.recorrencia,
              numeroSerie: item.equipamento?.numeroSerie || undefined,
              marca: item.equipamento?.marca || undefined,
              modelo: item.equipamento?.modelo || undefined,
            })),
          ...corretivas
            .filter((item) => item.dataAgendada)
            .map((item) => ({
              id: item.id,
              titulo: item.descricao,
              tipo: 'corretiva' as const,
              tecnico: item.tecnico.nome,
              equipamento: item.equipamento?.nomeEquipamento || item.tipoEquipamento.nome,
              setor: item.Setor ? item.Setor.nome : 'Sem setor',
              hora: item.dataAgendada
                ? format(new Date(item.dataAgendada), 'HH:mm', { locale: ptBR })
                : 'N/A',
              status: item.status === 'ABERTA' ? 'agendada' as const : 
                     item.status === 'CONCLUIDA' ? 'concluida' as const : 
                     item.status === 'CANCELADA' ? 'cancelada' as const : 'em_andamento' as const,
              data: item.dataAgendada ? new Date(item.dataAgendada) : new Date(),
              prioridade: item.prioridade,
              recorrencia: item.recorrencia,
              numeroSerie: item.equipamento?.numeroSerie || undefined,
              marca: item.equipamento?.marca || undefined,
              modelo: item.equipamento?.modelo || undefined,
            }))
        ];

        setEvents(mappedEvents);
        setError(null);
      } catch (error) {
        console.error('Erro ao buscar ordens de serviço:', error);
        setError('Não foi possível carregar as manutenções. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreventivas();
  }, [statusFiltro]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const eventsForDate = events.filter((event) =>
        isSameDay(event.data, date)
      );
      setSelectedEvents(eventsForDate);
    } else {
      setSelectedEvents([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-blue-100 text-blue-800';
      case 'em_andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'URGENTE':
        return 'bg-red-600 text-white';
      case 'ALTO':
        return 'bg-orange-500 text-white';
      case 'MEDIO':
        return 'bg-yellow-600 text-white';
      case 'BAIXO':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'preventiva' ? <Settings className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />;
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'preventiva' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800';
  };

  const hasEvents = (date: Date) => {
    return events.some((event) => isSameDay(event.data, date));
  };

  const totalAgendadas = events.filter((e) => e.status === 'agendada').length;
  const emAndamento = events.filter((e) => e.status === 'em_andamento').length;
  const totalPreventivas = events.filter((e) => e.tipo === 'preventiva').length;
  const totalCorretivas = events.filter((e) => e.tipo === 'corretiva').length;

  if (loading) {
    return <div className="text-center p-4">Carregando...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendário de Manutenções</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie as ordens de serviço agendadas
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-background"
          >
            <option value="ABERTA">Abertas</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="CONCLUIDA">Concluídas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
          <Button>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Nova OS
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border w-full max-w-4xl p-6 text-lg 
                 [&_.rdp-months]:w-full [&_.rdp-table]:w-full [&_.rdp-cell]:h-16 
                 [&_.rdp-day]:w-full [&_.rdp-day]:h-full [&_.rdp-day]:text-base"
                modifiers={{
                  hasEvents: (date) => hasEvents(date),
                }}
                modifiersStyles={{
                  hasEvents: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    fontWeight: 'bold',
                  },
                }}
              />
            </div>
            <div className="mt-4 text-sm text-muted-foreground text-center">
              <p>• Datas destacadas possuem manutenções agendadas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {selectedDate
                ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
                : 'Selecione uma data'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm leading-tight">
                        OS #{event.id} - {event.titulo}
                      </h4>
                      <div className="flex gap-1 flex-col items-end">
                        <Badge variant="outline" className={getStatusColor(event.status)}>
                          {event.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(event.prioridade)} variant="outline">
                          {event.prioridade}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {event.hora}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {event.tecnico}
                      </div>
                      <div className="flex items-center gap-2">
                        {getTipoIcon(event.tipo)}
                        <Badge variant="outline" className={getTipoColor(event.tipo)}>
                          {event.tipo}
                        </Badge>
                        {event.recorrencia && event.recorrencia !== 'NENHUMA' && (
                          <Badge variant="outline" className="text-xs">
                            {event.recorrencia}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t text-xs space-y-1">
                      <p><strong>Equipamento:</strong> {event.equipamento}</p>
                      <p><strong>Setor:</strong> {event.setor}</p>
                      {event.numeroSerie && (
                        <p><strong>Série:</strong> {event.numeroSerie}</p>
                      )}
                      {event.marca && (
                        <p><strong>Marca:</strong> {event.marca}</p>
                      )}
                      {event.modelo && (
                        <p><strong>Modelo:</strong> {event.modelo}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        Ver Detalhes
                      </Button>
                      {event.status === 'agendada' && (
                        <Button size="sm" variant="outline" className="text-xs">
                          Iniciar OS
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma manutenção agendada para esta data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agendadas</p>
                <p className="text-2xl font-bold">{totalAgendadas}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{emAndamento}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preventivas</p>
                <p className="text-2xl font-bold">{totalPreventivas}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Corretivas</p>
                <p className="text-2xl font-bold">{totalCorretivas}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendariotecnico;