import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle, ChevronDown, ChevronUp, Upload, X, FileText, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/api';

interface OS {
  id: number;
  descricao: string;
  status: string;
  criadoEm: string;
  finalizadoEm?: string | null;
  iniciadaEm?: string | null;
  preventiva: boolean;
  dataAgendada?: string | null;
  arquivos?: string[]; // Adicionado campo de arquivos
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

const ChamadosTecnico = () => {
  const [chamados, setChamados] = useState<OS[]>([]);
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
        setChamados(data);
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
      
      // Define a URL baseado no tipo de arquivo
      const fileUrl = isPdf 
        ? `${import.meta.env.VITE_API_URL2}/uploads/pdfs/${filename.replace(/^uploads[\/\\]pdfs[\/\\]/i, '')}`
        : `${import.meta.env.VITE_API_URL2}/uploads/${filename.replace(/^uploads[\/\\]pdfs[\/\\]/i, '')}`;
      
      // Abre o arquivo em nova aba para download
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

      // Atualiza lista de chamados
      const { data } = await api.get(endpointMap[statusFiltro], { withCredentials: true });
      setChamados(data);

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

      // Atualiza lista de chamados
      const { data } = await api.get(endpointMap[statusFiltro], { withCredentials: true });
      setChamados(data);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <h2 className="text-xl font-bold">Chamados Atribuídos</h2>
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
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold text-foreground">Chamados Atribuídos</h2>
      <select
        value={statusFiltro}
        onChange={(e) => setStatusFiltro(e.target.value)}
        className="border rounded p-2 text-sm"
      >
        <option value="ABERTA">Abertas</option>
        <option value="EM_ANDAMENTO">Em Andamento</option>
        <option value="CONCLUIDA">Concluídas</option>
        <option value="CANCELADA">Canceladas</option>
      </select>
      {chamados.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Nenhum chamado atribuído.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {chamados.map((os) => (
            <Card key={os.id} className="overflow-hidden">
              <Collapsible open={aberto === os.id} onOpenChange={() => handleAbrir(os.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm font-medium">OS #{os.id}</CardTitle>
                          <Badge className={`text-white ${getStatusColor(os.status)}`}>
                            {os.status}
                          </Badge>
                          {os.preventiva && (
                            <Badge variant="outline" className="text-xs">Preventiva</Badge>
                          )}
                          {os.arquivos && os.arquivos.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {os.arquivos.length} arquivo{os.arquivos.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-foreground font-medium">{os.descricao}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            {os.tipoEquipamento && <div><span className="font-medium">Tipo:</span> {os.tipoEquipamento.nome}</div>}
                            {os.Setor && <div><span className="font-medium">Setor:</span> {os.Setor.nome}</div>}
                            {os.solicitante && <div><span className="font-medium">Solicitante:</span> {os.solicitante.nome}</div>}
                            <div>
                              <span className="font-medium">Criado:</span> {formatDate(os.criadoEm)}
                            </div>

                            {os.iniciadaEm && (
                              <div>
                                <span className="font-medium">Iniciado:</span> {formatDate(os.iniciadaEm)}
                              </div>
                            )}

                            {os.finalizadoEm && (
                              <div>
                                <span className="font-medium">Finalizado:</span> {formatDate(os.finalizadoEm)}
                              </div>
                            )}

                            {os.equipamento ? (
                              <>
                                <div>
                                  <span className="font-medium">Equipamento:</span>{" "}
                                  {os.equipamento.nomeEquipamento?.trim() || "N/I"}
                                </div>
                                <div>
                                  <span className="font-medium">SN:</span>{" "}
                                  {os.equipamento.numeroSerie?.trim() || "N/I"}
                                </div>
                              </>
                            ) : (
                              <div>
                                <span className="font-medium">Equipamento:</span> N/I
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <CheckCircle className="h-4 w-4" />
                        {aberto === os.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {/* Seção de arquivos existentes */}
                    {os.arquivos && os.arquivos.length > 0 && (
                      <div className="space-y-2">
                        <Label className="font-medium">Arquivos anexados:</Label>
                        <div className="space-y-2">
                          {os.arquivos.map((arquivo, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="truncate">{getFileNameFromPath(arquivo)}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadFile(arquivo)}
                                className="h-6 w-6 p-0"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Só mostra resolução e arquivos se OS não estiver concluída */}
                    {os.status !== 'CONCLUIDA' && (
                      <>
                        {/* Resolução */}
                        {os.status === 'EM_ANDAMENTO' && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="resolucao">Resolução *</Label>
                              <Textarea
                                id="resolucao"
                                rows={4}
                                placeholder="Descreva a resolução..."
                                value={resolucao}
                                onChange={(e) => setResolucao(e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="valorManutencao">Valor da manutenção (R$)</Label>
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
                              <Label htmlFor="arquivos">
                                <Upload className="w-4 h-4 inline mr-2" />
                                Anexar novos arquivos
                              </Label>
                              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
                                <input
                                  type="file"
                                  id="arquivos"
                                  multiple
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  className="hidden"
                                />
                                <label htmlFor="arquivos" className="cursor-pointer">
                                  <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-6 h-6 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Clique para selecionar arquivos</span>
                                  </div>
                                </label>
                              </div>

                              {fileNames.length > 0 && (
                                <div className="space-y-1">
                                  {fileNames.map((name, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                                      <span className="truncate">{name}</span>
                                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(idx)} className="h-6 w-6 p-0">
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <Button
                              onClick={() => handleFinalizar(os)}
                              className="w-full bg-gradient-brand hover:opacity-90"
                              disabled={!resolucao.trim()}
                            >
                              Confirmar Finalização
                            </Button>
                          </>
                        )}

                        {/* Botão para iniciar a OS se estiver ABERTA */}
                        {os.status === 'ABERTA' && (
                          <Button
                            onClick={() => handleMudarStatus(os.id, 'EM_ANDAMENTO')}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Iniciar OS
                          </Button>
                        )}

                        {/* Botão para cancelar OS (opcional) */}
                        {os.status === 'ABERTA' && (
                          <Button
                            onClick={() => handleMudarStatus(os.id, 'CANCELADA')}
                            className="w-full bg-red-500 hover:opacity-90 mt-2"
                          >
                            Cancelar OS
                          </Button>
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