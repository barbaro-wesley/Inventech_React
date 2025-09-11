import { useRef, useState } from 'react';
import { FaFilePdf, FaPrint, FaCog, FaImage, FaFile, FaTimes, FaDownload, FaEye, FaWrench, FaClock } from 'react-icons/fa';
import api from '@/lib/api';
import { pdf } from '@react-pdf/renderer';
import { EquipmentDetailReport } from '@/components/reports/EquipmentDetailReport';

const PopupEquip = ({ equipamento, onClose, onOptionClick }) => {
  const modalRef = useRef();
  const printRef = useRef();
  const [showMenu, setShowMenu] = useState(false);
  const [activeOSTab, setActiveOSTab] = useState('corretiva');

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

  // Função para verificar se é PDF
  const isPdfFile = (filename) => {
    return filename.toLowerCase().endsWith('.pdf');
  };

  // Função para verificar se é imagem
  const isImageFile = (filename) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  // Função para obter ícone e cor baseado no tipo de arquivo
  const getFileIcon = (filename) => {
    if (isPdfFile(filename)) {
      return { icon: <FaFilePdf className="h-5 w-5" />, color: 'text-red-500', bg: 'bg-red-50' };
    } else if (isImageFile(filename)) {
      return { icon: <FaImage className="h-5 w-5" />, color: 'text-blue-500', bg: 'bg-blue-50' };
    } else {
      return { icon: <FaFile className="h-5 w-5" />, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

  // Função melhorada para abrir arquivos
  const handleOpenFile = (filePath) => {
    try {
      // Extrair nome do arquivo do caminho
      const filename = filePath.split(/[/\\]/).pop();
      
      // Construir URL baseado no tipo de arquivo
      let fileUrl;
      
      if (isPdfFile(filename)) {
        // Para PDFs, usar a pasta pdfs
        fileUrl = `${import.meta.env.VITE_API_URL2}/uploads/pdfs/${filename}`;
      } else if (isImageFile(filename)) {
        // Para imagens, usar a pasta padrão de uploads
        fileUrl = `${import.meta.env.VITE_API_URL2}/uploads/${filename}`;
      } else {
        // Para outros arquivos, tentar usar o caminho original
        fileUrl = `${import.meta.env.VITE_API_URL2}/${filePath}`;
      }
      
      console.log('Abrindo arquivo:', fileUrl); // Para debug
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Erro ao abrir arquivo:', error);
      alert('Erro ao abrir o arquivo. Verifique se o arquivo existe.');
    }
  };

  // Função para fazer download do arquivo
  const handleDownloadFile = (filePath) => {
    try {
      const filename = filePath.split(/[/\\]/).pop();
      
      let fileUrl;
      if (isPdfFile(filename)) {
        fileUrl = `${import.meta.env.VITE_API_URL2}/uploads/pdfs/${filename}`;
      } else if (isImageFile(filename)) {
        fileUrl = `${import.meta.env.VITE_API_URL2}/uploads/${filename}`;
      } else {
        fileUrl = `${import.meta.env.VITE_API_URL2}/${filePath}`;
      }
      
      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      alert('Erro ao fazer download do arquivo.');
    }
  };

  const handlePrint = async () => {
    const blob = await pdf(<EquipmentDetailReport equipamento={equipamento} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ABERTA': { color: 'bg-yellow-100 text-yellow-800', text: 'Aberta' },
      'EM_ANDAMENTO': { color: 'bg-blue-100 text-blue-800', text: 'Em Andamento' },
      'CONCLUIDA': { color: 'bg-green-100 text-green-800', text: 'Concluída' },
      'CANCELADA': { color: 'bg-red-100 text-red-800', text: 'Cancelada' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Separar ordens de serviço por tipo
  const ordensCorretivas = equipamento.ordensServico ? equipamento.ordensServico.filter(os => !os.preventiva) : [];
  const ordensPreventivas = equipamento.ordensServico ? equipamento.ordensServico.filter(os => os.preventiva) : [];

  const totalManutencao = equipamento.ordensServico
    ? equipamento.ordensServico.reduce((acc, os) => acc + Number(os.valorManutencao || 0), 0)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col" ref={modalRef}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Informações do Equipamento</h2>
              <p className="text-blue-100">
                {equipamento.nomeEquipamento || 'N/A'} • Cadastrado em {formatDate(equipamento.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                onClick={handlePrint}
                title="Imprimir relatório"
              >
                <FaPrint className="h-5 w-5" />
              </button>
              <div className="relative">
                <button
                  className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  onClick={() => setShowMenu(!showMenu)}
                  title="Criar OS"
                >
                  <FaCog className="h-5 w-5" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border">
                    <button
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                      onClick={() => handleOptionClick("Corretiva")}
                    >
                      <span className="font-medium">OS Corretiva</span>
                    </button>
                    <button
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                      onClick={() => handleOptionClick("Preventiva")}
                    >
                      <span className="font-medium">OS Preventiva</span>
                    </button>
                  </div>
                )}
              </div>
              <button
                className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                onClick={onClose}
                title="Fechar"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Dados Gerais */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-1 h-6 bg-blue-500 rounded mr-3"></div>
                Dados Gerais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: 'Identificação', value: equipamento.identificacao },
                  { label: 'Equipamento', value: equipamento.nomeEquipamento },
                  { label: 'Modelo', value: equipamento.modelo },
                  { label: 'Fabricante', value: equipamento.fabricante },
                  { label: 'Nº Patrimônio', value: equipamento.numeroPatrimonio },
                  { label: 'Nº Série', value: equipamento.numeroSerie },
                  { label: 'Nº Anvisa', value: equipamento.numeroAnvisa },
                  { label: 'IP', value: equipamento.ip },
                  { label: 'Sistema Operacional', value: equipamento.sistemaOperacional },
                ].map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.value || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dados da Compra */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-1 h-6 bg-green-500 rounded mr-3"></div>
                Dados da Compra
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    label: 'Valor da Compra',
                    value: equipamento.valorCompra ? `R$ ${equipamento.valorCompra.toFixed(2)}` : 'R$ 0,00'
                  },
                  {
                    label: 'Valor Atual',
                    value: equipamento.valorAtual ? `R$ ${equipamento.valorAtual.toFixed(2)}` : 'R$ 0,00'
                  },
                  { label: 'Data da Compra', value: formatDate(equipamento.dataCompra) },
                  { label: 'Nota Fiscal', value: equipamento.notaFiscal },
                  { label: 'Início da Garantia', value: formatDate(equipamento.inicioGarantia) },
                  { label: 'Fim da Garantia', value: formatDate(equipamento.terminoGarantia) },
                ].map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.value || '-'}
                    </div>
                  </div>
                ))}
              </div>
              {equipamento.obs && (
                <div className="mt-4 bg-white p-4 rounded-lg border">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Observações
                  </div>
                  <div className="text-sm text-gray-700">
                    {equipamento.obs}
                  </div>
                </div>
              )}
            </div>

            {/* Informações Adicionais */}
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-1 h-6 bg-purple-500 rounded mr-3"></div>
                Informações Adicionais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Setor', value: equipamento.setor?.nome },
                  { label: 'Localização', value: equipamento.localizacao?.nome },
                  { label: 'Tipo de Equipamento', value: equipamento.tipoEquipamento?.nome },
                ].map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.value || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anexos - Seção Melhorada */}
            {equipamento.arquivos && equipamento.arquivos.length > 0 && (
              <div className="bg-orange-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-orange-500 rounded mr-3"></div>
                  Anexos ({equipamento.arquivos.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {equipamento.arquivos.map((arquivo, index) => {
                    const filename = arquivo.split(/[/\\]/).pop();
                    const fileInfo = getFileIcon(filename);
                    
                    return (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg border hover:shadow-lg transition-all duration-200 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-3 rounded-lg ${fileInfo.bg} ${fileInfo.color} group-hover:scale-110 transition-transform`}>
                            {fileInfo.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div 
                              className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors"
                              title={filename}
                            >
                              {filename}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {isPdfFile(filename) ? 'Documento PDF' : 
                               isImageFile(filename) ? 'Imagem' : 'Arquivo'}
                            </div>
                            
                            {/* Botões de Ação */}
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleOpenFile(arquivo)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                title="Visualizar arquivo"
                              >
                                <FaEye className="h-3 w-3" />
                                Ver
                              </button>
                              <button
                                onClick={() => handleDownloadFile(arquivo)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                title="Fazer download"
                              >
                                <FaDownload className="h-3 w-3" />
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Informação adicional sobre anexos */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-800">
                    <strong>Dica:</strong> Clique em "Ver" para visualizar o arquivo em uma nova aba ou em "Download" para baixá-lo.
                  </p>
                </div>
              </div>
            )}

            {/* Ordens de Serviço */}
            {equipamento.ordensServico && equipamento.ordensServico.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-slate-500 rounded mr-3"></div>
                  Ordens de Serviço ({equipamento.ordensServico.length})
                </h3>
                
                {/* Abas */}
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      activeOSTab === 'corretiva'
                        ? 'bg-red-100 text-red-700 border-b-2 border-red-500'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveOSTab('corretiva')}
                  >
                    <FaWrench className="h-4 w-4" />
                    Corretivas ({ordensCorretivas.length})
                  </button>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      activeOSTab === 'preventiva'
                        ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveOSTab('preventiva')}
                  >
                    <FaClock className="h-4 w-4" />
                    Preventivas ({ordensPreventivas.length})
                  </button>
                </div>

                {/* Conteúdo das Abas */}
                <div className="bg-white rounded-lg border overflow-hidden">
                  {activeOSTab === 'corretiva' && (
                    <div className="overflow-x-auto">
                      {ordensCorretivas.length > 0 ? (
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b">
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Descrição
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor da Manutenção
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Anexos
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {ordensCorretivas.map((os) => (
                              <tr key={os.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">#{os.id}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 max-w-xs truncate" title={os.descricao}>
                                    {os.descricao}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {getStatusBadge(os.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {os.valorManutencao
                                      ? new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      }).format(Number(os.valorManutencao))
                                      : "-"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {os.arquivos && os.arquivos.length > 0 ? (
                                    <div className="flex items-center gap-2">
                                      {os.arquivos.map((arquivo, idx) => {
                                        const filename = arquivo.split(/[/\\]/).pop();
                                        const fileInfo = getFileIcon(filename);
                                        return (
                                          <button
                                            key={idx}
                                            className={`p-2 rounded-lg ${fileInfo.bg} ${fileInfo.color} hover:scale-110 transition-transform`}
                                            onClick={() => handleOpenFile(arquivo)}
                                            title={filename}
                                          >
                                            {fileInfo.icon}
                                          </button>
                                        );
                                      })}
                                      <span className="text-xs text-gray-500 ml-2">
                                        {os.arquivos.length} arquivo{os.arquivos.length > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-sm">Sem anexos</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <FaWrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">Nenhuma ordem corretiva encontrada</p>
                          <p className="text-sm">Este equipamento não possui ordens de serviço corretivas.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeOSTab === 'preventiva' && (
                    <div className="overflow-x-auto">
                      {ordensPreventivas.length > 0 ? (
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b">
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Descrição
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data Agendada
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Anexos
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {ordensPreventivas.map((os) => (
                              <tr key={os.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">#{os.id}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 max-w-xs truncate" title={os.descricao}>
                                    {os.descricao}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {getStatusBadge(os.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {os.dataAgendada ? formatDate(os.dataAgendada) : '-'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {os.arquivos && os.arquivos.length > 0 ? (
                                    <div className="flex items-center gap-2">
                                      {os.arquivos.map((arquivo, idx) => {
                                        const filename = arquivo.split(/[/\\]/).pop();
                                        const fileInfo = getFileIcon(filename);
                                        return (
                                          <button
                                            key={idx}
                                            className={`p-2 rounded-lg ${fileInfo.bg} ${fileInfo.color} hover:scale-110 transition-transform`}
                                            onClick={() => handleOpenFile(arquivo)}
                                            title={filename}
                                          >
                                            {fileInfo.icon}
                                          </button>
                                        );
                                      })}
                                      <span className="text-xs text-gray-500 ml-2">
                                        {os.arquivos.length} arquivo{os.arquivos.length > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-sm">Sem anexos</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <FaClock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">Nenhuma ordem preventiva encontrada</p>
                          <p className="text-sm">Este equipamento não possui ordens de serviço preventivas.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="mt-4 bg-white p-4 rounded-lg border">
                  <div className="text-right">
                    <span className="text-sm text-gray-600">Total em Manutenções: </span>
                    <span className="text-lg font-bold text-green-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(totalManutencao)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupEquip;