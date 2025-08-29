import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Scan, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback, useRef } from "react";
import api from "@/lib/api";
import PopupEquip from "@/components/popups/PopupEquip";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

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
  const { toast } = useToast();
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

  const handleScanResult = useCallback((result: string) => {
    if (result) {
      setNumeroPatrimonio(result);
      setShowScanner(false);
      pesquisarEquipamento(result);
    }
  }, []);

 const handleScanError = useCallback((error: any) => {
  if (error?.name === "NotAllowedError") {
    toast({
      title: "Permissão negada",
      description: "Habilite o acesso à câmera no navegador.",
      variant: "destructive",
    });
  } else if (error?.name === "NotReadableError") {
    toast({
      title: "Erro",
      description: "Outro app pode estar usando a câmera.",
      variant: "destructive",
    });
  } else {
    console.error("Scanner error:", error);
  }
}, [toast]);

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
            Encontre equipamentos pelo número de patrimônio ou código de barras
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
                <Scan className="h-4 w-4 mr-2" />
                Scanner
              </Button>
            </div>
          </div>

          {/* Barcode Scanner */}
          {showScanner && (
            <div className="border rounded-lg p-4 bg-background">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base sm:text-lg font-semibold">Scanner de Código de Barras</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScanner(false)}
                >
                  Fechar
                </Button>
              </div>
              <div ref={scannerRef} className="w-full max-w-[90vw] sm:max-w-md mx-auto">
                <BarcodeScannerComponent
                  width="100%"
                  height={window.innerWidth < 640 ? 300 : 400}
                  facingMode="environment"
                  onUpdate={(err: any, result: any) => {
                    if (result) {
                      handleScanResult(result.getText());
                    }
                    if (err && err.name !== "NotFoundException") {
                      handleScanError(err);
                    }
                  }}
                />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2">
                Posicione o código de barras dentro da área de leitura
              </p>
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