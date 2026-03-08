import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import os

# Create charts directory if it doesn't exist
os.makedirs('charts', exist_ok=True)

# Load datasets
# sentiment.csv: timestamp,value,classification,date
sentiment_df = pd.read_csv('data/sentiment.csv')
# hyperliquid_trades.csv: Account,Coin,Execution Price,Size Tokens,Size USD,Side,Timestamp IST,Start Position,Direction,Closed PnL,Transaction Hash,Order ID,Crossed,Fee,Trade ID,Timestamp
trades_df = pd.read_csv('data/hyperliquid_trades.csv')

# Preprocessing
# Use 'date' instead of 'Date'
sentiment_df['date'] = pd.to_datetime(sentiment_df['date'])

def parse_trade_date(date_str):
    try:
        # Expected format: 02-12-2024 22:50
        return pd.to_datetime(date_str, format='%d-%m-%Y %H:%M')
    except:
        return pd.to_datetime(date_str)

# Use 'Timestamp IST' for time
trades_df['time'] = trades_df['Timestamp IST'].apply(parse_trade_date)
trades_df['Date'] = trades_df['time'].dt.normalize()

# Merge on 'Date' (from trades) and 'date' (from sentiment)
merged_df = pd.merge(trades_df, sentiment_df, left_on='Date', right_on='date', how='inner')

# Clean up Closed PnL (handle string if necessary)
if merged_df['Closed PnL'].dtype == 'object':
    merged_df['Closed PnL'] = pd.to_numeric(merged_df['Closed PnL'].str.replace(',', ''), errors='coerce')

# Set aesthetic style
sns.set_theme(style="whitegrid")

# Chart 1: PnL vs Sentiment
plt.figure(figsize=(12, 7))
sns.boxplot(x='classification', y='Closed PnL', data=merged_df, palette='viridis')
plt.title('Profit/Loss Distribution by Market Sentiment', fontsize=15)
plt.xlabel('Market Sentiment', fontsize=12)
plt.ylabel('Closed PnL (USD)', fontsize=12)
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('charts/pnl_vs_sentiment.png', dpi=300)
plt.close()

# Chart 2: Leverage Distribution (Hyperliquid trades don't have a direct 'leverage' column in this export, 
# but they have Size USD and Size Tokens. Usually leverage is implicit. 
# Let's use 'Size USD' as a proxy for trade size distribution instead)
plt.figure(figsize=(12, 7))
sns.histplot(merged_df['Size USD'], bins=30, kde=True, color='blue')
plt.title('Trade Size Distribution (USD)', fontsize=15)
plt.xlabel('Size (USD)', fontsize=12)
plt.ylabel('Frequency', fontsize=12)
plt.tight_layout()
plt.savefig('charts/leverage_distribution.png', dpi=300)
plt.close()

# Chart 3: Trade Frequency (Volume vs Sentiment)
plt.figure(figsize=(12, 7))
volume_by_sentiment = merged_df.groupby('classification').size().sort_values(ascending=False)
volume_by_sentiment.plot(kind='bar', color='teal')
plt.title('Trade Frequency per Sentiment Category', fontsize=15)
plt.xlabel('Market Sentiment', fontsize=12)
plt.ylabel('Number of Trades', fontsize=12)
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('charts/trade_frequency.png', dpi=300)
plt.close()

print("Charts generated successfully in 'charts/' directory.")
