import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Equipamento {
  id?: number;
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
  setor?: { nome: string };
  localizacao?: { nome: string };
  tipoEquipamento?: { nome: string };
  arquivos?: string[];
  ordensServico?: Array<{
    id: number;
    descricao: string;
    status: string;
    valorManutencao?: number;
    arquivos?: string[];
  }>;
  createdAt?: string;
}

export const generateEquipamentoPDF = (equipamento: Equipamento) => {
  const doc = new jsPDF();
  
  // Configurações
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let currentY = 25;

  // Função para formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  // Cabeçalho
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE EQUIPAMENTO', pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 7;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestão de Equipamentos', pageWidth / 2, currentY, { align: 'center' });
  
  // Linha separadora
  currentY += 10;
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  
  // Dados Gerais
  currentY += 12;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS GERAIS', margin, currentY);
  
  currentY += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const addField = (label: string, value: string | undefined) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(value || '-', margin + 40, currentY);
    currentY += 7;
  };

  addField('Identificação', equipamento.identificacao);
  addField('Equipamento', equipamento.nomeEquipamento);
  addField('Modelo', equipamento.modelo);
  addField('Fabricante', equipamento.fabricante);
  addField('Nº Patrimônio', equipamento.numeroPatrimonio);
  addField('Nº Série', equipamento.numeroSerie);
  addField('Nº Anvisa', equipamento.numeroAnvisa);

  // Dados da Compra
  currentY += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA COMPRA', margin, currentY);
  
  currentY += 10;
  doc.setFontSize(10);
  
  addField('Valor da Compra', equipamento.valorCompra ? `R$ ${equipamento.valorCompra.toFixed(2)}` : '-');
  addField('Data da Compra', formatDate(equipamento.dataCompra));
  addField('NF', equipamento.notaFiscal);
  addField('Início da Garantia', formatDate(equipamento.inicioGarantia));
  addField('Fim da Garantia', formatDate(equipamento.terminoGarantia));

  // Informações Adicionais
  currentY += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMAÇÕES ADICIONAIS', margin, currentY);
  
  currentY += 10;
  doc.setFontSize(10);
  
  addField('Setor', equipamento.setor?.nome);
  addField('Localização', equipamento.localizacao?.nome);
  addField('Tipo de Equipamento', equipamento.tipoEquipamento?.nome);

  // Observações
  if (equipamento.obs) {
    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', margin, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    const obsLines = doc.splitTextToSize(equipamento.obs, pageWidth - 2 * margin);
    doc.text(obsLines, margin, currentY);
    currentY += obsLines.length * 5;
  }

  // Ordens de Serviço
  if (equipamento.ordensServico && equipamento.ordensServico.length > 0) {
    currentY += 10;
    
    // Verificar se precisa de nova página
    if (currentY > 220) {
      doc.addPage();
      currentY = 30;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDENS DE SERVIÇO', margin, currentY);
    
    currentY += 10;
    
    // Cabeçalho da tabela
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    const colWidths = [20, 60, 30, 40];
    const colPositions = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];
    
    doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 8);
    doc.text('ID', colPositions[0] + 2, currentY);
    doc.text('DESCRIÇÃO', colPositions[1] + 2, currentY);
    doc.text('STATUS', colPositions[2] + 2, currentY);
    doc.text('VALOR MANUTENÇÃO', colPositions[3] + 2, currentY);
    
    currentY += 8;
    
    // Dados das OS
    doc.setFont('helvetica', 'normal');
    let totalManutencao = 0;
    
    equipamento.ordensServico.forEach((os) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 30;
      }
      
      const rowHeight = 8;
      
      doc.rect(margin, currentY - 5, colWidths[0], rowHeight);
      doc.rect(margin + colWidths[0], currentY - 5, colWidths[1], rowHeight);
      doc.rect(margin + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], rowHeight);
      doc.rect(margin + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], rowHeight);
      
      doc.text(os.id.toString(), colPositions[0] + 2, currentY);
      
      // Quebrar descrição se muito longa
      const descricaoText = doc.splitTextToSize(os.descricao || '-', colWidths[1] - 4);
      doc.text(descricaoText[0], colPositions[1] + 2, currentY);
      
      doc.text(os.status || '-', colPositions[2] + 2, currentY);
      
      const valorFormatado = os.valorManutencao 
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(os.valorManutencao))
        : '-';
      doc.text(valorFormatado, colPositions[3] + 2, currentY);
      
      if (os.valorManutencao) {
        totalManutencao += Number(os.valorManutencao);
      }
      
      currentY += rowHeight;
    });
    
    // Total
    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Total Valor da Manutenção: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalManutencao)}`, 
      pageWidth - margin, 
      currentY, 
      { align: 'right' }
    );
  }

  // Rodapé
  const finalY = Math.max(currentY + 30, 250);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Documento gerado automaticamente pelo Sistema de Gestão de Equipamentos', 
    pageWidth / 2, finalY, { align: 'center' });
  doc.text(`Data de geração: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 
    pageWidth / 2, finalY + 5, { align: 'center' });
  
  // Salvar o PDF
  const fileName = `equipamento_${equipamento.numeroPatrimonio || equipamento.identificacao || 'sem_identificacao'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};