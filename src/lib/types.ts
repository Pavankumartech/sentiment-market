export interface SentimentRow {
  timestamp: number;
  value: number;
  classification: string;
  date: string;
}

export interface TradeRow {
  account: string;
  symbol: string;
  executionPrice: number;
  size: number;
  side: string;
  time: string;
  date: string;
  startPosition: number;
  event: string;
  closedPnL: number;
  leverage: number;
  fee: number;
}

export interface DailyMetrics {
  date: string;
  sentiment: string;
  sentimentValue: number;
  totalPnL: number;
  tradeCount: number;
  uniqueTraders: number;
  avgLeverage: number;
  winRate: number;
  avgTradeSize: number;
  longRatio: number;
  shortRatio: number;
  medianPnL: number;
}

export interface TraderSegment {
  account: string;
  totalPnL: number;
  tradeCount: number;
  avgLeverage: number;
  winRate: number;
  avgTradeSize: number;
  longRatio: number;
  segment: string;
}

export interface DataSummary {
  sentimentRows: number;
  sentimentCols: number;
  tradeRows: number;
  tradeCols: number;
  sentimentMissing: Record<string, number>;
  tradeMissing: Record<string, number>;
  sentimentDuplicates: number;
  tradeDuplicates: number;
  dateRange: { start: string; end: string };
  overlappingDates: number;
}
