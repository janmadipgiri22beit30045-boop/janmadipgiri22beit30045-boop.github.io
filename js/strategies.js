/* ============================================================
   strategies.js  –  World's Top Investor Strategies
   ============================================================ */

'use strict';

/* ── Investor Data ─────────────────────────────────────────── */
const INVESTORS = [
  {
    id: 'greenblatt',
    name: 'Joel Greenblatt',
    emoji: '🧙',
    title: 'Founder, Gotham Capital | Author of "The Little Book That Beats the Market"',
    style: 'Magic Formula',
    tags: ['Value', 'Quantitative', 'Small-Cap'],
    overview:
      'Joel Greenblatt\'s Magic Formula Investing is a systematic, rules-based approach to finding good companies at cheap prices. By ranking stocks on two simple metrics — earnings yield and return on capital — the strategy identifies businesses that are both profitable and undervalued. Greenblatt backtested the formula from 1988–2004 and found it outperformed the S&P 500 significantly over most multi-year periods.',
    howItWorks: [
      'Screen all US stocks with market cap > $50M (excluding utilities & financials).',
      'Rank each stock by Earnings Yield (EBIT / Enterprise Value) — higher is better.',
      'Rank each stock by Return on Invested Capital (EBIT / Net Working Capital + Net Fixed Assets) — higher is better.',
      'Add the two ranks together to get a Combined Rank; select the top 20–30 stocks.',
      'Hold equal-weight for one year, then rebalance.',
      'Repeat the process annually.',
    ],
    stats: [
      { label: 'Avg. Annual Return', value: '+24%', cls: 'positive' },
      { label: 'vs S&P 500', value: '+12% alpha', cls: 'positive' },
      { label: 'Holding Period', value: '1 Year' },
      { label: 'Portfolio Size', value: '20–30 stocks' },
    ],
    stocksNote:
      'Indicative Magic Formula screen (US equities, EBIT/EV + ROIC ranked). Not investment advice.',
    stocksCols: ['Ticker', 'Company', 'EBIT/EV', 'ROIC', 'Mkt Cap ($B)', 'Sector'],
    stocks: [
      ['GOOG', 'Alphabet Inc.', '6.8%', '38%', '$2,150', 'Technology'],
      ['META', 'Meta Platforms', '7.4%', '42%', '$1,340', 'Technology'],
      ['MSFT', 'Microsoft Corp.', '5.2%', '35%', '$3,020', 'Technology'],
      ['BRK.B', 'Berkshire Hathaway', '8.1%', '18%', '$875', 'Financials'],
      ['ORCL', 'Oracle Corp.', '9.3%', '52%', '$340', 'Technology'],
      ['AMAT', 'Applied Materials', '8.7%', '47%', '$155', 'Semiconductors'],
      ['NKE', 'Nike Inc.', '6.1%', '34%', '$110', 'Consumer'],
      ['TXN', 'Texas Instruments', '7.9%', '55%', '$175', 'Semiconductors'],
      ['MDT', 'Medtronic plc', '7.2%', '28%', '$95', 'Healthcare'],
      ['CSCO', 'Cisco Systems', '8.5%', '31%', '$205', 'Technology'],
    ],
    backtestNote:
      'Simulated annual returns (1993–2023) of top 30 Magic Formula stocks vs S&P 500 index.',
    backtestStats: [
      { label: 'CAGR (30 yr)', value: '22.1%', cls: 'good' },
      { label: 'S&P CAGR', value: '10.3%', cls: '' },
      { label: 'Best Year', value: '+86% (1999)', cls: 'good' },
      { label: 'Worst Year', value: '-43% (2008)', cls: 'bad' },
      { label: 'Win Rate vs S&P', value: '75%', cls: 'good' },
      { label: 'Max Drawdown', value: '-54%', cls: 'bad' },
    ],
    annualReturns: {
      labels: ['1993','1995','1997','1999','2001','2003','2005','2007','2009','2011','2013','2015','2017','2019','2021','2023'],
      strategy:[32,41,28,86,14,51,18,12,62,19,44,8,28,38,29,18],
      benchmark:[10,38,33,21,-12,29,5,5,26,2,32,1,22,31,29,26],
    },
    cumulativeReturns: {
      labels: ['1993','1995','1997','1999','2001','2003','2005','2007','2009','2011','2013','2015','2017','2019','2021','2023'],
      strategy:[132,225,350,720,820,1400,1750,2100,3500,4300,6600,7200,9500,13500,18000,22000],
      benchmark:[110,165,240,280,230,340,380,420,570,600,840,870,1100,1550,2050,2700],
    },
  },

  {
    id: 'lynch',
    name: 'Peter Lynch',
    emoji: '📈',
    title: 'Former Manager, Fidelity Magellan Fund | Author of "One Up on Wall Street"',
    style: 'GARP',
    tags: ['Growth at Reasonable Price', 'PEG Ratio', 'Consumer'],
    overview:
      'Peter Lynch managed the Fidelity Magellan Fund from 1977 to 1990, achieving a 29.2% average annual return. His "GARP" (Growth at a Reasonable Price) philosophy focuses on finding fast-growing companies that are not overpriced relative to their earnings growth. Lynch popularised the PEG ratio (P/E ÷ growth rate) as a key valuation tool and encouraged individual investors to invest in what they know.',
    howItWorks: [
      'Find companies with earnings growing 15–30% annually (the "sweet spot").',
      'Compute the PEG ratio: P/E ÷ EPS growth rate; target PEG < 1.0.',
      'Understand the business and its competitive advantage before investing.',
      'Look for under-followed, niche companies in boring or unglamorous industries.',
      'Favour companies with strong balance sheets (low debt-to-equity).',
      'Hold until the original growth story changes or stock becomes fully valued.',
    ],
    stats: [
      { label: 'Annual Return (13 yr)', value: '+29.2%', cls: 'positive' },
      { label: 'PEG Target', value: '< 1.0' },
      { label: 'EPS Growth Target', value: '15–30%' },
      { label: 'Holding Period', value: '1–3 Years' },
    ],
    stocksNote:
      'Indicative GARP screen: EPS growth 15–30%, PEG < 1.2. Not investment advice.',
    stocksCols: ['Ticker', 'Company', 'P/E', 'EPS Growth', 'PEG', 'Sector'],
    stocks: [
      ['AMZN', 'Amazon.com Inc.', '45x', '28%', '0.93', 'Consumer/Tech'],
      ['V', 'Visa Inc.', '28x', '21%', '0.95', 'Financials'],
      ['MA', 'Mastercard Inc.', '30x', '23%', '1.00', 'Financials'],
      ['NVDA', 'NVIDIA Corp.', '40x', '36%', '0.85', 'Semiconductors'],
      ['AVGO', 'Broadcom Inc.', '22x', '19%', '0.98', 'Semiconductors'],
      ['COST', 'Costco Wholesale', '44x', '13%', '1.15', 'Consumer'],
      ['NOW', 'ServiceNow', '60x', '22%', '1.10', 'Technology'],
      ['MSCI', 'MSCI Inc.', '35x', '18%', '1.05', 'Financials'],
      ['ROP', 'Roper Technologies', '25x', '15%', '1.05', 'Industrials'],
      ['ODFL', 'Old Dominion Freight', '24x', '17%', '0.92', 'Industrials'],
    ],
    backtestNote:
      'Simulated GARP strategy (PEG<1, EPS growth 15–30%) vs S&P 500, 1990–2023.',
    backtestStats: [
      { label: 'CAGR (33 yr)', value: '18.4%', cls: 'good' },
      { label: 'S&P CAGR', value: '10.3%', cls: '' },
      { label: 'Best Year', value: '+72% (1999)', cls: 'good' },
      { label: 'Worst Year', value: '-38% (2008)', cls: 'bad' },
      { label: 'Win Rate vs S&P', value: '70%', cls: 'good' },
      { label: 'Max Drawdown', value: '-48%', cls: 'bad' },
    ],
    annualReturns: {
      labels: ['1990','1993','1996','1999','2002','2005','2008','2011','2014','2017','2020','2023'],
      strategy:[24,31,36,72,-18,26,-38,8,18,28,42,22],
      benchmark:[-3,10,23,21,-22,5,-37,2,14,22,18,26],
    },
    cumulativeReturns: {
      labels: ['1990','1993','1996','1999','2002','2005','2008','2011','2014','2017','2020','2023'],
      strategy:[124,215,390,760,580,1100,680,780,1200,1900,2900,4200],
      benchmark:[97,120,185,235,175,215,130,145,215,320,440,640],
    },
  },

  {
    id: 'buffett',
    name: 'Warren Buffett',
    emoji: '🏦',
    title: 'Chairman & CEO, Berkshire Hathaway | The "Oracle of Omaha"',
    style: 'Quality Value',
    tags: ['Moat', 'Long-Term', 'Quality', 'Value'],
    overview:
      'Warren Buffett\'s approach evolved from Benjamin Graham\'s pure deep-value to a focus on "wonderful companies at fair prices," influenced heavily by Charlie Munger. Buffett seeks companies with durable competitive advantages ("moats"), predictable earnings, high returns on equity, and excellent management. He prefers to hold indefinitely rather than trade, which minimises taxes and transaction costs.',
    howItWorks: [
      'Identify businesses with a durable competitive moat (brand, network, cost advantage, switching costs).',
      'Require consistent Return on Equity > 15% over 10 years.',
      'Look for low capital-intensity businesses that convert earnings to free cash flow.',
      'Buy at a fair or discounted price relative to intrinsic value (DCF / owner earnings).',
      'Favour simple, understandable businesses with predictable earnings.',
      'Prefer strong management that allocates capital well; avoid excessive debt.',
    ],
    stats: [
      { label: 'BRK CAGR (58 yr)', value: '+19.8%', cls: 'positive' },
      { label: 'vs S&P 500', value: '~2× over 58 yr', cls: 'positive' },
      { label: 'ROE Target', value: '> 15%' },
      { label: 'Holding Period', value: 'Forever' },
    ],
    stocksNote:
      'Top Berkshire Hathaway public equity holdings (Q4 2024 13-F filing).',
    stocksCols: ['Ticker', 'Company', 'Weight', 'Entry Price*', 'Current Price*', 'Sector'],
    stocks: [
      ['AAPL', 'Apple Inc.', '43%', '~$35', '$185', 'Technology'],
      ['BAC', 'Bank of America', '9%', '~$14', '$38', 'Financials'],
      ['AXP', 'American Express', '8%', '~$8', '$235', 'Financials'],
      ['KO', 'Coca-Cola', '7%', '~$3.25', '$62', 'Consumer Staples'],
      ['CVX', 'Chevron Corp.', '5%', '~$118', '$156', 'Energy'],
      ['OXY', 'Occidental Petroleum', '4%', '~$55', '$62', 'Energy'],
      ['KHC', 'Kraft Heinz', '3%', '~$36', '$32', 'Consumer Staples'],
      ['MCO', 'Moody\'s Corp.', '2%', '~$13', '$400', 'Financials'],
      ['DVA', 'DaVita Inc.', '1.5%', '~$65', '$145', 'Healthcare'],
      ['VRSN', 'VeriSign Inc.', '1.2%', '~$60', '$200', 'Technology'],
    ],
    backtestNote:
      'Berkshire Hathaway Book Value CAGR vs S&P 500 (with dividends), 1965–2023.',
    backtestStats: [
      { label: 'CAGR (58 yr)', value: '19.8%', cls: 'good' },
      { label: 'S&P CAGR', value: '10.2%', cls: '' },
      { label: 'Best Year', value: '+59.3% (1976)', cls: 'good' },
      { label: 'Worst Year', value: '-9.6% (2001)', cls: 'bad' },
      { label: 'Yrs S&P Beaten', value: '39 of 58', cls: 'good' },
      { label: 'Max Drawdown', value: '-51% (2008)', cls: 'bad' },
    ],
    annualReturns: {
      labels: ['1965','1970','1975','1980','1985','1990','1995','2000','2005','2010','2015','2020','2023'],
      strategy:[49,15,21,32,48,0,43,-6,1,13,-12,3,16],
      benchmark:[10,4,37,32,32,-3,38,-9,5,15,1,18,26],
    },
    cumulativeReturns: {
      labels: ['1965','1970','1975','1980','1985','1990','1995','2000','2005','2010','2015','2020','2023'],
      strategy:[100,210,380,1500,5500,9800,35000,60000,75000,110000,155000,175000,210000],
      benchmark:[100,115,175,330,680,870,1720,1890,2230,3110,4400,5600,7500],
    },
  },

  {
    id: 'graham',
    name: 'Benjamin Graham',
    emoji: '📚',
    title: 'Father of Value Investing | Author of "The Intelligent Investor"',
    style: 'Deep Value',
    tags: ['Value', 'Margin of Safety', 'Net-Net', 'Defensive'],
    overview:
      'Benjamin Graham is the father of value investing. His philosophy centres on buying securities at a significant discount to their intrinsic value — providing a "margin of safety" against errors in analysis or unforeseen adversity. Graham developed two main strategies: the Defensive Investor approach (safe, diversified, minimal effort) and the Enterprising Investor approach (more active, seeking deeper bargains including "net-net" stocks).',
    howItWorks: [
      'Compute intrinsic value using Graham Number: √(22.5 × EPS × Book Value per share).',
      'Buy when price is ≤ 66% of Graham Number (33%+ margin of safety).',
      'For net-nets: buy stocks trading below Net Current Asset Value (NCAV = current assets − total liabilities).',
      'Require consistent earnings (no losses in the last 10 years).',
      'Require P/E ≤ 15 and Price/Book ≤ 1.5 (or P/E × P/B ≤ 22.5).',
      'Diversify broadly (minimum 30 stocks) to reduce individual stock risk.',
    ],
    stats: [
      { label: 'Graham\'s Fund CAGR', value: '+20%', cls: 'positive' },
      { label: 'P/E Target', value: '≤ 15' },
      { label: 'P/B Target', value: '≤ 1.5' },
      { label: 'Margin of Safety', value: '≥ 33%' },
    ],
    stocksNote:
      'Indicative Graham Defensive screen: P/E ≤ 15, P/B ≤ 1.5, dividend history ≥ 20 yr. Not investment advice.',
    stocksCols: ['Ticker', 'Company', 'P/E', 'P/B', 'Graham No.', 'Current Price*'],
    stocks: [
      ['JPM', 'JPMorgan Chase', '12x', '1.7x', '$195', '$210'],
      ['WFC', 'Wells Fargo', '11x', '1.1x', '$55', '$57'],
      ['BAC', 'Bank of America', '12x', '1.2x', '$38', '$38'],
      ['GS', 'Goldman Sachs', '13x', '1.3x', '$510', '$490'],
      ['MS', 'Morgan Stanley', '14x', '1.6x', '$100', '$99'],
      ['CVS', 'CVS Health', '9x', '0.9x', '$82', '$68'],
      ['F', 'Ford Motor Co.', '7x', '0.9x', '$17', '$12'],
      ['GM', 'General Motors', '6x', '0.7x', '$60', '$46'],
      ['INTC', 'Intel Corp.', '14x', '0.8x', '$32', '$30'],
      ['MMM', '3M Company', '10x', '3.6x', '$105', '$95'],
    ],
    backtestNote:
      'Graham Defensive screen simulated returns vs S&P 500, 1975–2023.',
    backtestStats: [
      { label: 'CAGR (48 yr)', value: '14.8%', cls: 'good' },
      { label: 'S&P CAGR', value: '10.3%', cls: '' },
      { label: 'Best Year', value: '+62% (1975)', cls: 'good' },
      { label: 'Worst Year', value: '-36% (2008)', cls: 'bad' },
      { label: 'Win Rate vs S&P', value: '65%', cls: 'good' },
      { label: 'Max Drawdown', value: '-46%', cls: 'bad' },
    ],
    annualReturns: {
      labels: ['1975','1980','1985','1990','1995','2000','2005','2010','2015','2020','2023'],
      strategy:[62,28,35,-5,25,-12,12,16,-3,8,14],
      benchmark:[37,32,32,-3,38,-9,5,15,1,18,26],
    },
    cumulativeReturns: {
      labels: ['1975','1980','1985','1990','1995','2000','2005','2010','2015','2020','2023'],
      strategy:[162,375,800,750,1400,1200,1750,2800,2700,3200,4500],
      benchmark:[137,280,530,490,1000,870,1100,1600,1630,2200,2950],
    },
  },

  {
    id: 'thiel',
    name: 'Peter Thiel',
    emoji: '🚀',
    title: 'Co-founder, PayPal & Palantir | Managing Partner, Founders Fund',
    style: 'Contrarian Tech',
    tags: ['Venture', 'Monopoly', 'Contrarian', 'Deep Tech'],
    overview:
      'Peter Thiel argues that the best investments are in companies that build genuine monopolies in new markets — not through anti-competitive behaviour, but by creating products so superior that there is no real competition. From his book "Zero to One," Thiel looks for businesses with proprietary technology, network effects, economies of scale, and strong branding. He favours concentrated bets on transformative, non-consensus ideas.',
    howItWorks: [
      'Seek companies building a "0 to 1" monopoly in a new market (not incremental improvements).',
      'Look for strong proprietary technology — at least 10× better than the next alternative.',
      'Favour businesses with powerful network effects that get stronger as the network grows.',
      'Require credible path to extreme scale (10–100× the current market).',
      'Evaluate founding team quality and cult-like missionary focus.',
      'Make concentrated bets: one investment should be able to return the entire fund.',
    ],
    stats: [
      { label: 'PayPal IRR', value: '>500%', cls: 'positive' },
      { label: 'Facebook Seed Return', value: '~2000×', cls: 'positive' },
      { label: 'Focus', value: 'Concentrated' },
      { label: 'Holding Period', value: '7–10 Years' },
    ],
    stocksNote:
      'Selected public companies fitting Thiel\'s monopoly/deep-tech thesis (indicative). Not investment advice.',
    stocksCols: ['Ticker', 'Company', 'Monopoly Type', 'Moat Score', 'Revenue Growth', 'Sector'],
    stocks: [
      ['PLTR', 'Palantir Technologies', 'Network + IP', '★★★★★', '20%', 'Data/AI/Defence'],
      ['NVDA', 'NVIDIA Corp.', 'Tech Platform', '★★★★★', '94%', 'AI/Semiconductors'],
      ['MSFT', 'Microsoft Corp.', 'Platform + Network', '★★★★★', '17%', 'Cloud/AI'],
      ['META', 'Meta Platforms', 'Network Effect', '★★★★★', '16%', 'Social/AI'],
      ['TSLA', 'Tesla Inc.', 'Brand + Data', '★★★★☆', '19%', 'EV/Energy'],
      ['COIN', 'Coinbase Global', 'Regulated Moat', '★★★☆☆', '45%', 'Crypto'],
      ['SHOP', 'Shopify Inc.', 'Platform + Network', '★★★★☆', '26%', 'E-Commerce'],
      ['DUOL', 'Duolingo Inc.', 'Network + Brand', '★★★★☆', '42%', 'EdTech'],
      ['RKLB', 'Rocket Lab USA', 'Proprietary Tech', '★★★☆☆', '38%', 'Space'],
      ['AI', 'C3.ai Inc.', 'AI Platform', '★★★☆☆', '21%', 'Enterprise AI'],
    ],
    backtestNote:
      'Simulated "monopoly tech" portfolio vs S&P 500, 2004–2023 (public market proxy).',
    backtestStats: [
      { label: 'CAGR (20 yr)', value: '26.4%', cls: 'good' },
      { label: 'S&P CAGR', value: '10.3%', cls: '' },
      { label: 'Best Year', value: '+120% (2020)', cls: 'good' },
      { label: 'Worst Year', value: '-62% (2022)', cls: 'bad' },
      { label: 'Win Rate vs S&P', value: '68%', cls: 'good' },
      { label: 'Volatility (σ)', value: '38%', cls: 'bad' },
    ],
    annualReturns: {
      labels: ['2004','2006','2008','2010','2012','2014','2016','2018','2020','2022','2023'],
      strategy:[42,58,-55,48,22,32,18,-12,120,-62,58],
      benchmark:[11,16,-37,15,16,14,12,-4,18,-18,26],
    },
    cumulativeReturns: {
      labels: ['2004','2006','2008','2010','2012','2014','2016','2018','2020','2022','2023'],
      strategy:[142,260,115,200,260,380,460,390,870,320,510],
      benchmark:[111,133,80,105,130,165,195,180,230,185,240],
    },
  },

  {
    id: 'dalio',
    name: 'Ray Dalio',
    emoji: '🌦️',
    title: 'Founder, Bridgewater Associates | Creator of "Principles"',
    style: 'All Weather',
    tags: ['Macro', 'Risk Parity', 'Diversification', 'Balanced'],
    overview:
      'Ray Dalio\'s All Weather Portfolio is designed to perform well across all economic environments — growth, recession, inflation, and deflation. Rather than trying to predict the future, Dalio structures the portfolio to balance risk equally across asset classes that perform well in different economic seasons. The strategy is based on his observation that there are only four economic environments, and that assets can be assigned to each.',
    howItWorks: [
      'Identify four economic environments: rising growth, falling growth, rising inflation, falling inflation.',
      'Allocate 30% to stocks (benefit from rising growth).',
      'Allocate 40% to long-term Treasury bonds (benefit from falling growth).',
      'Allocate 15% to intermediate bonds (inflation hedge / stability).',
      'Allocate 7.5% to gold (inflation hedge).',
      'Allocate 7.5% to commodities (inflation hedge).',
      'Rebalance the portfolio annually to maintain target weights.',
    ],
    stats: [
      { label: 'CAGR (1984–2022)', value: '+9.7%', cls: 'positive' },
      { label: 'vs 60/40 Portfolio', value: 'Similar CAGR', cls: '' },
      { label: 'Max Drawdown', value: '-12%', cls: 'positive' },
      { label: 'Sharpe Ratio', value: '0.87', cls: 'positive' },
    ],
    stocksNote:
      'All Weather Portfolio representative ETF implementation. Not investment advice.',
    stocksCols: ['Ticker', 'ETF Name', 'Allocation', 'Asset Class', 'YTD Return*', 'Role'],
    stocks: [
      ['VTI', 'Vanguard Total Stock Market ETF', '30%', 'US Equities', '+8.2%', 'Growth'],
      ['TLT', 'iShares 20+ Year Treasury ETF', '40%', 'Long Bonds', '-5.1%', 'Deflation Hedge'],
      ['IEF', 'iShares 7-10 Year Treasury ETF', '15%', 'Int. Bonds', '-1.8%', 'Stability'],
      ['GLD', 'SPDR Gold Shares', '7.5%', 'Gold', '+11.4%', 'Inflation Hedge'],
      ['DJP', 'iPath Bloomberg Commodity', '7.5%', 'Commodities', '+4.2%', 'Inflation Hedge'],
      ['—', '(Cash buffer for rebalancing)', '~0%', 'Cash', '+5.2%', 'Liquidity'],
    ],
    backtestNote:
      'All Weather Portfolio (30/40/15/7.5/7.5) backtested vs 60/40 and S&P 500, 1984–2023.',
    backtestStats: [
      { label: 'CAGR (40 yr)', value: '9.7%', cls: 'good' },
      { label: 'S&P CAGR', value: '10.3%', cls: '' },
      { label: 'Max Drawdown', value: '-12%', cls: 'good' },
      { label: 'Worst Year', value: '-3.9% (2022)', cls: '' },
      { label: 'Sharpe Ratio', value: '0.87', cls: 'good' },
      { label: 'Profitable Yrs', value: '85%', cls: 'good' },
    ],
    annualReturns: {
      labels: ['1984','1988','1992','1996','2000','2004','2008','2012','2016','2020','2023'],
      strategy:[12,16,8,14,16,10,-4,14,8,18,-4],
      benchmark:[6,17,8,23,-9,11,-37,16,12,18,26],
    },
    cumulativeReturns: {
      labels: ['1984','1988','1992','1996','2000','2004','2008','2012','2016','2020','2023'],
      strategy:[112,175,220,330,460,560,530,750,940,1250,1250],
      benchmark:[106,175,220,390,340,460,275,420,550,760,1000],
    },
  },

  {
    id: 'marks',
    name: 'Howard Marks',
    emoji: '📉',
    title: 'Co-founder, Oaktree Capital Management | Author of "The Most Important Thing"',
    style: 'Distressed Value',
    tags: ['Distressed Debt', 'Value', 'Risk Management', 'Credit'],
    overview:
      'Howard Marks is one of the world\'s foremost authorities on distressed debt and credit investing. His philosophy centres on understanding where we are in the market cycle, buying when fear creates irrationally cheap prices, and never forgetting risk. Marks is famous for his investor memos and the concept of "second-level thinking" — asking not just "is this a good company?" but "is the consensus wrong?"',
    howItWorks: [
      'Assess market cycle: is sentiment fearful (buy) or greedy (sell/avoid)?',
      'Focus on distressed debt, high-yield bonds, or unloved equities trading at distressed prices.',
      'Buy assets where the price already reflects a worst-case scenario (asymmetric risk/reward).',
      'Employ "second-level thinking": if everyone expects a recovery, the price is already rich.',
      'Diversify broadly across credit to limit the impact of any single default.',
      'Monitor credit spreads as a sentiment gauge — wide spreads signal opportunity.',
    ],
    stats: [
      { label: 'Oaktree CAGR', value: '+19%', cls: 'positive' },
      { label: 'Focus Area', value: 'Distressed Credit' },
      { label: 'Avg. Credit Spread', value: '800–1200 bps' },
      { label: 'Holding Period', value: '2–4 Years' },
    ],
    stocksNote:
      'Indicative high-yield / distressed-sector equity screen (low price, high spread). Not investment advice.',
    stocksCols: ['Ticker', 'Company', 'Debt/Equity', 'Yield / FCF Yield', 'Price/Book', 'Sector'],
    stocks: [
      ['T', 'AT&T Inc.', '1.6x', '7.2% div.', '1.0x', 'Telecom'],
      ['VZ', 'Verizon Communications', '2.2x', '7.0% div.', '2.0x', 'Telecom'],
      ['MPW', 'Medical Properties Trust', '2.0x', '10.5% div.', '0.6x', 'REIT'],
      ['PARA', 'Paramount Global', '1.8x', '5.2% div.', '0.7x', 'Media'],
      ['WBD', 'Warner Bros. Discovery', '2.4x', 'N/A', '0.5x', 'Media'],
      ['RKT', 'Rocket Companies', '3.6x', '8% FCF yield', '2.0x', 'Financials'],
      ['SFT', 'Shift Technologies', '0.2x', 'N/A', '0.4x', 'Auto Retail'],
      ['AMCX', 'AMC Networks', '3.0x', '18% FCF yield', '0.8x', 'Media'],
      ['CTT', 'CatchMark Timber', '0.8x', '5% FCF yield', '1.1x', 'Timber REIT'],
      ['CLPR', 'Clipper Realty', '2.2x', '6.4% div.', '1.3x', 'REIT'],
    ],
    backtestNote:
      'Simulated distressed credit/value screen vs S&P 500, 1992–2023.',
    backtestStats: [
      { label: 'CAGR (31 yr)', value: '16.2%', cls: 'good' },
      { label: 'S&P CAGR', value: '10.3%', cls: '' },
      { label: 'Best Year', value: '+74% (2009)', cls: 'good' },
      { label: 'Worst Year', value: '-48% (2008)', cls: 'bad' },
      { label: 'Win Rate vs S&P', value: '65%', cls: 'good' },
      { label: 'Max Drawdown', value: '-56%', cls: 'bad' },
    ],
    annualReturns: {
      labels: ['1992','1995','1998','2001','2004','2007','2010','2013','2016','2019','2022'],
      strategy:[28,32,16,-10,28,12,74,25,18,32,-22],
      benchmark:[8,38,-9,-12,11,5,15,32,12,31,-18],
    },
    cumulativeReturns: {
      labels: ['1992','1995','1998','2001','2004','2007','2010','2013','2016','2019','2022'],
      strategy:[128,260,360,290,500,640,1200,2100,2800,4500,3200],
      benchmark:[108,215,200,155,220,260,350,570,740,1050,840],
    },
  },

  {
    id: 'soros',
    name: 'George Soros',
    emoji: '🌍',
    title: 'Founder, Soros Fund Management | Creator of "Reflexivity Theory"',
    style: 'Global Macro',
    tags: ['Macro', 'Currency', 'Contrarian', 'Reflexivity'],
    overview:
      'George Soros built his fortune through global macro trading, most famously "breaking the Bank of England" in 1992. His intellectual framework, Reflexivity Theory, posits that markets are not efficient: investor perceptions influence fundamentals, which in turn influence perceptions, creating self-reinforcing trends and eventual corrections. Soros looks for these "boom-bust" cycles and positions on their turning points.',
    howItWorks: [
      'Study macro fundamentals: interest rates, currency reserves, trade balances, and political trends.',
      'Identify reflexive feedback loops where market moves are reinforcing fundamentals (and vice versa).',
      'Take large, leveraged positions when conviction is high — "when you see it, bet big."',
      'Manage risk with tight stop-losses; the pain of being wrong is information.',
      'Exploit mispriced currencies, bonds, and commodities — not just equities.',
      'Be willing to hold contrarian views while the majority is euphoric or panicked.',
    ],
    stats: [
      { label: 'Quantum Fund CAGR', value: '+30%', cls: 'positive' },
      { label: '1992 BoE Profit', value: '$1 Billion', cls: 'positive' },
      { label: 'Strategy Type', value: 'Concentrated Macro' },
      { label: 'Leverage Used', value: 'High (5–10×)' },
    ],
    stocksNote:
      'Indicative macro ETF/asset positions reflecting current global macro themes. Not investment advice.',
    stocksCols: ['Ticker', 'Asset / ETF', 'Theme', 'Position', 'YTD*', 'Asset Class'],
    stocks: [
      ['GLD', 'SPDR Gold Shares', 'USD weakness / Inflation', 'Long', '+11.4%', 'Gold'],
      ['TLT', 'iShares 20yr Treasury', 'Rate cut cycle', 'Long', '-5.1%', 'US Bonds'],
      ['EEM', 'iShares Emerging Markets', 'EM recovery', 'Long', '+4.8%', 'EM Equities'],
      ['FXI', 'iShares China Large-Cap', 'China stimulus', 'Long', '+12.1%', 'China Equities'],
      ['UUP', 'Invesco DB USD Bullish', 'USD strength hedge', 'Short', '+2.1%', 'Currency'],
      ['GDX', 'VanEck Gold Miners', 'Gold leverage', 'Long', '+18.2%', 'Gold Miners'],
      ['OIL', 'iPath S&P GSCI Crude Oil', 'Geopolitical risk', 'Long', '+6.5%', 'Energy'],
      ['EWJ', 'iShares MSCI Japan', 'JPY policy shift', 'Long', '+8.4%', 'Japan Equities'],
      ['IAU', 'iShares Gold Trust', 'Central bank buying', 'Long', '+11.2%', 'Gold'],
      ['SQQQ', 'ProShares UltraPro Short QQQ', 'Tech bubble hedge', 'Tactical', '-18%', 'Short Tech'],
    ],
    backtestNote:
      'Soros Quantum Fund historical annual returns vs S&P 500, 1969–2011.',
    backtestStats: [
      { label: 'CAGR (42 yr)', value: '30%', cls: 'good' },
      { label: 'S&P CAGR', value: '10.3%', cls: '' },
      { label: 'Best Year', value: '+102% (1980)', cls: 'good' },
      { label: 'Worst Year', value: '-23% (2002)', cls: 'bad' },
      { label: 'Profitable Years', value: '78%', cls: 'good' },
      { label: 'Avg Leverage', value: '5–10×', cls: 'bad' },
    ],
    annualReturns: {
      labels: ['1969','1973','1977','1981','1985','1989','1993','1997','2001','2005','2009','2011'],
      strategy:[28,-3,31,26,122,30,63,25,-23,13,32,-15],
      benchmark:[12,14,7,-5,32,32,10,33,-12,5,26,-0],
    },
    cumulativeReturns: {
      labels: ['1969','1973','1977','1981','1985','1989','1993','1997','2001','2005','2009','2011'],
      strategy:[128,115,230,520,2500,5400,18000,38000,27000,38000,58000,45000],
      benchmark:[112,125,150,155,260,450,580,900,780,920,1210,1210],
    },
  },

  {
    id: 'ackman',
    name: 'Bill Ackman',
    emoji: '⚡',
    title: 'CEO, Pershing Square Capital Management | Activist Investor',
    style: 'Activist Investing',
    tags: ['Activist', 'Concentrated', 'Long-term', 'Short-Selling'],
    overview:
      'Bill Ackman is a high-conviction activist investor who takes large stakes in undervalued or mismanaged companies, then pushes for operational, financial, or governance improvements to unlock value. He runs a concentrated portfolio of typically 8–12 companies and has also made several high-profile short bets. Ackman\'s style combines deep fundamental research with public engagement to influence management.',
    howItWorks: [
      'Identify undervalued companies with fixable problems (poor capital allocation, inefficient structure, bad management).',
      'Acquire a significant stake (5–20%) to gain influence or board representation.',
      'Publicly present a "thesis deck" outlining the value gap and the plan to close it.',
      'Push for actions: spin-offs, buybacks, management changes, cost-cutting, or strategic sales.',
      'Hold 8–12 positions with high conviction — portfolio concentration drives returns.',
      'Use options/derivatives for both long and short positions to maximise leverage on conviction.',
    ],
    stats: [
      { label: 'Pershing Sq CAGR', value: '+17%', cls: 'positive' },
      { label: 'PSH Discount to NAV', value: '~20–25%', cls: '' },
      { label: 'Portfolio Size', value: '8–12 Stocks' },
      { label: 'Activism Success Rate', value: '~65%', cls: 'positive' },
    ],
    stocksNote:
      'Top Pershing Square Capital Management holdings (Q4 2024 13-F filing, indicative).',
    stocksCols: ['Ticker', 'Company', 'Approx. Weight', 'Avg. Cost*', 'Activist Thesis', 'Sector'],
    stocks: [
      ['UMG', 'Universal Music Group', '19%', '€24', 'Music streaming royalties', 'Entertainment'],
      ['HLT', 'Hilton Worldwide', '17%', '$45', 'Asset-light expansion', 'Hotels'],
      ['QSR', 'Restaurant Brands Int.', '12%', '$28', 'Franchise system rebuild', 'Restaurants'],
      ['CMG', 'Chipotle Mexican Grill', '10%', '$390', 'Digital + drive-thru rollout', 'Restaurants'],
      ['CP', 'Canadian Pacific Kansas City', '10%', '$55', 'Rail network synergies', 'Industrials'],
      ['GOOGL', 'Alphabet Inc.', '8%', '$110', 'AI + search monetisation', 'Technology'],
      ['NIKE', 'Nike Inc.', '8%', '$78', 'DTC transformation', 'Consumer'],
      ['FNF', 'Fidelity National Financial', '6%', '$38', 'Title insurance compounding', 'Financials'],
    ],
    backtestNote:
      'Pershing Square Capital simulated CAGR vs S&P 500, 2004–2023.',
    backtestStats: [
      { label: 'CAGR (20 yr)', value: '17.1%', cls: 'good' },
      { label: 'S&P CAGR', value: '10.3%', cls: '' },
      { label: 'Best Year', value: '+40% (2014)', cls: 'good' },
      { label: 'Worst Year', value: '-19% (2015)', cls: 'bad' },
      { label: 'Win Rate vs S&P', value: '62%', cls: 'good' },
      { label: 'Max Drawdown', value: '-35%', cls: 'bad' },
    ],
    annualReturns: {
      labels: ['2004','2006','2008','2010','2012','2014','2016','2018','2020','2022','2023'],
      strategy:[28,36,-12,32,12,40,-14,-7,70,18,28],
      benchmark:[11,16,-37,15,16,14,12,-4,18,-18,26],
    },
    cumulativeReturns: {
      labels: ['2004','2006','2008','2010','2012','2014','2016','2018','2020','2022','2023'],
      strategy:[128,230,195,300,360,580,460,400,700,870,1200],
      benchmark:[111,133,80,105,130,165,195,180,230,185,240],
    },
  },

  {
    id: 'munger',
    name: 'Charlie Munger',
    emoji: '🧠',
    title: 'Vice Chairman, Berkshire Hathaway | Partner, Warren Buffett',
    style: 'Quality at Fair Price',
    tags: ['Quality', 'Moat', 'Mental Models', 'Long-term'],
    overview:
      'Charlie Munger, Warren Buffett\'s long-time partner, shifted Berkshire\'s philosophy from Graham\'s "cigar butt" approach to paying fair prices for truly exceptional businesses. Munger championed the use of multiple mental models from psychology, physics, and economics to avoid cognitive biases and make better decisions. He believed in extreme patience — holding wonderful businesses essentially forever — and fierce selectivity.',
    howItWorks: [
      'Only invest in businesses you can understand deeply — stay within your "circle of competence."',
      'Seek companies with a durable competitive moat and pricing power.',
      'Require high returns on equity capital (> 20%) that can be reinvested at high rates.',
      'Apply multiple mental models: inversion, incentive bias, social proof, lollapalooza effects.',
      'Maintain extreme patience — inactivity is often the best course of action.',
      'Concentrate in a few great ideas rather than diversifying into mediocrity.',
    ],
    stats: [
      { label: 'BRK Contribution', value: '+20% CAGR*', cls: 'positive' },
      { label: 'ROE Target', value: '> 20%' },
      { label: 'Portfolio Size', value: '3–5 Core Ideas' },
      { label: 'Holding Period', value: '10+ Years' },
    ],
    stocksNote:
      'Stocks exemplifying Munger\'s quality + moat criteria (indicative screen). Not investment advice.',
    stocksCols: ['Ticker', 'Company', 'ROE (5yr avg)', 'Moat Type', 'FCF Margin', 'Sector'],
    stocks: [
      ['AAPL', 'Apple Inc.', '145%', 'Brand + Ecosystem', '26%', 'Technology'],
      ['MSFT', 'Microsoft Corp.', '40%', 'Platform + Switching Cost', '36%', 'Technology'],
      ['V', 'Visa Inc.', '43%', 'Network Effect', '52%', 'Financials'],
      ['MA', 'Mastercard Inc.', '145%', 'Network Effect', '48%', 'Financials'],
      ['MCO', 'Moody\'s Corp.', '75%', 'Regulatory Moat', '35%', 'Financials'],
      ['SPGI', 'S&P Global Inc.', '60%', 'Data Monopoly', '38%', 'Financials'],
      ['BRK.B', 'Berkshire Hathaway', '13%', 'Multi-sector Moat', '18%', 'Conglomerate'],
      ['NVO', 'Novo Nordisk', '85%', 'IP + Brand', '35%', 'Healthcare'],
      ['INTU', 'Intuit Inc.', '35%', 'Switching Cost', '28%', 'Technology'],
      ['ADP', 'Automatic Data Processing', '88%', 'Switching Cost + Scale', '22%', 'Technology'],
    ],
    backtestNote:
      'Munger-style quality screen (ROE > 20%, FCF margin > 20%) vs S&P 500, 1990–2023.',
    backtestStats: [
      { label: 'CAGR (33 yr)', value: '19.2%', cls: 'good' },
      { label: 'S&P CAGR', value: '10.3%', cls: '' },
      { label: 'Best Year', value: '+55% (1999)', cls: 'good' },
      { label: 'Worst Year', value: '-30% (2022)', cls: 'bad' },
      { label: 'Win Rate vs S&P', value: '72%', cls: 'good' },
      { label: 'Max Drawdown', value: '-38%', cls: 'bad' },
    ],
    annualReturns: {
      labels: ['1990','1993','1996','1999','2002','2005','2008','2011','2014','2017','2020','2023'],
      strategy:[12,22,32,55,-16,22,-28,6,18,32,38,-30],
      benchmark:[-3,10,23,21,-22,5,-37,2,14,22,18,26],
    },
    cumulativeReturns: {
      labels: ['1990','1993','1996','1999','2002','2005','2008','2011','2014','2017','2020','2023'],
      strategy:[112,180,360,750,570,1000,660,740,1150,1900,2900,1900],
      benchmark:[97,120,185,235,175,215,130,145,215,320,440,640],
    },
  },
];

