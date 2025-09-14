import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Download, FileText } from 'lucide-react';
import api from '@/lib/api';

// Componente PDF (seria importado do arquivo separado)
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  companyInfo: {
    alignItems: 'center',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#082C5E',
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 9,
    color: '#0B428E',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#082C5E',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 25,
    color: '#374151',
  },
  content: {
    flex: 1,
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#082C5E',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  badge: {
    fontSize: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    textAlign: 'center',
    marginVertical: 2,
  },
  badgeUrgente: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
  },
  badgeAlta: {
    backgroundColor: '#fff7ed',
    color: '#ea580c',
  },
  badgeMedio: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
  },
  badgeNormal: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
  },
  badgeBaixa: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  preventivaBadge: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontSize: 7,
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 9,
    color: '#6b7280',
  },
  pageNumber: {
    fontSize: 9,
    color: '#6b7280',
  },
});

interface OrdemServico {
  id: number;
  descricao: string;
  preventiva: boolean;
  prioridade: string;
  status: string;
  criadoEm: string;
  iniciadaEm?: string;
  finalizadoEm?: string;
  canceladaEm?: string;
  dataAgendada: string;
  valorManutencao?: number;
  resolucao?: string;
  tipoEquipamento: {
    id: number;
    nome: string;
    grupoId: number;
    taxaDepreciacao?: number;
  };
  tecnico: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    matricula: string;
    admissao: string;
    ativo: boolean;
    telegramChatId?: string;
    grupoId: number;
  };
  solicitante: {
    nome: string;
  };
  Setor?: any;
  equipamento: {
    nomeEquipamento: string;
    marca?: string;
    modelo: string;
    numeroSerie: string;
  };
}

interface RelatorioCompletoResponse {
  success: boolean;
  data: {
    message: string;
    estatisticas: {
      totalOS: number;
      porStatus: Record<string, number>;
      porPrioridade: Record<string, number>;
      porTipoEquipamento: Record<string, number>;
      periodo: {
        inicio: string;
        fim: string;
      };
    };
    ordens: OrdemServico[];
  };
}

interface Props {
  config: {
    dataInicio: string;
    dataFim: string;
    status: string;
    prioridade: string;
  };
}

