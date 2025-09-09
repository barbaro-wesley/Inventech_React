import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Printer } from 'lucide-react';
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
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // URL da logo - ajuste conforme necessário
  // const logoUrl = "/assets/HCR_Marca.png"; // ou use: logoImage se importar
  
  const qrData = JSON.stringify({
    patrimonio: equipamento.numeroPatrimonio,
    id: equipamento.id,
    url: `${window.location.origin}/equipamento/${equipamento.id}`
  });

  const handlePrint = async () => {
    try {
      // Gerar QR code menor (120px) como data URL para impressão
      const qrCodeDataURL = await generateQRCodeDataURL(qrData, 120);
      
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
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              margin: 0;
              padding: 15px;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f5f5f5;
            }
            
            .label-container {
              width: 80mm;
              height: 60mm;
              border: 2px solid #2c3e50;
              border-radius: 8px;
              padding: 6mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              text-align: center;
              background: white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              position: relative;
              overflow: hidden;
            }
            
            .label-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, #3498db, #2ecc71, #e74c3c);
            }
            
            .header {
              text-align: center;
              margin-bottom: 4mm;
              width: 100%;
            }
            
            .institution-name {
              font-size: 8px;
              font-weight: 600;
              line-height: 1.3;
              margin-bottom: 3mm;
              text-transform: uppercase;
              color: #2c3e50;
              letter-spacing: 0.5px;
            }
            
            .logo-container {
              width: 12mm;
              height: 12mm;
              margin: 0 auto 3mm auto;
              border-radius: 6px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              background: #f8f9fa;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .logo-container img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            
            .logo-placeholder {
              font-size: 6px;
              color: #7f8c8d;
              font-weight: 500;
            }
            
            .content-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 3mm;
              width: 100%;
              flex: 1;
              justify-content: center;
            }
            
            .qr-code {
              padding: 2mm;
              background: white;
              border-radius: 4px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              border: 1px solid #e9ecef;
            }
            
            .qr-code img {
              width: 18mm;
              height: 18mm;
              display: block;
            }
            
            .patrimonio-section {
              width: 100%;
              margin-top: 2mm;
            }
            
            .patrimonio-label {
              font-size: 7px;
              color: #6c757d;
              font-weight: 500;
              text-transform: uppercase;
              margin-bottom: 1mm;
              letter-spacing: 0.3px;
            }
            
            .patrimonio-value {
              font-size: 11px;
              font-weight: bold;
              color: #2c3e50;
              padding: 2mm;
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              border: 1px solid #dee2e6;
              border-radius: 4px;
              letter-spacing: 0.5px;
            }
            
            .equipment-name {
              font-size: 6px;
              color: #6c757d;
              margin-top: 1mm;
              font-style: italic;
              max-width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            @media print {
              body { 
                margin: 0; 
                padding: 0; 
                background: white;
              }
              
              .label-container { 
                width: 80mm; 
                height: 60mm; 
                margin: 0;
                page-break-after: always;
                box-shadow: none;
                border-radius: 4px;
              }
              
              .label-container::before {
                display: none;
              }
            }
            
            @page {
              size: 80mm 60mm;
              margin: 0;
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
              <div class="logo-container">
                <img src="${logoImage}" alt="Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="logo-placeholder" style="display:none;">LOGO</div>
              </div>
            </div>
            
            <div class="content-section">
              <div class="qr-code">
                <img src="${qrCodeDataURL}" alt="QR Code" />
              </div>
              
              <div class="patrimonio-section">
                <div class="patrimonio-label">Patrimônio</div>
                <div class="patrimonio-value">
                  ${equipamento.numeroPatrimonio || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Esperar as imagens carregarem antes de imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
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
              <div className="bg-white border-2 border-gray-700 p-3 inline-block rounded-lg shadow-sm relative">
                {/* Barra colorida no topo */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-t-md"></div>
                
                <div className="text-center pt-1">
                  <div className="text-xs font-semibold mb-2 leading-tight text-gray-700">
                    PROPRIEDADE<br/>
                    ASSOCIAÇÃO HOSPITALAR<br/>
                    BENEFICENTE DE MARAU
                  </div>
                  
                  <div className="w-6 h-6 bg-gray-100 border border-gray-300 mx-auto mb-2 flex items-center justify-content-center rounded shadow-sm overflow-hidden">
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
                  
                  <div className="mb-2 p-1 bg-white rounded border shadow-sm">
                    <QRCodeGenerator data={qrData} size={72} />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">PATRIMÔNIO</div>
                    <div className="text-xs font-bold bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-300 p-1 rounded">
                      {equipamento.numeroPatrimonio || 'N/A'}
                    </div>
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