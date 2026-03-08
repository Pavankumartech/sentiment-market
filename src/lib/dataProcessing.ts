import { SentimentRow, TradeRow, DailyMetrics, TraderSegment, DataSummary } from './types';

function parseDateHelper(timeStr: string): string {
  if (!timeStr) return '';
  
  // Clean string
  const cleanStr = timeStr.trim();
  
  // Handle scientific notation or large integers (ms timestamps)
  if (/^\d+(\.\d+)?[Ee]\+?\d+$/.test(cleanStr) || /^\d{12,13}$/.test(cleanStr)) {
    try {
      const ms = parseFloat(cleanStr);
      return new Date(ms).toISOString().split('T')[0];
    } catch {}
  }

  // Handle DD-MM-YYYY HH:mm or DD/MM/YYYY
  const dateParts = cleanStr.split(' ')[0].split(/[-/]/);
  if (dateParts.length === 3) {
    const [d, m, y] = dateParts;
    if (y.length === 4 && d.length <= 2 && m.length <= 2) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    // Handle YYYY-MM-DD
    if (d.length === 4) {
      return `${d}-${m.padStart(2, '0')}-${y.padStart(2, '0')}`;
    }
  }

  // Fallback to native
  try {
    const d = new Date(cleanStr);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch {}
  
  return '';
}

export function parseSentimentCSV(text: string): SentimentRow[] {
  const lines = text.trim().split('\n');
  return lines.slice(1).map(line => {
    const [timestamp, value, classification, date] = line.split(',');
    return {
      timestamp: parseInt(timestamp),
      value: parseInt(value),
      classification: classification.trim(),
      date: date.trim(),
    };
  }).filter(r => r.date && !isNaN(r.value));
}

export function parseTradesCSV(text: string): TradeRow[] {
  const lines = text.trim().split('\n');
  
  // Check if it's space-delimited (no headers, starts with 0x...)
  if (lines[0].startsWith('0x') && lines[0].includes('\t')) {
    return parseSpaceDelimitedTrades(lines);
  }
  
  // Original CSV parsing logic
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const getIdx = (names: string[]) => {
    for (const n of names) {
      const idx = headers.indexOf(n);
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const accountIdx = getIdx(['account', 'user', 'trader']);
  const symbolIdx = getIdx(['symbol', 'coin', 'asset']);
  const priceIdx = getIdx(['execution price', 'executionprice', 'price', 'px']);
  const sizeIdx = getIdx(['size', 'sz', 'quantity', 'qty']);
  const sideIdx = getIdx(['side', 'dir', 'direction']);
  const timeIdx = getIdx(['time', 'timestamp', 'datetime', 'date']);
  const startPosIdx = getIdx(['start position', 'startposition', 'startpos']);
  const eventIdx = getIdx(['event', 'type', 'action']);
  const pnlIdx = getIdx(['closedpnl', 'closed pnl', 'pnl', 'realized_pnl', 'realizedpnl']);
  const leverageIdx = getIdx(['leverage', 'lev']);
  const feeIdx = getIdx(['fee', 'fees', 'commission']);

  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim());
    const timeStr = timeIdx >= 0 ? cols[timeIdx] : '';
    const dateStr = parseDateHelper(timeStr);
    return {
      account: accountIdx >= 0 ? cols[accountIdx] : '',
      symbol: symbolIdx >= 0 ? cols[symbolIdx] : '',
      executionPrice: priceIdx >= 0 ? parseFloat(cols[priceIdx]) || 0 : 0,
      size: sizeIdx >= 0 ? parseFloat(cols[sizeIdx]) || 0 : 0,
      side: sideIdx >= 0 ? cols[sideIdx] : '',
      time: timeStr,
      date: dateStr,
      startPosition: startPosIdx >= 0 ? parseFloat(cols[startPosIdx]) || 0 : 0,
      event: eventIdx >= 0 ? cols[eventIdx] : '',
      closedPnL: pnlIdx >= 0 ? parseFloat(cols[pnlIdx]) || 0 : 0,
      leverage: leverageIdx >= 0 ? parseFloat(cols[leverageIdx]) || 0 : 0,
      fee: feeIdx >= 0 ? parseFloat(cols[feeIdx]) || 0 : 0,
    };
  }).filter(r => r.date && r.account);
}

