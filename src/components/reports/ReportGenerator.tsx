import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Download, FileText, Eye } from 'lucide-react';
import { EquipamentosReport } from './EquipamentosReport';
import { CondicionadoresReport } from './CondicionadoresReport';
import api from '@/lib/api';

export const ReportGenerator: React.FC = () => {
  const [reportType, setReportType] = useState<string>('condicionadores');
  const [filters, setFilters] = useState({
    dataInicio: '',
    dataFim: '',
    setor: '',
    tipo: '',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [condicionadores, setCondicionadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reportType === 'condicionadores') {
      fetchCondicionadores();
    }
  }, [reportType]);

  const fetchCondicionadores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/condicionadores');
      setCondicionadores(response.data);
    } catch (error) {
      console.error('Erro ao buscar condicionadores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dados mockados para equipamentos
  const mockEquipamentos = [
    {
      id: 'EQ001',
      nome: 'Computador Desktop Dell',
      tipo: 'Computador',
      setor: 'TI',
      status: 'Ativo',
      dataAquisicao: '2023-01-15',
    },
    {
      id: 'EQ002',
      nome: 'Impressora HP LaserJet',
      tipo: 'Impressora',
      setor: 'Administrativo',
      status: 'Ativo',
      dataAquisicao: '2023-02-20',
    },
  ];

  const getReportComponent = () => {
    switch (reportType) {
      case 'equipamentos':
        return (
          <EquipamentosReport
            equipamentos={mockEquipamentos}
            filtros={filters}
          />
        );
      case 'condicionadores':
        return (
          <CondicionadoresReport
            condicionadores={condicionadores}
            filtros={filters}
          />
        );
      default:
        return null;
    }
  };

  const getReportFilename = () => {
    const now = new Date().toISOString().split('T')[0];
    switch (reportType) {
      case 'equipamentos':
        return `relatorio-equipamentos-${now}.pdf`;
      case 'condicionadores':
        return `relatorio-condicionadores-${now}.pdf`;
      default:
        return `relatorio-${now}.pdf`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações do Relatório */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configurações do Relatório
              </CardTitle>
              <CardDescription>
                Configure os parâmetros do relatório
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reportType">Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="condicionadores">Relatório de Condicionadores de Ar</SelectItem>
                    <SelectItem value="equipamentos">Relatório de Equipamentos</SelectItem>
                    <SelectItem value="usuarios">Relatório de Usuários</SelectItem>
                    <SelectItem value="manutencao">Relatório de Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={filters.dataInicio}
                    onChange={(e) =>
                      setFilters(prev => ({ ...prev, dataInicio: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={filters.dataFim}
                    onChange={(e) =>
                      setFilters(prev => ({ ...prev, dataFim: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="setor">Setor</Label>
                <Select
                  value={filters.setor}
                  onValueChange={(value) =>
                    setFilters(prev => ({ ...prev, setor: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os setores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os setores</SelectItem>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Vendas">Vendas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Ocultar' : 'Visualizar'}
                </Button>

                {getReportComponent() && (
                  <PDFDownloadLink
                    document={getReportComponent()!}
                    fileName={getReportFilename()}
                  >
                    {({ loading }) => (
                      <Button disabled={loading} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        {loading ? 'Carregando dados...' : 'Download'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          {showPreview && getReportComponent() && (
            <Card>
              <CardHeader>
                <CardTitle>Preview do Relatório</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] border rounded-lg overflow-hidden">
                  <PDFViewer width="100%" height="100%">
                    {getReportComponent()}
                  </PDFViewer>
                </div>
              </CardContent>
            </Card>
          )}

          {!showPreview && (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Clique em "Visualizar" para ver o preview do relatório</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};