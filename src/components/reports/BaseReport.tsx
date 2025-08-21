import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

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
  logo: {
    width: 50,
    height: 50,
    marginBottom: 5,
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
    textAlign: 'justify',
    marginBottom: 25,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 1.4,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    marginBottom: 30,
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
  companyName = "Inventech",
  companyAddress = "Rua Exemplo, 123 - Cidade, Estado",
  logoUrl,
  children,
  footerText = "Relatório gerado automaticamente pelo sistema",
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {logoUrl && <Image style={styles.logo} src={logoUrl} />}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.companyAddress}>{companyAddress}</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      <View style={styles.content}>
        {children}
      </View>

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>{footerText}</Text>
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
