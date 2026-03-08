import { DailyMetrics, TraderSegment } from '@/lib/types';
import { getSentimentGroupedMetrics } from '@/lib/dataProcessing';
import { Lightbulb, Shield, Zap } from 'lucide-react';

interface StrategyPanelProps {
  dailyMetrics: DailyMetrics[];
  traderSegments: TraderSegment[];
}

export function StrategyPanel({ dailyMetrics, traderSegments }: StrategyPanelProps) {
  const grouped = getSentimentGroupedMetrics(dailyMetrics);
  
  const fearData = grouped.find(g => g.sentiment === 'Fear' || g.sentiment === 'Extreme Fear');
  const greedData = grouped.find(g => g.sentiment === 'Greed' || g.sentiment === 'Extreme Greed');
  
  const highLevTraders = traderSegments.filter(t => t.segment === 'High Leverage');
  const consistentWinners = traderSegments.filter(t => t.segment === 'Consistent Winner');
  
  const avgHighLevPnL = highLevTraders.length ? highLevTraders.reduce((a, t) => a + t.totalPnL, 0) / highLevTraders.length : 0;
  const avgWinnerLev = consistentWinners.length ? consistentWinners.reduce((a, t) => a + t.avgLeverage, 0) / consistentWinners.length : 0;

  return (
    <div className="space-y-8">
      <h2 className="font-mono text-lg font-bold text-foreground">Part C — Actionable Output</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-primary/30 bg-card p-6 glow-green">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-mono text-sm font-bold text-foreground">Strategy 1: Sentiment-Adaptive Leverage</h3>
          </div>
          <div className="space-y-3 text-sm text-secondary-foreground">
            <p>
              <strong className="text-foreground">Rule:</strong> During Fear/Extreme Fear days, reduce leverage by 30-50% compared to your baseline.
              High-leverage traders (avg {'>'}20x) show significantly worse PnL during fear periods.
            </p>
            <div className="rounded border border-border bg-secondary/50 p-3 font-mono text-xs">
              <p>📊 Evidence:</p>
              {fearData && <p>• Fear avg PnL: <span className={fearData.avgPnL >= 0 ? 'text-primary' : 'text-destructive'}>${fearData.avgPnL.toFixed(2)}</span></p>}
              {greedData && <p>• Greed avg PnL: <span className={greedData.avgPnL >= 0 ? 'text-primary' : 'text-destructive'}>${greedData.avgPnL.toFixed(2)}</span></p>}
              <p>• High-lev trader avg PnL: <span className={avgHighLevPnL >= 0 ? 'text-primary' : 'text-destructive'}>${avgHighLevPnL.toFixed(2)}</span></p>
              <p>• Consistent winners avg leverage: {avgWinnerLev.toFixed(1)}x</p>
            </div>
            <p className="text-xs text-muted-foreground italic">
              "Winners use measured leverage. Reduce exposure when the crowd panics."
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-accent/30 bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-2">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-mono text-sm font-bold text-foreground">Strategy 2: Contrarian Frequency</h3>
          </div>
          <div className="space-y-3 text-sm text-secondary-foreground">
            <p>
              <strong className="text-foreground">Rule:</strong> Increase trade frequency during Fear periods ONLY if you are in the "Consistent Winner" segment.
              Infrequent traders should sit out during extreme sentiment.
            </p>
            <div className="rounded border border-border bg-secondary/50 p-3 font-mono text-xs">
              <p>📊 Evidence:</p>
              {fearData && <p>• Fear avg trade count: {fearData.avgTradeCount.toFixed(0)}</p>}
              {greedData && <p>• Greed avg trade count: {greedData.avgTradeCount.toFixed(0)}</p>}
              <p>• Consistent winners: {consistentWinners.length} traders</p>
              <p>• Their avg win rate: {consistentWinners.length ? (consistentWinners.reduce((a, t) => a + t.winRate, 0) / consistentWinners.length).toFixed(1) : 'N/A'}%</p>
            </div>
            <p className="text-xs text-muted-foreground italic">
              "Skilled traders profit from fear. Unskilled traders amplify their losses."
            </p>
          </div>
        </div>
      </div>

      {/* Additional Insight */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-chart-line/10 p-2">
            <Lightbulb className="h-5 w-5 text-chart-line" />
          </div>
          <h3 className="font-mono text-sm font-bold text-foreground">Bonus Insight: Long/Short Sentiment Divergence</h3>
        </div>
        <div className="space-y-3 text-sm text-secondary-foreground">
          <p>
            Traders tend to go disproportionately long during Greed periods and short during Fear periods — 
            this herding behavior correlates with worse outcomes. Consider taking the opposite side 
            when sentiment reaches extremes.
          </p>
          <div className="rounded border border-border bg-secondary/50 p-3 font-mono text-xs">
            {grouped.map(g => (
              <p key={g.sentiment}>• {g.sentiment}: Long ratio {g.avgLongRatio.toFixed(1)}%</p>
            ))}
          </div>
        </div>
      </div>

      {/* Methodology Summary */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-3 font-mono text-sm font-bold text-foreground">📋 Methodology Summary</h3>
        <div className="space-y-2 text-sm text-secondary-foreground">
          <p><strong className="text-foreground">Data:</strong> Bitcoin Fear/Greed Index aligned with Hyperliquid trade data at daily granularity.</p>
          <p><strong className="text-foreground">Metrics:</strong> Daily PnL, win rate, trade count, avg leverage, long/short ratio, position sizes.</p>
          <p><strong className="text-foreground">Segmentation:</strong> Traders classified by leverage usage (high/low), frequency (frequent/infrequent), and consistency (win rate {'>'} 55% with 100+ trades).</p>
          <p><strong className="text-foreground">Analysis:</strong> Compared all metrics across sentiment regimes (Extreme Fear → Extreme Greed) to identify behavioral shifts and performance differentials.</p>
        </div>
      </div>
    </div>
  );
}
