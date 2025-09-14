import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface Props {
  onConfigChange: (config: { 
    dataInicio: string; 
    dataFim: string; 
    status: string; 
    prioridade: string;
    tipoRelatorio: string;
  }) => void;
  onGenerate: () => void;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'ABERTA', label: 'Aberta' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

const PRIORIDADE_OPTIONS = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIO', label: 'Normal' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' }
];

const TIPO_RELATORIO_OPTIONS = [
  { value: 'completo', label: 'Relatório Completo' },
  { value: 'resumo', label: 'Relatório Resumo' },
  { value: 'produtividade', label: 'Relatório de Produtividade' },
  { value: 'listar-periodo', label: 'Listagem por Período' }
];

export function ReportConfigTecnico({ onConfigChange, onGenerate, loading }: Props) {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPrioridade, setSelectedPrioridade] = useState<string[]>([]);
  const [tipoRelatorio, setTipoRelatorio] = useState('completo');

  const handleStatusChange = (statusValue: string, checked: boolean) => {
    if (checked) {
      setSelectedStatus(prev => [...prev, statusValue]);
    } else {
      setSelectedStatus(prev => prev.filter(s => s !== statusValue));
    }
  };

  const handlePrioridadeChange = (prioridadeValue: string, checked: boolean) => {
    if (checked) {
      setSelectedPrioridade(prev => [...prev, prioridadeValue]);
    } else {
      setSelectedPrioridade(prev => prev.filter(p => p !== prioridadeValue));
    }
  };

  const handleTipoRelatorioChange = (tipo: string) => {
    setTipoRelatorio(tipo);
  };

  const handleGenerate = () => {
    onConfigChange({
      dataInicio,
      dataFim,
      status: selectedStatus.join(','),
      prioridade: selectedPrioridade.join(','),
      tipoRelatorio
    });
    onGenerate();
  };

  const canGenerate = dataInicio && dataFim && (
    tipoRelatorio === 'resumo' || 
    tipoRelatorio === 'produtividade' || 
    (tipoRelatorio === 'listar-periodo' && selectedStatus.length > 0) ||
    (tipoRelatorio === 'completo' && selectedStatus.length > 0)
  );

  const needsStatus = tipoRelatorio === 'completo' || tipoRelatorio === 'listar-periodo';
  const needsPrioridade = tipoRelatorio === 'completo';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório Técnico</CardTitle>
        <CardDescription>
          Configure os filtros para gerar o relatório técnico
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Período */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataInicio" className="text-sm font-medium mb-2 block">
              Data Início
            </Label>
            <Input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="dataFim" className="text-sm font-medium mb-2 block">
              Data Fim
            </Label>
            <Input
              id="dataFim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        </div>

        {/* Status - apenas para relatórios que precisam */}
        {needsStatus && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Status</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {STATUS_OPTIONS.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={selectedStatus.includes(status.value)}
                    onCheckedChange={(checked) => handleStatusChange(status.value, checked as boolean)}
                  />
                  <Label htmlFor={`status-${status.value}`} className="text-sm">
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prioridade - opcional para relatório completo */}
        {needsPrioridade && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Prioridade (opcional)</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {PRIORIDADE_OPTIONS.map((prioridade) => (
                <div key={prioridade.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`prioridade-${prioridade.value}`}
                    checked={selectedPrioridade.includes(prioridade.value)}
                    onCheckedChange={(checked) => handlePrioridadeChange(prioridade.value, checked as boolean)}
                  />
                  <Label htmlFor={`prioridade-${prioridade.value}`} className="text-sm">
                    {prioridade.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

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