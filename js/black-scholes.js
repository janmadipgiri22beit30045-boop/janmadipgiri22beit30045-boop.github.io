/**
 * Black-Scholes Option Pricing Engine
 * Nifty 50 live option pricing with dynamic updates and mispricing detection.
 *
 * Updates via requestAnimationFrame + a 500 ms market-tick timer so that the
 * UI always stays in sync with the fastest possible browser render cycle.
 */
(function () {
    'use strict';

    /* =========================================================
       1. BLACK-SCHOLES MATHEMATICS
       ========================================================= */

    /** Standard normal PDF */
    function phi(x) {
        return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    }

    /** Standard normal CDF – Abramowitz & Stegun approximation (error < 7.5e-8) */
    function cdf(x) {
        if (x < -8) return 0;
        if (x >  8) return 1;
        var neg = x < 0;
        if (neg) x = -x;
        var t  = 1 / (1 + 0.2316419 * x);
        var y  = t * (0.319381530 +
                 t * (-0.356563782 +
                 t * (1.781477937 +
                 t * (-1.821255978 +
                 t *  1.330274429))));
        var val = 1 - phi(x) * y;
        return neg ? 1 - val : val;
    }

    /**
     * Core Black-Scholes pricing.
     * @param {string} type  'call' | 'put'
     * @param {number} S     Spot price
     * @param {number} K     Strike price
     * @param {number} T     Time to expiry in years
     * @param {number} r     Risk-free rate (decimal, e.g. 0.065)
     * @param {number} sigma Volatility (decimal, e.g. 0.18)
     * @returns {{price, d1, d2}}
     */
    function bsPrice(type, S, K, T, r, sigma) {
        if (T <= 0) {
            var intrinsic = type === 'call'
                ? Math.max(S - K, 0)
                : Math.max(K - S, 0);
            return { price: intrinsic, d1: 0, d2: 0 };
        }
        var sqrtT = Math.sqrt(T);
        var d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
        var d2 = d1 - sigma * sqrtT;

        var price;
        if (type === 'call') {
            price = S * cdf(d1) - K * Math.exp(-r * T) * cdf(d2);
        } else {
            price = K * Math.exp(-r * T) * cdf(-d2) - S * cdf(-d1);
        }
        return { price: price, d1: d1, d2: d2 };
    }

    /** Full Greeks for a single option */
    function greeks(type, S, K, T, r, sigma) {
        if (T <= 0) {
            return { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
        }
        var bs     = bsPrice(type, S, K, T, r, sigma);
        var d1     = bs.d1;
        var d2     = bs.d2;
        var sqrtT  = Math.sqrt(T);
        var phiD1  = phi(d1);
        var expRT  = Math.exp(-r * T);

        var delta, theta, rho;
        if (type === 'call') {
            delta = cdf(d1);
            theta = (-S * phiD1 * sigma / (2 * sqrtT)
                    - r * K * expRT * cdf(d2)) / 365;
            rho   = K * T * expRT * cdf(d2) / 100;
        } else {
            delta = cdf(d1) - 1;
            theta = (-S * phiD1 * sigma / (2 * sqrtT)
                    + r * K * expRT * cdf(-d2)) / 365;
            rho   = -K * T * expRT * cdf(-d2) / 100;
        }

        var gamma = phiD1 / (S * sigma * sqrtT);
        var vega  = S * phiD1 * sqrtT / 100;  // per 1% change in vol

        return {
            delta: delta,
            gamma: gamma,
            theta: theta,
            vega:  vega,
            rho:   rho
        };
    }

    /**
     * Implied Volatility – Newton-Raphson solver.
     * Returns NaN if it doesn't converge.
     */
    function impliedVol(type, S, K, T, r, marketPrice) {
        if (T <= 0 || marketPrice <= 0) return NaN;
        var sigma = 0.20;  // initial guess
        for (var i = 0; i < 100; i++) {
            var bs    = bsPrice(type, S, K, T, r, sigma);
            var diff  = bs.price - marketPrice;
            if (Math.abs(diff) < 0.001) return sigma;
            var sqrtT = Math.sqrt(T);
            var vega  = S * phi(bs.d1) * sqrtT;
            if (vega < 1e-10) return NaN;
            sigma -= diff / vega;
            if (sigma <= 0) sigma = 0.001;
            if (sigma > 10)  return NaN;
        }
        return sigma;
    }

    /* =========================================================
       2. MARKET SIMULATOR
       ========================================================= */

    /* Trading calendar constants */
    var TRADING_DAYS_PER_YEAR  = 252;
    var TRADING_HOURS_PER_DAY  = 6.5;
    var SECONDS_PER_HOUR       = 3600;
    var MS_PER_SECOND          = 1000;

    /* Mispricing simulation constants */
    var MISPRICING_PROBABILITY    = 0.17;  // ~1-in-6 ticks have structural mispricing
    var MAX_STRUCTURAL_MISPRICING = 0.06;  // up to ±3 % structural deviation from model

    var SIM = {
        spotBase:   22450,   // current "reference" Nifty spot
        spot:       22450,
        vol:        0.165,   // annualised implied vol ~16.5 %
        riskFree:   0.065,   // RBI repo rate proxy
        tickMs:     500,     // market-data tick every 500 ms
        lastTick:   0,
        marketNoise: 0.004,  // ±0.4 % random spread on market prices

        /* Random GBM step for one tick */
        step: function () {
            /* Trading-time fraction: dt = tick duration / total annual trading milliseconds */
            var annualTradingMs = TRADING_DAYS_PER_YEAR * TRADING_HOURS_PER_DAY *
                                  SECONDS_PER_HOUR * MS_PER_SECOND;
            var dt = this.tickMs / annualTradingMs;

            /*
             * Central Limit Theorem (Irwin-Hall) approximation of N(0,1):
             * Sum of 6 U[0,1] variables has mean 3 and variance 1, so
             * (sum − 3) / √1 ≈ N(0,1). Fast and sufficient for a price simulation.
             */
            var z = (Math.random() + Math.random() + Math.random() +
                     Math.random() + Math.random() + Math.random() - 3) / Math.sqrt(3);

            var ret  = (this.riskFree - 0.5 * this.vol * this.vol) * dt +
                        this.vol * Math.sqrt(dt) * z;
            this.spot *= Math.exp(ret);
            /* Soft mean-reversion so the spot stays in a tradeable range */
            this.spot += (this.spotBase - this.spot) * 0.002;
        },

        /** Simulate a market price with bid-ask noise and occasional mispricing */
        marketPrice: function (type, K, T) {
            var model = bsPrice(type, this.spot, K, T, this.riskFree, this.vol).price;
            /* Random spread component (bid-ask noise) */
            var noise = 1 + (Math.random() - 0.5) * this.marketNoise * 2;
            /* Occasional structural mispricing (stale quotes, liquidity gaps, order-book imbalance) */
            var misprice = 0;
            if (Math.random() < MISPRICING_PROBABILITY) {
                misprice = model * (Math.random() - 0.5) * MAX_STRUCTURAL_MISPRICING;
            }
            return Math.max(0.05, model * noise + misprice);
        }
    };

    /* =========================================================
       3. EXPIRY MANAGEMENT
       ========================================================= */

    /** Nearest-to-date Nifty weekly expiry (every Thursday in India) */
    function nextExpiries(count) {
        var expiries = [];
        var d = new Date();
        d.setHours(15, 30, 0, 0);  // market close IST
        for (var days = 0; expiries.length < count; days++) {
            var candidate = new Date(d.getTime() + days * 86400000);
            if (candidate.getDay() === 4) {  // 4 = Thursday
                expiries.push(candidate);
            }
        }
        return expiries;
    }

    function yearsToExpiry(expDate) {
        var ms  = expDate.getTime() - Date.now();
        return Math.max(ms / (365.25 * 24 * 3600 * 1000), 0);
    }

    function formatExpiry(d) {
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    /* =========================================================
       4. OPTION CHAIN
       ========================================================= */

    var STRIKE_STEP = 50;   // Nifty strikes in multiples of 50
    var STRIKES_EACH_SIDE = 7;  // 7 ITM + ATM + 7 OTM = 15 rows

    function generateStrikes(spot) {
        var atm = Math.round(spot / STRIKE_STEP) * STRIKE_STEP;
        var strikes = [];
        for (var i = -STRIKES_EACH_SIDE; i <= STRIKES_EACH_SIDE; i++) {
            strikes.push(atm + i * STRIKE_STEP);
        }
        return strikes;
    }

    /* =========================================================
       5. DOM HELPERS
       ========================================================= */

    function $(id) { return document.getElementById(id); }

    function fmt2(n) { return isNaN(n) ? '—' : n.toFixed(2); }
    function fmt4(n) { return isNaN(n) ? '—' : n.toFixed(4); }
    function fmtPct(n) { return isNaN(n) ? '—' : (n * 100).toFixed(2) + '%'; }

    function colorClass(val) {
        if (val >  0.5) return 'pos-strong';
        if (val >  0)   return 'pos';
        if (val < -0.5) return 'neg-strong';
        if (val <  0)   return 'neg';
        return '';
    }

    function mispricingClass(pct) {
        var abs = Math.abs(pct);
        if (abs >= 3)    return 'misprice-high';
        if (abs >= 1.5)  return 'misprice-med';
        if (abs >= 0.5)  return 'misprice-low';
        return '';
    }

    /* =========================================================
       6. STATE
       ========================================================= */

    var state = {
        expiries:      [],
        selectedExpiry: null,
        strikes:       [],
        marketPrices:  {},   // { 'call_K': price, 'put_K': price }
        tickCount:     0,
        running:       false
    };

    /* =========================================================
       7. RENDERING
       ========================================================= */

    function renderTicker() {
        var el = $('bs-spot');
        if (!el) return;

        var prevText = el.dataset.prev || '';
        var curr     = SIM.spot.toFixed(2);
        el.textContent = '₹ ' + Number(curr).toLocaleString('en-IN', { minimumFractionDigits: 2 });

        if (prevText !== '') {
            var diff = SIM.spot - parseFloat(prevText);
            el.className = 'spot-value ' + (diff >= 0 ? 'tick-up' : 'tick-down');
            setTimeout(function () {
                if (el) el.className = 'spot-value';
            }, 300);
        }
        el.dataset.prev = curr;

        /* live vol display */
        var volLive = $('bs-vol-live');
        if (volLive) volLive.textContent = (SIM.vol * 100).toFixed(1) + '%';
    }

    function renderInputs() {
        /* Update vol + rate from controls */
        var volEl  = $('bs-vol');
        var rateEl = $('bs-rate');
        if (volEl)  SIM.vol      = parseFloat(volEl.value)  / 100 || SIM.vol;
        if (rateEl) SIM.riskFree = parseFloat(rateEl.value) / 100 || SIM.riskFree;
    }

    function renderAtmPanel() {
        var S = SIM.spot;
        var T = state.selectedExpiry ? yearsToExpiry(state.selectedExpiry) : 7 / 365;
        var r = SIM.riskFree;
        var v = SIM.vol;
        var K = Math.round(S / STRIKE_STEP) * STRIKE_STEP;  // ATM strike

        ['call', 'put'].forEach(function (type) {
            var bs = bsPrice(type, S, K, T, r, v);
            var g  = greeks(type, S, K, T, r, v);
            var prefix = type === 'call' ? 'call' : 'put';

            var priceEl = $(prefix + '-price');
            if (priceEl) priceEl.textContent = '₹ ' + fmt2(bs.price);

            var els = {
                delta: $(prefix + '-delta'),
                gamma: $(prefix + '-gamma'),
                theta: $(prefix + '-theta'),
                vega:  $(prefix + '-vega'),
                rho:   $(prefix + '-rho')
            };
            if (els.delta) els.delta.textContent = fmt4(g.delta);
            if (els.gamma) els.gamma.textContent = fmt4(g.gamma);
            if (els.theta) els.theta.textContent = fmt2(g.theta);
            if (els.vega)  els.vega.textContent  = fmt2(g.vega);
            if (els.rho)   els.rho.textContent   = fmt2(g.rho);
        });

        /* Time remaining */
        var tEl = $('bs-time-left');
        if (tEl && state.selectedExpiry) {
            var ms = state.selectedExpiry.getTime() - Date.now();
            if (ms <= 0) {
                tEl.textContent = 'Expired';
            } else {
                var totalMin = Math.floor(ms / 60000);
                var days  = Math.floor(totalMin / (60 * 24));
                var hours = Math.floor((totalMin % (60 * 24)) / 60);
                var mins  = totalMin % 60;
                tEl.textContent = days + 'd ' + hours + 'h ' + mins + 'm';
            }
        }

        /* Tick counter */
        var tcEl = $('bs-tick-count');
        if (tcEl) tcEl.textContent = state.tickCount.toLocaleString('en-IN');
    }

    function renderOptionChain() {
        var tbody = $('chain-tbody');
        if (!tbody) return;

        var S = SIM.spot;
        var T = state.selectedExpiry ? yearsToExpiry(state.selectedExpiry) : 7 / 365;
        var r = SIM.riskFree;
        var v = SIM.vol;
        var atmK = Math.round(S / STRIKE_STEP) * STRIKE_STEP;

        var mispricingAlerts = [];

        var rows = state.strikes.map(function (K) {
            var callBS  = bsPrice('call', S, K, T, r, v);
            var putBS   = bsPrice('put',  S, K, T, r, v);

            var cKey = 'call_' + K;
            var pKey = 'put_'  + K;

            /* Refresh market prices on every tick */
            var callMkt = state.marketPrices[cKey];
            var putMkt  = state.marketPrices[pKey];

            var callIV = impliedVol('call', S, K, T, r, callMkt);
            var putIV  = impliedVol('put',  S, K, T, r, putMkt);

            var callMisprice = callBS.price > 0
                ? ((callMkt - callBS.price) / callBS.price) * 100 : 0;
            var putMisprice  = putBS.price  > 0
                ? ((putMkt  - putBS.price)  / putBS.price)  * 100 : 0;

            var callG = greeks('call', S, K, T, r, v);
            var putG  = greeks('put',  S, K, T, r, v);

            if (Math.abs(callMisprice) >= 1.5) {
                mispricingAlerts.push({
                    strike: K, type: 'CALL',
                    model: callBS.price, market: callMkt,
                    pct: callMisprice
                });
            }
            if (Math.abs(putMisprice) >= 1.5) {
                mispricingAlerts.push({
                    strike: K, type: 'PUT',
                    model: putBS.price, market: putMkt,
                    pct: putMisprice
                });
            }

            var isATM = K === atmK;
            var moneyness = K < atmK ? 'itm-row' : (K > atmK ? 'otm-row' : 'atm-row');

            return {
                K: K,
                callBS: callBS.price, callMkt: callMkt,
                callMisprice: callMisprice, callIV: callIV,
                callDelta: callG.delta,
                putBS: putBS.price, putMkt: putMkt,
                putMisprice: putMisprice, putIV: putIV,
                putDelta: putG.delta,
                isATM: isATM,
                rowClass: moneyness
            };
        });

        /* Build HTML in one pass to minimise reflow */
        var html = rows.map(function (row) {
            var callMC = mispricingClass(row.callMisprice);
            var putMC  = mispricingClass(row.putMisprice);

            return '<tr class="' + row.rowClass + (row.isATM ? ' atm-highlight' : '') + '">' +
                /* === CALL side === */
                '<td class="num ' + callMC + '" title="Market: ₹' + fmt2(row.callMkt) + '">' +
                    fmt2(row.callMkt) + '</td>' +
                '<td class="num model-price">' + fmt2(row.callBS) + '</td>' +
                '<td class="num ' + callMC + ' misprice-cell">' +
                    (callMC ? '<span class="misprice-badge">' + (row.callMisprice >= 0 ? '+' : '') +
                        fmt2(row.callMisprice) + '%</span>' : fmt2(row.callMisprice) + '%') +
                '</td>' +
                '<td class="num iv-cell">' + fmtPct(row.callIV) + '</td>' +
                '<td class="num delta-cell">' + fmt4(row.callDelta) + '</td>' +
                /* === STRIKE === */
                '<td class="strike-cell' + (row.isATM ? ' atm-strike' : '') + '">' + row.K + '</td>' +
                /* === PUT side === */
                '<td class="num delta-cell">' + fmt4(row.putDelta) + '</td>' +
                '<td class="num iv-cell">' + fmtPct(row.putIV) + '</td>' +
                '<td class="num ' + putMC + ' misprice-cell">' +
                    (putMC ? '<span class="misprice-badge">' + (row.putMisprice >= 0 ? '+' : '') +
                        fmt2(row.putMisprice) + '%</span>' : fmt2(row.putMisprice) + '%') +
                '</td>' +
                '<td class="num model-price">' + fmt2(row.putBS) + '</td>' +
                '<td class="num ' + putMC + '" title="Market: ₹' + fmt2(row.putMkt) + '">' +
                    fmt2(row.putMkt) + '</td>' +
                '</tr>';
        }).join('');

        tbody.innerHTML = html;

        renderMispricingAlerts(mispricingAlerts);
    }

    function renderMispricingAlerts(alerts) {
        var panel = $('mispricing-panel');
        if (!panel) return;
        if (alerts.length === 0) {
            panel.innerHTML = '<p class="no-alerts">✅ No significant mispricing detected at this moment.</p>';
            return;
        }

        /* Sort by absolute mispricing descending */
        alerts.sort(function (a, b) { return Math.abs(b.pct) - Math.abs(a.pct); });

        var html = alerts.map(function (a) {
            var dir   = a.pct > 0 ? 'overpriced' : 'underpriced';
            var dirLbl = a.pct > 0 ? '⬆ Market Overpriced' : '⬇ Market Underpriced';
            var absPct = Math.abs(a.pct);
            var cls   = absPct >= 3 ? 'alert-high' : 'alert-med';
            return '<div class="alert-item ' + cls + '">' +
                '<span class="alert-type ' + dir + '">' + dirLbl + '</span>' +
                '<span class="alert-strike">' + a.type + ' ' + a.strike + '</span>' +
                '<span class="alert-detail">Market ₹' + fmt2(a.market) +
                    ' vs Model ₹' + fmt2(a.model) +
                    ' <strong>(' + (a.pct >= 0 ? '+' : '') + fmt2(a.pct) + '%)</strong></span>' +
                '</div>';
        }).join('');

        panel.innerHTML = '<p class="alerts-heading">⚡ ' + alerts.length +
            ' mispricing opportunit' + (alerts.length > 1 ? 'ies' : 'y') + ' detected</p>' + html;
    }

    /* =========================================================
       8. MARKET TICK
       ========================================================= */

    function marketTick() {
        SIM.step();
        state.tickCount++;

        /* Refresh market prices */
        var S = SIM.spot;
        var T = state.selectedExpiry ? yearsToExpiry(state.selectedExpiry) : 7 / 365;
        state.strikes = generateStrikes(S);
        state.strikes.forEach(function (K) {
            state.marketPrices['call_' + K] = SIM.marketPrice('call', K, T);
            state.marketPrices['put_'  + K] = SIM.marketPrice('put',  K, T);
        });
    }

    /* =========================================================
       9. ANIMATION LOOP
       ========================================================= */

    var rafId = null;
    var lastRender = 0;
    /*
     * Cap DOM updates at 100 ms (~10 Hz).
     * Market ticks can arrive faster (down to 100 ms), but re-rendering the
     * full 15-row option chain on every tick at 60 Hz would cause visual noise
     * and unnecessary layout thrashing. 10 Hz keeps numbers readable while
     * still feeling live.
     */
    var RENDER_INTERVAL_MS = 100;

    function animLoop(now) {
        if (!state.running) return;
        rafId = requestAnimationFrame(animLoop);
        if (now - lastRender < RENDER_INTERVAL_MS) return;
        lastRender = now;

        renderInputs();
        renderTicker();
        renderAtmPanel();
        renderOptionChain();
    }

    function startLoop() {
        if (state.running) return;
        state.running = true;

        /* Market tick timer (independent of render) */
        state.tickInterval = setInterval(marketTick, SIM.tickMs);
        marketTick();  // immediate first tick

        rafId = requestAnimationFrame(animLoop);

        var btn = $('bs-toggle');
        if (btn) {
            btn.textContent = '⏸ Pause';
            btn.classList.add('active');
        }
    }

    function stopLoop() {
        state.running = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        clearInterval(state.tickInterval);

        var btn = $('bs-toggle');
        if (btn) {
            btn.textContent = '▶ Resume';
            btn.classList.remove('active');
        }
    }

    /* =========================================================
       10. INIT
       ========================================================= */

    function init() {
        /* Populate expiry dropdown */
        state.expiries = nextExpiries(5);
        var sel = $('bs-expiry');
        if (sel) {
            state.expiries.forEach(function (d, i) {
                var opt = document.createElement('option');
                opt.value = i;
                opt.textContent = formatExpiry(d);
                sel.appendChild(opt);
            });
            sel.addEventListener('change', function () {
                state.selectedExpiry = state.expiries[parseInt(sel.value)];
            });
        }
        state.selectedExpiry = state.expiries[0];

        /* Strikes */
        state.strikes = generateStrikes(SIM.spot);

        /* Control events */
        var volEl  = $('bs-vol');
        var rateEl = $('bs-rate');
        var tickEl = $('bs-tick');

        if (volEl) {
            volEl.value = (SIM.vol * 100).toFixed(1);
            volEl.addEventListener('input', function () {
                $('bs-vol-display').textContent = parseFloat(volEl.value).toFixed(1) + '%';
                SIM.vol = parseFloat(volEl.value) / 100;
            });
            $('bs-vol-display').textContent = (SIM.vol * 100).toFixed(1) + '%';
        }

        if (rateEl) {
            rateEl.value = (SIM.riskFree * 100).toFixed(1);
            rateEl.addEventListener('input', function () {
                $('bs-rate-display').textContent = parseFloat(rateEl.value).toFixed(1) + '%';
                SIM.riskFree = parseFloat(rateEl.value) / 100;
            });
            $('bs-rate-display').textContent = (SIM.riskFree * 100).toFixed(1) + '%';
        }

        if (tickEl) {
            tickEl.value = SIM.tickMs;
            tickEl.addEventListener('change', function () {
                SIM.tickMs = parseInt(tickEl.value);
                if (state.running) {
                    clearInterval(state.tickInterval);
                    state.tickInterval = setInterval(marketTick, SIM.tickMs);
                }
            });
        }

        /* Custom spot override */
        var spotInput = $('bs-spot-override');
        if (spotInput) {
            spotInput.addEventListener('change', function () {
                var val = parseFloat(spotInput.value);
                if (!isNaN(val) && val > 0) {
                    SIM.spot     = val;
                    SIM.spotBase = val;
                }
            });
        }

        /* Toggle button */
        var toggleBtn = $('bs-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function () {
                if (state.running) stopLoop(); else startLoop();
            });
        }

        /* Noise override */
        var noiseEl = $('bs-noise');
        if (noiseEl) {
            noiseEl.value = SIM.marketNoise * 100;
            noiseEl.addEventListener('input', function () {
                SIM.marketNoise = parseFloat(noiseEl.value) / 100;
                $('bs-noise-display').textContent = parseFloat(noiseEl.value).toFixed(1) + '%';
            });
            $('bs-noise-display').textContent = (SIM.marketNoise * 100).toFixed(1) + '%';
        }

        startLoop();
    }

    /* Run after DOM ready */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
