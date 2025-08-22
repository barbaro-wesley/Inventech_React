import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Computer, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import api from "@/lib/api";
const Computadores = () => {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchComputers = async () => {
      try {
        const response = await api.get('/hcr-computers', {
          withCredentials: true,
        });

        // axios não tem response.ok
        setComputers(response.data);

      } catch (error) {
        toast({
          title: "Erro ao carregar computadores",
          description: "Não foi possível carregar a lista de computadores",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchComputers();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Computer className="h-8 w-8 text-brand-primary" />
            Computadores
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os computadores da organização
          </p>
        </div>


        <Button className="bg-gradient-brand hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          Novo Computador
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar computadores..."
            <Input
              placeholder="Pesquisar computadores..."
              className="pl-9"
            />
          </div>
          <Button variant="outline">Filtros</Button>
        </div>
      </Card>

      {/* Computers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </Card>
          ))
        ) : computers.length > 0 ? (
          computers.map((computer: any) => (
            <Card key={computer.id} className="p-6 hover:shadow-soft transition-shadow">
          computers.map((computer: any) => (
            <Card key={computer.id} className="p-6 hover:shadow-soft transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-gradient-brand rounded-lg">
                  <Computer className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Ativo
                </span>
              </div>

              <h3 className="font-semibold text-lg mb-2">
                {computer.nomePC} ({computer.nPatrimonio})
              </h3>

              <div className="space-y-1 text-sm text-muted-foreground">
                <p><span className="font-medium">IP:</span> {computer.ip}</p>
                <p><span className="font-medium">SO:</span> {computer.sistemaOperacional}</p>
                <p><span className="font-medium">Setor:</span> {computer.setor?.nome}</p>
              </div>


              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Manutenção
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Computer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum computador encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando o primeiro computador ao sistema
            </p>
            <Button className="bg-gradient-brand hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Computador
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Computadores;