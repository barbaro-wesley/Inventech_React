// TecnicoReportPDF.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
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

interface TecnicoReportPDFProps {
  data: {
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
  filtros: {
    dataInicio: string;
    dataFim: string;
    status?: string;
    prioridade?: string;
  };
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  
  if (dateString.includes(',')) {
    return dateString.split(',')[0];
  }
  
  // Para strings no formato YYYY-MM-DD, evita problemas de fuso horário
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR');
  }
  
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const getPrioridadeBadgeStyle = (prioridade: string) => {
  switch (prioridade) {
    case 'URGENTE': return styles.badgeUrgente;
    case 'ALTA': return styles.badgeAlta;
    case 'MEDIO': return styles.badgeMedio;
    case 'NORMAL': return styles.badgeNormal;
    case 'BAIXA': return styles.badgeBaixa;
    default: return styles.badgeBaixa;
  }
};

export const TecnicoReportPDF: React.FC<TecnicoReportPDFProps> = ({ data, filtros }) => {
  const { estatisticas, ordens } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Inventech</Text>
            <Text style={styles.companyAddress}>Rua Bento Gonçalves, 10 - Centro</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Relatório de Técnicos</Text>
        <Text style={styles.subtitle}>
          Período: {formatDate(filtros.dataInicio)} a {formatDate(filtros.dataFim)}
        </Text>

        {/* Statistics */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Estatísticas Gerais</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{estatisticas.totalOS}</Text>
              <Text style={styles.statLabel}>Total de OS</Text>
            </View>
            
            {Object.entries(estatisticas.porStatus).map(([status, count]) => (
              <View key={status} style={styles.statCard}>
                <Text style={styles.statValue}>{count}</Text>
                <Text style={styles.statLabel}>{status.replace('_', ' ')}</Text>
              </View>
            ))}
          </View>

          <View style={styles.statsGrid}>
            {Object.entries(estatisticas.porPrioridade).map(([prioridade, count]) => (
              <View key={prioridade} style={styles.statCard}>
                <Text style={styles.statValue}>{count}</Text>
                <Text style={styles.statLabel}>Prioridade {prioridade}</Text>
              </View>
            ))}
          </View>

          <View style={styles.statsGrid}>
            {Object.entries(estatisticas.porTipoEquipamento).map(([tipo, count]) => (
              <View key={tipo} style={styles.statCard}>
                <Text style={styles.statValue}>{count}</Text>
                <Text style={styles.statLabel}>{tipo}</Text>
              </View>
            ))}
          </View>

          {/* Orders Table */}
          <Text style={styles.sectionTitle}>
            Ordens de Serviço ({ordens.length} ordens)
          </Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, { flex: 0.8 }]}>OS #</Text>
              <Text style={[styles.tableCellHeader, { flex: 2 }]}>Equipamento</Text>
              <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>Técnico</Text>
              <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>Solicitante</Text>
              <Text style={[styles.tableCellHeader, { flex: 1 }]}>Prioridade</Text>
              <Text style={[styles.tableCellHeader, { flex: 1 }]}>Status</Text>
            </View>
            
            {ordens.slice(0, 20).map((ordem) => (
              <View key={ordem.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>#{ordem.id}</Text>
                <View style={[{ flex: 2 }]}>
                  <Text style={styles.tableCell}>{ordem.equipamento.nomeEquipamento}</Text>
                  <Text style={[styles.tableCell, { fontSize: 8, color: '#6b7280' }]}>
                    {ordem.equipamento.modelo}
                  </Text>
                </View>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{ordem.tecnico.nome}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{ordem.solicitante.nome}</Text>
                <View style={[{ flex: 1 }]}>
                  <Text style={[styles.badge, getPrioridadeBadgeStyle(ordem.prioridade)]}>
                    {ordem.prioridade}
                  </Text>
                  {ordem.preventiva && (
                    <Text style={styles.preventivaBadge}>PREVENTIVA</Text>
                  )}
                </View>
                <Text style={[styles.tableCell, { flex: 1 }]}>{ordem.status}</Text>
              </View>
            ))}
          </View>

          {ordens.length > 20 && (
            <Text style={[styles.tableCell, { textAlign: 'center', fontStyle: 'italic', marginTop: 10 }]}>
              ... e mais {ordens.length - 20} ordens de serviço
            </Text>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Relatório gerado automaticamente pelo sistema
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};