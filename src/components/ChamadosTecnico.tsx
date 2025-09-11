import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle, ChevronDown, ChevronUp, Upload, X, FileText, Download, Calendar, User, MapPin, Wrench, Clock, Settings, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/api';

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
  arquivos?: string[]; 
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
  recorrencia?: string;
}

interface ApiResponse {
  preventivas: OS[];
  corretivas: OS[];
  totalManutencao?: number;
}

const ChamadosTecnico = () => {
  const [dadosOS, setDadosOS] = useState<ApiResponse>({ preventivas: [], corretivas: [] });
  const [tipoAtivo, setTipoAtivo] = useState<'preventivas' | 'corretivas'>('preventivas');
  const [aberto, setAberto] = useState<number | null>(null);
  const [resolucao, setResolucao] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [valorManutencao, setValorManutencao] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFiltro, setStatusFiltro] = useState<string>("ABERTA");
  const { toast } = useToast();

  const endpointMap: Record<string, string> = {
    "ABERTA": "/os/tecnico",
    "EM_ANDAMENTO": "/os/tecnico/em-andamento",
    "CONCLUIDA": "/os/tecnico/concluidos",
    "CANCELADA": "/os/tecnico/cancelados",
  };

  // Buscar OS do técnico
  useEffect(() => {
    const fetchChamados = async () => {
      try {
        setLoading(true);
        const endpoint = endpointMap[statusFiltro];
        const { data } = await api.get(endpoint, { withCredentials: true });
        
        // Se a resposta já tem a estrutura separada, use-a diretamente
        if (data.preventivas && data.corretivas) {
          setDadosOS(data);
        } else {
          // Caso contrário, mantenha compatibilidade com a estrutura antiga
          const preventivas = data.filter((os: OS) => os.preventiva);
          const corretivas = data.filter((os: OS) => !os.preventiva);
          setDadosOS({ preventivas, corretivas });
        }
      } catch (error) {
        console.error('Erro ao buscar chamados:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar chamados",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchChamados();
  }, [statusFiltro, toast]);

  // Obter a lista de OSs baseada no tipo ativo
  const chamadosAtivos = tipoAtivo === 'preventivas' ? dadosOS.preventivas : dadosOS.corretivas;

  // Abrir/Fechar Collapsible
  const handleAbrir = (id: number) => {
    setAberto(aberto === id ? null : id);
    setResolucao('');
    setArquivos([]);
    setFileNames([]);
    setValorManutencao('');
  };

  // Upload de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setArquivos(filesArray);
      setFileNames(filesArray.map(file => file.name));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = arquivos.filter((_, i) => i !== index);
    const newFileNames = fileNames.filter((_, i) => i !== index);
    setArquivos(newFiles);
    setFileNames(newFileNames);
  };

  // Função para extrair nome do arquivo do caminho
  const getFileNameFromPath = (filePath: string) => {
    return filePath.split(/[\\/]/).pop() || filePath;
  };

  // Função para fazer download do arquivo
  const handleDownloadFile = (filePath: string) => {
    try {
      const filename = getFileNameFromPath(filePath);
      const isPdf = filename.toLowerCase().endsWith('.pdf');
      
      const fileUrl = isPdf 
        ? `${import.meta.env.VITE_API_URL2}/uploads/pdfs/${filename.replace(/^uploads[\/\\]pdfs[\/\\]/i, '')}`
        : `${import.meta.env.VITE_API_URL2}/uploads/${filename.replace(/^uploads[\/\\]pdfs[\/\\]/i, '')}`;
      
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao fazer download do arquivo:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer download do arquivo",
        variant: "destructive",
      });
    }
  };

  // Mudar status sem resolver (EM_ANDAMENTO ou CANCELADA)
  const handleMudarStatus = async (osId: number, status: string) => {
    try {
      const statusMap: Record<string, string> = {
        "EM_ANDAMENTO": "iniciar",
        "CONCLUIDA": "concluir",
        "CANCELADA": "cancelar",
      };

      const endpoint = statusMap[status];
      if (!endpoint) {
        toast({
          title: "Erro",
          description: "Status inválido.",
          variant: "destructive",
        });
        return;
      }

      await api.put(`/os/${osId}/${endpoint}`);
      toast({
        title: "Sucesso",
        description: `OS alterada para ${status} com sucesso!`,
      });

      const { data } = await api.get(endpointMap[statusFiltro], { withCredentials: true });
      if (data.preventivas && data.corretivas) {
        setDadosOS(data);
      } else {
        const preventivas = data.filter((os: OS) => os.preventiva);
        const corretivas = data.filter((os: OS) => !os.preventiva);
        setDadosOS({ preventivas, corretivas });
      }

    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status da OS. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Concluir OS com resolução, valor e arquivos
  const handleFinalizar = async (os: OS) => {
    if (!resolucao.trim()) {
      toast({
        title: "Aviso",
        description: "Descreva a resolução.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('resolucao', resolucao);
    formData.append('tecnicoId', String(os.tecnico.id));
    formData.append('finalizadoEm', new Date().toISOString());
    formData.append('valorManutencao', valorManutencao);
    arquivos.forEach((file) => formData.append('arquivos', file));

    try {
      await api.put(`/os/${os.id}/concluir`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      toast({
        title: "Sucesso",
        description: "Chamado finalizado com sucesso!",
      });

      setAberto(null);
      setResolucao('');
      setArquivos([]);
      setFileNames([]);
      setValorManutencao('');

      const { data } = await api.get(endpointMap[statusFiltro], { withCredentials: true });
      if (data.preventivas && data.corretivas) {
        setDadosOS(data);
      } else {
        const preventivas = data.filter((os: OS) => os.preventiva);
        const corretivas = data.filter((os: OS) => !os.preventiva);
        setDadosOS({ preventivas, corretivas });
      }
    } catch (error) {
      console.error('Erro ao finalizar chamado:', error);
      toast({
        title: "Erro",
        description: "Erro ao finalizar chamado.",
        variant: "destructive",
      });
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
      case 'URGENTE': return 'bg-red-600';
      case 'ALTO': return 'bg-orange-500';
      case 'MEDIO': return 'bg-yellow-600';
      case 'BAIXO': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  function formatDateOnly(dateString: string) {
    if (!dateString) return "";
    const [dia, mes, ano] = dateString.split("/");
    return `${dia}/${mes}/${ano}`;
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Ordens de Serviço</h2>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Ordens de Serviço</h2>
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
      </div>

      {/* Tabs para separar Preventivas e Corretivas */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setTipoAtivo('preventivas')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              tipoAtivo === 'preventivas'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            Preventivas
            <Badge variant="secondary" className="ml-1">
              {dadosOS.preventivas.length}
            </Badge>
          </button>
          <button
            onClick={() => setTipoAtivo('corretivas')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              tipoAtivo === 'corretivas'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Corretivas
            <Badge variant="secondary" className="ml-1">
              {dadosOS.corretivas.length}
            </Badge>
          </button>
        </nav>
      </div>

      {/* Resumo de valores */}
      {dadosOS.totalManutencao !== undefined && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Resumo Financeiro
            </CardTitle>
            <div className="text-2xl font-bold text-green-600">
              Total: R$ {dadosOS.totalManutencao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardHeader>
        </Card>
      )}

      {chamadosAtivos.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nenhuma ordem de serviço {tipoAtivo === 'preventivas' ? 'preventiva' : 'corretiva'} encontrada.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {chamadosAtivos.map((os) => (
            <Card key={os.id} className={`overflow-hidden border-l-4 ${
              tipoAtivo === 'preventivas' ? 'border-l-blue-500' : 'border-l-orange-500'
            }`}>
              <Collapsible open={aberto === os.id} onOpenChange={() => handleAbrir(os.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        {/* Cabeçalho com badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg font-semibold">OS #{os.id}</CardTitle>
                          <Badge className={`text-white ${getStatusColor(os.status)}`}>
                            {os.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`text-white ${getPriorityColor(os.prioridade)}`}>
                            {os.prioridade}
                          </Badge>
                          {os.preventiva ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Settings className="w-3 h-3 mr-1" />
                              Preventiva
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Corretiva
                            </Badge>
                          )}
                          {os.recorrencia && os.recorrencia !== 'NENHUMA' && (
                            <Badge variant="outline" className="text-xs">
                              {os.recorrencia}
                            </Badge>
                          )}
                          {os.arquivos && os.arquivos.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <FileText className="w-3 h-3 mr-1" />
                              {os.arquivos.length} arquivo{os.arquivos.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>

                        {/* Descrição em destaque */}
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="text-sm font-medium text-foreground">{os.descricao}</p>
                        </div>

                        {/* Data agendada em destaque */}
                        {os.dataAgendada && (
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-blue-800">Agendado para:</span>
                              <span className="text-blue-700 font-medium">
                                {formatDateOnly(os.dataAgendada)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Informações organizadas em grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                          {/* Informações do equipamento */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-1 text-muted-foreground font-medium">
                              <Wrench className="w-3 h-3" />
                              Equipamento
                            </div>
                            <div className="pl-4 space-y-1">
                              {os.tipoEquipamento && (
                                <div><span className="font-medium">Tipo:</span> {os.tipoEquipamento.nome}</div>
                              )}
                              {os.equipamento ? (
                                <>
                                  <div><span className="font-medium">Nome:</span> {os.equipamento.nomeEquipamento || "N/I"}</div>
                                  <div><span className="font-medium">Série:</span> {os.equipamento.numeroSerie || "N/I"}</div>
                                  {os.equipamento.marca && (
                                    <div><span className="font-medium">Marca:</span> {os.equipamento.marca}</div>
                                  )}
                                  {os.equipamento.modelo && (
                                    <div><span className="font-medium">Modelo:</span> {os.equipamento.modelo}</div>
                                  )}
                                </>
                              ) : (
                                <div>N/I</div>
                              )}
                            </div>
                          </div>

                          {/* Informações de pessoas e local */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-1 text-muted-foreground font-medium">
                              <User className="w-3 h-3" />
                              Responsáveis
                            </div>
                            <div className="pl-4 space-y-1">
                              {os.solicitante && (
                                <div><span className="font-medium">Solicitante:</span> {os.solicitante.nome}</div>
                              )}
                              <div><span className="font-medium">Técnico:</span> {os.tecnico.nome}</div>
                              {os.Setor && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="font-medium">Setor:</span> {os.Setor.nome}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Informações de tempo */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-1 text-muted-foreground font-medium">
                              <Clock className="w-3 h-3" />
                              Histórico
                            </div>
                            <div className="pl-4 space-y-1">
                              <div><span className="font-medium">Criado:</span> {formatDate(os.criadoEm)}</div>

                              {os.iniciadaEm && (
                                <div><span className="font-medium">Iniciado:</span> {formatDate(os.iniciadaEm)}</div>
                              )}

                              {os.finalizadoEm && (
                                <div><span className="font-medium">Finalizado:</span> {formatDate(os.finalizadoEm)}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <CheckCircle className="h-5 w-5 text-muted-foreground" />
                        {aberto === os.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-4 border-t">
                    {/* Seção de arquivos existentes */}
                    {os.arquivos && os.arquivos.length > 0 && (
                      <div className="space-y-3">
                        <Label className="font-medium text-base">Arquivos anexados:</Label>
                        <div className="space-y-2">
                          {os.arquivos.map((arquivo, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-muted p-3 rounded-lg text-sm">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="truncate">{getFileNameFromPath(arquivo)}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadFile(arquivo)}
                                className="h-8 w-8 p-0"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Só mostra resolução e arquivos se OS não estiver concluída */}
                    {os.status !== 'CONCLUIDA' && os.status !== 'CANCELADA' && (
                      <>
                        {/* Resolução */}
                        {os.status === 'EM_ANDAMENTO' && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="resolucao" className="text-base font-medium">Resolução *</Label>
                              <Textarea
                                id="resolucao"
                                rows={4}
                                placeholder="Descreva detalhadamente a resolução do problema..."
                                value={resolucao}
                                onChange={(e) => setResolucao(e.target.value)}
                                className="resize-none"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="valorManutencao" className="text-base font-medium">Valor da manutenção (R$)</Label>
                              <Input
                                id="valorManutencao"
                                type="number"
                                step="0.01"
                                placeholder="Ex: 150.50"
                                value={valorManutencao}
                                onChange={(e) => setValorManutencao(e.target.value)}
                              />
                            </div>

                            {/* Arquivos */}
                            <div className="space-y-2">
                              <Label htmlFor="arquivos" className="text-base font-medium">
                                <Upload className="w-4 h-4 inline mr-2" />
                                Anexar novos arquivos
                              </Label>
                              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                                <input
                                  type="file"
                                  id="arquivos"
                                  multiple
                                  accept="image/*,.pdf"
                                  onChange={handleFileChange}
                                  className="hidden"
                                />
                                <label htmlFor="arquivos" className="cursor-pointer">
                                  <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Clique para selecionar arquivos</span>
                                    <span className="text-xs text-muted-foreground">Aceita imagens e PDFs</span>
                                  </div>
                                </label>
                              </div>

                              {fileNames.length > 0 && (
                                <div className="space-y-2">
                                  {fileNames.map((name, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-muted p-3 rounded-lg text-sm">
                                      <span className="truncate">{name}</span>
                                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(idx)} className="h-8 w-8 p-0">
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <Button
                              onClick={() => handleFinalizar(os)}
                              className="w-full bg-green-600 hover:bg-green-700"
                              disabled={!resolucao.trim()}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirmar Finalização
                            </Button>
                          </>
                        )}

                        {/* Botão para iniciar a OS se estiver ABERTA */}
                        {os.status === 'ABERTA' && (
                          <div className="space-y-2">
                            <Button
                              onClick={() => handleMudarStatus(os.id, 'EM_ANDAMENTO')}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Iniciar OS
                            </Button>

                            <Button
                              onClick={() => handleMudarStatus(os.id, 'CANCELADA')}
                              variant="outline"
                              className="w-full border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancelar OS
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChamadosTecnico;