# Trader Performance vs Market Sentiment

Analysis of how market sentiment (Fear/Greed) relates to trader behavior and performance on Hyperliquid.

## Objective
Uncover patterns in trader performance across different market sentiment regimes (Fear vs Greed) to inform smarter trading strategies.

## Features
- [x] **Analysis Engine**: TypeScript-based processing logic for high-volume trade data.
- [x] **Jupyter Notebook**: [analysis.ipynb](./analysis.ipynb) for traditional Python-based Data Science exploration.
- [x] **README.md**: Comprehensive setup and deployment instructions.
- [x] **Charts & Tables**: Dynamic visualizations using Recharts and shadcn componentry.
- [x] **Write-up**: See [ANALYSIS_REPORT.md](./ANALYSIS_REPORT.md) for methodology, insights, and strategies.

## Tech Stack
- **Vite** + **React**
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (Data Visualization)
- **Radix UI** / **Shadcn**

## Getting Started

### Prerequisites
- Node.js & npm/bun

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🚀 Deployment (Vercel)

This project is optimized for deployment on **Vercel**.

1.  **Environment Variables**: In Vercel Project Settings, add the following (optional if using defaults):
    - `VITE_SENTIMENT_DATA_URL`: Path to your sentiment CSV (default: `/data/sentiment.csv`)
    - `VITE_TRADER_DATA_URL`: Path to your trades CSV (default: `/data/trades.csv`)
2.  **Automatic Routing**: The included `vercel.json` ensures that all routes redirect correctly for this SPA.

## ⚙️ Environment Variables

Copy `.env.example` to `.env` for local development:
```bash
VITE_SENTIMENT_DATA_URL=/data/sentiment.csv
VITE_TRADER_DATA_URL=/data/trades.csv
```

## Dataset Requirements
The application expects two primary CSV datasets:
1. **Sentiment Data**: Bitcoin Fear/Greed Index with `Date` and `Classification`.
2. **Trader Data**: Hyperliquid execution data with `account`, `symbol`, `size`, `side`, `closedPnL`, and `leverage`.

## Methodology
Data is aligned at a daily granularity. Metrics such as PnL, win rate, and leverage are aggregated across sentiment classifications to identify behavioral shifts and performance differentials.

---
*Internship Assignment Submission*