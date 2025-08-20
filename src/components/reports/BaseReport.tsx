import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Registrar fonte personalizada se necessário
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf',
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  logo: {
    width: 80,
    height: 40,
  },
  companyInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 10,
    color: '#6b7280',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    marginBottom: 30,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 10,
    color: '#6b7280',
  },
  pageNumber: {
    fontSize: 10,
    color: '#6b7280',
  },
});

export interface BaseReportProps {
  title: string;
  subtitle?: string;
  companyName?: string;
  companyAddress?: string;
  logoUrl?: string;
  children: React.ReactNode;
  footerText?: string;
}

export const BaseReport: React.FC<BaseReportProps> = ({
  title,
  subtitle,
  companyName = "Sistema de Gestão",
  companyAddress = "Rua Exemplo, 123 - Cidade, Estado",
  logoUrl,
  children,
  footerText = "Relatório gerado automaticamente pelo sistema",
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          {logoUrl && <Image style={styles.logo} src={logoUrl} />}
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.companyAddress}>{companyAddress}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>{footerText}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => 
          `Página ${pageNumber} de ${totalPages}`
        } />
      </View>
    </Page>
  </Document>
);