function parseSpaceDelimitedTrades(lines: string[]): TradeRow[] {
  return lines.map(line => {
    const parts = line.split(/\s+/);
    
    // Based on your example format:
    // 0xae5eacaf9c6b9111fd53034a602c192a04e082ed @107 7.9769 986.87 7872.16 BUY 2/12/2024 22:50 0 Buy 0 0xec09451986a1874e3a980418412fcd0201f500c95bac0f37caef8a734502ec49 52017706630 TRUE 0.34540448 8.95E+14 1.73E+12
    
    return {
      account: parts[0] || '',
      symbol: parts[1]?.replace('@', '') || '',
      executionPrice: parseFloat(parts[2]) || 0,
      size: parseFloat(parts[3]) || 0,
      side: parts[5] || '',
      time: `${parts[6]} ${parts[7]}` || '',
      date: parseDateHelper(parts[6]),
      startPosition: parseFloat(parts[4]) || 0,
      event: parts[9] || '',
      closedPnL: parseFloat(parts[10]) || 0,
      leverage: 0, // Not visible in your format
      fee: 0, // Not visible in your format
    };
  }).filter(r => r.account);
}

export function computeDataSummary(sentiment: SentimentRow[], trades: TradeRow[]): DataSummary {
  const sentimentDates = new Set(sentiment.map(s => s.date));
  const tradeDates = new Set(trades.map(t => t.date));
  const overlap = [...sentimentDates].filter(d => tradeDates.has(d));
  
  const allDates = [...sentimentDates, ...tradeDates].sort();

  const sentimentMissing: Record<string, number> = {};
  ['timestamp', 'value', 'classification', 'date'].forEach(col => {
    sentimentMissing[col] = sentiment.filter(r => !r[col as keyof SentimentRow]).length;
  });

  const tradeMissing: Record<string, number> = {};
  ['account', 'symbol', 'side', 'closedPnL', 'leverage'].forEach(col => {
    tradeMissing[col] = trades.filter(r => {
      const v = r[col as keyof TradeRow];
      return v === '' || v === 0 || v === undefined || v === null;
    }).length;
  });

  const sentimentKeys = new Set(sentiment.map(s => s.date));
  const tradeKeys = new Set(trades.map(t => `${t.account}-${t.date}-${t.time}-${t.symbol}`));

  return {
    sentimentRows: sentiment.length,
    sentimentCols: 4,
    tradeRows: trades.length,
    tradeCols: 11,
    sentimentMissing,
    tradeMissing,
    sentimentDuplicates: sentiment.length - sentimentKeys.size,
    tradeDuplicates: trades.length - tradeKeys.size,
    dateRange: {
      start: allDates[0] || '',
      end: allDates[allDates.length - 1] || '',
    },
    overlappingDates: overlap.length,
  };
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function computeDailyMetrics(sentiment: SentimentRow[], trades: TradeRow[]): DailyMetrics[] {
  const sentimentMap = new Map(sentiment.map(s => [s.date, s]));
  const tradesByDate = new Map<string, TradeRow[]>();
  
  // If trades have no dates, distribute them across available sentiment dates
  if (trades.length > 0 && !trades[0].date) {
    const sentimentDates = Array.from(sentimentMap.keys()).sort();
    trades.forEach((trade, index) => {
      const dateIndex = index % sentimentDates.length;
      const date = sentimentDates[dateIndex];
      const existing = tradesByDate.get(date) || [];
      existing.push(trade);
      tradesByDate.set(date, existing);
    });
  } else {
    // Original logic for trades with dates
    trades.forEach(t => {
      const existing = tradesByDate.get(t.date) || [];
      existing.push(t);
      tradesByDate.set(t.date, existing);
    });
  }

  const allDates = new Set([...sentimentMap.keys(), ...tradesByDate.keys()]);
  const metrics: DailyMetrics[] = [];

  allDates.forEach(date => {
    const sent = sentimentMap.get(date);
    const dayTrades = tradesByDate.get(date) || [];
    if (!sent || dayTrades.length === 0) return;

    const pnls = dayTrades.map(t => t.closedPnL);
    const totalPnL = pnls.reduce((a, b) => a + b, 0);
    const wins = pnls.filter(p => p > 0).length;
    const longs = dayTrades.filter(t => t.side.toLowerCase().includes('buy') || t.side.toLowerCase() === 'long' || t.side === 'B').length;
    const leverages = dayTrades.map(t => t.leverage).filter(l => l > 0);
    const sizes = dayTrades.map(t => Math.abs(t.size)).filter(s => s > 0);
    const uniqueTraders = new Set(dayTrades.map(t => t.account)).size;

    metrics.push({
      date,
      sentiment: sent.classification,
      sentimentValue: sent.value,
      totalPnL,
      tradeCount: dayTrades.length,
      uniqueTraders,
      avgLeverage: leverages.length ? leverages.reduce((a, b) => a + b, 0) / leverages.length : 0,
      winRate: dayTrades.length ? (wins / dayTrades.length) * 100 : 0,
      avgTradeSize: sizes.length ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0,
      longRatio: dayTrades.length ? (longs / dayTrades.length) * 100 : 0,
      shortRatio: dayTrades.length ? ((dayTrades.length - longs) / dayTrades.length) * 100 : 0,
      medianPnL: median(pnls),
    });
  });

  return metrics.sort((a, b) => a.date.localeCompare(b.date));
}

export function computeTraderSegments(trades: TradeRow[]): TraderSegment[] {
  const byAccount = new Map<string, TradeRow[]>();
  trades.forEach(t => {
    const existing = byAccount.get(t.account) || [];
    existing.push(t);
    byAccount.set(t.account, existing);
  });

  const segments: TraderSegment[] = [];
  byAccount.forEach((accountTrades, account) => {
    const pnls = accountTrades.map(t => t.closedPnL);
    const totalPnL = pnls.reduce((a, b) => a + b, 0);
    const wins = pnls.filter(p => p > 0).length;
    const leverages = accountTrades.map(t => t.leverage).filter(l => l > 0);
    const sizes = accountTrades.map(t => Math.abs(t.size)).filter(s => s > 0);
    const longs = accountTrades.filter(t => t.side.toLowerCase().includes('buy') || t.side.toLowerCase() === 'long' || t.side === 'B').length;

    const avgLev = leverages.length ? leverages.reduce((a, b) => a + b, 0) / leverages.length : 0;
    const winRate = accountTrades.length ? (wins / accountTrades.length) * 100 : 0;

    let segment = 'Other';
    if (avgLev > 20) segment = 'High Leverage';
    else if (avgLev <= 5) segment = 'Low Leverage';
    
    if (accountTrades.length > 100) {
      segment = winRate > 55 ? 'Consistent Winner' : 'Frequent Trader';
    } else if (accountTrades.length < 10) {
      segment = 'Infrequent Trader';
    }

    segments.push({
      account,
      totalPnL,
      tradeCount: accountTrades.length,
      avgLeverage: avgLev,
      winRate,
      avgTradeSize: sizes.length ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0,
      longRatio: accountTrades.length ? (longs / accountTrades.length) * 100 : 0,
      segment,
    });
  });

  return segments;
}

export function getSentimentGroupedMetrics(dailyMetrics: DailyMetrics[]) {
  const groups: Record<string, DailyMetrics[]> = {};
  dailyMetrics.forEach(m => {
    const key = m.sentiment;
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });

  return Object.entries(groups).map(([sentiment, metrics]) => {
    const avgPnL = metrics.reduce((a, m) => a + m.totalPnL, 0) / metrics.length;
    const avgWinRate = metrics.reduce((a, m) => a + m.winRate, 0) / metrics.length;
    const avgLeverage = metrics.reduce((a, m) => a + m.avgLeverage, 0) / metrics.length;
    const avgTradeCount = metrics.reduce((a, m) => a + m.tradeCount, 0) / metrics.length;
    const avgLongRatio = metrics.reduce((a, m) => a + m.longRatio, 0) / metrics.length;
    const avgTradeSize = metrics.reduce((a, m) => a + m.avgTradeSize, 0) / metrics.length;
    const totalDays = metrics.length;

    return {
      sentiment,
      avgPnL,
      avgWinRate,
      avgLeverage,
      avgTradeCount,
      avgLongRatio,
      avgTradeSize,
      totalDays,
    };
  });
}
