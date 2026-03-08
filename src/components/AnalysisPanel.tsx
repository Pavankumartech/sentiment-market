import { DailyMetrics, TraderSegment } from '@/lib/types';
import { getSentimentGroupedMetrics } from '@/lib/dataProcessing';
import { SentimentBadge } from './SentimentBadge';
import { MetricCard } from './MetricCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, Legend, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Users } from 'lucide-react';

interface AnalysisPanelProps {
  dailyMetrics: DailyMetrics[];
  traderSegments: TraderSegment[];
}

const SENTIMENT_COLORS: Record<string, string> = {
  'Extreme Fear': '#991b1b',
  'Fear': '#ef4444',
  'Neutral': '#f59e0b',
  'Greed': '#22c55e',
  'Extreme Greed': '#166534',
};

const SEGMENT_COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export function AnalysisPanel({ dailyMetrics, traderSegments }: AnalysisPanelProps) {
  const grouped = getSentimentGroupedMetrics(dailyMetrics);
  
  const segmentCounts = traderSegments.reduce((acc, t) => {
    acc[t.segment] = (acc[t.segment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(segmentCounts).map(([name, value]) => ({ name, value }));

  const segmentPerformance = Object.keys(segmentCounts).map(seg => {
    const traders = traderSegments.filter(t => t.segment === seg);
    return {
      segment: seg,
      count: traders.length,
      avgPnL: traders.reduce((a, t) => a + t.totalPnL, 0) / traders.length,
      avgWinRate: traders.reduce((a, t) => a + t.winRate, 0) / traders.length,
      avgLeverage: traders.reduce((a, t) => a + t.avgLeverage, 0) / traders.length,
    };
  });

  const bestSentiment = [...grouped].sort((a, b) => b.avgPnL - a.avgPnL)[0];
  const worstSentiment = [...grouped].sort((a, b) => a.avgPnL - b.avgPnL)[0];

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'hsl(220, 18%, 10%)',
      border: '1px solid hsl(220, 16%, 18%)',
      borderRadius: '8px',
      fontFamily: 'JetBrains Mono',
      fontSize: '12px',
      color: 'hsl(210, 20%, 90%)',
    },
  };

  return (
    <div className="space-y-8">
      <h2 className="font-mono text-lg font-bold text-foreground">Part B — Analysis</h2>

      {/* Key Findings */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard
          label="Best Sentiment"
          value={bestSentiment?.sentiment || 'N/A'}
          subtitle={`Avg PnL: $${bestSentiment ? bestSentiment.avgPnL.toFixed(2) : '0.00'}`}
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          variant="positive"
        />
        <MetricCard
          label="Worst Sentiment"
          value={worstSentiment?.sentiment || 'N/A'}
          subtitle={`Avg PnL: $${worstSentiment ? worstSentiment.avgPnL.toFixed(2) : '0.00'}`}
          icon={<TrendingDown className="h-4 w-4 text-destructive" />}
          variant="negative"
        />
        <MetricCard
          label="Total Traders"
          value={traderSegments.length}
          subtitle={`${Object.keys(segmentCounts).length} segments`}
          icon={<Users className="h-4 w-4 text-chart-line" />}
        />
        <MetricCard
          label="Avg Daily Trades"
          value={dailyMetrics.length > 0 ? Math.round(dailyMetrics.reduce((a, m) => a + m.tradeCount, 0) / dailyMetrics.length) : 0}
          subtitle="Across all days"
          icon={<Activity className="h-4 w-4 text-accent" />}
          variant="warning"
        />
      </div>

      {/* Q1: Performance by Sentiment */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-1 font-mono text-sm font-semibold text-foreground">
          Q1: Performance by Market Sentiment
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">Average daily PnL, win rate, and trade count grouped by Fear/Greed classification</p>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-mono text-muted-foreground uppercase">Avg Daily PnL by Sentiment</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={grouped}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 18%)" />
                <XAxis dataKey="sentiment" tick={{ fill: 'hsl(215, 15%, 50%)', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(215, 15%, 50%)', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="avgPnL" radius={[4, 4, 0, 0]}>
                  {grouped.map((entry, i) => (
                    <Cell key={i} fill={SENTIMENT_COLORS[entry.sentiment] || '#666'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="mb-2 text-xs font-mono text-muted-foreground uppercase">Win Rate & Trade Frequency</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={grouped}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 18%)" />
                <XAxis dataKey="sentiment" tick={{ fill: 'hsl(215, 15%, 50%)', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fill: 'hsl(215, 15%, 50%)', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(215, 15%, 50%)', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="avgWinRate" name="Win Rate %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="avgTradeCount" name="Avg Trades" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment comparison table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
                <th className="pb-2 pr-4">Sentiment</th>
                <th className="pb-2 pr-4">Days</th>
                <th className="pb-2 pr-4">Avg PnL</th>
                <th className="pb-2 pr-4">Win Rate</th>
                <th className="pb-2 pr-4">Avg Leverage</th>
                <th className="pb-2 pr-4">Long Ratio</th>
                <th className="pb-2">Avg Size</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(g => (
                <tr key={g.sentiment} className="border-b border-border/50">
                  <td className="py-2 pr-4"><SentimentBadge classification={g.sentiment} /></td>
                  <td className="py-2 pr-4 text-foreground">{g.totalDays}</td>
                  <td className={`py-2 pr-4 ${g.avgPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>${g.avgPnL.toFixed(2)}</td>
                  <td className="py-2 pr-4 text-foreground">{g.avgWinRate.toFixed(1)}%</td>
                  <td className="py-2 pr-4 text-foreground">{g.avgLeverage.toFixed(1)}x</td>
                  <td className="py-2 pr-4 text-foreground">{g.avgLongRatio.toFixed(1)}%</td>
                  <td className="py-2 text-foreground">{g.avgTradeSize.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Q2: Behavior Changes */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-1 font-mono text-sm font-semibold text-foreground">
          Q2: Trader Behavior Across Sentiment Regimes
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">How leverage, long/short bias, and position sizes shift</p>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-mono text-muted-foreground uppercase">Avg Leverage by Sentiment</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={grouped}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 18%)" />
                <XAxis dataKey="sentiment" tick={{ fill: 'hsl(215, 15%, 50%)', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(215, 15%, 50%)', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="avgLeverage" name="Avg Leverage" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="mb-2 text-xs font-mono text-muted-foreground uppercase">Long Ratio by Sentiment</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={grouped}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 18%)" />
                <XAxis dataKey="sentiment" tick={{ fill: 'hsl(215, 15%, 50%)', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(215, 15%, 50%)', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="avgLongRatio" name="Long %" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Q3: Trader Segments */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-1 font-mono text-sm font-semibold text-foreground">
          Q3: Trader Segments
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">Behavioral archetypes: High/Low leverage, Frequent/Infrequent, Consistent Winners</p>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-mono text-muted-foreground uppercase">Segment Distribution</p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="mb-2 text-xs font-mono text-muted-foreground uppercase">Segment Performance</p>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 18%)" />
                <XAxis dataKey="avgWinRate" name="Win Rate" unit="%" tick={{ fill: 'hsl(215, 15%, 50%)', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <YAxis dataKey="avgPnL" name="Avg PnL" tick={{ fill: 'hsl(215, 15%, 50%)', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Scatter data={segmentPerformance} fill="#22c55e">
                  {segmentPerformance.map((_, i) => (
                    <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
                <th className="pb-2 pr-4">Segment</th>
                <th className="pb-2 pr-4">Traders</th>
                <th className="pb-2 pr-4">Avg PnL</th>
                <th className="pb-2 pr-4">Win Rate</th>
                <th className="pb-2">Avg Leverage</th>
              </tr>
            </thead>
            <tbody>
              {segmentPerformance.map((s, i) => (
                <tr key={s.segment} className="border-b border-border/50">
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} />
                      {s.segment}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-foreground">{s.count}</td>
                  <td className={`py-2 pr-4 ${s.avgPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>${s.avgPnL.toFixed(2)}</td>
                  <td className="py-2 pr-4 text-foreground">{s.avgWinRate.toFixed(1)}%</td>
                  <td className="py-2 text-foreground">{s.avgLeverage.toFixed(1)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-1 font-mono text-sm font-semibold text-foreground">Daily PnL Timeline with Sentiment Overlay</h3>
        <p className="mb-4 text-xs text-muted-foreground">Colored by sentiment classification</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyMetrics.slice(-90)}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 18%)" />
            <XAxis dataKey="date" tick={{ fill: 'hsl(215, 15%, 50%)', fontFamily: 'JetBrains Mono', fontSize: 10 }} />
            <YAxis tick={{ fill: 'hsl(215, 15%, 50%)', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11 }} />
            <Line type="monotone" dataKey="totalPnL" name="Daily PnL" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="sentimentValue" name="Fear/Greed Index" stroke="#f59e0b" strokeWidth={1} dot={false} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
