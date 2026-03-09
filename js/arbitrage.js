/* ===================================================================
   Arbitrage Bot – Polymarket × Kalshi
   Fetches live markets, matches similar events, calculates arbitrage.
   =================================================================== */

(function () {
    'use strict';

    // ── Config ──────────────────────────────────────────────────────
    const POLYMARKET_API  = 'https://gamma-api.polymarket.com';
    const KALSHI_API      = 'https://trading-api.kalshi.com/trade-api/v2';

    const REFRESH_INTERVALS = { '10': 10000, '30': 30000, '60': 60000, '120': 120000 };
    const DEFAULT_INTERVAL  = 30000;
    const MIN_PROFIT_DEFAULT = 0;
    const SIMILARITY_THRESHOLD = 0.4;

    // ── State ───────────────────────────────────────────────────────
    let polymarketData  = [];
    let kalshiData      = [];
    let opportunities   = [];
    let refreshTimer    = null;
    let isRunning       = false;
    let useDemoData     = false;
    let lastFetchTime   = null;

    // ── DOM refs ────────────────────────────────────────────────────
    const dom = {};

    function cacheDom() {
        dom.startBtn       = document.getElementById('start-btn');
        dom.stopBtn        = document.getElementById('stop-btn');
        dom.refreshBtn     = document.getElementById('refresh-btn');
        dom.intervalSel    = document.getElementById('refresh-interval');
        dom.minProfitInput = document.getElementById('min-profit');
        dom.categorySel    = document.getElementById('category-filter');
        dom.sortSel        = document.getElementById('sort-by');
        dom.demoToggle     = document.getElementById('demo-toggle');
        dom.liveToggle     = document.getElementById('live-toggle');
        dom.statusDot      = document.getElementById('status-dot');
        dom.statusText     = document.getElementById('status-text');
        dom.statOppCount   = document.getElementById('stat-opp-count');
        dom.statBestProfit = document.getElementById('stat-best-profit');
        dom.statAvgProfit  = document.getElementById('stat-avg-profit');
        dom.statPolyCount  = document.getElementById('stat-poly-count');
        dom.statKalshiCount = document.getElementById('stat-kalshi-count');
        dom.statLastUpdate = document.getElementById('stat-last-update');
        dom.oppContainer   = document.getElementById('opportunities-container');
        dom.polyTable      = document.getElementById('poly-markets-body');
        dom.kalshiTable    = document.getElementById('kalshi-markets-body');
        dom.logPanel       = document.getElementById('log-panel');
    }

    // ── Logging ─────────────────────────────────────────────────────
    function log(msg, level) {
        level = level || 'info';
        var ts = new Date().toLocaleTimeString();
        var entry = document.createElement('div');
        entry.className = 'log-entry ' + level;
        entry.textContent = '[' + ts + '] ' + msg;
        dom.logPanel.appendChild(entry);
        dom.logPanel.scrollTop = dom.logPanel.scrollHeight;
    }

    // ── Helpers ─────────────────────────────────────────────────────
    function escapeHtml(str) {
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(str));
        return d.innerHTML;
    }

    function setStatus(state, text) {
        dom.statusDot.className = 'status-dot ' + state;
        dom.statusText.textContent = text;
    }

    function pct(v) {
        return (v * 100).toFixed(2) + '%';
    }

    // ── Demo Data ───────────────────────────────────────────────────
    function generateDemoData() {
        var categories = ['Politics', 'Crypto', 'Sports', 'Economics', 'Science', 'Entertainment'];

        var sharedEvents = [
            { q: 'Will Bitcoin exceed $100k by end of 2026?', cat: 'Crypto' },
            { q: 'Will the Fed cut rates in June 2026?', cat: 'Economics' },
            { q: 'Will AI pass the Turing test by 2027?', cat: 'Science' },
            { q: 'Will SpaceX land humans on Mars by 2030?', cat: 'Science' },
            { q: 'Will the S&P 500 reach 6000 by Dec 2026?', cat: 'Economics' },
            { q: 'Will there be a US government shutdown in 2026?', cat: 'Politics' },
            { q: 'Will Ethereum flip Bitcoin market cap in 2026?', cat: 'Crypto' },
            { q: 'Will the next iPhone have satellite messaging?', cat: 'Entertainment' },
            { q: 'Will a hurricane Cat 5 hit the US in 2026?', cat: 'Science' },
            { q: 'Will Gold exceed $3000/oz in 2026?', cat: 'Economics' },
            { q: 'Will the US enter a recession in 2026?', cat: 'Economics' },
            { q: 'Will Dogecoin reach $1 in 2026?', cat: 'Crypto' },
            { q: 'Will a third-party candidate win a US state in 2028?', cat: 'Politics' },
            { q: 'Will the Lakers win the NBA Championship 2026?', cat: 'Sports' },
            { q: 'Will the FIFA Club World Cup final exceed 1B viewers?', cat: 'Sports' }
        ];

        var poly = [];
        var kalshi = [];

        for (var i = 0; i < sharedEvents.length; i++) {
            var e = sharedEvents[i];
            /* Create slight price discrepancies to simulate arbitrage */
            var baseYes = 0.25 + Math.random() * 0.5;
            /* Polymarket prices */
            var pYes = +(baseYes + (Math.random() * 0.1 - 0.05)).toFixed(2);
            pYes = Math.max(0.02, Math.min(0.98, pYes));
            var pNo = +(1 - pYes + (Math.random() * 0.06 - 0.03)).toFixed(2);
            pNo = Math.max(0.02, Math.min(0.98, pNo));

            /* Kalshi prices (different enough to create arb) */
            var kYes = +(baseYes + (Math.random() * 0.12 - 0.06)).toFixed(2);
            kYes = Math.max(0.02, Math.min(0.98, kYes));
            var kNo = +(1 - kYes + (Math.random() * 0.06 - 0.03)).toFixed(2);
            kNo = Math.max(0.02, Math.min(0.98, kNo));

            var volume = Math.floor(10000 + Math.random() * 500000);

            poly.push({
                id: 'poly-' + i,
                question: e.q,
                category: e.cat,
                yes_price: pYes,
                no_price: pNo,
                volume: volume,
                source: 'Polymarket'
            });

            kalshi.push({
                id: 'kalshi-' + i,
                question: e.q,
                category: e.cat,
                yes_price: kYes,
                no_price: kNo,
                volume: Math.floor(volume * (0.3 + Math.random() * 0.7)),
                source: 'Kalshi'
            });
        }

        /* Some unique markets on each platform */
        for (var j = 0; j < 5; j++) {
            var cat = categories[Math.floor(Math.random() * categories.length)];
            var py = +(0.15 + Math.random() * 0.7).toFixed(2);
            poly.push({
                id: 'poly-extra-' + j,
                question: 'Polymarket-only: Event #' + (j + 1) + ' ' + cat,
                category: cat,
                yes_price: py,
                no_price: +(1 - py + (Math.random() * 0.04 - 0.02)).toFixed(2),
                volume: Math.floor(5000 + Math.random() * 100000),
                source: 'Polymarket'
            });

            var ky = +(0.15 + Math.random() * 0.7).toFixed(2);
            kalshi.push({
                id: 'kalshi-extra-' + j,
                question: 'Kalshi-only: Event #' + (j + 1) + ' ' + cat,
                category: cat,
                yes_price: ky,
                no_price: +(1 - ky + (Math.random() * 0.04 - 0.02)).toFixed(2),
                volume: Math.floor(5000 + Math.random() * 100000),
                source: 'Kalshi'
            });
        }

        return { polymarket: poly, kalshi: kalshi };
    }

    // ── API Fetchers ────────────────────────────────────────────────

    function fetchPolymarketMarkets() {
        return fetch(POLYMARKET_API + '/markets?limit=50&active=true')
            .then(function (r) {
                if (!r.ok) throw new Error('Polymarket HTTP ' + r.status);
                return r.json();
            })
            .then(function (markets) {
                if (!Array.isArray(markets)) markets = [];
                return markets.map(function (m) {
                    var yesPrice = 0;
                    var noPrice = 0;
                    if (m.outcomePrices) {
                        try {
                            var prices = typeof m.outcomePrices === 'string'
                                ? JSON.parse(m.outcomePrices)
                                : m.outcomePrices;
                            yesPrice = parseFloat(prices[0]) || 0;
                            noPrice  = parseFloat(prices[1]) || 0;
                        } catch (_e) { /* price format varies by market */ }
                    }
                    if (yesPrice === 0 && m.bestBid !== undefined) {
                        yesPrice = parseFloat(m.bestBid) || 0;
                    }
                    return {
                        id: m.id || m.conditionId || '',
                        question: m.question || m.title || 'Untitled',
                        category: m.groupItemTitle || m.category || 'Other',
                        yes_price: +yesPrice.toFixed(2),
                        no_price: +noPrice.toFixed(2),
                        volume: parseInt(m.volume || m.volumeNum || 0, 10),
                        source: 'Polymarket'
                    };
                }).filter(function (m) { return m.yes_price > 0; });
            });
    }

    function fetchKalshiMarkets() {
        return fetch(KALSHI_API + '/markets?limit=50&status=open')
            .then(function (r) {
                if (!r.ok) throw new Error('Kalshi HTTP ' + r.status);
                return r.json();
            })
            .then(function (body) {
                var markets = body.markets || body.data || [];
                if (!Array.isArray(markets)) markets = [];
                return markets.map(function (m) {
                    var yesPrice = parseFloat(m.yes_price || m.last_price || m.yes_bid || 0);
                    var noPrice  = parseFloat(m.no_price || m.no_bid || 0);
                    if (noPrice === 0 && yesPrice > 0) noPrice = +(1 - yesPrice).toFixed(2);
                    return {
                        id: m.ticker || m.id || '',
                        question: m.title || m.subtitle || 'Untitled',
                        category: m.category || m.event_ticker || 'Other',
                        yes_price: +yesPrice.toFixed(2),
                        no_price: +noPrice.toFixed(2),
                        volume: parseInt(m.volume || m.open_interest || 0, 10),
                        source: 'Kalshi'
                    };
                }).filter(function (m) { return m.yes_price > 0; });
            });
    }

    // ── Text similarity (Jaccard on bigrams) ────────────────────────
    function bigrams(str) {
        str = str.toLowerCase().replace(/[^a-z0-9 ]/g, '');
        var tokens = str.split(/\s+/);
        var bg = {};
        for (var i = 0; i < tokens.length - 1; i++) {
            var key = tokens[i] + ' ' + tokens[i + 1];
            bg[key] = true;
        }
        // Also add individual tokens for better matching
        for (var j = 0; j < tokens.length; j++) {
            if (tokens[j].length > 2) bg['_t_' + tokens[j]] = true;
        }
        return bg;
    }

    function similarity(a, b) {
        var bgA = bigrams(a);
        var bgB = bigrams(b);
        var intersection = 0;
        var union = 0;
        var all = {};
        var k;
        for (k in bgA) { if (bgA.hasOwnProperty(k)) all[k] = true; }
        for (k in bgB) { if (bgB.hasOwnProperty(k)) all[k] = true; }
        for (k in all) {
            if (all.hasOwnProperty(k)) {
                union++;
                if (bgA[k] && bgB[k]) intersection++;
            }
        }
        return union === 0 ? 0 : intersection / union;
    }

    // ── Arbitrage Calculation ───────────────────────────────────────

    /**
     * Cross-platform arbitrage:
     * If Polymarket YES + Kalshi NO < 1 → buy YES on Poly, NO on Kalshi
     * If Kalshi YES + Polymarket NO < 1 → buy YES on Kalshi, NO on Poly
     *
     * Profit = 1 - (cost_yes + cost_no) for a guaranteed $1 payout
     */
    function findArbitrageOpportunities(polyMarkets, kalshiMarkets) {
        var opps = [];
        var threshold = SIMILARITY_THRESHOLD;

        for (var i = 0; i < polyMarkets.length; i++) {
            for (var j = 0; j < kalshiMarkets.length; j++) {
                var pm = polyMarkets[i];
                var km = kalshiMarkets[j];

                var sim = similarity(pm.question, km.question);
                if (sim < threshold) continue;

                // Strategy 1: Buy YES on Polymarket + NO on Kalshi
                var cost1 = pm.yes_price + km.no_price;
                if (cost1 < 1) {
                    var profit1 = 1 - cost1;
                    opps.push({
                        polymarket: pm,
                        kalshi: km,
                        similarity: sim,
                        strategy: 'Buy YES on Polymarket + Buy NO on Kalshi',
                        buy_yes_platform: 'Polymarket',
                        buy_no_platform: 'Kalshi',
                        yes_price: pm.yes_price,
                        no_price: km.no_price,
                        total_cost: cost1,
                        profit: profit1,
                        profit_pct: profit1 / cost1,
                        category: pm.category
                    });
                }

                // Strategy 2: Buy YES on Kalshi + NO on Polymarket
                var cost2 = km.yes_price + pm.no_price;
                if (cost2 < 1) {
                    var profit2 = 1 - cost2;
                    opps.push({
                        polymarket: pm,
                        kalshi: km,
                        similarity: sim,
                        strategy: 'Buy YES on Kalshi + Buy NO on Polymarket',
                        buy_yes_platform: 'Kalshi',
                        buy_no_platform: 'Polymarket',
                        yes_price: km.yes_price,
                        no_price: pm.no_price,
                        total_cost: cost2,
                        profit: profit2,
                        profit_pct: profit2 / cost2,
                        category: km.category
                    });
                }
            }
        }

        return opps;
    }

    // ── Rendering ───────────────────────────────────────────────────

    function renderStats() {
        if (opportunities.length === 0) {
            dom.statOppCount.textContent = '0';
            dom.statBestProfit.textContent = '—';
            dom.statAvgProfit.textContent  = '—';
        } else {
            dom.statOppCount.textContent = opportunities.length;
            var best = 0;
            var sum  = 0;
            for (var i = 0; i < opportunities.length; i++) {
                if (opportunities[i].profit_pct > best) best = opportunities[i].profit_pct;
                sum += opportunities[i].profit_pct;
            }
            dom.statBestProfit.textContent = pct(best);
            dom.statAvgProfit.textContent  = pct(sum / opportunities.length);
        }

        dom.statPolyCount.textContent  = polymarketData.length;
        dom.statKalshiCount.textContent = kalshiData.length;
        dom.statLastUpdate.textContent = lastFetchTime
            ? lastFetchTime.toLocaleTimeString()
            : '—';
    }

    function getFilteredOpportunities() {
        var minProfit = parseFloat(dom.minProfitInput.value) || MIN_PROFIT_DEFAULT;
        var category  = dom.categorySel.value;
        var sortBy    = dom.sortSel.value;

        var filtered = opportunities.filter(function (o) {
            if (o.profit_pct * 100 < minProfit) return false;
            if (category !== 'all' && o.category !== category) return false;
            return true;
        });

        filtered.sort(function (a, b) {
            if (sortBy === 'profit-desc') return b.profit_pct - a.profit_pct;
            if (sortBy === 'profit-asc')  return a.profit_pct - b.profit_pct;
            if (sortBy === 'similarity')  return b.similarity - a.similarity;
            return 0;
        });

        return filtered;
    }

    function renderOpportunities() {
        var filtered = getFilteredOpportunities();
        dom.oppContainer.innerHTML = '';

        if (filtered.length === 0) {
            dom.oppContainer.innerHTML =
                '<div class="empty-state">' +
                    '<div class="empty-icon">🔍</div>' +
                    '<p>' + (opportunities.length === 0
                        ? 'Click <strong>Start Bot</strong> to begin scanning for arbitrage opportunities.'
                        : 'No opportunities match your filters. Try lowering the minimum profit.') +
                    '</p>' +
                '</div>';
            return;
        }

        for (var i = 0; i < filtered.length; i++) {
            var o = filtered[i];
            var profitClass = o.profit_pct >= 0.05 ? 'high-profit'
                            : o.profit_pct >= 0.02 ? 'medium-profit'
                            : 'low-profit';

            var html =
                '<div class="opp-card ' + profitClass + '">' +
                    '<div class="opp-header">' +
                        '<div class="opp-title">' + escapeHtml(o.polymarket.question) + '</div>' +
                        '<span class="opp-category">' + escapeHtml(o.category) + '</span>' +
                    '</div>' +
                    '<div class="opp-body">' +
                        '<div class="opp-platform">' +
                            '<div class="opp-platform-name">🟣 ' + escapeHtml(o.buy_yes_platform) + ' (YES)</div>' +
                            '<div class="opp-price-row"><span class="label">Price:</span> <span class="value price-yes">$' + o.yes_price.toFixed(2) + '</span></div>' +
                        '</div>' +
                        '<div class="opp-platform">' +
                            '<div class="opp-platform-name">🔵 ' + escapeHtml(o.buy_no_platform) + ' (NO)</div>' +
                            '<div class="opp-price-row"><span class="label">Price:</span> <span class="value price-no">$' + o.no_price.toFixed(2) + '</span></div>' +
                        '</div>' +
                        '<div class="opp-profit">' +
                            '<div class="profit-pct">' + pct(o.profit_pct) + '</div>' +
                            '<div class="profit-label">Profit</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="opp-explanation">' +
                        '<strong>Strategy:</strong> ' + escapeHtml(o.strategy) +
                        ' · <strong>Total cost:</strong> $' + o.total_cost.toFixed(2) +
                        ' · <strong>Guaranteed payout:</strong> $1.00' +
                        ' · <strong>Net profit:</strong> $' + o.profit.toFixed(2) +
                        ' · <strong>Match confidence:</strong> ' + (o.similarity * 100).toFixed(0) + '%' +
                    '</div>' +
                '</div>';

            dom.oppContainer.insertAdjacentHTML('beforeend', html);
        }
    }

    function renderMarketTable(markets, tbody) {
        tbody.innerHTML = '';
        if (markets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:1rem;">No markets loaded</td></tr>';
            return;
        }
        for (var i = 0; i < markets.length; i++) {
            var m = markets[i];
            tbody.innerHTML +=
                '<tr>' +
                    '<td>' + escapeHtml(m.question) + '</td>' +
                    '<td class="price-yes">$' + m.yes_price.toFixed(2) + '</td>' +
                    '<td class="price-no">$' + m.no_price.toFixed(2) + '</td>' +
                    '<td>' + escapeHtml(m.category) + '</td>' +
                    '<td>' + (m.volume ? m.volume.toLocaleString() : '—') + '</td>' +
                '</tr>';
        }
    }

    function populateCategoryFilter() {
        var cats = {};
        for (var i = 0; i < opportunities.length; i++) {
            cats[opportunities[i].category] = true;
        }
        var current = dom.categorySel.value;
        dom.categorySel.innerHTML = '<option value="all">All Categories</option>';
        var keys = Object.keys(cats).sort();
        for (var j = 0; j < keys.length; j++) {
            var opt = document.createElement('option');
            opt.value = keys[j];
            opt.textContent = keys[j];
            dom.categorySel.appendChild(opt);
        }
        dom.categorySel.value = current || 'all';
    }

    // ── Main Fetch & Process ────────────────────────────────────────

    function fetchAndProcess() {
        log('Fetching market data…');
        setStatus('live', 'Fetching…');

        var fetchPoly, fetchKalshi;

        if (useDemoData) {
            var demo = generateDemoData();
            fetchPoly  = Promise.resolve(demo.polymarket);
            fetchKalshi = Promise.resolve(demo.kalshi);
        } else {
            fetchPoly = fetchPolymarketMarkets().catch(function (err) {
                log('Polymarket API error: ' + err.message + ' – using demo data for Polymarket', 'warn');
                return generateDemoData().polymarket;
            });
            fetchKalshi = fetchKalshiMarkets().catch(function (err) {
                log('Kalshi API error: ' + err.message + ' – using demo data for Kalshi', 'warn');
                return generateDemoData().kalshi;
            });
        }

        Promise.all([fetchPoly, fetchKalshi]).then(function (results) {
            polymarketData = results[0];
            kalshiData     = results[1];

            log('Loaded ' + polymarketData.length + ' Polymarket markets');
            log('Loaded ' + kalshiData.length + ' Kalshi markets');

            // Find arbitrage
            opportunities = findArbitrageOpportunities(polymarketData, kalshiData);
            lastFetchTime = new Date();

            log('Found ' + opportunities.length + ' arbitrage opportunities', opportunities.length > 0 ? 'info' : 'warn');

            // Update UI
            renderStats();
            populateCategoryFilter();
            renderOpportunities();
            renderMarketTable(polymarketData, dom.polyTable);
            renderMarketTable(kalshiData, dom.kalshiTable);

            setStatus('live', 'Live · Last updated ' + lastFetchTime.toLocaleTimeString());
        }).catch(function (err) {
            log('Fatal error: ' + err.message, 'error');
            setStatus('error', 'Error');
        });
    }

    // ── Bot Controls ────────────────────────────────────────────────

    function startBot() {
        if (isRunning) return;
        isRunning = true;
        dom.startBtn.disabled = true;
        dom.stopBtn.disabled  = false;
        log('Bot started');
        setStatus('live', 'Starting…');

        fetchAndProcess();

        var intervalMs = REFRESH_INTERVALS[dom.intervalSel.value] || DEFAULT_INTERVAL;
        refreshTimer = setInterval(fetchAndProcess, intervalMs);
    }

    function stopBot() {
        if (!isRunning) return;
        isRunning = false;
        dom.startBtn.disabled = false;
        dom.stopBtn.disabled  = true;
        clearInterval(refreshTimer);
        refreshTimer = null;
        log('Bot stopped');
        setStatus('', 'Stopped');
    }

    function manualRefresh() {
        if (!isRunning) {
            fetchAndProcess();
        }
    }

    function setDataSource(mode) {
        useDemoData = (mode === 'demo');
        dom.demoToggle.classList.toggle('active', useDemoData);
        dom.liveToggle.classList.toggle('active', !useDemoData);
        log('Data source switched to ' + (useDemoData ? 'Demo' : 'Live API'));
        if (isRunning) {
            stopBot();
            startBot();
        }
    }

    // ── Init ────────────────────────────────────────────────────────

    function init() {
        cacheDom();

        // Event listeners
        dom.startBtn.addEventListener('click', startBot);
        dom.stopBtn.addEventListener('click', stopBot);
        dom.refreshBtn.addEventListener('click', manualRefresh);

        dom.demoToggle.addEventListener('click', function () { setDataSource('demo'); });
        dom.liveToggle.addEventListener('click', function () { setDataSource('live'); });

        dom.minProfitInput.addEventListener('input', renderOpportunities);
        dom.categorySel.addEventListener('change', renderOpportunities);
        dom.sortSel.addEventListener('change', renderOpportunities);

        dom.intervalSel.addEventListener('change', function () {
            if (isRunning) {
                stopBot();
                startBot();
            }
        });

        // Defaults
        dom.stopBtn.disabled = true;
        setStatus('', 'Ready – click Start Bot');
        log('Arbitrage bot initialized. Select a data source and click Start Bot.');
    }

    document.addEventListener('DOMContentLoaded', init);
})();
