import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Search, Eye, Download, Upload, Plus, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

interface FolderData {
  id: number;
  cailun_id: number;
  name: string;
  local_path: string;
  created_at: string;
}

interface FileData {
  id: number;
  name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  folder_id: number;
  created_at: string;
  updated_at: string;
}

interface FolderFilesProps {
  folder: FolderData;
}

const FolderFiles: React.FC<FolderFilesProps> = ({ folder }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, [folder.id]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      // Endpoint para buscar arquivos da pasta - ajuste conforme sua API
      const { data } = await api.get(`/cailun/folder/${folder.id}/files`, {
        withCredentials: true,
      });
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
      setFiles([]);
      toast({
        title: "Erro ao carregar arquivos",
        description: "Não foi possível carregar os arquivos da pasta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (file: FileData) => {
    setSelectedFile(file);
    setIsDetailsOpen(true);
  };

  const handleDownload = async (file: FileData) => {
    try {
      const response = await api.get(`/cailun/files/${file.id}/download`, {
        responseType: 'blob',
        withCredentials: true,
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.original_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado",
        description: `Baixando ${file.original_name}`,
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Arquivo inválido",
        description: "Apenas arquivos PDF são permitidos",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder_id', folder.id.toString());

    try {
      setIsUploading(true);
      const { data } = await api.post('/cailun/files/upload', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFiles(prev => [...prev, data]);
      toast({
        title: "Upload concluído",
        description: `${file.name} foi enviado com sucesso`,
      });
      
      // Limpar input
      event.target.value = '';
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.response?.data?.message || "Erro ao enviar arquivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredFiles = Array.isArray(files) 
    ? files.filter(file =>
        file.original_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-4">
      {/* Header com controles */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar PDFs..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <label htmlFor="file-upload">
              <Button
                as="span"
                className="bg-gradient-brand hover:opacity-90 cursor-pointer"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Enviando..." : "Upload PDF"}
              </Button>
            </label>
          </div>
        </div>
      </Card>

      {/* Grid/Lista de arquivos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center p-3 animate-pulse">
                <div className="w-16 h-20 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            ))
          ) : filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group flex flex-col items-center p-3 rounded-lg hover:bg-red-50 transition-all duration-200 cursor-pointer relative"
                onDoubleClick={() => handleViewDetails(file)}
              >
                {/* PDF Visual */}
                <div className="relative mb-2">
                  <svg
                    width="48"
                    height="60"
                    viewBox="0 0 48 60"
                    className="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200"
                  >
                    {/* Sombra do arquivo */}
                    <path
                      d="M8 4 L32 4 L40 12 L40 56 L8 56 Z"
                      fill="#00000010"
                      transform="translate(1,2)"
                    />
                    {/* Corpo do arquivo */}
                    <path
                      d="M8 4 L32 4 L40 12 L40 56 L8 56 Z"
                      fill="#DC2626"
                      className="group-hover:fill-red-500 transition-colors duration-200"
                    />
                    {/* Dobra do arquivo */}
                    <path
                      d="M32 4 L32 12 L40 12 Z"
                      fill="#B91C1C"
                      className="group-hover:fill-red-600 transition-colors duration-200"
                    />
                    {/* Texto PDF */}
                    <text
                      x="24"
                      y="35"
                      textAnchor="middle"
                      className="fill-white text-xs font-bold"
                      style={{ fontSize: '8px' }}
                    >
                      PDF
                    </text>
                  </svg>
                  
                  {/* Menu de contexto */}
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-white rounded-lg shadow-lg border p-1 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(file);
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-800"
                        title="Detalhes"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-800"
                        title="Download"
                      >
                        <Download className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nome do arquivo */}
                <div className="text-center w-full">
                  <p 
                    className="text-sm font-medium text-gray-700 group-hover:text-red-700 truncate px-1 leading-tight"
                    title={file.original_name}
                  >
                    {file.original_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(file.file_size)}
                  </p>
                </div>

                {/* Tooltip com informações */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    <div className="space-y-1">
                      <div><strong>Tamanho:</strong> {formatFileSize(file.file_size)}</div>
                      <div><strong>Criado:</strong> {formatDate(file.created_at)}</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12">
              <div className="mb-4">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto opacity-40" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhum PDF encontrado</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {searchTerm ? "Nenhum arquivo encontrado com esse nome" : "Esta pasta está vazia. Faça upload do primeiro PDF"}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Vista em lista */
        <Card className="overflow-hidden">
          <div className="divide-y">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : filteredFiles.length > 0 ? (
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3"
                  onDoubleClick={() => handleViewDetails(file)}
                >
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.original_name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>{formatDate(file.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(file);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-lg font-semibold mb-2">Nenhum PDF encontrado</h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm ? "Nenhum arquivo encontrado com esse nome" : "Esta pasta está vazia"}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              Detalhes do Arquivo
            </DialogTitle>
          </DialogHeader>
          
          {selectedFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nome Original</Label>
                  <p className="text-sm font-medium break-all">{selectedFile.original_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tamanho</Label>
                  <p className="text-sm">{formatFileSize(selectedFile.file_size)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                  <p className="text-sm">{selectedFile.mime_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Criado em</Label>
                  <p className="text-sm">{formatDate(selectedFile.created_at)}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Caminho do Arquivo</Label>
                <p className="text-sm bg-muted p-2 rounded mt-1 font-mono break-all">
                  {selectedFile.file_path}
                </p>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedFile)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderFiles;