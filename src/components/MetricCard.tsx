import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'default' | 'positive' | 'negative' | 'warning';
}

export function MetricCard({ label, value, subtitle, icon, variant = 'default' }: MetricCardProps) {
  const variantClasses = {
    default: 'border-border',
    positive: 'border-primary/30 glow-green',
    negative: 'border-destructive/30 glow-red',
    warning: 'border-accent/30',
  };

  return (
    <div className={`rounded-lg border bg-card p-4 ${variantClasses[variant]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold font-mono text-card-foreground">
        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}
      </p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
