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
  section: { marginBottom: 16 },
  tecnicoHeader: { fontSize: 14, marginBottom: 6, fontWeight: 700 },
  row: { flexDirection: 'row', fontSize: 10, borderBottomWidth: 0.5, paddingVertical: 3 },
  cell: { flexGrow: 1 },
  cellSmall: { width: 90 },
  headerRow: { flexDirection: 'row', fontSize: 10, fontWeight: 700, borderBottomWidth: 1, paddingBottom: 4, marginBottom: 2 },
});

export function OsPorTecnicoReport({ data, filtros }: Props) {
  const subtitleParts: string[] = [];
  if (filtros?.tecnicos) subtitleParts.push(`Técnicos: ${filtros.tecnicos}`);
  if (filtros?.inicio && filtros?.fim) subtitleParts.push(`Período: ${filtros.inicio} a ${filtros.fim}`);
  if (filtros?.campoData) subtitleParts.push(`Campo de data: ${filtros.campoData}`);
  if (filtros?.status) subtitleParts.push(`Status: ${filtros.status}`);
  const subtitle = subtitleParts.join(' | ');

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
                Técnico: {tec.tecnico} • Total: {tec.quantidade ?? tec.ordens?.length ?? 0}
              </Text>

              <View style={styles.headerRow}>
                <Text style={[styles.cellSmall]}>OS</Text>
                <Text style={[styles.cell]}>Equipamento</Text>
                <Text style={[styles.cellSmall]}>Status</Text>
                <Text style={[styles.cellSmall]}>Criado</Text>
                <Text style={[styles.cellSmall]}>Finalizado</Text>
              </View>

              {tec.ordens?.map((os, oidx) => (
                <View key={oidx} style={styles.row}>
                  <Text style={[styles.cellSmall]}>{String(os.id || '-')}</Text>
                  <Text style={[styles.cell]}>{os.equipamento || '-'}</Text>
                  <Text style={[styles.cellSmall]}>{os.status || '-'}</Text>
                  <Text style={[styles.cellSmall]}>{os.criadoEm || '-'}</Text>
                  <Text style={[styles.cellSmall]}>{os.finalizadoEm || '-'}</Text>
                </View>
              ))}

              {tec.ordens?.some((o) => o.resolucao) && (
                <View style={{ marginTop: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: 700 }}>Observações/Resoluções:</Text>
                  {tec.ordens.filter((o) => o.resolucao).map((o, ridx) => (
                    <Text key={ridx} style={{ fontSize: 10 }}>• {o.resolucao}</Text>
                  ))}
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 12 }}>Nenhum dado para exibir.</Text>
        )}
      </View>
    </BaseReport>
  );
}

export default OsPorTecnicoReport;
