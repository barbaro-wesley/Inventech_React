import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock, User, Wrench } from 'lucide-react';
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
  status: 'agendada' | 'em_andamento' | 'concluida';
  data: Date;
}

interface Preventiva {
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
}

const Calendario = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvents, setSelectedEvents] = useState<OSEvent[]>([]);
  const [events, setEvents] = useState<OSEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreventivas = async () => {
      try {
        const response = await api.get('/os'); // Usa o cliente api do componente antigo
        const data = response.data;

        // Garante que data.preventivas é um array
        const preventivas: Preventiva[] = Array.isArray(data.preventivas) ? data.preventivas : [];

        const mappedEvents: OSEvent[] = preventivas
          .filter((item) => item.dataAgendada) // Apenas preventivas com dataAgendada
          .map((item) => ({
            id: item.id,
            titulo: `${item.descricao} - ${item.Setor?.nome || 'Sem setor'}`,
            tipo: 'preventiva',
            tecnico: item.tecnico.nome,
            equipamento: item.tipoEquipamento.nome,
            setor: item.Setor ? item.Setor.nome : 'Sem setor',
            hora: item.dataAgendada
              ? format(new Date(item.dataAgendada), 'HH:mm', { locale: ptBR })
              : 'N/A',
            status: item.status === 'ABERTA' ? 'agendada' : item.status === 'CONCLUIDA' ? 'concluida' : 'em_andamento',
            data: item.dataAgendada ? new Date(item.dataAgendada) : new Date(),
          }));

        setEvents(mappedEvents);
        setError(null);
      } catch (error) {
        console.error('Erro ao buscar preventivas:', error);
        setError('Não foi possível carregar as manutenções. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreventivas();
  }, []);

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'preventiva' ? <CalendarIcon className="w-4 h-4" /> : <Wrench className="w-4 h-4" />;
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'preventiva' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };

  const hasEvents = (date: Date) => {
    return events.some((event) => isSameDay(event.data, date));
  };

  const totalAgendadas = events.filter((e) => e.status === 'agendada').length;
  const emAndamento = events.filter((e) => e.status === 'em_andamento').length;
  const totalPreventivas = events.length;
  const totalCorretivas = 0;

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
        <Button>
          <CalendarIcon className="w-4 h-4 mr-2" />
          Nova OS
        </Button>
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
                        {event.titulo}
                      </h4>
                      <Badge variant="outline" className={getStatusColor(event.status)}>
                        {event.status.replace('_', ' ')}
                      </Badge>
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
                      </div>
                    </div>

                    <div className="pt-2 border-t text-xs">
                      <p><strong>Equipamento:</strong> {event.equipamento}</p>
                      <p><strong>Setor:</strong> {event.setor}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        Detalhes
                      </Button>
                      {event.status === 'agendada' && (
                        <Button size="sm" variant="outline" className="text-xs">
                          Iniciar
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
              <CalendarIcon className="w-8 h-8 text-green-600" />
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
              <Wrench className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendario;