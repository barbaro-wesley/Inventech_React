import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, QrCode, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback, useRef, useEffect } from "react";
import api from "@/lib/api";
import PopupEquip from "@/components/popups/PopupEquip";

interface Setor {
  id: number;
  nome: string;
}

interface Localizacao {
  id: number;
  nome: string;
  setorId: number;
}

interface TipoEquipamento {
  id: number;
  nome: string;
  grupoId: number;
  taxaDepreciacao: number | null;
}

interface OrdemServico {
  id: number;
  descricao: string;
  tipoEquipamentoId: number;
  equipamentoId: number;
  tecnicoId: number;
  solicitanteId: number;
  status: string;
  criadoEm: string;
  finalizadoEm: string | null;
  iniciadaEm: string | null;
  canceladaEm: string | null;
  valorManutencao: number | null;
  resolucao: string | null;
  arquivos: string[];
  preventiva: boolean;
  dataAgendada: string | null;
  recorrencia: string;
  intervaloDias: number | null;
  setorId: number;
}

interface Equipamento {
  id: number;
  numeroPatrimonio: string;
  numeroSerie: string;
  numeroAnvisa: string;
  nomeEquipamento: string;
  marca: string | null;
  modelo: string;
  fabricante: string;
  identificacao: string;
  ip: string | null;
  sistemaOperacional: string | null;
  nControle: string | null;
  BTUS: string | null;
  estado: string | null;
  taxaDepreciacao: number | null;
  valorAtual: number | null;
  valorCompra: number;
  dataCompra: string;
  inicioGarantia: string;
  terminoGarantia: string;
  notaFiscal: string;
  obs: string;
  setorId: number;
  localizacaoId: number;
  tipoEquipamentoId: number;
  createdAt: string;
  updatedAt: string;
  arquivos: string[];
  setor: Setor;
  localizacao: Localizacao;
  tipoEquipamento: TipoEquipamento;
  ordensServico: OrdemServico[];
}

