/**
 * Chart rendering using Chart.js.
 */
var Charts = (function () {
    'use strict';

    var priceChart = null;
    var returnsBarChart = null;

    var COLORS = [
        '#0f3460', '#e94560', '#0a8754', '#f39c12',
        '#8e44ad', '#2980b9', '#d35400', '#1abc9c',
        '#c0392b', '#2c3e50'
    ];

    /**
     * Create or update the price trend line chart.
     * commodity: name string
     * entries: array of {date, value}
     * period: '3M','6M','1Y','3Y','ALL'
     */
    function renderPriceChart(commodity, entries, period) {
        var canvas = document.getElementById('price-chart');
        if (!canvas) return;

        // Filter by period
        var filtered = entries;
        if (period !== 'ALL' && entries.length > 0) {
            var latest = entries[entries.length - 1].date;
            var periodMap = { '3M': '3M', '6M': '6M', '1Y': '12M', '3Y': '3Y' };
            var cutoff = Utils.subtractPeriod(latest, periodMap[period] || '12M');
            filtered = entries.filter(function (e) { return e.date >= cutoff; });
        }

        var labels = filtered.map(function (e) { return Utils.formatDateShort(e.date); });
        var data = filtered.map(function (e) { return e.value; });

        if (priceChart) {
            priceChart.destroy();
        }

        priceChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: commodity,
                    data: data,
                    borderColor: COLORS[0],
                    backgroundColor: 'rgba(15, 52, 96, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: filtered.length > 100 ? 0 : 2,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: {
                        callbacks: {
                            title: function (items) { return items[0].label; },
                            label: function (item) {
                                return commodity + ': ' + Utils.formatNumber(item.raw);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxTicksLimit: 12,
                            maxRotation: 45
                        }
                    },
                    y: {
                        ticks: {
                            callback: function (value) {
                                return Utils.formatNumber(value);
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Render a grouped bar chart comparing period returns across commodities.
     */
    function renderReturnsBarChart(commodityReturns) {
        var canvas = document.getElementById('returns-bar-chart');
        if (!canvas) return;

        var names = Object.keys(commodityReturns);
        var periods = ['1M', '3M', '6M', '12M'];

        var datasets = periods.map(function (period, idx) {
            return {
                label: period,
                data: names.map(function (name) {
                    var val = commodityReturns[name][period];
                    return val !== null && val !== undefined ? (val * 100) : null;
                }),
                backgroundColor: COLORS[idx % COLORS.length] + 'CC',
                borderColor: COLORS[idx % COLORS.length],
                borderWidth: 1
            };
        });

        if (returnsBarChart) {
            returnsBarChart.destroy();
        }

        returnsBarChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: names,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function (item) {
                                var val = item.raw;
                                if (val === null) return item.dataset.label + ': N/A';
                                return item.dataset.label + ': ' + val.toFixed(2) + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function (value) { return value + '%'; }
                        },
                        title: {
                            display: true,
                            text: 'Return (%)'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }

    return {
        renderPriceChart: renderPriceChart,
        renderReturnsBarChart: renderReturnsBarChart,
        COLORS: COLORS
    };
})();