const getPrioridadeColor = (prioridade: string) => {
  switch (prioridade) {
    case 'URGENTE': return 'bg-red-100 text-red-800';
    case 'ALTO': return 'bg-orange-100 text-orange-800';
    case 'MEDIO': return 'bg-blue-100 text-blue-800';
    case 'BAIXO': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPrioridadeBadgeStyle = (prioridade: string) => {
  switch (prioridade) {
    case 'URGENTE': return pdfStyles.badgeUrgente;
    case 'ALTO': return pdfStyles.badgeAlta;
    case 'MEDIO': return pdfStyles.badgeMedio;
    case 'BAIXO': return pdfStyles.badgeBaixa;
    default: return pdfStyles.badgeBaixa;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  if (dateString.includes(',')) {
    return dateString.split(',')[0];
  }
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Componente PDF
const TecnicoReportPDF: React.FC<{ data: RelatorioCompletoResponse['data']; filtros: Props['config'] }> = ({ data, filtros }) => {
  const { estatisticas, ordens } = data;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View style={pdfStyles.companyInfo}>
            <Text style={pdfStyles.companyName}>Inventech</Text>
            <Text style={pdfStyles.companyAddress}>Rua Bento Gonçalves, 10 - Centro</Text>
          </View>
        </View>

        <Text style={pdfStyles.title}>Relatório de Técnicos</Text>
        <Text style={pdfStyles.subtitle}>
          Período: {formatDate(filtros.dataInicio)} a {formatDate(filtros.dataFim)}
        </Text>

        <View style={pdfStyles.content}>
          <Text style={pdfStyles.sectionTitle}>Estatísticas Gerais</Text>
          
          <View style={pdfStyles.statsGrid}>
            <View style={pdfStyles.statCard}>
              <Text style={pdfStyles.statValue}>{estatisticas.totalOS}</Text>
              <Text style={pdfStyles.statLabel}>Total de OS</Text>
            </View>
            
            {Object.entries(estatisticas.porStatus).map(([status, count]) => (
              <View key={status} style={pdfStyles.statCard}>
                <Text style={pdfStyles.statValue}>{count}</Text>
                <Text style={pdfStyles.statLabel}>{status.replace('_', ' ')}</Text>
              </View>
            ))}
          </View>

          <View style={pdfStyles.statsGrid}>
            {Object.entries(estatisticas.porPrioridade).map(([prioridade, count]) => (
              <View key={prioridade} style={pdfStyles.statCard}>
                <Text style={pdfStyles.statValue}>{count}</Text>
                <Text style={pdfStyles.statLabel}>Prioridade {prioridade}</Text>
              </View>
            ))}
          </View>

          <View style={pdfStyles.statsGrid}>
            {Object.entries(estatisticas.porTipoEquipamento).map(([tipo, count]) => (
              <View key={tipo} style={pdfStyles.statCard}>
                <Text style={pdfStyles.statValue}>{count}</Text>
                <Text style={pdfStyles.statLabel}>{tipo}</Text>
              </View>
            ))}
          </View>

          <Text style={pdfStyles.sectionTitle}>
            Ordens de Serviço ({ordens.length} ordens)
          </Text>
          
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableCellHeader, { flex: 0.8 }]}>OS #</Text>
              <Text style={[pdfStyles.tableCellHeader, { flex: 2 }]}>Equipamento</Text>
              <Text style={[pdfStyles.tableCellHeader, { flex: 1.5 }]}>Técnico</Text>
              <Text style={[pdfStyles.tableCellHeader, { flex: 1.5 }]}>Solicitante</Text>
              <Text style={[pdfStyles.tableCellHeader, { flex: 1 }]}>Prioridade</Text>
              <Text style={[pdfStyles.tableCellHeader, { flex: 1 }]}>Status</Text>
            </View>
            
            {ordens.slice(0, 20).map((ordem) => (
              <View key={ordem.id} style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, { flex: 0.8 }]}>#{ordem.id}</Text>
                <View style={[{ flex: 2 }]}>
                  <Text style={pdfStyles.tableCell}>{ordem.equipamento.nomeEquipamento}</Text>
                  <Text style={[pdfStyles.tableCell, { fontSize: 8, color: '#6b7280' }]}>
                    {ordem.equipamento.modelo}
                  </Text>
                </View>
                <Text style={[pdfStyles.tableCell, { flex: 1.5 }]}>{ordem.tecnico.nome}</Text>
                <Text style={[pdfStyles.tableCell, { flex: 1.5 }]}>{ordem.solicitante.nome}</Text>
                <View style={[{ flex: 1 }]}>
                  <Text style={[pdfStyles.badge, getPrioridadeBadgeStyle(ordem.prioridade)]}>
                    {ordem.prioridade}
                  </Text>
                  {ordem.preventiva && (
                    <Text style={pdfStyles.preventivaBadge}>PREVENTIVA</Text>
                  )}
                </View>
                <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{ordem.status}</Text>
              </View>
            ))}
          </View>

          {ordens.length > 20 && (
            <Text style={[pdfStyles.tableCell, { textAlign: 'center', fontStyle: 'italic', marginTop: 10 }]}>
              ... e mais {ordens.length - 20} ordens de serviço
            </Text>
          )}
        </View>

        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>
            Relatório gerado automaticamente pelo sistema
          </Text>
          <Text
            style={pdfStyles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export function TecnicoReport({ config }: Props) {
  const [data, setData] = useState<RelatorioCompletoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (config.dataInicio && config.dataFim) {
      fetchReportData();
    }
  }, [config]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        dataInicio: config.dataInicio,
        dataFim: config.dataFim,
      });

      if (config.status) {
        params.append('status', config.status);
      }

      if (config.prioridade) {
        params.append('prioridade', config.prioridade);
      }

      const response = await api.get(`tecnicos/completo?${params.toString()}`);
      setData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
      setError('Erro ao carregar o relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderRelatorioCompleto = (response: RelatorioCompletoResponse) => {
    const { data } = response;
    const ordens = data.ordens || [];
    
    return (
      <div className="space-y-4">
        {/* Estatísticas Essenciais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{data.estatisticas.totalOS}</div>
              <p className="text-sm text-muted-foreground">Total de OS</p>
            </CardContent>
          </Card>
          {Object.entries(data.estatisticas.porStatus).map(([status, count]) => (
            <Card key={status}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{count}</div>
                <p className="text-sm text-muted-foreground">{status.replace('_', ' ')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(data.estatisticas.porPrioridade).map(([prioridade, count]) => (
            <Card key={prioridade}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{count}</div>
                <p className="text-sm text-muted-foreground">Prioridade {prioridade}</p>
              </CardContent>
            </Card>
          ))}
          {Object.entries(data.estatisticas.porTipoEquipamento).map(([tipo, count]) => (
            <Card key={tipo}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{count}</div>
                <p className="text-sm text-muted-foreground">{tipo}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Lista Simplificada de Ordens */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Ordens de Serviço</h3>
          <Badge variant="outline">{ordens.length} ordens</Badge>
        </div>
        <div className="space-y-3">
          {ordens.map((ordem) => (
            <Card key={ordem.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">OS #{ordem.id}</h4>
                    <p className="text-sm text-muted-foreground">Equipamento: {ordem.equipamento.nomeEquipamento}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPrioridadeColor(ordem.prioridade)}>
                      {ordem.prioridade}
                    </Badge>
                    {ordem.preventiva && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        PREVENTIVA
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Solicitante:</span> {ordem.solicitante.nome}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const getReportFilename = () => {
    const now = new Date().toISOString().split('T')[0];
    return `relatorio-tecnicos-${now}.pdf`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Carregando relatório...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Configure os filtros e clique em "Gerar Relatório"</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Relatório de Técnicos</CardTitle>
              <CardDescription>
                Período: {formatDate(config.dataInicio)} a {formatDate(config.dataFim)}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Ocultar Preview' : 'Ver Preview PDF'}
              </Button>
              
              <PDFDownloadLink
                document={<TecnicoReportPDF data={data.data} filtros={config} />}
                fileName={getReportFilename()}
              >
                {({ loading: pdfLoading }) => (
                  <Button disabled={pdfLoading} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {pdfLoading ? 'Gerando PDF...' : 'Download PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="web" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="web">Visualização Web</TabsTrigger>
              <TabsTrigger value="pdf" disabled={!showPreview}>
                Preview PDF
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="web" className="mt-6">
              {renderRelatorioCompleto(data)}
            </TabsContent>
            
            <TabsContent value="pdf" className="mt-6">
              {showPreview ? (
                <div className="border rounded-lg overflow-hidden bg-gray-100">
                  <div className="h-[800px]">
                    <PDFViewer width="100%" height="100%">
                      <TecnicoReportPDF data={data.data} filtros={config} />
                    </PDFViewer>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Clique em "Ver Preview PDF" para visualizar</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}