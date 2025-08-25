import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import api from '@/lib/api';

interface Tecnico {
  id: number;
  nome: string;
  email: string;
  grupo?: {
    id: number;
    nome: string;
    descricao: string;
  };
  grupo?: {
    id: number;
    nome: string;
    descricao: string;
  };
}

interface Props {
  onConfigChange: (config: { 
    tecnicos: string; 
    inicio: string; 
    fim: string; 
    campoData: string; 
    status: string; 
  }) => void;
  onGenerate: () => void;
  loading?: boolean;
}

const statusOptions = [
  { value: 'ABERTA', label: 'Aberta' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' }
];

export function ReportConfigOsPorTecnico({ onConfigChange, onGenerate, loading }: Props) {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [selectedTecnicos, setSelectedTecnicos] = useState<number[]>([]);
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [campoData, setCampoData] = useState('criadoEm');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    fetchTecnicos();
  }, []);

  const fetchTecnicos = async () => {
    try {
      setLoadingData(true);
      const response = await api.get('/tecnicos');
      // Pega todos técnicos ativos
      const tecnicosData = response.data.filter((func: any) => func.ativo);
      setTecnicos(tecnicosData);
    } catch (error) {
      console.error('Erro ao buscar técnicos:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleTecnicoChange = (tecnicoId: number, checked: boolean) => {
    if (checked) {
      setSelectedTecnicos(prev => [...prev, tecnicoId]);
    } else {
      setSelectedTecnicos(prev => prev.filter(id => id !== tecnicoId));
    }
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatus(prev => [...prev, status]);
    } else {
      setSelectedStatus(prev => prev.filter(s => s !== status));
    }
  };

  // ✅ Função para só gerar quando clicar
  const handleGenerate = () => {
    onConfigChange({
      tecnicos: selectedTecnicos.join(','),
      inicio,
      fim,
      campoData,
      status: selectedStatus.join(',')
    });
    onGenerate();
  };

  const canGenerate = selectedTecnicos.length > 0 && inicio && fim;

  return (
    <Card>
      <CardHeader>
        <CardTitle>OS por Técnico</CardTitle>
        <CardDescription>
          Configure o período e técnicos para o relatório de Ordens de Serviço
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="inicio">Data Início</Label>
            <Input
              id="inicio"
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="fim">Data Fim</Label>
            <Input
              id="fim"
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="campoData">Campo de Data</Label>
          <Select value={campoData} onValueChange={setCampoData}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="criadoEm">Criado em</SelectItem>
              <SelectItem value="finalizadoEm">Finalizado em</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Técnicos</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
            {loadingData ? (
              <p className="text-sm text-muted-foreground">Carregando técnicos...</p>
            ) : tecnicos.length > 0 ? (
              tecnicos.map((tecnico) => (
                <div key={tecnico.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tecnico-${tecnico.id}`}
                    checked={selectedTecnicos.includes(tecnico.id)}
                    onCheckedChange={(checked) => handleTecnicoChange(tecnico.id, checked as boolean)}
                  />
                  <Label htmlFor={`tecnico-${tecnico.id}`} className="text-sm">
                    {tecnico.nome} {tecnico.grupo ? `(${tecnico.grupo.nome})` : ''}
                    {tecnico.nome} {tecnico.grupo ? `(${tecnico.grupo.nome})` : ''}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum técnico encontrado</p>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Status (opcional)</Label>
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${option.value}`}
                  checked={selectedStatus.includes(option.value)}
                  onCheckedChange={(checked) => handleStatusChange(option.value, checked as boolean)}
                />
                <Label htmlFor={`status-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={!canGenerate || loading}
          className="w-full"
        >
          {loading ? 'Gerando relatório...' : 'Gerar Relatório'}
        </Button>
      </CardContent>
    </Card>
  );
}

