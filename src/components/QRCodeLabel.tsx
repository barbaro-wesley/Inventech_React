import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Printer } from 'lucide-react';
import { QRCodeGenerator, generateQRCodeDataURL } from './QRCodeGenerator';
import { useToast } from '@/hooks/use-toast';

interface QRCodeLabelProps {
  equipamento: {
    numeroPatrimonio: string;
    nomeEquipamento: string;
    id: number;
  };
  trigger?: React.ReactNode;
}

export const QRCodeLabel = ({ equipamento, trigger }: QRCodeLabelProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const qrData = JSON.stringify({
    patrimonio: equipamento.numeroPatrimonio,
    nome: equipamento.nomeEquipamento,
    id: equipamento.id,
    url: `${window.location.origin}/equipamento/${equipamento.id}`
  });

  const handlePrint = async () => {
    try {
      // Gerar QR code como data URL para impressão
      const qrCodeDataURL = await generateQRCodeDataURL(qrData, 150);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Erro",
          description: "Não foi possível abrir a janela de impressão. Verifique se pop-ups estão bloqueados.",
          variant: "destructive"
        });
        return;
      }

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Etiqueta QR Code - ${equipamento.numeroPatrimonio}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .label-container {
              width: 80mm;
              height: 60mm;
              border: 2px solid #000;
              padding: 8mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              text-align: center;
              box-sizing: border-box;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 5mm;
            }
            .institution-name {
              font-size: 10px;
              font-weight: bold;
              line-height: 1.2;
              margin-bottom: 3mm;
              text-transform: uppercase;
            }
            .logo {
              width: 15mm;
              height: 15mm;
              margin: 0 auto 3mm auto;
              border: 1px solid #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              color: #666;
            }
            .qr-code {
              margin: 5mm 0;
            }
            .qr-code img {
              width: 25mm;
              height: 25mm;
            }
            .patrimonio {
              font-size: 12px;
              font-weight: bold;
              margin-top: 3mm;
              padding: 2mm;
              background: #f0f0f0;
              border: 1px solid #ccc;
              width: 100%;
              box-sizing: border-box;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .label-container { 
                width: 80mm; 
                height: 60mm; 
                margin: 0;
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="header">
              <div class="institution-name">
                Propriedade<br>
                Associação Hospitalar<br>
                Beneficente de Marau
              </div>
              <div class="logo">LOGO</div>
            </div>
            
            <div class="qr-code">
              <img src="${qrCodeDataURL}" alt="QR Code" />
            </div>
            
            <div class="patrimonio">
              Patrimônio: ${equipamento.numeroPatrimonio || 'N/A'}
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Esperar a imagem carregar antes de imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };

      toast({
        title: "Sucesso",
        description: "Etiqueta enviada para impressão!"
      });
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      toast({
        title: "Erro",
        description: "Erro ao preparar a impressão da etiqueta.",
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
              <div className="bg-white border-2 border-black p-3 inline-block">
                <div className="text-center">
                  <div className="text-xs font-bold mb-2 leading-tight">
                    PROPRIEDADE<br/>
                    ASSOCIAÇÃO HOSPITALAR<br/>
                    BENEFICENTE DE MARAU
                  </div>
                  <div className="w-8 h-8 bg-gray-200 border mx-auto mb-2 flex items-center justify-center text-xs">
                    LOGO
                  </div>
                  <div className="mb-2">
                    <QRCodeGenerator data={qrData} size={100} />
                  </div>
                  <div className="text-xs font-bold bg-gray-100 border p-1">
                    Patrimônio: {equipamento.numeroPatrimonio || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm">
              <strong>Equipamento:</strong> {equipamento.nomeEquipamento}
            </div>
            <div className="text-sm">
              <strong>Patrimônio:</strong> {equipamento.numeroPatrimonio || 'Não informado'}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Etiqueta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};