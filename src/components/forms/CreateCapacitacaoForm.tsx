import { useState, useEffect } from "react";
import { ArrowLeft, Search, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import api from '@/lib/api';

// Tipos
interface Setor {
  id: number;
  nome: string;
}

interface Employee {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  setor: Setor;
}

interface DocumentType {
  id: number;
  nome: string;
  descricao?: string;
}

interface TrainingFormData {
  titulo: string;
  dataEvento: string;
  local: string;
  instrutor: string;
  tipoDocumentoId: number;
  participantesIds: number[];
}

interface CreateCapacitacaoFormProps {
  onSubmit: (data: TrainingFormData) => void;
  onCancel: () => void;
}

// Interfaces para as respostas da API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
}

export default function CreateCapacitacaoForm({ onSubmit, onCancel }: CreateCapacitacaoFormProps) {
  // Estados do formulário
  const [formData, setFormData] = useState<TrainingFormData>({
    titulo: '',
    dataEvento: '',
    local: '',
    instrutor: '',
    tipoDocumentoId: 0,
    participantesIds: []
  });

  // Estados para dados externos
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  
  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSetor, setSelectedSetor] = useState<string>('all');

  // Carregar dados necessários
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filtrar funcionários quando search ou setor mudam
  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, selectedSetor]);

  const loadInitialData = async () => {
    try {
      setEmployeesLoading(true);
      
      // Carregar funcionários, tipos de documento e setores
      const [employeesRes, docTypesRes, setoresRes] = await Promise.all([
        api.get<ApiResponse<Employee[]>>('/funcionarios'),
        api.get<ApiResponse<DocumentType[]> | DocumentType[]>('/tipos-documento'),
        api.get<ApiResponse<Setor[]> | Setor[]>('/setor')
      ]);

      console.log('Resposta da API - Funcionários:', employeesRes.data);
      console.log('Resposta da API - Tipos de Documento:', docTypesRes.data);
      console.log('Resposta da API - Setores:', setoresRes.data);

      // CORREÇÃO: Verificar se a resposta tem a estrutura { success, data } ou é um array direto
      let employeesData: Employee[] = [];
      if (employeesRes.data && typeof employeesRes.data === 'object' && 'data' in employeesRes.data) {
        // Resposta estruturada com { success, data }
        employeesData = Array.isArray(employeesRes.data.data) ? employeesRes.data.data : [];
      } else if (Array.isArray(employeesRes.data)) {
        // Resposta direta como array
        employeesData = employeesRes.data;
      }

      let docTypesData: DocumentType[] = [];
      if (docTypesRes.data && typeof docTypesRes.data === 'object' && 'data' in docTypesRes.data) {
        docTypesData = Array.isArray((docTypesRes.data as ApiResponse<DocumentType[]>).data) 
          ? (docTypesRes.data as ApiResponse<DocumentType[]>).data 
          : [];
      } else if (Array.isArray(docTypesRes.data)) {
        docTypesData = docTypesRes.data as DocumentType[];
      }

      let setoresData: Setor[] = [];
      if (setoresRes.data && typeof setoresRes.data === 'object' && 'data' in setoresRes.data) {
        setoresData = Array.isArray((setoresRes.data as ApiResponse<Setor[]>).data) 
          ? (setoresRes.data as ApiResponse<Setor[]>).data 
          : [];
      } else if (Array.isArray(setoresRes.data)) {
        setoresData = setoresRes.data as Setor[];
      }

      console.log('Dados processados - Funcionários:', employeesData);
      console.log('Dados processados - Tipos de Documento:', docTypesData);
      console.log('Dados processados - Setores:', setoresData);

      setEmployees(employeesData);
      setDocumentTypes(docTypesData);
      setSetores(setoresData);
      
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      console.error('Detalhes do erro:', error.response?.data || error.message);
      alert('Erro ao carregar dados necessários para o formulário');
      // Garantir arrays vazios em caso de erro
      setEmployees([]);
      setDocumentTypes([]);
      setSetores([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!Array.isArray(employees)) {
      setFilteredEmployees([]);
      return;
    }

    let filtered = employees;

    // Filtrar por setor
    if (selectedSetor !== 'all') {
      filtered = filtered.filter(emp => emp.setor?.id?.toString() === selectedSetor);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.cpf?.includes(searchTerm) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  };

  const handleEmployeeToggle = (employeeId: number) => {
    setFormData(prev => ({
      ...prev,
      participantesIds: prev.participantesIds.includes(employeeId)
        ? prev.participantesIds.filter(id => id !== employeeId)
        : [...prev.participantesIds, employeeId]
    }));
  };

  const handleSelectAllEmployees = () => {
    if (!Array.isArray(filteredEmployees)) {
      return;
    }

    const allIds = filteredEmployees.map(emp => emp.id);
    const areAllSelected = allIds.every(id => formData.participantesIds.includes(id));
    
    if (areAllSelected) {
      // Desmarcar todos os filtrados
      setFormData(prev => ({
        ...prev,
        participantesIds: prev.participantesIds.filter(id => !allIds.includes(id))
      }));
    } else {
      // Marcar todos os filtrados
      const newSelected = [...new Set([...formData.participantesIds, ...allIds])];
      setFormData(prev => ({
        ...prev,
        participantesIds: newSelected
      }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      dataEvento: value ? new Date(`${value}T00:00:00`).toISOString() : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.dataEvento || !formData.local || !formData.instrutor || !formData.tipoDocumentoId) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.participantesIds.length === 0) {
      alert('Selecione pelo menos um participante');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedEmployees = () => {
    if (!Array.isArray(employees)) {
      return [];
    }
    return employees.filter(emp => formData.participantesIds.includes(emp.id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Novo Registro de Capacitação</h1>
          <p className="text-muted-foreground">
            Preencha os dados do treinamento ou capacitação
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titulo">Título da Capacitação *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({...prev, titulo: e.target.value}))}
                  placeholder="Ex: Treinamento de Segurança no Trabalho"
                />
              </div>
              <div>
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.dataEvento ? new Date(formData.dataEvento).toLocaleDateString('en-CA') : ''}
                  onChange={handleDateChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="local">Local *</Label>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) => setFormData(prev => ({...prev, local: e.target.value}))}
                  placeholder="Ex: Sala de Treinamento A"
                />
              </div>
              <div>
                <Label htmlFor="instrutor">Instrutor *</Label>
                <Input
                  id="instrutor"
                  value={formData.instrutor}
                  onChange={(e) => setFormData(prev => ({...prev, instrutor: e.target.value}))}
                  placeholder="Nome do instrutor"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tipoDocumento">Tipo de Documento *</Label>
              <Select 
                value={formData.tipoDocumentoId.toString()} 
                onValueChange={(value) => setFormData(prev => ({...prev, tipoDocumentoId: parseInt(value)}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Seleção de Participantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Participantes ({formData.participantesIds.length} selecionados)
            </CardTitle>
            {/* Debug info - remover em produção */}
            <div className="text-sm text-muted-foreground">
              Total de funcionários carregados: {employees.length} | 
              Filtrados: {filteredEmployees.length}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, CPF ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedSetor} onValueChange={setSelectedSetor}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os setores</SelectItem>
                  {setores.map((setor) => (
                    <SelectItem key={setor.id} value={setor.id.toString()}>
                      {setor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={handleSelectAllEmployees}
                disabled={!Array.isArray(filteredEmployees) || filteredEmployees.length === 0}
              >
                {Array.isArray(filteredEmployees) && filteredEmployees.length > 0 && 
                 filteredEmployees.every(emp => formData.participantesIds.includes(emp.id))
                  ? 'Desmarcar Todos'
                  : 'Selecionar Todos'}
              </Button>
            </div>

            {/* Lista de Funcionários */}
            {employeesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Carregando funcionários...</span>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto border rounded-md">
                {!Array.isArray(filteredEmployees) || filteredEmployees.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {employees.length === 0 
                      ? 'Nenhum funcionário encontrado na base de dados'
                      : 'Nenhum funcionário corresponde aos filtros aplicados'
                    }
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {filteredEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded"
                      >
                        <Checkbox
                          id={`employee-${employee.id}`}
                          checked={formData.participantesIds.includes(employee.id)}
                          onCheckedChange={() => handleEmployeeToggle(employee.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{employee.nome}</p>
                              <p className="text-sm text-muted-foreground">
                                {employee.email} | {employee.cpf}
                              </p>
                            </div>
                            <Badge variant="outline">{employee.setor?.nome || 'Sem setor'}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Resumo dos Selecionados */}
            {formData.participantesIds.length > 0 && (
              <div className="mt-4">
                <Label>Participantes Selecionados ({formData.participantesIds.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getSelectedEmployees().map((employee) => (
                    <Badge
                      key={employee.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleEmployeeToggle(employee.id)}
                      title="Clique para remover"
                    >
                      {employee.nome} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Criar Registro
          </Button>
        </div>
      </form>
    </div>
  );
}