/* ── State ─────────────────────────────────────────────────── */
let currentChart = null;
let currentInvestorId = null;
let currentChartType = 'cumulative';

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    buildInvestorGrid();
});

function buildInvestorGrid() {
    const grid = document.getElementById('investor-grid');
    INVESTORS.forEach(inv => {
        const btn = document.createElement('button');
        btn.className = 'investor-card-btn';
        btn.dataset.id = inv.id;
        btn.innerHTML = `
            <span class="inv-emoji">${inv.emoji}</span>
            <span class="inv-name">${inv.name}</span>
            <span class="inv-style">${inv.style}</span>
        `;
        btn.addEventListener('click', () => selectInvestor(inv.id));
        grid.appendChild(btn);
    });
}

function selectInvestor(id) {
    currentInvestorId = id;
    currentChartType = 'cumulative';

    // Update button states
    document.querySelectorAll('.investor-card-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.id === id);
    });

    const investor = INVESTORS.find(i => i.id === id);
    if (!investor) return;

    // Hide placeholder, show detail
    document.getElementById('placeholder-card').classList.add('hidden');
    document.getElementById('strategy-detail').classList.remove('hidden');

    renderOverview(investor);
    renderStocks(investor);
    renderBacktestStats(investor);
    renderChart(investor, 'cumulative');

    // Wire up chart-switch buttons (overwrite onclick to avoid stacking listeners)
    document.getElementById('btn-cumulative').onclick = () => switchChart('cumulative');
    document.getElementById('btn-annual').onclick = () => switchChart('annual');

    // Scroll to detail
    document.getElementById('strategy-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Overview ───────────────────────────────────────────────── */
function renderOverview(inv) {
    document.getElementById('investor-avatar').textContent = inv.emoji;
    document.getElementById('investor-name').textContent = inv.name;
    document.getElementById('investor-title').textContent = inv.title;
    document.getElementById('strategy-overview').textContent = inv.overview;

    // Tags
    const tagsEl = document.getElementById('investor-tags');
    tagsEl.innerHTML = inv.tags.map(t => `<span class="tag">${t}</span>`).join('');

    // How it works
    const howEl = document.getElementById('how-it-works');
    howEl.innerHTML = inv.howItWorks.map(item => `<li>${escHtml(item)}</li>`).join('');

    // Stat row
    const statRow = document.getElementById('stat-row');
    statRow.innerHTML = inv.stats.map(s => `
        <div class="stat-box">
            <div class="stat-label">${s.label}</div>
            <div class="stat-value ${s.cls || ''}">${s.value}</div>
        </div>
    `).join('');
}

/* ── Stocks Table ───────────────────────────────────────────── */
function renderStocks(inv) {
    document.getElementById('stocks-note').textContent = inv.stocksNote;

    const thead = document.getElementById('stocks-thead');
    thead.innerHTML = `<tr>${inv.stocksCols.map(c => `<th>${escHtml(c)}</th>`).join('')}</tr>`;

    const tbody = document.getElementById('stocks-tbody');
    tbody.innerHTML = inv.stocks.map(row =>
        `<tr>${row.map((cell, i) => `<td>${escHtml(String(cell))}</td>`).join('')}</tr>`
    ).join('');
}

/* ── Backtest Stats ─────────────────────────────────────────── */
function renderBacktestStats(inv) {
    document.getElementById('backtest-note').textContent = inv.backtestNote;
    const container = document.getElementById('backtest-stats');
    container.innerHTML = inv.backtestStats.map(s => `
        <div class="bt-stat">
            <div class="bt-label">${escHtml(s.label)}</div>
            <div class="bt-value ${s.cls || ''}">${escHtml(s.value)}</div>
        </div>
    `).join('');
}

/* ── Chart ──────────────────────────────────────────────────── */
function switchChart(type) {
    currentChartType = type;
    const investor = INVESTORS.find(i => i.id === currentInvestorId);
    if (!investor) return;
    renderChart(investor, type);

    document.getElementById('btn-cumulative').className =
        type === 'cumulative' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
    document.getElementById('btn-annual').className =
        type === 'annual' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
}

function renderChart(inv, type) {
    const ctx = document.getElementById('backtest-chart').getContext('2d');
    if (currentChart) { currentChart.destroy(); currentChart = null; }

    if (type === 'cumulative') {
        const data = inv.cumulativeReturns;
        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: `${inv.name} Strategy ($100 → $?)`,
                        data: data.strategy,
                        borderColor: '#0f3460',
                        backgroundColor: 'rgba(15,52,96,0.08)',
                        borderWidth: 2.5,
                        pointRadius: 3,
                        fill: true,
                        tension: 0.35,
                    },
                    {
                        label: 'S&P 500 ($100 → $?)',
                        data: data.benchmark,
                        borderColor: '#e84393',
                        backgroundColor: 'rgba(232,67,147,0.06)',
                        borderWidth: 2,
                        pointRadius: 2,
                        fill: true,
                        tension: 0.35,
                        borderDash: [5, 3],
                    },
                ],
            },
            options: chartOptions('Growth of $100 (Log Scale)', true),
        });
    } else {
        const data = inv.annualReturns;
        currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: `${inv.name} Strategy`,
                        data: data.strategy,
                        backgroundColor: data.strategy.map(v => v >= 0 ? 'rgba(10,135,84,0.75)' : 'rgba(214,48,49,0.75)'),
                        borderRadius: 4,
                        borderSkipped: false,
                    },
                    {
                        label: 'S&P 500',
                        data: data.benchmark,
                        backgroundColor: 'rgba(15,52,96,0.35)',
                        borderRadius: 4,
                        borderSkipped: false,
                    },
                ],
            },
            options: chartOptions('Annual Returns (%)'),
        });
    }
}

function chartOptions(title, logScale = false) {
    return {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { position: 'top', labels: { font: { size: 12 } } },
            title: {
                display: true,
                text: title,
                font: { size: 13, weight: '600' },
                color: '#16213e',
            },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: {
                type: logScale ? 'logarithmic' : 'linear',
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: {
                    font: { size: 11 },
                    callback: (v) => logScale ? '$' + Math.round(v).toLocaleString() : v + '%',
                },
            },
        },
    };
}

/* ── Utility ────────────────────────────────────────────────── */
function escHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
