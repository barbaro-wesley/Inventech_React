import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { BaseReport } from './BaseReport';

interface EquipamentoItem {
  id?: string | number;
  nome?: string;
  patrimonio?: string;
  serie?: string;
  status?: string;
}

interface TipoGrupo {
  tipo: string;
  total: number;
  equipamentos: EquipamentoItem[];
}

interface SetorGrupo {
  setor: string;
  totalSetor: number;
  tipos: TipoGrupo[];
}

interface Props {
  data: SetorGrupo[];
  filtros?: Record<string, any>;
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  setorHeader: { fontSize: 14, marginBottom: 6, fontWeight: 700 },
  tipoHeader: { fontSize: 12, marginTop: 6, marginBottom: 4 },
  row: { flexDirection: 'row', fontSize: 10, borderBottomWidth: 0.5, paddingVertical: 3 },
  cell: { flexGrow: 1 },
  cellSmall: { width: 80 },
  headerRow: { flexDirection: 'row', fontSize: 10, fontWeight: 700, borderBottomWidth: 1, paddingBottom: 4, marginBottom: 2 },
});

export function EquipamentosPorSetorReport({ data, filtros }: Props) {
  const subtitleParts: string[] = [];
  if (filtros?.setores) subtitleParts.push(`Setores: ${filtros.setores}`);
  if (filtros?.tipos) subtitleParts.push(`Tipos: ${filtros.tipos}`);
  const subtitle = subtitleParts.join(' | ');

  return (
    <BaseReport
      title="Relatório de Equipamentos por Setor"
      subtitle={subtitle || undefined}
      companyName="Inventech"
      footerText="Relatório gerado automaticamente"
    >
      <View>
        {data?.length ? (
          data.map((setor, idx) => (
            <View key={idx} style={styles.section}>
              <Text style={styles.setorHeader}>
                Setor: {setor.setor} • Total do setor: {setor.totalSetor}
              </Text>

              {setor.tipos?.map((grupo, gidx) => (
                <View key={gidx}>
                  <Text style={styles.tipoHeader}>
                    Tipo: {grupo.tipo} • Quantidade: {grupo.total}
                  </Text>

                  <View style={styles.headerRow}>
                    <Text style={[styles.cellSmall]}>Patrimônio</Text>
                    <Text style={[styles.cell]}>Nome</Text>
                    <Text style={[styles.cellSmall]}>Série</Text>
                  </View>

                  {grupo.equipamentos?.map((eq, eidx) => (
                    <View key={eidx} style={styles.row}>
                      <Text style={[styles.cellSmall]}>{eq.patrimonio || '-'}</Text>
                      <Text style={[styles.cell]}>{eq.nome || '-'}</Text>
                      <Text style={[styles.cellSmall]}>{eq.serie || '-'}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 12 }}>Nenhum dado para exibir.</Text>
        )}
      </View>
    </BaseReport>
  );
}

export default EquipamentosPorSetorReport;
