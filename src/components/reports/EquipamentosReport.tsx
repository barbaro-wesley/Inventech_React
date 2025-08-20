import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { BaseReport } from './BaseReport';

const styles = StyleSheet.create({
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 8,
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
  },
  summarySection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
  },
  summaryText: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 4,
  },
});

interface Equipamento {
  id: string;
  nome: string;
  tipo: string;
  setor: string;
  status: string;
  dataAquisicao?: string;
}

interface EquipamentosReportProps {
  equipamentos: Equipamento[];
  filtros?: {
    dataInicio?: string;
    dataFim?: string;
    setor?: string;
    tipo?: string;
  };
}

export const EquipamentosReport: React.FC<EquipamentosReportProps> = ({
  equipamentos,
  filtros,
}) => {
  const totalEquipamentos = equipamentos.length;
  const equipamentosAtivos = equipamentos.filter(eq => eq.status === 'Ativo').length;
  const equipamentosInativos = equipamentos.filter(eq => eq.status === 'Inativo').length;
  const equipamentosManutencao = equipamentos.filter(eq => eq.status === 'Em Manutenção').length;

  const subtitle = filtros?.dataInicio && filtros?.dataFim 
    ? `Período: ${filtros.dataInicio} a ${filtros.dataFim}`
    : `Gerado em ${new Date().toLocaleDateString('pt-BR')}`;

  return (
    <BaseReport
      title="Relatório de Equipamentos"
      subtitle={subtitle}
      logoUrl="/logo.png"
    >
      {/* Resumo */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Resumo Executivo</Text>
        <Text style={styles.summaryText}>Total de Equipamentos: {totalEquipamentos}</Text>
        <Text style={styles.summaryText}>Equipamentos Ativos: {equipamentosAtivos}</Text>
        <Text style={styles.summaryText}>Equipamentos Inativos: {equipamentosInativos}</Text>
        <Text style={styles.summaryText}>Em Manutenção: {equipamentosManutencao}</Text>
        {filtros?.setor && (
          <Text style={styles.summaryText}>Setor Filtrado: {filtros.setor}</Text>
        )}
        {filtros?.tipo && (
          <Text style={styles.summaryText}>Tipo Filtrado: {filtros.tipo}</Text>
        )}
      </View>

      {/* Tabela de Equipamentos */}
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>ID</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Nome</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Tipo</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Setor</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Status</Text>
          </View>
        </View>

        {/* Rows */}
        {equipamentos.map((equipamento, index) => (
          <View key={equipamento.id} style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{equipamento.id}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{equipamento.nome}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{equipamento.tipo}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{equipamento.setor}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{equipamento.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </BaseReport>
  );
};