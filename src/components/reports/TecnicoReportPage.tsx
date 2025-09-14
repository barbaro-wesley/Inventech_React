import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, FileText, Settings } from 'lucide-react';

// Import do TecnicoReport real (remova esta linha e use o import real)
import { TecnicoReport } from './TecnicoReport';

interface ReportConfig {
    dataInicio: string;
    dataFim: string;
    status: string;
    prioridade: string;
}

// Componente de configuração
const ReportConfigTecnico: React.FC<{
    onConfigChange: (config: ReportConfig) => void;
    onGenerate: () => void;
    loading: boolean;
}> = ({ onConfigChange, onGenerate, loading }) => {
    const [config, setConfig] = useState<ReportConfig>({
        dataInicio: '',
        dataFim: '',
        status: 'ALL',
        prioridade: 'ALL',
    });

    const handleChange = (field: keyof ReportConfig, value: string) => {
        const newConfig = { ...config, [field]: value };
        setConfig(newConfig);
        // Converte "ALL" para string vazia para compatibilidade com a API
        const apiConfig = {
            ...newConfig,
            status: newConfig.status === 'ALL' ? '' : newConfig.status,
            prioridade: newConfig.prioridade === 'ALL' ? '' : newConfig.prioridade,
        };
        onConfigChange(apiConfig);
    };

    const handleGenerate = () => {
        if (!config.dataInicio || !config.dataFim) {
            alert('Por favor, selecione as datas de início e fim');
            return;
        }
        onGenerate();
    };

    const isConfigValid = config.dataInicio && config.dataFim;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuração do Relatório
                </CardTitle>
                <CardDescription>
                    Configure os parâmetros para gerar o relatório de técnicos
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Período */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Período</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor="dataInicio" className="text-xs text-muted-foreground">
                                Data Início
                            </Label>
                            <Input
                                id="dataInicio"
                                type="date"
                                value={config.dataInicio}
                                onChange={(e) => handleChange('dataInicio', e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Label htmlFor="dataFim" className="text-xs text-muted-foreground">
                                Data Fim
                            </Label>
                            <Input
                                id="dataFim"
                                type="date"
                                value={config.dataFim}
                                onChange={(e) => handleChange('dataFim', e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Filtros Opcionais */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Filtros (Opcionais)</Label>

                    <div>
                        <Label htmlFor="status" className="text-xs text-muted-foreground">
                            Status
                        </Label>
                        <Select value={config.status} onValueChange={(value) => handleChange('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos os status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos os status</SelectItem>
                                <SelectItem value="ABERTA">ABERTA</SelectItem>
                                <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                                <SelectItem value="CONCLUIDA">CONCLUIDA</SelectItem>
                                <SelectItem value="CANCELADA">Cancelada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="prioridade" className="text-xs text-muted-foreground">
                            Prioridade
                        </Label>
                        <Select
                            value={config.prioridade}
                            onValueChange={(value) => handleChange('prioridade', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Todas as prioridades" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todas as prioridades</SelectItem>
                                <SelectItem value="URGENTE">Urgente</SelectItem>
                                <SelectItem value="ALTO">Alta</SelectItem>
                                <SelectItem value="MEDIO">Médio</SelectItem>
                                <SelectItem value="BAIXO">Baixa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Resumo da Configuração */}
                {isConfigValid && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm">
                            <div className="font-medium text-blue-900 mb-1">Resumo:</div>
                            <div className="text-blue-700 space-y-1">
                                <div>📅 Período: {new Date(config.dataInicio).toLocaleDateString('pt-BR')} a {new Date(config.dataFim).toLocaleDateString('pt-BR')}</div>
                                {config.status && config.status !== 'ALL' && (
                                    <div>📊 Status: {config.status.replace('_', ' ')}</div>
                                )}
                                {config.prioridade && config.prioridade !== 'ALL' && (
                                    <div>⚠️ Prioridade: {config.prioridade}</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Botão Gerar */}
                <Button
                    onClick={handleGenerate}
                    disabled={!isConfigValid || loading}
                    className="w-full"
                    size="lg"
                >
                    <FileText className="h-4 w-4 mr-2" />
                    {loading ? 'Gerando Relatório...' : 'Gerar Relatório'}
                </Button>
            </CardContent>
        </Card>
    );
};

export function TecnicoReportPage() {
    const [config, setConfig] = useState<ReportConfig | null>(null);
    const [loading, setLoading] = useState(false);
    const [shouldGenerate, setShouldGenerate] = useState(false);

    const handleConfigChange = (newConfig: ReportConfig) => {
        console.log('Config changed:', newConfig); // Debug log
        setConfig(newConfig);
    };

    const handleGenerate = () => {
        console.log('Generate clicked with config:', config); // Debug log
        setLoading(true);
        setShouldGenerate(true);
        
        // Simula um pequeno delay para mostrar o loading
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    // Só renderiza o TecnicoReport se as condições estão atendidas
    const shouldRenderReport = config && config.dataInicio && config.dataFim && shouldGenerate;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Relatórios de Técnicos</h1>
                    <p className="text-muted-foreground">
                        Gere relatórios completos sobre as atividades dos técnicos
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Coluna da esquerda - Configuração */}
                <div className="xl:col-span-1">
                    <ReportConfigTecnico
                        onConfigChange={handleConfigChange}
                        onGenerate={handleGenerate}
                        loading={loading}
                    />
                    
                    {/* Debug info - remova em produção */}
                    {process.env.NODE_ENV === 'development' && (
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-sm">Debug Info</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs space-y-1">
                                    <div>Config: {config ? 'Definido' : 'Null'}</div>
                                    <div>Data Início: {config?.dataInicio || 'Não definida'}</div>
                                    <div>Data Fim: {config?.dataFim || 'Não definida'}</div>
                                    <div>Should Generate: {shouldGenerate ? 'Sim' : 'Não'}</div>
                                    <div>Should Render: {shouldRenderReport ? 'Sim' : 'Não'}</div>
                                    <div>Loading: {loading ? 'Sim' : 'Não'}</div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Coluna da direita - Resultado */}
                <div className="xl:col-span-2">
                    {shouldRenderReport ? (
                        <TecnicoReport config={config} />
                    ) : loading ? (
                        <Card className="h-fit">
                            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-muted-foreground">Carregando relatório...</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="h-fit">
                            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Nenhum relatório gerado
                                </h3>
                                <p className="text-muted-foreground max-w-sm">
                                    Configure os filtros ao lado e clique em "Gerar Relatório" para visualizar
                                    os dados dos técnicos e gerar o PDF
                                </p>
                                <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        Visualização Web
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Preview PDF
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        Download PDF
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}