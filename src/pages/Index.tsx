import { useState, useEffect, useCallback, useMemo } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataOverviewPanel } from '@/components/DataOverviewPanel';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { StrategyPanel } from '@/components/StrategyPanel';
import {
  parseSentimentCSV, parseTradesCSV, computeDataSummary,
  computeDailyMetrics, computeTraderSegments
} from '@/lib/dataProcessing';
import { SentimentRow, TradeRow } from '@/lib/types';
import { Activity, BarChart3, Lightbulb, Database } from 'lucide-react';
import { toast } from "sonner";

const TABS = [
  { id: 'overview', label: 'Data Overview', icon: Database },
  { id: 'analysis', label: 'Analysis', icon: BarChart3 },
  { id: 'strategy', label: 'Strategy', icon: Lightbulb },
] as const;

type TabId = typeof TABS[number]['id'];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sentiment, setSentiment] = useState<SentimentRow[]>([]);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [sentimentLoaded, setSentimentLoaded] = useState(false);
  const [tradesLoaded, setTradesLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTradesLoad = useCallback((content: string) => {
    setLoading(true);
    // Process in chunks to avoid blocking UI
    setTimeout(() => {
      const parsed = parseTradesCSV(content);
      setTrades(parsed);
      setTradesLoaded(true);
      setLoading(false);
    }, 100);
  }, []);

  const handleSentimentLoad = useCallback((content: string) => {
    setSentiment(parseSentimentCSV(content));
    setSentimentLoaded(true);
  }, []);

  // Auto-load sentiment data
  useEffect(() => {
    const sentimentUrl = import.meta.env.VITE_SENTIMENT_DATA_URL || '/data/sentiment.csv';
    const traderUrl = import.meta.env.VITE_TRADER_DATA_URL || '/data/hyperliquid_trades.csv';

    fetch(sentimentUrl)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load sentiment: ${r.statusText}`);
        return r.text();
      })
      .then(text => {
        setSentiment(parseSentimentCSV(text));
        setSentimentLoaded(true);
        toast.success("Sentiment data loaded successfully");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error loading sentiment CSV. Please ensure public/data/sentiment.csv exists.");
      });
    
    // Auto-load trades data
    fetch(traderUrl)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load trades: ${r.statusText}`);
        return r.text();
      })
      .then(text => {
        if (text.trim().startsWith('<')) {
          throw new Error("Received HTML instead of CSV (likely 404)");
        }
        handleTradesLoad(text);
        toast.success("Trader data loaded successfully");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error loading trades CSV. Please ensure public/data/trades.csv exists.");
      });
  }, [handleTradesLoad]);

  const dataReady = sentimentLoaded && tradesLoaded;

  const summary = useMemo(() =>
    dataReady ? computeDataSummary(sentiment, trades) : null,
    [dataReady, sentiment, trades]
  );

  const dailyMetrics = useMemo(() =>
    dataReady ? computeDailyMetrics(sentiment, trades) : [],
    [dataReady, sentiment, trades]
  );

  const traderSegments = useMemo(() =>
    dataReady ? computeTraderSegments(trades) : [],
    [dataReady, trades]
  );

  return (
    <div className="min-h-screen bg-background terminal-grid">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-mono text-lg font-bold text-foreground">
                Hyperliquid × Sentiment Analyzer
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Fear/Greed → Trader Behavior → Strategy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${dataReady ? 'bg-primary animate-pulse-glow' : 'bg-muted-foreground'}`} />
            <span className="text-xs font-mono text-muted-foreground">
              {dataReady ? 'DATA LOADED' : 'AWAITING DATA'}
            </span>
          </div>
        </div>
      </header>

      <div className="container py-6 space-y-6">
        {/* Data Upload */}
        <div className="flex flex-wrap gap-4">
          <FileUpload label="Sentiment CSV" onFileLoad={handleSentimentLoad} loaded={sentimentLoaded} />
          <FileUpload label="Trades CSV (Hyperliquid)" onFileLoad={handleTradesLoad} loaded={tradesLoaded} />
        </div>

        {loading && (
          <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <span className="font-mono text-sm text-accent">Processing trade data...</span>
          </div>
        )}

        {!dataReady && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Activity className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <h2 className="mb-2 font-mono text-lg text-muted-foreground">Upload both datasets to begin analysis</h2>
            <p className="max-w-md text-sm text-muted-foreground/60">
              Sentiment CSV is pre-loaded. Upload the Hyperliquid trades CSV to unlock the full dashboard.
            </p>
          </div>
        )}

        {dataReady && summary && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-md px-4 py-2 font-mono text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && <DataOverviewPanel summary={summary} />}
            {activeTab === 'analysis' && <AnalysisPanel dailyMetrics={dailyMetrics} traderSegments={traderSegments} />}
            {activeTab === 'strategy' && <StrategyPanel dailyMetrics={dailyMetrics} traderSegments={traderSegments} />}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
