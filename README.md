# Sentiment Market Analysis (Traders vs. Sentiment)

This repository contains a comprehensive analysis of the relationship between market sentiment (Bitcoin Fear & Greed Index) and trader performance on the Hyperliquid platform.

## 📁 Repository Structure

The project is organized as follows for a clean Data Science submission:

```text
sentiment-market
│
├ data/
│   ├ sentiment.csv             # Bitcoin Fear & Greed Index dataset
│   └ hyperliquid_trades.csv    # Historical trader execution data (Large file)
│
├ notebook/
│   └ analysis.ipynb   ✅      # Main Jupyter Notebook (Data Exploration & Insights)
│
├ charts/
│   ├ pnl_vs_sentiment.png      # PnL distribution by sentiment category
│   ├ leverage_distribution.png # Distribution of trade sizes (USD)
│   └ trade_frequency.png       # Activity volume per sentiment regime
│
├ docs/
│   └ ANALYSIS_REPORT.md        # Methodology, Insights, and Strategy recommendations
│
├ requirements.txt              # Required Python libraries
└ README.md                     # Project overview and setup guide
```

## 📊 Objective
The goal of this study is to identify how extreme market emotions (Fear vs. Greed) influence trader profitability and risk-taking behavior, ultimately formulating a sentiment-aware trading strategy.

## 🚀 Getting Started

### 1. Python Analysis (Charts & Data)
Ensure you have Python 3.8+ installed.
```bash
# Install dependencies
pip install -r requirements.txt

# Generate analysis charts
python generate_charts.py
```

### 2. Interactive Dashboard
To run the React-based visualizer:
```bash
npm install
npm run dev
```

## 💡 Key Insights
*   **PnL Variance**: Traders experience significantly higher volatility in returns during "Extreme Fear" regimes.
*   **Volume Spikes**: Trade frequency correlates positively with "Extreme Greed," showing increased retail participation.
*   **Strategic Alpha**: Reducing leverage during sentiment extremes improves long-term capital preservation.

---
**Data Science Submission**  
*Methodology, Insights, and Strategy included in [ANALYSIS_REPORT.md](docs/ANALYSIS_REPORT.md)*
