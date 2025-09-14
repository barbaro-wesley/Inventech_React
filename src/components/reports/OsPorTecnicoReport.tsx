import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { BaseReport } from './BaseReport';

interface OrdemServico {
  id?: string | number;
  descricao?: string;
  equipamento?: string;
  status?: string;
  criadoEm?: string;
  finalizadoEm?: string;
  resolucao?: string;
}

interface TecnicoGrupo {
  tecnicoId: number | string;
  tecnico?: string;
  quantidade?: number;
  ordens: OrdemServico[];
}

interface Props {
  data: TecnicoGrupo[];
  filtros?: any;
}

const styles = StyleSheet.create({
  section: { 
    marginBottom: 20,
    pageBreakInside: 'avoid'
  },
  tecnicoHeader: { 
    fontSize: 14, 
    marginBottom: 8, 
    fontWeight: 700,
    backgroundColor: '#f5f5f5',
    padding: 6,
    borderRadius: 3
  },
  headerRow: { 
    flexDirection: 'row', 
    fontSize: 10, 
    fontWeight: 700, 
    borderBottomWidth: 1.5,
    borderColor: '#333',
    paddingVertical: 5,
    marginBottom: 3,
    backgroundColor: '#fafafa'
  },
  row: { 
    flexDirection: 'row', 
    fontSize: 10, 
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
    paddingVertical: 4,
    minHeight: 16
  },
  cellOS: { 
    width: 50,
    paddingRight: 5
  },
  cellEquipamento: { 
    width: 200, // Aumentei significativamente para nomes longos
    paddingRight: 8,
    overflow: 'hidden'
  },
  cellStatus: { 
    width: 70,
    paddingRight: 5
  },
  cellData: { 
    width: 65,
    paddingRight: 5
  },
  cellDataFinal: { 
    width: 65
  },
  // Estilos para observações
  observacoesContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#fafafa',
    borderRadius: 3,
    borderLeft: '3px solid #007bff'
  },
  observacoesTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 4,
    color: '#333'
  },
  observacaoItem: {
    fontSize: 9,
    marginBottom: 2,
    lineHeight: 1.3,
    paddingLeft: 8
  },
  equipamentoText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
});

export function OsPorTecnicoReport({ data, filtros }: Props) {
  const subtitleParts: string[] = [];
  if (filtros?.tecnicos) subtitleParts.push(`Técnicos: ${filtros.tecnicos}`);
  if (filtros?.inicio && filtros?.fim) subtitleParts.push(`Período: ${filtros.inicio} a ${filtros.fim}`);
  if (filtros?.campoData) subtitleParts.push(`Campo de data: ${filtros.campoData}`);
  if (filtros?.status) subtitleParts.push(`Status: ${filtros.status}`);
  const subtitle = subtitleParts.join(' | ');

  // Função para truncar texto se necessário
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  };

  return (
    <BaseReport
      title="Relatório de OS por Técnico"
      subtitle={subtitle || undefined}
      companyName="Inventech"
      footerText="Relatório gerado automaticamente"
    >
      <View>
        {data?.length ? (
          data.map((tec, idx) => (
            <View key={idx} style={styles.section}>
              <Text style={styles.tecnicoHeader}>
                Técnico: {tec.tecnico} • Total de OS: {tec.quantidade ?? tec.ordens?.length ?? 0}
              </Text>

              {/* Cabeçalho da tabela */}
              <View style={styles.headerRow}>
                <Text style={styles.cellOS}>OS</Text>
                <Text style={styles.cellEquipamento}>Equipamento</Text>
                <Text style={styles.cellStatus}>Status</Text>
                <Text style={styles.cellData}>Criado</Text>
                <Text style={styles.cellDataFinal}>Finalizado</Text>
              </View>

              {/* Linhas de dados */}
              {tec.ordens?.map((os, oidx) => (
                <View key={oidx} style={styles.row}>
                  <Text style={styles.cellOS}>{String(os.id || '-')}</Text>
                  <Text style={styles.cellEquipamento}>
                    {truncateText(os.equipamento || '', 35)}
                  </Text>
                  <Text style={styles.cellStatus}>{os.status || '-'}</Text>
                  <Text style={styles.cellData}>{os.criadoEm || '-'}</Text>
                  <Text style={styles.cellDataFinal}>{os.finalizadoEm || '-'}</Text>
                </View>
              ))}              
            </View>
          ))
        ) : (
          <View style={{ textAlign: 'center', marginTop: 40 }}>
            <Text style={{ fontSize: 12, color: '#666' }}>
              Nenhum dado disponível para exibir no relatório.
            </Text>
          </View>
        )}
      </View>
    </BaseReport>
  );
}

export default OsPorTecnicoReport;