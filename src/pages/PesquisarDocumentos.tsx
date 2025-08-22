import { useState } from "react";
import { Search, Filter, Download, Eye, Calendar, MapPin, User, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockTrainingRecords, mockEmployees, mockDocumentTypes } from "@/data/mockData";
import { TrainingRecord, SearchFilters } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PesquisarDocumentos() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = mockTrainingRecords.filter((record) => {
    const matchesSearch = !searchTerm || (
      record.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.instrutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.tipoDocumento.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesType = !searchFilters.tipoDocumento || 
      record.tipoDocumento.id === searchFilters.tipoDocumento;

    const matchesEmployee = !searchFilters.funcionario ||
      record.participantes.some(p => p.id === searchFilters.funcionario);

    const matchesInstrutor = !searchFilters.instrutor ||
      record.instrutor.toLowerCase().includes(searchFilters.instrutor.toLowerCase());

    return matchesSearch && matchesType && matchesEmployee && matchesInstrutor;
  });

  const clearFilters = () => {
    setSearchFilters({});
    setSearchTerm("");
  };

  const getStatusBadge = (status: TrainingRecord['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'sent_for_signature':
        return <Badge className="bg-yellow-100 text-yellow-800">Enviado p/ Assinatura</Badge>;
      case 'signed':
        return <Badge className="bg-blue-100 text-blue-800">Assinado</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pesquisar Documentos</h1>
          <p className="text-muted-foreground mt-1">
            Encontre documentos de capacitação por diversos filtros
          </p>
        </div>
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, instrutor, local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select 
              value={searchFilters.tipoDocumento || ""} 
              onValueChange={(value) => setSearchFilters(prev => ({ 
                ...prev, 
                tipoDocumento: value === "all" ? undefined : value 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {mockDocumentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={searchFilters.funcionario || ""} 
              onValueChange={(value) => setSearchFilters(prev => ({ 
                ...prev, 
                funcionario: value === "all" ? undefined : value 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Funcionário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os funcionários</SelectItem>
                {mockEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Filtrar por instrutor..."
              value={searchFilters.instrutor || ""}
              onChange={(e) => setSearchFilters(prev => ({ 
                ...prev, 
                instrutor: e.target.value || undefined 
              }))}
            />

            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-lg">
            Resultados da Busca ({filteredRecords.length} documento{filteredRecords.length !== 1 ? 's' : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum documento encontrado
              </h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros de busca para encontrar mais resultados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <Card key={record.id} className="shadow-soft hover:shadow-medium transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-foreground">
                            {record.titulo}
                          </h3>
                          {getStatusBadge(record.status)}
                          <Badge variant="outline">{record.tipoDocumento.nome}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{format(record.data, "dd/MM/yyyy", { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{record.local}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="truncate">{record.instrutor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{record.participantes.length} participante{record.participantes.length > 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Participantes:</strong>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {record.participantes.map((participant) => (
                              <Badge key={participant.id} variant="secondary" className="text-xs">
                                {participant.nome}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm" title="Visualizar detalhes">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {(record.certificadoUrl || record.certificadoAssinado) && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Baixar documento"
                            className="text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}