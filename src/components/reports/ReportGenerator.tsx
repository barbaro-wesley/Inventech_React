import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Download, FileText, Eye } from 'lucide-react';

// Mock API
const api = {
  get: async (endpoint, options = {}) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`API Call: ${endpoint}`, options.params);
    
    if (endpoint === '/reports/performance-tecnicos') {
      return {
        data: [
          {
            tecnico: {
              id: 18,
              nome: "Compras",
              email: "ti2@hcrmarau.com.br",
              grupo: "Engenharia Clinica",
              ativo: true
            },
            estatisticas: {
              totalOrdens: 74,
              concluidas: 7,
              abertas: 66,
              emAndamento: 1,
              canceladas: 0,
              taxaSucesso: 9.46,
              tempoMedioResolucaoHoras: 37.02,
              valorTotalManutencoes: 12500.00
            },
            analisePorTipo: [
              {
                tipo: "Equipamentos Cirurgicos",
                total: 74,
                concluidas: 7,
                taxaSucesso: 9.46
              }
            ]
          },
          {
            tecnico: {
              id: 1,
              nome: "Wesley Barbaro",
              email: "wesleybarbaro09@gmail.com",
              grupo: "TI",
              ativo: true
            },
            estatisticas: {
              totalOrdens: 92,
              concluidas: 4,
              abertas: 85,
              emAndamento: 3,
              canceladas: 0,
              taxaSucesso: 4.35,
              tempoMedioResolucaoHoras: 61.06,
              valorTotalManutencoes: 8750.00
            },
            analisePorTipo: [
              {
                tipo: "Ar Condicionado",
                total: 18,
                concluidas: 3,
                taxaSucesso: 16.67
              },
              {
                tipo: "Computador",
                total: 62,
                concluidas: 1,
                taxaSucesso: 1.61
              },
              {
                tipo: "Impressora",
                total: 12,
                concluidas: 0,
                taxaSucesso: 0
              }
            ]
          }
        ]
      };
    }
    
    return { data: [] };
  }
};

// Mock components para demonstração
const EquipamentosPorSetorReport = ({ data, filtros }) => (
  <div style={{ padding: 20 }}>
    <h1>Relatório de Equipamentos por Setor</h1>
    <p>Dados: {JSON.stringify({ data: data.length, filtros }, null, 2)}</p>
  </div>
);

const OsPorTecnicoReport = ({ data, filtros }) => (
  <div style={{ padding: 20 }}>
    <h1>Relatório de OS por Técnico</h1>
    <p>Dados: {JSON.stringify({ data: data.length, filtros }, null, 2)}</p>
  </div>
);

const PerformanceTecnicosReport = ({ data, filtros }) => (
  <div style={{ padding: 20 }}>
    <h1>Relatório de Performance dos Técnicos</h1>
    <p>Técnicos: {data.length}</p>
    <p>Período: {filtros?.periodo}</p>
    <p>Incluir detalhes: {filtros?.incluirDetalhes ? 'Sim' : 'Não'}</p>
    {data.map((item, index) => (
      <div key={item.tecnico.id} style={{ margin: '10px 0', padding: 10, border: '1px solid #ccc' }}>
        <h3>{item.tecnico.nome} - {item.tecnico.grupo}</h3>
        <p>Total de Ordens: {item.estatisticas.totalOrdens}</p>
        <p>Taxa de Sucesso: {item.estatisticas.taxaSucesso}%</p>
      </div>
    ))}
  </div>
);

// Mock config components
const ReportConfigEquipamentosPorSetor = ({ onGenerateWithConfig, loading }) => (
  <Card>
    <CardHeader>
      <CardTitle>Equipamentos por Setor</CardTitle>
    </CardHeader>
    <CardContent>
      <Button 
        onClick={() => onGenerateWithConfig?.({ setores: 'TI,Compras', tipos: 'Computador,Impressora' })}
        disabled={loading}
      >
        {loading ? 'Carregando...' : 'Gerar Relatório'}
      </Button>
    </CardContent>
  </Card>
);

