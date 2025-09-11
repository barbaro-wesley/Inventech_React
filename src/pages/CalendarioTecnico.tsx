import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Settings, User, Wrench, AlertTriangle,Clock } from 'lucide-react';
import api from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OS {
  id: number;
  descricao: string;
  status: string;
  criadoEm: string;
  finalizadoEm?: string | null;
  prioridade: string;
  iniciadaEm?: string | null;
  preventiva: boolean;
  dataAgendada?: string | null;
  tipoEquipamento?: {
    nome: string;
  } | null;
  tecnico: {
    id: number;
    nome: string;
  };
  solicitante?: {
    nome: string;
  } | null;
  Setor?: {
    nome: string;
  } | null;
  equipamento?: {
    nomeEquipamento: string | null;
    numeroSerie: string | null;
    marca?: string | null;
    modelo?: string | null;
  } | null;
}

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
  numeroSerie?: string;
  marca?: string;
  modelo?: string;
}

interface ApiResponse {
  preventivas: OS[];
  corretivas: OS[];
  totalManutencao?: number;
}

const ChamadosTecnico: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  // Parse API date (dd/mm/yyyy, hh:mm:ss) to ignore time
  const parseApiDate = (dateString: string): Date => {
    try {
      const [datePart] = dateString.split(','); // Split on comma to get "dd/mm/yyyy"
      const [day, month, year] = datePart.trim().split('/').map(Number);
      const parsedDate = new Date(year, month - 1, day);
      if (isNaN(parsedDate.getTime())) {
        console.error('Data inválida:', dateString);
        return new Date(); // Fallback to current date
      }
      return parsedDate;
    } catch (error) {
      console.error('Erro ao converter data:', dateString, error);
      return new Date(); // Fallback to current date
    }
  };

  // Fetch data from API
  useEffect(() => {
  const fetchPreventivas = async () => {
    try {
      setLoading(true);
      const response = await api.get("os/ordens/preventivas", { withCredentials: true });
      const data = response.data;

      console.log("Preventivas da API:", data);

      // Mapeia cada OS para o formato que o calendário entende
      const mappedPreventivas: OSEvent[] = data.map((item: any) => {
        const parsedDate = item.dataAgendada ? parseApiDate(item.dataAgendada) : new Date();

        return {
          id: item.id,
          titulo: item.descricao,
          tipo: "preventiva",
          tecnico: item.tecnico?.nome || "Sem técnico",
          equipamento: item.equipamento?.nomeEquipamento || item.tipoEquipamento?.nome || "N/A",
          setor: item.Setor ? item.Setor.nome : "Sem setor",
          hora: item.dataAgendada
            ? format(parseApiDate(item.dataAgendada), "HH:mm", { locale: ptBR })
            : "N/A",
          status:
            item.status === "ABERTA"
              ? "agendada"
              : item.status === "CONCLUIDA"
              ? "concluida"
              : item.status === "CANCELADA"
              ? "cancelada"
              : "em_andamento",
          data: parsedDate,
          prioridade: item.prioridade,
          numeroSerie: item.equipamento?.numeroSerie || undefined,
          marca: item.equipamento?.marca || undefined,
          modelo: item.equipamento?.modelo || undefined,
        };
      });

      setEvents(mappedPreventivas);
      setError(null);
    } catch (error) {
      console.error("Erro ao buscar preventivas:", error);
      setError("Não foi possível carregar as manutenções preventivas.");
    } finally {
      setLoading(false);
    }
  };

  fetchPreventivas();
}, []);

  const normalizeDate = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const getManutencoesPorData = (date: Date) => {
    const normalizedDate = normalizeDate(date);
    const filteredEvents = events.filter(event => {
      const eventDate = normalizeDate(event.data);
      const isMatch = eventDate.getTime() === normalizedDate.getTime();
      console.log(`Comparando ${format(eventDate, 'dd/MM/yyyy')} com ${format(normalizedDate, 'dd/MM/yyyy')}: ${isMatch}`);
      return isMatch;
    });
    return filteredEvents;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDateNormalized = normalizeDate(startDate);
    
    while (currentDateNormalized <= endDate) {
      days.push(new Date(currentDateNormalized));
      currentDateNormalized.setDate(currentDateNormalized.getDate() + 1);
    }
    
    return days;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENTE': return 'bg-red-600';
      case 'ALTO': return 'bg-orange-500';
      case 'MEDIO': return 'bg-yellow-600';
      case 'BAIXO': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'bg-blue-500';
      case 'em_andamento': return 'bg-yellow-500';
      case 'concluida': return 'bg-green-500';
      case 'cancelada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'preventiva' ? <Settings className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const calendarDays = generateCalendarDays();
  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();
  const isToday = (date: Date) => normalizeDate(date).getTime() === normalizeDate(new Date()).getTime();

  const selectedDateManutencoes = selectedDate ? getManutencoesPorData(selectedDate) : [];

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
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Calendário de Manutenções
        </h2>
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
          <div className="text-sm text-muted-foreground">
            Total de manutenções: {events.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Hoje
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToNextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  const dayManutencoes = getManutencoesPorData(date);
                  const isSelected = selectedDate && normalizeDate(date).getTime() === normalizeDate(selectedDate).getTime();
                  
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        p-2 min-h-[60px] border rounded-lg cursor-pointer transition-all hover:bg-muted/50
                        ${!isCurrentMonth(date) ? 'text-muted-foreground bg-muted/20' : ''}
                        ${isToday(date) ? 'border-blue-500 bg-blue-50' : 'border-border'}
                        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-100' : ''}
                        ${dayManutencoes.length > 0 ? 'bg-green-50' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${isToday(date) ? 'text-blue-600' : ''}`}>
                          {date.getDate()}
                        </span>
                        {dayManutencoes.length > 0 && (
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{dayManutencoes.length}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayManutencoes.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`w-full h-1.5 rounded-full ${getPriorityColor(event.prioridade)}`}
                            title={`OS #${event.id} - ${event.titulo}`}
                          />
                        ))}
                        {dayManutencoes.length > 2 && (
                          <div className="text-xs text-center text-muted-foreground">
                            +{dayManutencoes.length - 2} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? `Manutenções de ${formatDate(selectedDate)}` : 'Selecione uma data'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDateManutencoes.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateManutencoes.map(event => (
                      <div key={event.id} className="border border-border rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getTipoIcon(event.tipo)}
                            <span className="font-semibold">OS #{event.id}</span>
                          </div>
                          <div className="flex gap-1">
                            <Badge className={`text-white text-xs ${getStatusColor(event.status)}`}>
                              {event.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={`text-white text-xs ${getPriorityColor(event.prioridade)}`}>
                              {event.prioridade}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-foreground bg-muted/30 p-2 rounded">
                          {event.titulo}
                        </p>
                        <div className="text-xs space-y-1 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            {event.equipamento}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {event.tecnico}
                          </div>
                          {event.setor && (
                            <div>Setor: {event.setor}</div>
                          )}
                          {event.numeroSerie && (
                            <div>Série: {event.numeroSerie}</div>
                          )}
                          {event.marca && (
                            <div>Marca: {event.marca}</div>
                          )}
                          {event.modelo && (
                            <div>Modelo: {event.modelo}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma manutenção agendada para esta data.
                  </p>
                )
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Clique em uma data no calendário para ver as manutenções agendadas.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agendadas</p>
                <p className="text-2xl font-bold">{totalAgendadas}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
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

export default ChamadosTecnico;