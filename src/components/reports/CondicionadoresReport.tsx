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
    width: '16.66%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 8,
  },
  tableCol: {
    width: '16.66%',
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

interface Condicionador {
  id: number;
  nPatrimonio: string;
  nControle: string;
  marca: string;
  modelo: string;
  BTUS: string;
  numeroSerie: string;
  setor?: {
    nome: string;
  } | null;
  localizacao?: {
    nome: string;
  } | null;
  tipoEquipamento?: {
    nome: string;
  } | null;
}

interface CondicionadoresReportProps {
  condicionadores: Condicionador[];
  filtros?: {
    dataInicio?: string;
    dataFim?: string;
    setor?: string;
    tipo?: string;
  };
}

export const CondicionadoresReport: React.FC<CondicionadoresReportProps> = ({
  condicionadores,
  filtros,
}) => {
  const totalCondicionadores = condicionadores.length;
  const comPatrimonio = condicionadores.filter(eq => eq.nPatrimonio && eq.nPatrimonio !== 'Nao tem').length;
  const semPatrimonio = totalCondicionadores - comPatrimonio;

  // Contagem por marca
  const marcas = condicionadores.reduce((acc, curr) => {
    const marca = curr.marca || 'Não informado';
    acc[marca] = (acc[marca] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const subtitle = filtros?.dataInicio && filtros?.dataFim
    ? `Período: ${filtros.dataInicio} a ${filtros.dataFim}`
    : `Gerado em ${new Date().toLocaleDateString('pt-BR')}`;

  return (
    <BaseReport
      title="Relatório de Condicionadores de Ar"
      subtitle={subtitle}
      logoUrl="/logo.png"
    >
      {/* Resumo */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Resumo Executivo</Text>
        <Text style={styles.summaryText}>Total de Condicionadores: {totalCondicionadores}</Text>
        <Text style={styles.summaryText}>Com Patrimônio: {comPatrimonio}</Text>
        <Text style={styles.summaryText}>Sem Patrimônio: {semPatrimonio}</Text>

        <Text style={[styles.summaryText, { marginTop: 8, fontWeight: 'bold' }]}>Por Marca:</Text>
        {Object.entries(marcas).map(([marca, quantidade]) => (
          <Text key={marca} style={styles.summaryText}>• {marca}: {quantidade}</Text>
        ))}

        {filtros?.setor && (
          <Text style={styles.summaryText}>Setor Filtrado: {filtros.setor}</Text>
        )}
      </View>

      {/* Tabela de Condicionadores */}
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Patrimônio</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Marca</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Modelo</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>BTUs</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Localização</Text>
          </View>

        </View>

        {/* Rows */}
        {condicionadores.map((condicionador) => (
          <View key={condicionador.id} style={styles.tableRow}>   
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{String(condicionador.nPatrimonio || "-")}</Text>
            </View>
            <View style={styles.tableCol}>
             <Text style={styles.tableCell}>{String(condicionador.marca || "-")}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{String(condicionador.modelo || "-")}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{String(condicionador.BTUS || "-")}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{String(condicionador.localizacao?.nome || "-")}</Text>
            </View>
          </View>
          
        ))}
      </View>
    </BaseReport>
  );
};