const ReportConfigOsPorTecnico = ({ onGenerateWithConfig, loading }) => (
  <Card>
    <CardHeader>
      <CardTitle>OS por Técnico</CardTitle>
    </CardHeader>
    <CardContent>
      <Button 
        onClick={() => onGenerateWithConfig?.({ 
          tecnicos: '1,18', 
          inicio: '2024-01-01', 
          fim: '2024-12-31',
          campoData: 'criadoEm'
        })}
        disabled={loading}
      >
        {loading ? 'Carregando...' : 'Gerar Relatório'}
      </Button>
    </CardContent>
  </Card>
);

// Importando o componente que criamos anteriormente
import ReportConfigPerformanceTecnicos from './configs/ReportConfigPerformanceTecnicos';

export const ReportGenerator: React.FC = () => {
  const [reportType, setReportType] = useState<string>('performance-tecnicos');
  const [showPreview, setShowPreview] = useState(false);
  const [equipamentosPorSetor, setEquipamentosPorSetor] = useState<any[]>([]);
  const [osPorTecnico, setOsPorTecnico] = useState<any[]>([]);
  const [performanceTecnicos, setPerformanceTecnicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportConfig, setReportConfig] = useState<any>({});

  const fetchEquipamentosPorSetor = async (config: any) => {
    try {
      setLoading(true);
      const response = await api.get('/reports/equipamentos-por-setor', {
        params: {
          setores: config.setores,
          tipos: config.tipos,
        },
      });
      setEquipamentosPorSetor(response.data);
      setShowPreview(true);
    } catch (error) {
      console.error('Erro ao buscar equipamentos por setor:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOsPorTecnico = async (config: any) => {
    try {
      setLoading(true);
      const response = await api.get('/reports/os-por-tecnico', {
        params: {
          tecnicos: config.tecnicos,
          inicio: config.inicio,
          fim: config.fim,
          campoData: config.campoData || 'criadoEm',
          status: config.status || undefined,
        },
      });
      setOsPorTecnico(response.data);
      setShowPreview(true);
    } catch (error) {
      console.error('Erro ao buscar OS por técnico:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceTecnicos = async (config: any) => {
    try {
      setLoading(true);
      setReportConfig(config); // Salva a configuração
      
      const response = await api.get('/reports/performance-tecnicos', {
        params: {
          inicio: config.inicio,
          fim: config.fim,
          tecnicos: config.tecnicos || undefined,
          detalhes: config.detalhes || false,
        },
      });
      
      setPerformanceTecnicos(response.data);
      setShowPreview(true);
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
            onGenerateWithConfig={fetchEquipamentosPorSetor}
            loading={loading}
          />
        );
      case 'os-por-tecnico':
        return (
          <ReportConfigOsPorTecnico
            onGenerateWithConfig={fetchOsPorTecnico}
            loading={loading}
          />
        );
      case 'performance-tecnicos':
        return (
          <ReportConfigPerformanceTecnicos
            onGenerateWithConfig={fetchPerformanceTecnicos}
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
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPreview(false)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ocultar Preview
                  </Button>
                  
                  {getReportComponent() && (
                    <PDFDownloadLink
                      document={getReportComponent()!}
                      fileName={getReportFilename()}
                    >
                      {({ loading: pdfLoading }) => (
                        <Button 
                          disabled={pdfLoading} 
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {pdfLoading ? 'Gerando PDF...' : 'Download PDF'}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  )}
                </div>
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
                    Configure e gere um relatório
                  </p>
                  <p className="text-sm mb-4">
                    Preencha os filtros e clique em "Gerar Relatório" para visualizar
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 justify-center">
                      <Select value={reportType} onValueChange={(value) => {
                        setReportType(value);
                        setShowPreview(false);
                        setPerformanceTecnicos([]);
                        setOsPorTecnico([]);
                        setEquipamentosPorSetor([]);
                      }}>
                        <SelectTrigger className="w-64">
                          <SelectValue />
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