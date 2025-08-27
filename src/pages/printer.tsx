import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Search, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PrinterForm } from "@/components/PrinterForm";
import api from "@/lib/api";

interface Printer {
  id?: number;
  numeroPatrimonio: string;
  nPatrimonio: string;
  modelo: string;
  marca: string;
  ip: string;
  localizacao?: { nome: string };
  setor?: { nome: string };
  tipoEquipamento?: { nome: string };
}

const PrinterPage = () => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const { toast } = useToast();

  const fetchPrinters = async () => {
    try {
      setLoading(true);
      const response = await api.get("/equipamentos-medicos/tipo/2", {
        withCredentials: true,
      });
      setPrinters(response.data);
    } catch (error) {
      toast({
        title: "Erro ao carregar impressoras",
        description: "Não foi possível carregar a lista de impressoras",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  const handleFormSubmit = (data: Printer) => {
    if (editingPrinter) {
      setPrinters((prev) =>
        prev.map((printer) => (printer.id === data.id ? data : printer))
      );
    } else {
      setPrinters((prev) => [...prev, data]);
    }
    setEditingPrinter(null);
    setShowForm(false);
  };

  const handleEdit = (printer: Printer) => {
    setEditingPrinter(printer);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPrinter(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-6 sm:h-8 w-6 sm:w-8 text-brand-secondary" />
            Impressoras
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gerencie impressoras do sistema
          </p>
        </div>

        <Button
          className="bg-gradient-brand hover:opacity-90 transition-opacity w-full sm:w-auto"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Impressora
        </Button>
      </div>

      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisar impressoras..." className="pl-8 text-sm" />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Filtros
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="h-8 w-20 bg-muted rounded self-start"></div>
              </div>
            </Card>
          ))
        ) : printers.length > 0 ? (
          printers.map((printer) => (
            <Card
              key={printer.id}
              className="p-4 sm:p-6 hover:shadow-soft transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="p-2 sm:p-3 bg-gradient-brand rounded-lg">
                    <Settings className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-1">
                      {printer.modelo || `Impressora #${printer.id}`}
                    </h3>
                    <p className="text-muted-foreground mb-3 text-sm sm:text-base">
                      {printer.marca || "Impressora"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="font-medium">Nº Patrimônio:</span>
                        <span className="text-muted-foreground ml-1">
                          {printer.numeroPatrimonio || "Não informado"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">IP:</span>
                        <span className="text-muted-foreground ml-1">
                          {printer.ip || "Não informado"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Setor:</span>
                        <span className="text-muted-foreground ml-1">
                          {printer.setor?.nome || "Não informado"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Localização:</span>
                        <span className="text-muted-foreground ml-1">
                          {printer.localizacao?.nome || "Não informado"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 self-start">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-[70px] px-2 rounded-md hover:bg-gray-100 text-sm"
                    onClick={() => handleEdit(printer)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 sm:p-12 text-center">
            <Settings className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">
              Nenhuma impressora encontrada
            </h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
              Comece adicionando a primeira impressora ao sistema
            </p>
            <Button
              className="bg-gradient-brand hover:opacity-90 w-full sm:w-auto"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Impressora
            </Button>
          </Card>
        )}
      </div>

      <PrinterForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingPrinter}
      />
    </div>
  );
};

export default PrinterPage;