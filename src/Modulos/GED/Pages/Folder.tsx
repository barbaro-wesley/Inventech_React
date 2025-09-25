import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Plus, Search, Eye, FolderOpen, Edit, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import FolderFiles from "../Componets/FolderFiles";

interface FolderData {
  id: number;
  cailun_id: number;
  name: string;
  local_path: string;
  created_at: string;
}

interface FolderResponse {
  success: boolean;
  message: string;
  data: {
    cailun: {
      id: number;
      organization_account_id: number;
      hash: string;
      label: string;
      downward: number;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      users_id: number;
      is_root: number;
      status: number;
      downward_origin: string | null;
    };
    local: FolderData;
    localPath: string;
  };
}

const Folders = () => {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<FolderData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openedFolder, setOpenedFolder] = useState<FolderData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      console.log("Iniciando busca de pastas...");
      setLoading(true);
      const response = await api.get("/cailun/folders", {
        withCredentials: true,
      });
      
      console.log("Resposta da API:", response);
      console.log("Data recebida:", response.data);
      
      // Garantir que data é um array
      const foldersData = Array.isArray(response.data) ? response.data : 
                         response.data?.data ? (Array.isArray(response.data.data) ? response.data.data : []) : 
                         [];
      
      console.log("Pastas processadas:", foldersData);
      setFolders(foldersData);
    } catch (error) {
      console.error("Erro detalhado ao carregar pastas:", error);
      console.error("Resposta do erro:", error.response);
      setFolders([]);
      toast({
        title: "Erro ao carregar pastas",
        description: "Não foi possível carregar a lista de pastas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFolder = () => {
    setSelectedFolder(null);
    setFolderName("");
    setIsFormOpen(true);
  };

  const handleEditFolder = (folder: FolderData) => {
    setSelectedFolder(folder);
    setFolderName(folder.name);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      toast({
        title: "Erro",
        description: "O nome da pasta é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedFolder) {
        // Editar pasta existente (se houver endpoint para PUT)
        const { data } = await api.put(`/cailun/folder/${selectedFolder.id}`, {
          name: folderName.trim(),
        });
        
        setFolders(prev => 
          prev.map(folder => 
            folder.id === selectedFolder.id 
              ? { ...folder, name: folderName.trim() }
              : folder
          )
        );
        
        toast({
          title: "Sucesso",
          description: "Pasta editada com sucesso!",
        });
      } else {
        // Criar nova pasta
        const { data }: { data: FolderResponse } = await api.post("/cailun/folder", {
          name: folderName.trim(),
        });

        if (data.success) {
          setFolders(prev => [...prev, data.data.local]);
          toast({
            title: "Sucesso",
            description: data.message,
          });
        }
      }
      
      setIsFormOpen(false);
      setFolderName("");
      setSelectedFolder(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao salvar pasta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (folder: FolderData) => {
    setSelectedFolder(folder);
    setIsDetailsOpen(true);
  };

  const filteredFolders = Array.isArray(folders) 
    ? folders.filter(folder =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleOpenFolder = (folder: FolderData) => {
    setOpenedFolder(folder);
  };

  const handleBackToFolders = () => {
    setOpenedFolder(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Se uma pasta está aberta, mostrar o componente de arquivos
  if (openedFolder) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBackToFolders}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <FolderOpen className="h-6 sm:h-8 w-6 sm:w-8 text-brand-primary" />
              {openedFolder.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Arquivos dentro da pasta
            </p>
          </div>
        </div>
        
        <FolderFiles folder={openedFolder} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <FolderOpen className="h-6 sm:h-8 w-6 sm:w-8 text-brand-primary" />
            Pastas
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gerencie todas as pastas do sistema Cailun
          </p>
        </div>

        <Button
          className="bg-gradient-brand hover:opacity-90 transition-opacity w-full sm:w-auto"
          onClick={handleAddFolder}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Pasta
        </Button>
      </div>

      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar pastas..."
              className="pl-8 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Filtros
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center p-3 animate-pulse">
              <div className="w-16 h-16 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </div>
          ))
        ) : filteredFolders.length > 0 ? (
          filteredFolders.map((folder) => (
            <div
              key={folder.id}
              className="group flex flex-col items-center p-3 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer relative"
              onDoubleClick={() => handleOpenFolder(folder)}
            >
              {/* Pasta Visual */}
              <div className="relative mb-2">
                <svg
                  width="64"
                  height="52"
                  viewBox="0 0 64 52"
                  className="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200"
                >
                  {/* Sombra da pasta */}
                  <path
                    d="M4 12 L28 12 L32 16 L60 16 L60 48 L4 48 Z"
                    fill="#00000010"
                    transform="translate(1,2)"
                  />
                  {/* Corpo da pasta */}
                  <path
                    d="M4 12 L28 12 L32 16 L60 16 L60 48 L4 48 Z"
                    fill="#4A90E2"
                    className="group-hover:fill-blue-500 transition-colors duration-200"
                  />
                  {/* Aba da pasta */}
                  <path
                    d="M4 8 L24 8 L28 12 L4 12 Z"
                    fill="#3B82F6"
                    className="group-hover:fill-blue-600 transition-colors duration-200"
                  />
                  {/* Highlight */}
                  <path
                    d="M4 12 L28 12 L32 16 L60 16 L60 18 L4 18 Z"
                    fill="#60A5FA"
                    className="group-hover:fill-blue-400 transition-colors duration-200"
                  />
                </svg>
                
                {/* Badge de status */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                
                {/* Menu de contexto */}
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white rounded-lg shadow-lg border p-1 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFolder(folder);
                      }}
                      className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-800"
                      title="Editar"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(folder);
                      }}
                      className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-800"
                      title="Detalhes"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Nome da pasta */}
              <div className="text-center w-full">
                <p 
                  className="text-sm font-medium text-gray-700 group-hover:text-blue-700 truncate px-1 leading-tight"
                  title={folder.name}
                >
                  {folder.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(folder.created_at).split(' ')[0]}
                </p>
              </div>

              {/* Tooltip com informações */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  <div className="space-y-1">
                    <div><strong>ID:</strong> {folder.cailun_id}</div>
                    <div><strong>Criado:</strong> {formatDate(folder.created_at)}</div>
                    <div><strong>Caminho:</strong> {folder.local_path.split('\\').pop()}</div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 sm:py-12">
            <div className="mb-4">
              <svg width="80" height="65" viewBox="0 0 64 52" className="mx-auto opacity-40">
                <path d="M4 12 L28 12 L32 16 L60 16 L60 48 L4 48 Z" fill="#E5E7EB"/>
                <path d="M4 8 L24 8 L28 12 L4 12 Z" fill="#D1D5DB"/>
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhuma pasta encontrada</h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
              {searchTerm ? "Nenhuma pasta encontrada com esse nome" : "Comece criando a primeira pasta no sistema"}
            </p>
            <Button
              className="bg-gradient-brand hover:opacity-90 w-full sm:w-auto"
              onClick={handleAddFolder}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Pasta
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              {selectedFolder ? "Editar Pasta" : "Nova Pasta"}
            </DialogTitle>
            <DialogDescription>
              {selectedFolder 
                ? "Edite as informações da pasta selecionada" 
                : "Preencha os dados para criar uma nova pasta no sistema"
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Nome da Pasta</Label>
              <Input
                id="folderName"
                type="text"
                placeholder="Digite o nome da pasta..."
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-brand hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : (selectedFolder ? "Atualizar" : "Criar Pasta")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Detalhes da Pasta
            </DialogTitle>
          </DialogHeader>
          
          {selectedFolder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                  <p className="text-sm font-medium">{selectedFolder.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">ID Local</Label>
                  <p className="text-sm">{selectedFolder.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">ID Cailun</Label>
                  <p className="text-sm">{selectedFolder.cailun_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Data de Criação</Label>
                  <p className="text-sm">{formatDate(selectedFolder.created_at)}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Caminho Local</Label>
                <p className="text-sm bg-muted p-2 rounded mt-1 font-mono break-all">
                  {selectedFolder.local_path}
                </p>
              </div>
              
              <div className="flex justify-end pt-4">
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

export default Folders;