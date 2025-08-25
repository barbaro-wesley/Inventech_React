import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import api from '@/lib/api';

interface Setor {
  id: number;
  nome: string;
}

interface TipoEquipamento {
  id: number;
  nome: string;
  grupoId: number;
  grupo: {
    id: number;
    nome: string;
    descricao: string;
  };
}

interface Props {
  onConfigChange: (config: { setores: string; tipos: string }) => void;
  onGenerate: () => void;
  loading?: boolean;
}

export function ReportConfigEquipamentosPorSetor({ onConfigChange, onGenerate, loading }: Props) {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [tipos, setTipos] = useState<TipoEquipamento[]>([]);
  const [selectedSetores, setSelectedSetores] = useState<number[]>([]);
  const [selectedTipos, setSelectedTipos] = useState<number[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    onConfigChange({
      setores: selectedSetores.join(','),
      tipos: selectedTipos.join(',')
    });
  }, [selectedSetores, selectedTipos, onConfigChange]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [setoresResponse, tiposResponse] = await Promise.all([
        api.get('/setor'),
        api.get('/tipos-equipamento')
      ]);
      setSetores(setoresResponse.data);
      setTipos(tiposResponse.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSetorChange = (setorId: number, checked: boolean) => {
    if (checked) {
      setSelectedSetores(prev => [...prev, setorId]);
    } else {
      setSelectedSetores(prev => prev.filter(id => id !== setorId));
    }
  };

  const handleTipoChange = (tipoId: number, checked: boolean) => {
    if (checked) {
      setSelectedTipos(prev => [...prev, tipoId]);
    } else {
      setSelectedTipos(prev => prev.filter(id => id !== tipoId));
    }
  };

  const canGenerate = selectedSetores.length > 0 && selectedTipos.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipamentos por Setor</CardTitle>
        <CardDescription>
          Selecione os setores e tipos de equipamento para o relatório
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Setores</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
            {loadingData ? (
              <p className="text-sm text-muted-foreground">Carregando setores...</p>
            ) : (
              setores.map((setor) => (
                <div key={setor.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`setor-${setor.id}`}
                    checked={selectedSetores.includes(setor.id)}
                    onCheckedChange={(checked) => handleSetorChange(setor.id, checked as boolean)}
                  />
                  <Label htmlFor={`setor-${setor.id}`} className="text-sm">
                    {setor.nome}
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Tipos de Equipamento</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
            {loadingData ? (
              <p className="text-sm text-muted-foreground">Carregando tipos...</p>
            ) : (
              tipos.map((tipo) => (
                <div key={tipo.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tipo-${tipo.id}`}
                    checked={selectedTipos.includes(tipo.id)}
                    onCheckedChange={(checked) => handleTipoChange(tipo.id, checked as boolean)}
                  />
                  <Label htmlFor={`tipo-${tipo.id}`} className="text-sm">
                    {tipo.nome} ({tipo.grupo.nome})
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>

        <Button 
          onClick={onGenerate} 
          disabled={!canGenerate || loading}
          className="w-full"
        >
          {loading ? 'Gerando relatório...' : 'Gerar Relatório'}
        </Button>
      </CardContent>
    </Card>
  );
}