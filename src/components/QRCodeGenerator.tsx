import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
  className?: string;
}

export const QRCodeGenerator = ({ data, size = 200, className = "" }: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      if (canvasRef.current && data) {
        try {
          await QRCode.toCanvas(canvasRef.current, data, {
            width: size,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          // Também gerar data URL para uso posterior
          const dataURL = await QRCode.toDataURL(data, {
            width: size,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeDataURL(dataURL);
        } catch (error) {
          console.error('Erro ao gerar QR Code:', error);
        }
      }
    };

    generateQR();
  }, [data, size]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} className="border rounded" />
    </div>
  );
};

export const generateQRCodeDataURL = async (data: string, size: number = 200): Promise<string> => {
  try {
    return await QRCode.toDataURL(data, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code data URL:', error);
    return '';
  }
};