const PesquisarEquipamento = () => {
  const [equipamento, setEquipamento] = useState<Equipamento | null>(null);
  const [numeroPatrimonio, setNumeroPatrimonio] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [qrScanner, setQrScanner] = useState<any>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  const pesquisarEquipamento = async (patrimonio: string) => {
    if (!patrimonio.trim()) {
      toast({
        title: "Erro",
        description: "Digite um número de patrimônio para pesquisar",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.get<Equipamento[]>(`/equipamentos-medicos/equipamentos-medicos/patrimonio/${patrimonio}`, {
        withCredentials: true,
      });

      if (response.data && response.data.length > 0) {
        setEquipamento(response.data[0]);
        toast({
          title: "Equipamento encontrado!",
          description: `${response.data[0].nomeEquipamento}`,
        });
      } else {
        throw new Error("No data");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast({
          title: "Equipamento não encontrado",
          description: `Nenhum equipamento encontrado com o patrimônio ${patrimonio}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro na pesquisa",
          description: "Ocorreu um erro ao pesquisar o equipamento",
          variant: "destructive",
        });
      }
      setEquipamento(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    pesquisarEquipamento(numeroPatrimonio);
  };

  const extractPatrimonioFromQR = (qrData: string): string => {
    try {
      // Tentar fazer parse como JSON (formato do nosso QR Code)
      const parsed = JSON.parse(qrData);
      if (parsed.patrimonio) {
        return parsed.patrimonio;
      }
    } catch (e) {
      // Se não for JSON, tentar extrair número de patrimônio diretamente
      // Procurar por padrões comuns de números de patrimônio
      const patterns = [
        /patrimonio[:\s]*([A-Za-z0-9]+)/i,
        /^([A-Za-z0-9]+)$/,
        /\b([A-Za-z0-9]{4,})\b/
      ];
      
      for (const pattern of patterns) {
        const match = qrData.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    
    // Se nada der certo, retornar o próprio dado
    return qrData.trim();
  };

  const handleQRScan = useCallback((result: string) => {
    if (result && result.trim()) {
      const patrimonio = extractPatrimonioFromQR(result);
      setNumeroPatrimonio(patrimonio);
      setShowScanner(false);
      stopScanner();
      
      toast({
        title: "QR Code lido!",
        description: `Patrimônio: ${patrimonio}`,
      });
      
      pesquisarEquipamento(patrimonio);
    }
  }, []);

  const startScanner = async () => {
    try {
      setCameraError(null);
      
      // Importar QrScanner dinamicamente
      const QrScanner = (await import('qr-scanner')).default;
      
      if (videoRef.current) {
        const scanner = new QrScanner(
          videoRef.current,
          (result: any) => handleQRScan(result.data),
          {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        await scanner.start();
        setQrScanner(scanner);
      }
    } catch (error: any) {
      console.error('Erro ao iniciar scanner:', error);
      
      let errorMessage = "Erro ao acessar a câmera";
      
      if (error.name === "NotAllowedError") {
        errorMessage = "Permissão de câmera negada. Habilite o acesso à câmera.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "Câmera ocupada. Feche outros apps que usam a câmera.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "Nenhuma câmera encontrada no dispositivo.";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Navegador não suporta acesso à câmera.";
      }
      
      setCameraError(errorMessage);
      toast({
        title: "Erro na câmera",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stopScanner = () => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      setQrScanner(null);
    }
  };

  useEffect(() => {
    if (showScanner) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [showScanner]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
            <Search className="h-6 w-6 sm:h-8 sm:w-8 text-brand-secondary" />
            Pesquisar Equipamento
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Encontre equipamentos pelo número de patrimônio ou QR Code
          </p>
        </div>
      </div>

      {/* Search Section */}
      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Digite o número de patrimônio..."
                className="pl-9 text-sm sm:text-base"
                value={numeroPatrimonio}
                onChange={(e) => setNumeroPatrimonio(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-gradient-brand hover:opacity-90 text-sm sm:text-base px-3 sm:px-4"
              >
                {loading ? "Pesquisando..." : "Pesquisar"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowScanner(!showScanner)}
                className="text-sm sm:text-base px-3 sm:px-4"
              >
                <QrCode className="h-4 w-4 mr-2" />
                {showScanner ? "Fechar QR" : "QR Scanner"}
              </Button>
            </div>
          </div>

          {/* QR Code Scanner */}
          {showScanner && (
            <div className="border rounded-lg p-4 bg-background">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Scanner QR Code
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScanner(false)}
                >
                  Fechar
                </Button>
              </div>
              
              <div className="w-full max-w-md mx-auto">
                {cameraError ? (
                  <div className="text-center py-8">
                    <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-destructive mb-4">{cameraError}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setCameraError(null);
                        startScanner();
                      }}
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full rounded-lg bg-black"
                      style={{ aspectRatio: '1/1' }}
                    />
                    <div className="absolute inset-4 border-2 border-blue-500 rounded-lg pointer-events-none">
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl"></div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl"></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br"></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center mt-4 space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Posicione o QR Code dentro da área destacada
                </p>
                <p className="text-xs text-muted-foreground">
                  O scanner detectará automaticamente o código
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Equipment Result */}
      {equipamento && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
              <div className="p-2 sm:p-3 bg-gradient-brand rounded-lg">
                <Search className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg sm:text-xl mb-2">
                  {equipamento.nomeEquipamento}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  {equipamento.tipoEquipamento?.nome || 'Equipamento'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="font-medium">Nº Patrimônio:</span>
                    <span className="text-muted-foreground ml-1">
                      {equipamento.numeroPatrimonio}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Setor:</span>
                    <span className="text-muted-foreground ml-1">
                      {equipamento.setor?.nome || 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Localização:</span>
                    <span className="text-muted-foreground ml-1">
                      {equipamento.localizacao?.nome || 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Modelo:</span>
                    <span className="text-muted-foreground ml-1">
                      {equipamento.modelo || 'Não informado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowPopup(true)}
              className="bg-gradient-brand hover:opacity-90 text-sm sm:text-base px-3 sm:px-4 w-full sm:w-auto"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
          </div>
        </Card>
      )}

      {/* Equipment Details Popup */}
      {showPopup && equipamento && (
        <PopupEquip
          equipamento={equipamento}
          onClose={() => setShowPopup(false)}
          onOptionClick={(tipo) => {
            console.log(`Ação ${tipo} para equipamento ${equipamento.id}`);
            setShowPopup(false);
          }}
        />
      )}
    </div>
  );
};

export default PesquisarEquipamento;