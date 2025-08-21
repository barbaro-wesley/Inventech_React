export interface Employee {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
  setor: string;
  email: string;
  telefone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentType {
  id: string;
  nome: string;
  descricao?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingRecord {
  id: string;
  titulo: string;
  data: Date;
  local: string;
  instrutor: string;
  participantes: Employee[];
  tipoDocumento: DocumentType;
  certificadoUrl?: string;
  certificadoAssinado?: string;
  status: 'draft' | 'sent_for_signature' | 'signed' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  titulo?: string;
  instrutor?: string;
  tipoDocumento?: string;
  funcionario?: string;
  dataInicio?: Date;
  dataFim?: Date;
}