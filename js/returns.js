/**
 * Return calculation functions for commodities.
 */
var Returns = (function () {
    'use strict';

    var PERIODS = ['1W', '1M', '3M', '6M', '12M', '2Y', '3Y', '5Y'];

    /**
     * Calculate period returns for a single commodity.
     * entries: sorted array of {date, value} (non-null values only).
     * Returns object keyed by period label.
     */
    function periodReturns(entries) {
        if (!entries || entries.length === 0) return {};
        var latest = entries[entries.length - 1];
        var results = { latestPrice: latest.value, latestDate: latest.date };

        PERIODS.forEach(function (p) {
            var targetDate = Utils.subtractPeriod(latest.date, p);
            // Use wider tolerance for weekly/monthly data
            var tolerance = 15;
            if (p === '1W') tolerance = 10;
            var prev = Utils.findClosest(entries, targetDate, tolerance);
            if (prev && prev.value !== 0) {
                results[p] = (latest.value - prev.value) / prev.value;
            } else {
                results[p] = null;
            }
        });

        return results;
    }

    /**
     * Calendar Year returns (Jan 1 – Dec 31).
     * Returns array of {year, return} objects.
     */
    function calendarYearReturns(entries) {
        if (!entries || entries.length < 2) return [];
        var byYear = {};
        entries.forEach(function (e) {
            var y = e.date.getUTCFullYear();
            if (!byYear[y]) byYear[y] = [];
            byYear[y].push(e);
        });

        var years = Object.keys(byYear).map(Number).sort();
        var results = [];

        for (var i = 0; i < years.length; i++) {
            var y = years[i];
            var yearEntries = byYear[y];
            var endPrice = yearEntries[yearEntries.length - 1].value;

            // Start price: last price of previous year, or first of this year
            var startPrice = null;
            if (i > 0) {
                var prevYear = byYear[years[i - 1]];
                startPrice = prevYear[prevYear.length - 1].value;
            } else {
                startPrice = yearEntries[0].value;
            }

            if (startPrice && startPrice !== 0) {
                results.push({ year: y, return: (endPrice - startPrice) / startPrice });
            } else {
                results.push({ year: y, return: null });
            }
        }

        return results;
    }

    /**
     * Financial Year returns (Apr 1 – Mar 31).
     * FY label: "FY 2020-21" means Apr 2020 – Mar 2021.
     */
    function financialYearReturns(entries) {
        if (!entries || entries.length < 2) return [];

        // Group by financial year
        var byFY = {};
        entries.forEach(function (e) {
            var m = e.date.getUTCMonth(); // 0-indexed
            var y = e.date.getUTCFullYear();
            var fy = m >= 3 ? y : y - 1; // Apr(3)–Mar(2): if month >= Apr, FY starts this year
            if (!byFY[fy]) byFY[fy] = [];
            byFY[fy].push(e);
        });

        var fyKeys = Object.keys(byFY).map(Number).sort();
        var results = [];

        for (var i = 0; i < fyKeys.length; i++) {
            var fy = fyKeys[i];
            var fyEntries = byFY[fy];
            var endPrice = fyEntries[fyEntries.length - 1].value;

            var startPrice = null;
            if (i > 0) {
                var prevFY = byFY[fyKeys[i - 1]];
                startPrice = prevFY[prevFY.length - 1].value;
            } else {
                startPrice = fyEntries[0].value;
            }

            var label = 'FY ' + fy + '-' + String(fy + 1).slice(-2);
            if (startPrice && startPrice !== 0) {
                results.push({ label: label, return: (endPrice - startPrice) / startPrice });
            } else {
                results.push({ label: label, return: null });
            }
        }

        return results;
    }

    /**
     * Weekly movement: week-over-week returns for the last N weeks.
     * Returns array of {weekEnd, return} from most recent going back.
     */
    function weeklyMovement(entries, numWeeks) {
        numWeeks = numWeeks || 12;
        if (!entries || entries.length < 2) return [];

        var latest = entries[entries.length - 1];
        var results = [];

        for (var w = 0; w < numWeeks; w++) {
            var endDate = Utils.subtractPeriod(latest.date, (w) + 'W');
            var startDate = Utils.subtractPeriod(latest.date, (w + 1) + 'W');

            var endEntry = Utils.findClosest(entries, endDate, 7);
            var startEntry = Utils.findClosest(entries, startDate, 7);

            if (endEntry && startEntry && startEntry.value !== 0) {
                results.push({
                    weekEnd: endEntry.date,
                    return: (endEntry.value - startEntry.value) / startEntry.value
                });
            } else {
                results.push({ weekEnd: endDate, return: null });
            }
        }

        return results;
    }

    /**
     * Annualized volatility from daily returns.
     * window: number of data points to use.
     */
    function volatility(entries, window) {
        if (!entries || entries.length < 2) return null;
        var subset = window ? entries.slice(-window) : entries;
        if (subset.length < 2) return null;

        var returns = [];
        for (var i = 1; i < subset.length; i++) {
            if (subset[i - 1].value !== 0) {
                returns.push((subset[i].value - subset[i - 1].value) / subset[i - 1].value);
            }
        }

        if (returns.length < 2) return null;

        var mean = returns.reduce(function (s, v) { return s + v; }, 0) / returns.length;
        var variance = returns.reduce(function (s, v) { return s + (v - mean) * (v - mean); }, 0) / (returns.length - 1);
        var dailyVol = Math.sqrt(variance);

        // Detect frequency to annualize correctly
        var avgGap = 1;
        if (subset.length >= 2) {
            var totalDays = (subset[subset.length - 1].date - subset[0].date) / 86400000;
            avgGap = totalDays / (subset.length - 1);
        }

        var annualizeFactor;
        if (avgGap <= 3) annualizeFactor = Math.sqrt(252);       // Daily
        else if (avgGap <= 10) annualizeFactor = Math.sqrt(52);   // Weekly
        else annualizeFactor = Math.sqrt(12);                      // Monthly

        return dailyVol * annualizeFactor;
    }

    /**
     * Maximum drawdown analysis.
     * Returns { maxDrawdown, peakDate, troughDate, peakPrice, troughPrice }
     */
    function maxDrawdown(entries) {
        if (!entries || entries.length < 2) return null;

        var peak = entries[0].value;
        var peakDate = entries[0].date;
        var maxDD = 0;
        var result = { maxDrawdown: 0, peakDate: null, troughDate: null, peakPrice: 0, troughPrice: 0 };

        for (var i = 1; i < entries.length; i++) {
            if (entries[i].value > peak) {
                peak = entries[i].value;
                peakDate = entries[i].date;
            }
            var dd = (peak - entries[i].value) / peak;
            if (dd > maxDD) {
                maxDD = dd;
                result.maxDrawdown = dd;
                result.peakDate = peakDate;
                result.troughDate = entries[i].date;
                result.peakPrice = peak;
                result.troughPrice = entries[i].value;
            }
        }

        return result;
    }

    /**
     * Summary statistics for a commodity.
     */
    function summaryStats(entries) {
        if (!entries || entries.length === 0) return null;
        var values = entries.map(function (e) { return e.value; });
        var min = Math.min.apply(null, values);
        var max = Math.max.apply(null, values);
        var sum = values.reduce(function (s, v) { return s + v; }, 0);
        var avg = sum / values.length;
        var current = values[values.length - 1];

        return {
            count: entries.length,
            frequency: Utils.detectFrequency(entries),
            min: min,
            max: max,
            avg: avg,
            current: current,
            pctFromHigh: (current - max) / max,
            pctFromLow: (current - min) / min
        };
    }

    return {
        PERIODS: PERIODS,
        periodReturns: periodReturns,
        calendarYearReturns: calendarYearReturns,
        financialYearReturns: financialYearReturns,
        weeklyMovement: weeklyMovement,
        volatility: volatility,
        maxDrawdown: maxDrawdown,
        summaryStats: summaryStats
    };
})();
