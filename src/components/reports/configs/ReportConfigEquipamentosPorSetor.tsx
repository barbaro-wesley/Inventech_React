import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
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
  grupo?: {
    id: number;
    nome: string;
    descricao: string;
  } | null;
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

  // Função para selecionar/desselecionar todos os setores
  const handleSelectAllSetores = (checked: boolean) => {
    if (checked) {
      setSelectedSetores(setores.map(setor => setor.id));
    } else {
      setSelectedSetores([]);
    }
  };

  // Função para selecionar/desselecionar todos os tipos
  const handleSelectAllTipos = (checked: boolean) => {
    if (checked) {
      setSelectedTipos(tipos.map(tipo => tipo.id));
    } else {
      setSelectedTipos([]);
    }
  };

  // ✅ só dispara quando clicar no botão
  const handleGenerate = () => {
    onConfigChange({
      setores: selectedSetores.join(','), // Se vazio, será uma string vazia
      tipos: selectedTipos.join(',')
    });
    onGenerate();
  };

  // ✅ Agora só precisa de tipos selecionados (setores é opcional)
  const canGenerate = selectedTipos.length > 0;

  const allSetoresSelected = selectedSetores.length === setores.length && setores.length > 0;
  const allTiposSelected = selectedTipos.length === tipos.length && tipos.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipamentos por Setor</CardTitle>
        <CardDescription>
          Selecione os tipos de equipamento (obrigatório) e opcionalmente os setores para filtrar o relatório
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Setores (Opcional)</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectAllSetores(!allSetoresSelected)}
              disabled={loadingData || setores.length === 0}
            >
              {allSetoresSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </Button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
            {loadingData ? (
              <p className="text-sm text-muted-foreground">Carregando setores...</p>
            ) : setores.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum setor encontrado</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-2">
                  {selectedSetores.length === 0 
                    ? "Todos os setores serão incluídos" 
                    : `${selectedSetores.length} setor(es) selecionado(s)`}
                </p>
                {setores.map((setor) => (
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
                ))}
              </>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">
              Tipos de Equipamento <span className="text-red-500">*</span>
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectAllTipos(!allTiposSelected)}
              disabled={loadingData || tipos.length === 0}
            >
              {allTiposSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </Button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
            {loadingData ? (
              <p className="text-sm text-muted-foreground">Carregando tipos...</p>
            ) : tipos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum tipo encontrado</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-2">
                  {selectedTipos.length} tipo(s) selecionado(s)
                </p>
                {tipos.map((tipo) => (
                  <div key={tipo.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tipo-${tipo.id}`}
                      checked={selectedTipos.includes(tipo.id)}
                      onCheckedChange={(checked) => handleTipoChange(tipo.id, checked as boolean)}
                    />
                    <Label htmlFor={`tipo-${tipo.id}`} className="text-sm">
                      {tipo.nome || '-'} ({tipo.grupo?.nome || '-'})
                    </Label>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="pt-2">
          {!canGenerate && (
            <p className="text-sm text-muted-foreground mb-2">
              * Selecione pelo menos um tipo de equipamento para gerar o relatório
            </p>
          )}
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="w-full"
          >
            {loading ? 'Gerando relatório...' : 'Gerar Relatório'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}