import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { BaseReport } from './BaseReport';

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#082C5E', marginBottom: 6 },
  row: { display: 'flex', flexDirection: 'row', marginBottom: 4 },
  label: { width: '35%', fontSize: 10, fontWeight: 'bold', color: '#1f2937' },
  value: { width: '65%', fontSize: 10, color: '#374151' },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#e5e7eb' },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableHeader: { backgroundColor: '#f3f4f6' },
  tableColHeader: { width: '20%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e5e7eb', padding: 6 },
  tableCol: { width: '20%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e5e7eb', padding: 6 },
  tableCellHeader: { fontSize: 9, fontWeight: 'bold', color: '#1f2937' },
  tableCell: { fontSize: 9, color: '#374151' },
  total: { fontSize: 11, fontWeight: 'bold', color: '#111827', textAlign: 'right', marginTop: 8 },
});

export interface EquipmentDetailReportProps {
  equipamento: {
    identificacao?: string;
    nomeEquipamento?: string;
    numeroAnvisa?: string;
    fabricante?: string;
    modelo?: string;
    numeroSerie?: string;
    numeroPatrimonio?: string;
    valorCompra?: number;
    dataCompra?: string;
    notaFiscal?: string;
    inicioGarantia?: string;
    terminoGarantia?: string;
    obs?: string;
    setor?: { nome?: string };
    localizacao?: { nome?: string };
    tipoEquipamento?: { nome?: string };
    ordensServico?: Array<{ id: number; descricao?: string; status?: string; valorManutencao?: number; arquivos?: string[] }>;
  };
}

export const EquipmentDetailReport: React.FC<EquipmentDetailReportProps> = ({ equipamento }) => {
  const formatCurrency = (n?: number) => (n ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n) : '-');
  const totalManutencao = (equipamento.ordensServico || []).reduce((acc, os) => acc + Number(os.valorManutencao || 0), 0);

  return (
    <BaseReport
      title="Detalhes do Equipamento"
      subtitle={`Gerado em ${new Date().toLocaleDateString('pt-BR')}`}
      logoUrl="/logo.png"
    >
      {/* Dados Gerais */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados Gerais</Text>
        <View style={styles.row}><Text style={styles.label}>Identificação:</Text><Text style={styles.value}>{equipamento.identificacao || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Equipamento:</Text><Text style={styles.value}>{equipamento.nomeEquipamento || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Modelo:</Text><Text style={styles.value}>{equipamento.modelo || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Fabricante:</Text><Text style={styles.value}>{equipamento.fabricante || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Nº Patrimônio:</Text><Text style={styles.value}>{equipamento.numeroPatrimonio || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Nº Série:</Text><Text style={styles.value}>{equipamento.numeroSerie || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Nº Anvisa:</Text><Text style={styles.value}>{equipamento.numeroAnvisa || '-'}</Text></View>
      </View>

      {/* Dados da Compra */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados da Compra</Text>
        <View style={styles.row}><Text style={styles.label}>Valor da Compra:</Text><Text style={styles.value}>{equipamento.valorCompra ? `R$ ${equipamento.valorCompra.toFixed(2)}` : '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Data da Compra:</Text><Text style={styles.value}>{equipamento.dataCompra ? new Date(equipamento.dataCompra).toLocaleDateString('pt-BR') : '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>NF:</Text><Text style={styles.value}>{equipamento.notaFiscal || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Início da Garantia:</Text><Text style={styles.value}>{equipamento.inicioGarantia ? new Date(equipamento.inicioGarantia).toLocaleDateString('pt-BR') : '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Fim da Garantia:</Text><Text style={styles.value}>{equipamento.terminoGarantia ? new Date(equipamento.terminoGarantia).toLocaleDateString('pt-BR') : '-'}</Text></View>
        {equipamento.obs ? (<View style={styles.row}><Text style={styles.label}>OBS:</Text><Text style={styles.value}>{equipamento.obs}</Text></View>) : null}
      </View>

      {/* Info Adicionais */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Adicionais</Text>
        <View style={styles.row}><Text style={styles.label}>Setor:</Text><Text style={styles.value}>{equipamento.setor?.nome || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Localização:</Text><Text style={styles.value}>{equipamento.localizacao?.nome || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Tipo de Equipamento:</Text><Text style={styles.value}>{equipamento.tipoEquipamento?.nome || '-'}</Text></View>
      </View>

      {/* Ordens de Serviço */}
      {equipamento.ordensServico && equipamento.ordensServico.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ordens de Serviço</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>ID</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Descrição</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Status</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Valor</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Anexos</Text></View>
            </View>
            {equipamento.ordensServico.map((os) => (
              <View key={os.id} style={styles.tableRow}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{os.id}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{os.descricao || '-'}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{os.status || '-'}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{formatCurrency(os.valorManutencao)}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{os.arquivos && os.arquivos.length ? os.arquivos.length + ' arquivo(s)' : '-'}</Text></View>
              </View>
            ))}
          </View>
          <Text style={styles.total}>Total Valor da Manutenção: {formatCurrency(totalManutencao)}</Text>
        </View>
      )}
    </BaseReport>
  );
};
