import { useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Scan, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import PopupEquip from "@/components/popups/PopupEquip";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

interface Equipamento {
  id: number;
  numeroPatrimonio: string;
  nomeEquipamento: string;
  modelo: string;
  setor?: { nome: string };
  localizacao?: { nome: string };
  tipoEquipamento?: { nome: string };
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
      const response = await api.get(`/equipamentos-medicos/patrimonio/${patrimonio}`, {
        withCredentials: true,
      });
      
      if (response.data) {
        setEquipamento(response.data);
        toast({
          title: "Equipamento encontrado!",
          description: `${response.data.nomeEquipamento}`,
        });
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
    console.error("Scanner error:", error);
    toast({
      title: "Erro no scanner",
      description: "Não foi possível acessar a câmera",
      variant: "destructive",
    });
  }, [toast]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Search className="h-8 w-8 text-brand-secondary" />
            Pesquisar Equipamento
          </h1>
          <p className="text-muted-foreground mt-1">
            Encontre equipamentos pelo número de patrimônio ou código de barras
          </p>
        </div>
      </div>

      {/* Search Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Digite o número de patrimônio..."
                className="pl-9"
                value={numeroPatrimonio}
                onChange={(e) => setNumeroPatrimonio(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-brand hover:opacity-90"
            >
              {loading ? "Pesquisando..." : "Pesquisar"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowScanner(!showScanner)}
            >
              <Scan className="h-4 w-4 mr-2" />
              Scanner
            </Button>
          </div>

          {/* Barcode Scanner */}
          {showScanner && (
            <div className="border rounded-lg p-4 bg-background">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Scanner de Código de Barras</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScanner(false)}
                >
                  Fechar
                </Button>
              </div>
              <div ref={scannerRef} className="w-full max-w-md mx-auto">
                <BarcodeScannerComponent
                  width={300}
                  height={300}
                  onUpdate={(err: any, result: any) => {
                    if (result) {
                      handleScanResult(result.getText());
                    }
                    if (err) {
                      handleScanError(err);
                    }
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Posicione o código de barras dentro da área de leitura
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Equipment Result */}
      {equipamento && (
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 flex-1">
              <div className="p-3 bg-gradient-brand rounded-lg">
                <Search className="h-6 w-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-xl mb-2">
                  {equipamento.nomeEquipamento}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {equipamento.tipoEquipamento?.nome || 'Equipamento'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
              className="bg-gradient-brand hover:opacity-90"
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