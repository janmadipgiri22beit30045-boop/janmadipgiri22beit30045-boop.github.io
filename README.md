# Commodity Price Insights Dashboard

A browser-based financial analysis platform with three main tools: a commodity price insights dashboard, legendary investor strategies explorer, and a live prediction market arbitrage bot.

## Features

### 📊 Commodity Dashboard
- **Period Returns**: 1W / 1M / 3M / 6M / 12M / 2Y / 3Y / 5Y returns for each commodity
- **Calendar Year Returns**: Jan–Dec yearly performance breakdown
- **Financial Year Returns**: Apr–Mar (Indian FY) yearly performance breakdown
- **Weekly Movement**: Last 12 weeks of week-over-week changes
- **Price Trend Charts**: Interactive charts with adjustable time periods
- **Returns Comparison**: Grouped bar chart comparing returns across commodities
- **Volatility Analysis**: Annualized volatility at 30-day, 90-day, 1-year, and overall windows
- **Maximum Drawdown**: Peak-to-trough decline analysis
- **Summary Statistics**: Min, max, average, current price, and distance from highs/lows
- **Multi-frequency Support**: Handles daily, weekly, and monthly data in the same file

### ⚡ Live Arbitrage Bot (Polymarket × Kalshi)
- **Cross-Platform Scanning**: Fetches live market data from Polymarket and Kalshi prediction markets
- **Event Matching**: Identifies the same event listed on both platforms using text-similarity algorithms
- **Arbitrage Detection**: Finds mispriced markets where buying YES on one platform and NO on the other costs less than $1.00
- **Real-Time Monitoring**: Configurable auto-refresh intervals (10s / 30s / 60s / 2min)
- **Profit Calculation**: Shows exact profit percentages, total cost, and guaranteed payout per opportunity
- **Filtering & Sorting**: Filter by category, minimum profit threshold; sort by profit or match confidence
- **Live API + Demo Mode**: Attempts live API connections with automatic fallback to realistic demo data
- **Activity Log**: Real-time log of all bot actions, API calls, and discovered opportunities

### 🏆 Investor Strategies
- **10 Legendary Investors**: Complete strategy breakdowns for Greenblatt, Graham, Lynch, and more
- **Stock Screening**: Indicative stock screens for each strategy
- **Backtested Results**: Historical performance data with interactive charts

## CSV Format

The expected CSV format for the commodity dashboard has:
- **First column**: `Date` in DD-MM-YYYY format
- **Remaining columns**: Commodity prices (numeric values, empty cells for missing data)

Example:
```
Date,Gold (USD/oz),Silver (USD/oz),Crude Oil WTI (USD/bbl)
01-01-2020,1517.83,17.56,57.85
02-01-2020,1515.14,17.18,57.70
```

Commodities with different reporting frequencies (daily, weekly, monthly) can coexist in the same file — leave cells empty for dates without data.

## Weekly Update Workflow

1. Open the dashboard
2. Click **↻ Refresh / Update Data** or re-upload an updated CSV
3. The dashboard recalculates all insights with the latest data

## Usage

Visit the hosted site or open `index.html` locally in your browser. Use the built-in sample data to explore features, or upload your own commodity price CSV.

For the arbitrage bot, navigate to the **⚡ Arbitrage Bot** page and click **Start Bot** to begin scanning for cross-platform prediction market arbitrage opportunities.

## Technology

- Pure HTML / CSS / JavaScript (no build step required)
- [Chart.js](https://www.chartjs.org/) for interactive charts
- [Papa Parse](https://www.papaparse.com/) for CSV parsing
- All data processing happens locally in the browser — no data is sent to any server