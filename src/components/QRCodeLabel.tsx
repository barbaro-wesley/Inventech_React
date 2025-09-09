import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Download } from 'lucide-react';
import { QRCodeGenerator, generateQRCodeDataURL } from './QRCodeGenerator';
import { useToast } from '@/hooks/use-toast';

// Importar a logo (ajuste o caminho conforme sua estrutura de pastas)
import logoImage from "../assets/HCR_Marca.png";

interface QRCodeLabelProps {
  equipamento: {
    numeroPatrimonio: string;
    id: number;
  };
  trigger?: React.ReactNode;
}

export const QRCodeLabel = ({ equipamento, trigger }: QRCodeLabelProps) => {
  const { toast } = useToast();

  const qrData = JSON.stringify({
    patrimonio: equipamento.numeroPatrimonio,
    id: equipamento.id,
    url: `${window.location.origin}/equipamento/${equipamento.id}`
  });

  // Função para converter mm para pixels (usando 300 DPI para boa qualidade)
  const mmToPx = (mm) => Math.round((mm * 300) / 25.4);

  const generateLabelImage = async () => {
    try {
      // Dimensões da etiqueta em pixels (300 DPI) - tamanho menor
      const labelWidth = mmToPx(60);  // ~709px (era 80mm)
      const labelHeight = mmToPx(45); // ~532px (era 60mm)

      // Criar canvas
      const canvas = document.createElement('canvas');
      canvas.width = labelWidth;
      canvas.height = labelHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Não foi possível criar o contexto do canvas');
      }

      // Fundo branco
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, labelWidth, labelHeight);

      // Configurações de fonte
      const setupFont = (size, weight = 'normal') => {
        ctx.font = `${weight} ${size}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillStyle = '#2c3e50';
        ctx.textAlign = 'center';
      };

      let currentY = mmToPx(5); // Posição inicial menor

      // Carregar e desenhar logo
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          logoImg.src = logoImage;
        });

        const logoWidth = mmToPx(10);  // menor que 12mm
        const logoHeight = mmToPx(8);   // menor que 10mm
        const logoX = (labelWidth - logoWidth) / 2;
        
        ctx.drawImage(logoImg, logoX, currentY, logoWidth, logoHeight);
        currentY += logoHeight + mmToPx(1);
      } catch (logoError) {
        // Se falhar ao carregar logo, pular
        console.warn('Logo não pôde ser carregada:', logoError);
        currentY += mmToPx(2);
      }

      // Texto da instituição
      setupFont(mmToPx(2), 'bold');  // fonte menor (era 2.5)
      const institutionLines = [
        'PROPRIEDADE',
        'ASSOCIAÇÃO HOSPITALAR',
        'BENEFICENTE DE MARAU'
      ];

      institutionLines.forEach(line => {
        ctx.fillText(line, labelWidth / 2, currentY);
        currentY += mmToPx(2.5);  // espaçamento menor (era 3)
      });

      currentY += mmToPx(0.5);  // espaço menor (era 1)

      // Gerar e desenhar QR Code
      const qrSize = mmToPx(15);  // menor que 18mm
      const qrCodeDataURL = await generateQRCodeDataURL(qrData, Math.round(qrSize * 0.8));
      
      const qrImg = new Image();
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrCodeDataURL;
      });

      const qrX = (labelWidth - qrSize) / 2;
      ctx.drawImage(qrImg, qrX, currentY, qrSize, qrSize);
      currentY += qrSize + mmToPx(2);

      // Número do patrimônio
      setupFont(mmToPx(3), 'bold');  // fonte menor (era 3.5)
      ctx.fillStyle = '#000';
      ctx.fillText(equipamento.numeroPatrimonio || 'N/A', labelWidth / 2, currentY);

      return canvas;
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      throw error;
    }
  };

  const handleDownload = async () => {
    try {
      const canvas = await generateLabelImage();
      
      // Converter para blob e fazer download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Não foi possível gerar a imagem');
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `etiqueta-qr-${equipamento.numeroPatrimonio || equipamento.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Sucesso",
          description: "Imagem da etiqueta baixada com sucesso!"
        });
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar a imagem da etiqueta.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Etiqueta QR Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-sm font-medium mb-2">Preview da Etiqueta</div>
            <div className="border-2 border-dashed border-gray-300 p-4 bg-gray-50 rounded-lg">
              <div className="bg-white p-3 inline-block">
                <div className="text-center">
                  <div className="w-8 h-6 bg-gray-100 mx-auto mb-0.5 flex items-center justify-center overflow-hidden">
                    <img
                      src={logoImage}
                      alt="Logo"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                    <span className="text-gray-500 text-xs hidden items-center justify-center w-full h-full">
                      LOGO
                    </span>
                  </div>

                  <div className="mb-0.5 bg-white">
                    <QRCodeGenerator data={qrData} size={80} />
                  </div>

                  <div className="text-xs font-bold bg-gray-50 p-0.5 mb-1">
                    {equipamento.numeroPatrimonio || 'N/A'}
                  </div>

                  <div className="text-xs font-semibold leading-tight text-gray-700">
                    PROPRIEDADE<br />
                    ASSOCIAÇÃO HOSPITALAR<br />
                    BENEFICENTE DE MARAU
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm">
              <strong>Patrimônio:</strong> {equipamento.numeroPatrimonio || 'Não informado'}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownload} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Baixar Imagem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};