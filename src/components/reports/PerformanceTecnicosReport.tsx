import { Text, View, StyleSheet, Page } from '@react-pdf/renderer';
import { BaseReport } from './BaseReport';

interface OrdemDetalhada {
  id: number;
  descricao: string;
  equipamento: string;
  tipoEquipamento: string;
  status: string;
  criadoEm: string;
  finalizadoEm: string;
  tempoResolucaoHoras: number | null;
  valorManutencao: number | null;
}

interface AnalisePorTipo {
  tipo: string;
  total: number;
  concluidas: number;
  taxaSucesso: number;
}

interface Estatisticas {
  totalOrdens: number;
  concluidas: number;
  abertas: number;
  emAndamento: number;
  canceladas: number;
  taxaSucesso: number;
  tempoMedioResolucaoHoras: number;
  valorTotalManutencoes: number;
}

interface TecnicoPerformance {
  tecnico: {
    id: number;
    nome: string;
    email: string;
    grupo: string;
    ativo: boolean;
  };
  estatisticas: Estatisticas;
  analisePorTipo: AnalisePorTipo[];
  ordensDetalhadas?: OrdemDetalhada[];
}

interface Props {
  data: TecnicoPerformance[];
  filtros?: {
    periodo?: string;
    tecnicos?: string;
    incluirDetalhes?: boolean;
  };
}

const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  
  // Headers
  tecnicoHeader: { 
    fontSize: 14, 
    fontWeight: 700, 
    backgroundColor: '#f0f0f0', 
    padding: 8, 
    marginBottom: 12 
  },
  subHeader: { 
    fontSize: 12, 
    fontWeight: 700, 
    marginBottom: 8, 
    color: '#333' 
  },
  
  // Estatísticas gerais
  statsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 16 
  },
  statCard: { 
    width: '48%', 
    marginRight: '2%', 
    marginBottom: 8, 
    padding: 6, 
    border: '1pt solid #ddd',
    borderRadius: 4 
  },
  statLabel: { 
    fontSize: 9, 
    color: '#666', 
    marginBottom: 2 
  },
  statValue: { 
    fontSize: 12, 
    fontWeight: 700 
  },
  
  // Tabelas
  tableContainer: { marginBottom: 16 },
  headerRow: { 
    flexDirection: 'row', 
    fontSize: 9, 
    fontWeight: 700, 
    backgroundColor: '#e8e8e8',
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  row: { 
    flexDirection: 'row', 
    fontSize: 8, 
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc'
  },
  
  // Colunas - Análise por Tipo
  tipoCol: { width: '35%' },
  totalCol: { width: '20%', textAlign: 'center' },
  concluidasCol: { width: '20%', textAlign: 'center' },
  taxaCol: { width: '25%', textAlign: 'center' },
  
  // Colunas - Ordens Detalhadas
  idCol: { width: '8%', textAlign: 'center' },
  descricaoCol: { width: '25%' },
  equipamentoCol: { width: '20%' },
  statusCol: { width: '12%', textAlign: 'center' },
  dataCol: { width: '15%', fontSize: 7 },
  tempoCol: { width: '10%', textAlign: 'center' },
  valorCol: { width: '10%', textAlign: 'right' },
  
  // Indicadores visuais
  statusBadge: { 
    fontSize: 7, 
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2
  },
  statusConcluida: { backgroundColor: '#d4edda', color: '#155724' },
  statusAberta: { backgroundColor: '#fff3cd', color: '#856404' },
  statusAndamento: { backgroundColor: '#cce5ff', color: '#004085' },
  statusCancelada: { backgroundColor: '#f8d7da', color: '#721c24' },
  
  // Performance indicators
  performanceHigh: { color: '#28a745' },
  performanceMedium: { color: '#ffc107' },
  performanceLow: { color: '#dc3545' },
  
  // Separadores
  divider: { 
    borderBottomWidth: 2, 
    borderBottomColor: '#333', 
    marginVertical: 16 
  },
  
  // Textos especiais
  noData: { 
    fontSize: 10, 
    fontStyle: 'italic', 
    color: '#666', 
    textAlign: 'center',
    marginVertical: 20 
  },
  
  // Quebra de página
  pageBreak: { 
    marginBottom: 40 
  }
});

const formatCurrency = (value: number | null): string => {
  if (!value) return 'R$ 0,00';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
};

const formatHours = (hours: number | null): string => {
  if (!hours) return '-';
  if (hours < 1) return `${Math.round(hours * 60)}min`;
  return `${hours.toFixed(1)}h`;
};

