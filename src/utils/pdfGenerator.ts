import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrainingRecord } from '@/types';

export const generateCapacitacaoPDF = (trainingRecord: Omit<TrainingRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
  const doc = new jsPDF();
  
  // Configurações
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let currentY = 25; // <<< MUDANÇA: Começando um pouco mais acima

  // Cabeçalho da empresa
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GESTÃO DE DOCUMENTOS DE CAPACITAÇÃO', pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 7; // <<< MUDANÇA: Espaçamento reduzido
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Centro Estratégico de Pessoas', pageWidth / 2, currentY, { align: 'center' }); // <<< MUDANÇA: Texto ajustado
  
  // Linha separadora
  currentY += 10; // <<< MUDANÇA: Espaçamento reduzido
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  
  // Informações da capacitação
  currentY += 12; // <<< MUDANÇA: Espaçamento drasticamente reduzido
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMAÇÕES DA CAPACITAÇÃO', margin, currentY);
  
  currentY += 10; // <<< MUDANÇA: Espaçamento reduzido
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Título
  doc.setFont('helvetica', 'bold');
  doc.text('Título:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(trainingRecord.titulo, margin + 25, currentY); // <<< Mantido o original
  
  currentY += 7; // <<< MUDANÇA: Espaçamento entre linhas reduzido
  doc.setFont('helvetica', 'bold');
  doc.text('Data:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(format(trainingRecord.data, 'dd/MM/yyyy', { locale: ptBR }), margin + 25, currentY); // <<< Mantido o original

  currentY += 7; // <<< MUDANÇA: Espaçamento entre linhas reduzido
  doc.setFont('helvetica', 'bold');
  doc.text('Local:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(trainingRecord.local, margin + 25, currentY); // <<< Mantido o original
  
  currentY += 7; // <<< MUDANÇA: Espaçamento entre linhas reduzido
  doc.setFont('helvetica', 'bold');
  doc.text('Instrutor:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(trainingRecord.instrutor, margin + 25, currentY); // <<< Mantido o original
  
  currentY += 7; // <<< MUDANÇA: Espaçamento entre linhas reduzido
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(trainingRecord.tipoDocumento.nome, margin + 25, currentY); // <<< Mantido o original
  
  // Tabela de participantes
  currentY += 18; // <<< MUDANÇA: Espaçamento drasticamente reduzido
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('LISTA DE PARTICIPANTES', margin, currentY);
  
  currentY += 10; // <<< MUDANÇA: Espaçamento reduzido
  
  // Cabeçalho da tabela
  const tableStartY = currentY;
  const colWidths = [60, 50, 60];
  const colPositions = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1]];
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 10);
  doc.text('NOME DO FUNCIONÁRIO', colPositions[0] + 2, currentY);
  doc.text('FUNÇÃO', colPositions[1] + 2, currentY);
  doc.text('ASSINATURA', colPositions[2] + 2, currentY);
  
  currentY += 10;
  
  // Linhas dos participantes
  doc.setFont('helvetica', 'normal');
  trainingRecord.participantes.forEach((participante, index) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 30;
    }
    
    const rowHeight = 15;
    
    doc.rect(margin, currentY - 5, colWidths[0], rowHeight);
    doc.rect(margin + colWidths[0], currentY - 5, colWidths[1], rowHeight);
    doc.rect(margin + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], rowHeight);
    
    doc.text(participante.nome, colPositions[0] + 2, currentY + 2);
    doc.text(participante.cargo, colPositions[1] + 2, currentY + 2);
    
    currentY += rowHeight;
  });
  
  // Rodapé
  const finalY = Math.max(currentY + 30, 240);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Documento gerado automaticamente pelo Sistema de Gestão de Capacitação', 
    pageWidth / 2, finalY, { align: 'center' });
  doc.text(`Data de geração: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 
    pageWidth / 2, finalY + 5, { align: 'center' });
  
  // Salvar o PDF
  const fileName = `capacitacao_${trainingRecord.titulo.toLowerCase().replace(/\s+/g, '_')}_${format(trainingRecord.data, 'yyyy-MM-dd')}.pdf`; // <<< Mantido o original
  doc.save(fileName);
};