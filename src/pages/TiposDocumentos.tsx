import { useState } from "react";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockDocumentTypes } from "@/data/mockData";
import { DocumentType } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TiposDocumento() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(mockDocumentTypes);

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este tipo de documento?")) {
      setDocumentTypes(documentTypes.filter(type => type.id !== id));
    }
  };

  const getTypeIcon = (nome: string) => {
    switch (nome.toLowerCase()) {
      case 'treinamento':
        return '🎓';
      case 'integração':
        return '👋';
      case 'palestra':
        return '🎤';
      case 'workshop':
        return '🛠️';
      case 'certificação':
        return '🏆';
      default:
        return '📄';
    }
  };

  const getTypeColor = (nome: string) => {
    switch (nome.toLowerCase()) {
      case 'treinamento':
        return 'bg-blue-100 text-blue-800';
      case 'integração':
        return 'bg-green-100 text-green-800';
      case 'palestra':
        return 'bg-purple-100 text-purple-800';
      case 'workshop':
        return 'bg-orange-100 text-orange-800';
      case 'certificação':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tipos de Documento</h1>
          <p className="text-muted-foreground mt-1">
            Configure os tipos de documentos de capacitação
          </p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover shadow-medium">
          <Plus className="w-4 h-4 mr-2" />
          Novo Tipo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentTypes.map((docType) => (
          <Card key={docType.id} className="shadow-medium hover:shadow-strong transition-smooth">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getTypeIcon(docType.nome)}</div>
                  <div>
                    <CardTitle className="text-lg">{docType.nome}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Criado em {format(docType.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <Badge className={getTypeColor(docType.nome)}>
                  Ativo
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {docType.descricao || "Nenhuma descrição disponível"}
              </p>
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDelete(docType.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Lista Detalhada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentTypes.map((docType) => (
                  <TableRow key={docType.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(docType.nome)}</span>
                        <Badge className={getTypeColor(docType.nome)}>
                          {docType.nome}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{docType.nome}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs">
                      {docType.descricao || "Nenhuma descrição"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(docType.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(docType.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}