const getPerformanceStyle = (taxa: number) => {
  if (taxa >= 80) return styles.performanceHigh;
  if (taxa >= 60) return styles.performanceMedium;
  return styles.performanceLow;
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'CONCLUIDA': return [styles.statusBadge, styles.statusConcluida];
    case 'ABERTA': return [styles.statusBadge, styles.statusAberta];
    case 'EM_ANDAMENTO': return [styles.statusBadge, styles.statusAndamento];
    case 'CANCELADA': return [styles.statusBadge, styles.statusCancelada];
    default: return styles.statusBadge;
  }
};

const StatCard = ({ label, value, isPercentage = false, isCurrency = false, isHours = false }) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>
      {isCurrency ? formatCurrency(value) : 
       isHours ? formatHours(value) :
       isPercentage ? `${value}%` : value}
    </Text>
  </View>
);

export function PerformanceTecnicosReport({ data, filtros }: Props) {
  const subtitleParts: string[] = [];
  if (filtros?.periodo) subtitleParts.push(`Período: ${filtros.periodo}`);
  if (filtros?.tecnicos) subtitleParts.push(`Técnicos: ${filtros.tecnicos}`);
  const subtitle = subtitleParts.join(' | ');

  if (!data || data.length === 0) {
    return (
      <BaseReport
        title="Relatório de Performance dos Técnicos"
        subtitle={subtitle}
        companyName="Inventech"
        footerText="Relatório gerado automaticamente"
      >
        <Text style={styles.noData}>
          Nenhum dado de performance encontrado para os filtros selecionados.
        </Text>
      </BaseReport>
    );
  }

  // Calcular resumo consolidado (corrigido)
  const totalTecnicos = data.length;
  const totalOrdens = data.reduce((sum, item) => sum + item.estatisticas.totalOrdens, 0);
  const totalConcluidas = data.reduce((sum, item) => sum + item.estatisticas.concluidas, 0);
  const totalValor = data.reduce((sum, item) => sum + item.estatisticas.valorTotalManutencoes, 0);
  const taxaMedia = totalOrdens > 0 ? Math.round((totalConcluidas / totalOrdens * 100) * 100) / 100 : 0;
  
  // Calcular tempo médio corretamente - só considera técnicos com ordens concluídas
  const tecnicosComConcluidas = data.filter(item => item.estatisticas.concluidas > 0);
  const tempoMedioGeral = tecnicosComConcluidas.length > 0 ? 
    Math.round((tecnicosComConcluidas.reduce((sum, item) => sum + item.estatisticas.tempoMedioResolucaoHoras, 0) / tecnicosComConcluidas.length) * 100) / 100 : 0;

  return (
    <BaseReport
      title="Relatório de Performance dos Técnicos"
      subtitle={subtitle}
      companyName="Inventech"
      footerText="Relatório gerado automaticamente"
    >
      <View>
        {data.map((item, index) => (
          <View key={item.tecnico.id}>
            {/* Header do Técnico */}
            <View style={styles.tecnicoHeader}>
              <Text>
                {item.tecnico.nome} • {item.tecnico.grupo} • 
                Status: {item.tecnico.ativo ? 'Ativo' : 'Inativo'}
              </Text>
              <Text style={{ fontSize: 10, marginTop: 2 }}>
                {item.tecnico.email}
              </Text>
            </View>

            {/* Estatísticas Gerais */}
            <Text style={styles.subHeader}>📊 Estatísticas Gerais</Text>
            <View style={styles.statsContainer}>
              <StatCard label="Total de Ordens" value={item.estatisticas.totalOrdens} />
              <StatCard label="Concluídas" value={item.estatisticas.concluidas} />
              <StatCard label="Em Andamento" value={item.estatisticas.emAndamento} />
              <StatCard label="Abertas" value={item.estatisticas.abertas} />
              <StatCard 
                label="Taxa de Sucesso" 
                value={item.estatisticas.taxaSucesso} 
                isPercentage={true} 
              />
              <StatCard 
                label="Tempo Médio" 
                value={item.estatisticas.tempoMedioResolucaoHoras} 
                isHours={true} 
              />
              <StatCard 
                label="Valor Total" 
                value={item.estatisticas.valorTotalManutencoes} 
                isCurrency={true} 
              />
              <StatCard label="Canceladas" value={item.estatisticas.canceladas} />
            </View>

            {/* Análise por Tipo de Equipamento */}
            {item.analisePorTipo.length > 0 && (
              <View style={styles.tableContainer}>
                <Text style={styles.subHeader}>🔧 Performance por Tipo de Equipamento</Text>
                
                <View style={styles.headerRow}>
                  <Text style={styles.tipoCol}>Tipo de Equipamento</Text>
                  <Text style={styles.totalCol}>Total</Text>
                  <Text style={styles.concluidasCol}>Concluídas</Text>
                  <Text style={styles.taxaCol}>Taxa de Sucesso</Text>
                </View>

                {item.analisePorTipo.map((tipo, tipoIndex) => (
                  <View key={tipoIndex} style={styles.row}>
                    <Text style={styles.tipoCol}>{tipo.tipo}</Text>
                    <Text style={styles.totalCol}>{tipo.total}</Text>
                    <Text style={styles.concluidasCol}>{tipo.concluidas}</Text>
                    <Text style={[styles.taxaCol, getPerformanceStyle(tipo.taxaSucesso)]}>
                      {tipo.taxaSucesso}%
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Ordens Detalhadas */}
            {filtros?.incluirDetalhes && item.ordensDetalhadas && item.ordensDetalhadas.length > 0 && (
              <View style={styles.tableContainer}>
                <Text style={styles.subHeader}>📋 Histórico Detalhado de Ordens</Text>
                
                <View style={styles.headerRow}>
                  <Text style={styles.idCol}>ID</Text>
                  <Text style={styles.descricaoCol}>Descrição</Text>
                  <Text style={styles.equipamentoCol}>Equipamento</Text>
                  <Text style={styles.statusCol}>Status</Text>
                  <Text style={styles.dataCol}>Finalizado</Text>
                  <Text style={styles.tempoCol}>Tempo</Text>
                  <Text style={styles.valorCol}>Valor</Text>
                </View>

                {item.ordensDetalhadas.slice(0, 15).map((ordem, ordemIndex) => ( // Limitando para não quebrar o PDF
                  <View key={ordem.id} style={styles.row}>
                    <Text style={styles.idCol}>{ordem.id}</Text>
                    <Text style={styles.descricaoCol}>
                      {ordem.descricao.length > 40 
                        ? `${ordem.descricao.substring(0, 40)}...` 
                        : ordem.descricao}
                    </Text>
                    <Text style={styles.equipamentoCol}>
                      {ordem.equipamento?.length > 25 
                        ? `${ordem.equipamento.substring(0, 25)}...` 
                        : ordem.equipamento || '-'}
                    </Text>
                    <View style={styles.statusCol}>
                      <Text style={getStatusStyle(ordem.status)}>
                        {ordem.status}
                      </Text>
                    </View>
                    <Text style={styles.dataCol}>
                      {ordem.finalizadoEm ? 
                        new Date(ordem.finalizadoEm).toLocaleDateString('pt-BR') : '-'}
                    </Text>
                    <Text style={styles.tempoCol}>
                      {formatHours(ordem.tempoResolucaoHoras)}
                    </Text>
                    <Text style={styles.valorCol}>
                      {ordem.valorManutencao ? 
                        formatCurrency(ordem.valorManutencao) : '-'}
                    </Text>
                  </View>
                ))}

                {item.ordensDetalhadas.length > 15 && (
                  <Text style={[styles.noData, { fontSize: 8, marginTop: 8 }]}>
                    ... e mais {item.ordensDetalhadas.length - 15} ordens
                  </Text>
                )}
              </View>
            )}

            {/* Separador entre técnicos */}
            {index < data.length - 1 && <View style={styles.divider} />}
          </View>
        ))}

        {/* Resumo Geral - CORRIGIDO */}
        <View style={styles.divider} />
        <Text style={styles.subHeader}>📈 Resumo Consolidado</Text>
        <View style={styles.statsContainer}>
          <StatCard label="Total de Técnicos" value={totalTecnicos} />
          <StatCard label="Total de Ordens" value={totalOrdens} />
          <StatCard label="Ordens Concluídas" value={totalConcluidas} />
          <StatCard label="Taxa Média de Sucesso" value={taxaMedia} isPercentage={true} />
          <StatCard label="Tempo Médio Geral" value={tempoMedioGeral} isHours={true} />
          <StatCard label="Valor Total Movimentado" value={totalValor} isCurrency={true} />
        </View>
      </View>
    </BaseReport>
  );
}

export default PerformanceTecnicosReport;