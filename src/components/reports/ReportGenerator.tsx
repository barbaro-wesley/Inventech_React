import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Download, FileText, Eye } from 'lucide-react';
import { EquipamentosPorSetorReport } from './EquipamentosPorSetorReport';
import { OsPorTecnicoReport } from './OsPorTecnicoReport';
import { PerformanceTecnicosReport } from './PerformanceTecnicosReport';
import { ReportConfigEquipamentosPorSetor } from './configs/ReportConfigEquipamentosPorSetor';
import { ReportConfigOsPorTecnico } from './configs/ReportConfigOsPorTecnico';
import { ReportConfigPerformanceTecnicos } from './configs/ReportConfigPerformanceTecnicos';
import api from '@/lib/api';

export const ReportGenerator: React.FC = () => {
  const [reportType, setReportType] = useState<string>('condicionadores');
  const [filters, setFilters] = useState({
    dataInicio: '',
    dataFim: '',
    setor: '',
    tipo: '',
    setores: '',
    tipos: '',
    tecnicos: '',
    inicio: '',
    fim: '',
    campoData: 'criadoEm',
    status: '',
    detalhes: false,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [condicionadores, setCondicionadores] = useState<any[]>([]);
  const [equipamentosPorSetor, setEquipamentosPorSetor] = useState<any[]>([]);
  const [osPorTecnico, setOsPorTecnico] = useState<any[]>([]);
  const [performanceTecnicos, setPerformanceTecnicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportConfig, setReportConfig] = useState<any>({});

  useEffect(() => {
    if (reportType === 'equipamentos-por-setor') {
      if (filters.setores && filters.tipos) {
        fetchEquipamentosPorSetor();
      }
      return;
    }
    if (reportType === 'os-por-tecnico') {
      if (filters.tecnicos && filters.inicio && filters.fim) {
        fetchOsPorTecnico();
      }
      return;
    }
    if (reportType === 'performance-tecnicos') {
      if (filters.inicio && filters.fim) {
        fetchPerformanceTecnicos();
      }
      return;
    }
  }, [
    reportType, 
    filters.setores, 
    filters.tipos, 
    filters.tecnicos, 
    filters.inicio, 
    filters.fim, 
    filters.campoData, 
    filters.status,
    filters.detalhes
  ]);

  const fetchEquipamentosPorSetor = async (config?: any) => {
    try {
      const configToUse = config || reportConfig;
      if (!configToUse.setores || !configToUse.tipos) return;
      setLoading(true);
      const response = await api.get('/reports/equipamentos-por-setor', {
        params: {
          setores: configToUse.setores,
          tipos: configToUse.tipos,
        },
      });
      setEquipamentosPorSetor(response.data);
    } catch (error) {
      console.error('Erro ao buscar equipamentos por setor:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOsPorTecnico = async (config?: any) => {
    try {
      const configToUse = config || reportConfig;
      if (!configToUse.tecnicos || !configToUse.inicio || !configToUse.fim) return;
      setLoading(true);
      const response = await api.get('/reports/os-por-tecnico', {
        params: {
          tecnicos: configToUse.tecnicos,
          inicio: configToUse.inicio,
          fim: configToUse.fim,
          campoData: configToUse.campoData || 'criadoEm',
          status: configToUse.status || undefined,
        },
      });
      setOsPorTecnico(response.data);
    } catch (error) {
      console.error('Erro ao buscar OS por técnico:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceTecnicos = async (config?: any) => {
    try {
      const configToUse = config || reportConfig;
      if (!configToUse.inicio || !configToUse.fim) return;
      setLoading(true);
      const response = await api.get('/reports/performance-tecnicos', {
        params: {
          inicio: configToUse.inicio,
          fim: configToUse.fim,
          tecnicos: configToUse.tecnicos || undefined,
          detalhes: configToUse.detalhes || false,
        },
      });
      setPerformanceTecnicos(response.data);
    } catch (error) {
      console.error('Erro ao buscar performance dos técnicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReportComponent = () => {
    switch (reportType) {
      case 'equipamentos-por-setor':
        return (
          <EquipamentosPorSetorReport
            data={equipamentosPorSetor}
            filtros={reportConfig}
          />
        );
      case 'os-por-tecnico':
        return (
          <OsPorTecnicoReport
            data={osPorTecnico}
            filtros={reportConfig}
          />
        );
      case 'performance-tecnicos':
        return (
          <PerformanceTecnicosReport
            data={performanceTecnicos}
            filtros={{
              periodo: reportConfig.inicio && reportConfig.fim 
                ? `${new Date(reportConfig.inicio).toLocaleDateString('pt-BR')} - ${new Date(reportConfig.fim).toLocaleDateString('pt-BR')}`
                : undefined,
              tecnicos: reportConfig.tecnicosNomes || reportConfig.tecnicos,
              incluirDetalhes: reportConfig.detalhes || false,
            }}
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
      case 'equipamentos-por-setor':
        return `relatorio-equip-por-setor-${now}.pdf`;
      case 'os-por-tecnico':
        return `relatorio-os-por-tecnico-${now}.pdf`;
      case 'performance-tecnicos':
        return `relatorio-performance-tecnicos-${now}.pdf`;
      default:
        return `relatorio-${now}.pdf`;
    }
  };

  const renderConfigComponent = () => {
    switch (reportType) {
      case 'equipamentos-por-setor':
        return (
          <ReportConfigEquipamentosPorSetor
            onConfigChange={(config) => {
              setReportConfig(config);
              fetchEquipamentosPorSetor(config);
            }}
            onGenerate={() => setShowPreview(true)}
            loading={loading}
          />
        );
      case 'os-por-tecnico':
        return (
          <ReportConfigOsPorTecnico
            onConfigChange={(config) => {
              setReportConfig(config);
              fetchOsPorTecnico(config);
            }}
            onGenerate={() => setShowPreview(true)}
            loading={loading}
          />
        );
      case 'performance-tecnicos':
        return (
          <ReportConfigPerformanceTecnicos
            onConfigChange={(config) => {
              setReportConfig(config);
              fetchPerformanceTecnicos(config);
            }}
            onGenerate={() => setShowPreview(true)}
            loading={loading}
          />
        );
      default:
        return (
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
                    <SelectItem value="equipamentos-por-setor">
                      📦 Equipamentos por Setor
                    </SelectItem>
                    <SelectItem value="os-por-tecnico">
                      🔧 OS por Técnico
                    </SelectItem>
                    <SelectItem value="performance-tecnicos">
                      📊 Performance dos Técnicos
                    </SelectItem>
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
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações do Relatório */}
        <div className="lg:col-span-1">
          {renderConfigComponent()}
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          {showPreview && getReportComponent() && (
            <Card>
              <CardHeader>
                <CardTitle>Preview do Relatório</CardTitle>
                <CardDescription>
                  {reportType === 'performance-tecnicos' && 
                    'Análise detalhada da performance dos técnicos'}
                  {reportType === 'os-por-tecnico' && 
                    'Ordens de serviço agrupadas por técnico'}
                  {reportType === 'equipamentos-por-setor' && 
                    'Equipamentos organizados por setor'}
                </CardDescription>
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
                  <p className="text-lg font-medium mb-2">
                    Selecione um relatório para visualizar
                  </p>
                  <p className="text-sm">
                    Configure os filtros e clique em "Visualizar" para ver o preview
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2 justify-center">
                      <span>📦</span>
                      <span>Equipamentos por Setor</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <span>🔧</span>
                      <span>OS por Técnico</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <span>📊</span>
                      <span>Performance dos Técnicos</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};