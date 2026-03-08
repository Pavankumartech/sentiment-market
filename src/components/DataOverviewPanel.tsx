import { DataSummary } from '@/lib/types';
import { MetricCard } from './MetricCard';
import { Database, AlertTriangle, Calendar, Layers } from 'lucide-react';

interface DataOverviewPanelProps {
  summary: DataSummary;
}

export function DataOverviewPanel({ summary }: DataOverviewPanelProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-mono text-lg font-bold text-foreground">Part A — Data Preparation</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Sentiment Rows" value={summary.sentimentRows} subtitle={`${summary.sentimentCols} columns`} icon={<Database className="h-4 w-4 text-primary" />} variant="positive" />
        <MetricCard label="Trade Rows" value={summary.tradeRows} subtitle={`${summary.tradeCols} columns`} icon={<Database className="h-4 w-4 text-chart-line" />} />
        <MetricCard label="Date Range" value={`${summary.dateRange.start.slice(5)} → ${summary.dateRange.end.slice(5)}`} subtitle="Aligned by date" icon={<Calendar className="h-4 w-4 text-accent" />} variant="warning" />
        <MetricCard label="Overlapping Days" value={summary.overlappingDates} subtitle="Merged dataset" icon={<Layers className="h-4 w-4 text-primary" />} variant="positive" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 font-mono text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent" /> Sentiment Data Quality
          </h3>
          <div className="space-y-2">
            {Object.entries(summary.sentimentMissing).map(([col, count]) => (
              <div key={col} className="flex justify-between text-sm font-mono">
                <span className="text-muted-foreground">{col}</span>
                <span className={count > 0 ? 'text-destructive' : 'text-primary'}>{count} missing</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 flex justify-between text-sm font-mono">
              <span className="text-muted-foreground">Duplicates</span>
              <span className={summary.sentimentDuplicates > 0 ? 'text-accent' : 'text-primary'}>{summary.sentimentDuplicates}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 font-mono text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent" /> Trade Data Quality
          </h3>
          <div className="space-y-2">
            {Object.entries(summary.tradeMissing).map(([col, count]) => (
              <div key={col} className="flex justify-between text-sm font-mono">
                <span className="text-muted-foreground">{col}</span>
                <span className={count > 0 ? 'text-accent' : 'text-primary'}>{count} missing/zero</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 flex justify-between text-sm font-mono">
              <span className="text-muted-foreground">Duplicates</span>
              <span className={summary.tradeDuplicates > 0 ? 'text-accent' : 'text-primary'}>{summary.tradeDuplicates}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
