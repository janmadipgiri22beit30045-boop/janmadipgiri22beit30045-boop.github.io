/**
 * Utility functions for date parsing and data manipulation.
 */
var Utils = (function () {
    'use strict';

    /**
     * Parse a date string in DD-MM-YYYY format and return a Date object (UTC noon).
     */
    function parseDate(str) {
        if (!str || typeof str !== 'string') return null;
        var parts = str.trim().split(/[-\/]/);
        if (parts.length !== 3) return null;
        var day = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10) - 1;
        var year = parseInt(parts[2], 10);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        return new Date(Date.UTC(year, month, day, 12, 0, 0));
    }

    /**
     * Format a Date as DD-MM-YYYY.
     */
    function formatDate(d) {
        if (!d) return '—';
        var dd = String(d.getUTCDate()).padStart(2, '0');
        var mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        var yyyy = d.getUTCFullYear();
        return dd + '-' + mm + '-' + yyyy;
    }

    /**
     * Format a Date as DD Mon YYYY.
     */
    function formatDateShort(d) {
        if (!d) return '—';
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return d.getUTCDate() + ' ' + months[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
    }

    /**
     * Subtract a given number of calendar days, months, or years from a date.
     * period: '1W','1M','3M','6M','12M','2Y','3Y','5Y'
     */
    function subtractPeriod(date, period) {
        var d = new Date(date.getTime());
        var num = parseInt(period, 10);
        var unit = period.replace(/[0-9]/g, '').toUpperCase();
        if (unit === 'W') {
            d.setUTCDate(d.getUTCDate() - num * 7);
        } else if (unit === 'M') {
            d.setUTCMonth(d.getUTCMonth() - num);
        } else if (unit === 'Y') {
            d.setUTCFullYear(d.getUTCFullYear() - num);
        }
        return d;
    }

    /**
     * Find the closest available data point on or before targetDate.
     * entries: sorted array of {date, value} with non-null values.
     * tolerance: max days to look back (default 10).
     */
    function findClosest(entries, targetDate, tolerance) {
        tolerance = tolerance || 10;
        var targetMs = targetDate.getTime();
        var best = null;
        for (var i = entries.length - 1; i >= 0; i--) {
            var diff = (targetMs - entries[i].date.getTime()) / 86400000;
            if (diff >= 0 && diff <= tolerance) {
                best = entries[i];
                break;
            }
            if (diff > tolerance) break;
        }
        return best;
    }

    /**
     * Format a number as percentage string with color class.
     */
    function formatReturn(val) {
        if (val === null || val === undefined || isNaN(val)) {
            return { text: '—', className: 'neutral' };
        }
        var pct = (val * 100).toFixed(2) + '%';
        if (val > 0) return { text: '+' + pct, className: 'positive' };
        if (val < 0) return { text: pct, className: 'negative' };
        return { text: pct, className: 'neutral' };
    }

    /**
     * Format a number with commas and fixed decimals.
     */
    function formatNumber(num, decimals) {
        if (num === null || num === undefined || isNaN(num)) return '—';
        decimals = decimals !== undefined ? decimals : 2;
        return num.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    /**
     * Detect data frequency from sorted entries array.
     */
    function detectFrequency(entries) {
        if (entries.length < 2) return 'Unknown';
        var gaps = [];
        for (var i = 1; i < Math.min(entries.length, 50); i++) {
            var diffDays = (entries[i].date - entries[i - 1].date) / 86400000;
            gaps.push(diffDays);
        }
        var median = gaps.sort(function (a, b) { return a - b; })[Math.floor(gaps.length / 2)];
        if (median <= 3) return 'Daily';
        if (median <= 10) return 'Weekly';
        if (median <= 45) return 'Monthly';
        return 'Irregular';
    }

    return {
        parseDate: parseDate,
        formatDate: formatDate,
        formatDateShort: formatDateShort,
        subtractPeriod: subtractPeriod,
        findClosest: findClosest,
        formatReturn: formatReturn,
        formatNumber: formatNumber,
        detectFrequency: detectFrequency
    };
})();
