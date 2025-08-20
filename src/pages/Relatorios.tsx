import { ReportGenerator } from '@/components/reports/ReportGenerator';

export default function Relatorios() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Gere relatórios detalhados do sistema em formato PDF
        </p>
      </div>

      <ReportGenerator />
    </div>
  );
}