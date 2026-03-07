# Commodity Price Insights Dashboard

A browser-based dashboard for analyzing commodity price data. Upload a CSV file with raw commodity prices and instantly generate period returns, yearly analysis, weekly movement tracking, volatility metrics, and more.

## Features

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

## CSV Format

The expected CSV format has:
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

## Technology

- Pure HTML / CSS / JavaScript (no build step required)
- [Chart.js](https://www.chartjs.org/) for interactive charts
- [Papa Parse](https://www.papaparse.com/) for CSV parsing
- All data processing happens locally in the browser — no data is sent to any server