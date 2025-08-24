import { useRef, useState } from 'react';
import { FaFilePdf, FaPrint, FaCog } from 'react-icons/fa';
import api from '@/lib/api';
import { pdf } from '@react-pdf/renderer';
import { EquipmentDetailReport } from '@/components/reports/EquipmentDetailReport';

const PopupEquip = ({ equipamento, onClose, onOptionClick }) => {
  const modalRef = useRef();
  const printRef = useRef();
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleOptionClick = (tipo) => {
    setShowMenu(false);
    if (onOptionClick) {
      onOptionClick(tipo);
    }
  };

  const handleOpenPdf = (filePath) => {
    const filename = filePath.split('\\').pop();
    const fileUrl = `${import.meta.env.VITE_API_URL2}/uploads/pdfs/${filename.replace(/^Uploads\/pdfs\//i, '')}`;

    window.open(fileUrl, '_blank');
  };

  const handlePrint = async () => {
    const blob = await pdf(<EquipmentDetailReport equipamento={equipamento} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const totalManutencao = equipamento.ordensServico
    ? equipamento.ordensServico.reduce((acc, os) => acc + Number(os.valorManutencao || 0), 0)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-soft w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto" ref={modalRef}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-foreground">Informações do Equipamento</h2>
          <div className="flex items-center gap-3">
            <button className="p-2 bg-gradient-brand text-white rounded-md hover:opacity-90 transition-opacity" onClick={handlePrint}>
              <FaPrint />
            </button>
            <div className="relative">
              <button
                className="p-2 bg-gradient-brand text-white rounded-md hover:opacity-90 transition-opacity"
                onClick={() => setShowMenu(!showMenu)}
              >
                <FaCog />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-soft z-10">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                    onClick={() => handleOptionClick("Corretiva")}
                  >
                    Corretiva
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                    onClick={() => handleOptionClick("Preventiva")}
                  >
                    Preventiva
                  </button>
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              Data de Cadastro: {formatDate(equipamento.createdAt)}
            </span>
            <button className="text-2xl font-bold text-muted-foreground hover:text-foreground" onClick={onClose}>
              &times;
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-muted">Dados Gerais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-sm">
                <strong className="font-medium text-foreground">Identificação:</strong>
                <span className="text-muted-foreground ml-1">{equipamento.identificacao || "-"}</span>
              </div>
              <div className="text-sm">
                <strong className="font-medium text-foreground">Equipamento:</strong>
                <span className="text-muted-foreground ml-1">{equipamento.nomeEquipamento || "-"}</span>
              </div>
              <div className="text-sm">
                <strong className="font-medium text-foreground">Modelo:</strong>
                <span className="text-muted-foreground ml-1">{equipamento.modelo || "-"}</span>
              </div>
              <div className="text-sm">
                <strong className="font-medium text-foreground">Fabricante:</strong>
                <span className="text-muted-foreground ml-1">{equipamento.fabricante || "-"}</span>
              </div>
              <div className="text-sm">
                <strong className="font-medium text-foreground">Nº Patrimônio:</strong>
                <span className="text-muted-foreground ml-1">{equipamento.numeroPatrimonio || "-"}</span>
              </div>
              <div className="text-sm">
                <strong className="font-medium text-foreground">Nº Série:</strong>
                <span className="text-muted-foreground ml-1">{equipamento.numeroSerie || "-"}</span>
              </div>
              <div className="text-sm">
                <strong className="font-medium text-foreground">Nº Anvisa:</strong>
                <span className="text-muted-foreground ml-1">{equipamento.numeroAnvisa || "-"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-muted">Dados da Compra</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-sm">
                <strong className="font-medium text-foreground">Valor da Compra:</strong>
                <span className="text-muted-foreground ml-1">
                  R$ {equipamento.valorCompra ? equipamento.valorCompra.toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="text-sm">
                <strong className="font-medium text-foreground">Data da Compra:</strong>
                <span className="text-muted-foreground ml-1">{formatDate(equipamento.dataCompra)}</span>
              </div>
              <div className="text-sm">
                <strong className="font-medium text-foreground">NF:</strong>
                <span className="text-muted-foreground ml-1">{equipamento.notaFiscal || "-"}</span>
              </div>
              <div className="text-sm">
                <strong className="font-medium text-foreground">Início da Garantia:</strong>
                <span className="text-muted-foreground ml-1">{formatDate(equipamento.inicioGarantia)}</span>
              </div>
              <div className="text-sm">
                <strong className="font-medium text-foreground">Fim da Garantia:</strong>
                <span className="text-muted-foreground ml-1">{formatDate(equipamento.terminoGarantia)}</span>
              </div>
              <div className="text-sm">
                <strong className="font-medium text-foreground">OBS:</strong>
                <span className="text-muted-foreground ml-1">{equipamento.obs || "-"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-muted">Informações Adicionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-sm">
                <strong className="font-medium text-foreground">Setor:</strong>
                <span className="text-muted-foreground ml-1">{equipamento.setor?.nome || "-"}</span>
              </div>
              <div className="text-sm">
                <strong className="font-medium text-foreground">Localização:</strong>
                <span className="text-muted-foreground ml-1">{equipamento.localizacao?.nome || "-"}</span>
              </div>
              <div className="text-sm">
                <strong className="font-medium text-foreground">Tipo de Equipamento:</strong>
                <span className="text-muted-foreground ml-1">{equipamento.tipoEquipamento?.nome || "-"}</span>
              </div>
            </div>
          </div>

          {equipamento.arquivos && equipamento.arquivos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-muted">Anexos</h3>
              <div className="flex flex-col gap-2">
                {equipamento.arquivos.map((arquivo, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FaFilePdf className="h-5 w-5 text-red-600" />
                    <span
                      onClick={() => handleOpenPdf(arquivo)}
                      className="text-brand-secondary hover:underline cursor-pointer"
                    >
                      {arquivo.split("\\").pop()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {equipamento.ordensServico && equipamento.ordensServico.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-muted">Ordens de Serviço</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-muted px-4 py-2 text-sm text-foreground bg-muted font-medium">ID</th>
                      <th className="border border-muted px-4 py-2 text-sm text-foreground bg-muted font-medium">Descrição</th>
                      <th className="border border-muted px-4 py-2 text-sm text-foreground bg-muted font-medium">Status</th>
                      <th className="border border-muted px-4 py-2 text-sm text-foreground bg-muted font-medium">Valor da Manutenção</th>
                      <th className="border border-muted px-4 py-2 text-sm text-foreground bg-muted font-medium">Anexos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipamento.ordensServico.map((os) => (
                      <tr key={os.id}>
                        <td className="border border-muted px-4 py-2 text-sm text-muted-foreground">{os.id}</td>
                        <td className="border border-muted px-4 py-2 text-sm text-muted-foreground">{os.descricao}</td>
                        <td className="border border-muted px-4 py-2 text-sm text-muted-foreground">{os.status}</td>
                        <td className="border border-muted px-4 py-2 text-sm text-muted-foreground">
                          {os.valorManutencao
                            ? new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(Number(os.valorManutencao))
                            : "-"}
                        </td>
                        <td className="border border-muted px-4 py-2 text-sm text-muted-foreground">
                          {os.arquivos && os.arquivos.length > 0 ? (
                            os.arquivos.map((arquivo, idx) => (
                              <FaFilePdf
                                key={idx}
                                className="h-5 w-5 text-red-600 cursor-pointer mr-2"
                                onClick={() => handleOpenPdf(arquivo)}
                              />
                            ))
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="text-right font-semibold text-foreground mt-4">
            <strong>Total Valor da Manutenção:</strong>{" "}
            <span>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalManutencao)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupEquip;