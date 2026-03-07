/**
 * Main application: handles CSV parsing, UI rendering, and event binding.
 */
(function () {
    'use strict';

    /* ---------- State ---------- */
    var commodityData = {}; // { name: [{date, value}, ...] }
    var commodityNames = [];

    /* ---------- DOM refs ---------- */
    var fileInput = document.getElementById('file-input');
    var dropZone = document.getElementById('drop-zone');
    var loadSampleLink = document.getElementById('load-sample');
    var uploadSection = document.getElementById('upload-section');
    var fileInfo = document.getElementById('file-info');
    var fileName = document.getElementById('file-name');
    var dataSummary = document.getElementById('data-summary');
    var clearBtn = document.getElementById('clear-data');
    var dashboard = document.getElementById('dashboard');
    var refreshBtn = document.getElementById('refresh-btn');
    var lastUpdated = document.getElementById('last-updated');
    var dataRange = document.getElementById('data-range');
    var chartCommodity = document.getElementById('chart-commodity');
    var chartPeriod = document.getElementById('chart-period');

    /* ---------- CSV Parsing ---------- */

    function parseCSV(csvText) {
        var result = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false
        });

        if (result.errors.length > 0) {
            console.warn('CSV parse warnings:', result.errors);
        }

        var headers = result.meta.fields;
        var dateCol = headers[0]; // first column is Date
        var commodityCols = headers.slice(1);

        var data = {};
        commodityCols.forEach(function (col) { data[col] = []; });

        result.data.forEach(function (row) {
            var dateStr = row[dateCol];
            var date = Utils.parseDate(dateStr);
            if (!date) return;

            commodityCols.forEach(function (col) {
                var raw = row[col];
                if (raw === undefined || raw === null || raw === '') return;
                var val = parseFloat(String(raw).replace(/,/g, ''));
                if (!isNaN(val)) {
                    data[col].push({ date: date, value: val });
                }
            });
        });

        // Sort each commodity by date
        commodityCols.forEach(function (col) {
            data[col].sort(function (a, b) { return a.date - b.date; });
        });

        // Remove empty commodities
        commodityCols.forEach(function (col) {
            if (data[col].length === 0) delete data[col];
        });

        return data;
    }

    /* ---------- Dashboard Rendering ---------- */

    function renderDashboard() {
        commodityNames = Object.keys(commodityData);
        if (commodityNames.length === 0) return;

        renderInfoBar();
        renderPeriodReturns();
        renderCalendarYearReturns();
        renderFinancialYearReturns();
        renderWeeklyMovement();
        renderVolatility();
        renderDrawdown();
        renderSummary();
        setupCharts();

        dashboard.classList.remove('hidden');
    }

    function renderInfoBar() {
        lastUpdated.textContent = '⏰ Last updated: ' + new Date().toLocaleString();
        var allDates = [];
        commodityNames.forEach(function (name) {
            commodityData[name].forEach(function (e) { allDates.push(e.date); });
        });
        allDates.sort(function (a, b) { return a - b; });
        if (allDates.length > 0) {
            dataRange.textContent = '📅 Data: ' + Utils.formatDateShort(allDates[0]) + ' → ' + Utils.formatDateShort(allDates[allDates.length - 1]);
        }
    }

    /* --- Period Returns Table --- */
    function renderPeriodReturns() {
        var tbody = document.querySelector('#period-returns-table tbody');
        tbody.innerHTML = '';

        var allReturns = {};

        commodityNames.forEach(function (name) {
            var ret = Returns.periodReturns(commodityData[name]);
            allReturns[name] = ret;

            var tr = document.createElement('tr');
            tr.innerHTML = '<td>' + escapeHtml(name) + '</td>';
            tr.innerHTML += '<td>' + Utils.formatNumber(ret.latestPrice) + '</td>';

            Returns.PERIODS.forEach(function (p) {
                var fmt = Utils.formatReturn(ret[p]);
                tr.innerHTML += '<td class="' + fmt.className + '">' + fmt.text + '</td>';
            });

            tbody.appendChild(tr);
        });

        // Render returns bar chart
        Charts.renderReturnsBarChart(allReturns);
    }

    /* --- Calendar Year Returns --- */
    function renderCalendarYearReturns() {
        var allCY = {};
        var allYears = new Set();

        commodityNames.forEach(function (name) {
            var cy = Returns.calendarYearReturns(commodityData[name]);
            allCY[name] = {};
            cy.forEach(function (r) {
                allCY[name][r.year] = r.return;
                allYears.add(r.year);
            });
        });

        var years = Array.from(allYears).sort();
        var thead = document.querySelector('#cy-returns-table thead');
        var tbody = document.querySelector('#cy-returns-table tbody');

        thead.innerHTML = '<tr><th>Commodity</th>' +
            years.map(function (y) { return '<th>' + y + '</th>'; }).join('') +
            '</tr>';

        tbody.innerHTML = '';
        commodityNames.forEach(function (name) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td>' + escapeHtml(name) + '</td>';
            years.forEach(function (y) {
                var fmt = Utils.formatReturn(allCY[name][y]);
                tr.innerHTML += '<td class="' + fmt.className + '">' + fmt.text + '</td>';
            });
            tbody.appendChild(tr);
        });
    }

    /* --- Financial Year Returns --- */
    function renderFinancialYearReturns() {
        var allFY = {};
        var allLabels = new Set();

        commodityNames.forEach(function (name) {
            var fy = Returns.financialYearReturns(commodityData[name]);
            allFY[name] = {};
            fy.forEach(function (r) {
                allFY[name][r.label] = r.return;
                allLabels.add(r.label);
            });
        });

        var labels = Array.from(allLabels).sort();
        var thead = document.querySelector('#fy-returns-table thead');
        var tbody = document.querySelector('#fy-returns-table tbody');

        thead.innerHTML = '<tr><th>Commodity</th>' +
            labels.map(function (l) { return '<th>' + escapeHtml(l) + '</th>'; }).join('') +
            '</tr>';

        tbody.innerHTML = '';
        commodityNames.forEach(function (name) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td>' + escapeHtml(name) + '</td>';
            labels.forEach(function (l) {
                var fmt = Utils.formatReturn(allFY[name][l]);
                tr.innerHTML += '<td class="' + fmt.className + '">' + fmt.text + '</td>';
            });
            tbody.appendChild(tr);
        });
    }

    /* --- Weekly Movement --- */
    function renderWeeklyMovement() {
        var allWeekly = {};
        var maxWeeks = 12;
        var weekLabels = [];

        commodityNames.forEach(function (name) {
            var wm = Returns.weeklyMovement(commodityData[name], maxWeeks);
            allWeekly[name] = wm;
            if (wm.length > weekLabels.length) {
                weekLabels = wm.map(function (w, i) {
                    if (i === 0) return 'Current Week';
                    return Utils.formatDateShort(w.weekEnd);
                });
            }
        });

        var thead = document.querySelector('#weekly-movement-table thead');
        var tbody = document.querySelector('#weekly-movement-table tbody');

        thead.innerHTML = '<tr><th>Commodity</th>' +
            weekLabels.map(function (l) { return '<th>' + escapeHtml(l) + '</th>'; }).join('') +
            '</tr>';

        tbody.innerHTML = '';
        commodityNames.forEach(function (name) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td>' + escapeHtml(name) + '</td>';
            var wm = allWeekly[name];
            for (var i = 0; i < weekLabels.length; i++) {
                var val = wm[i] ? wm[i].return : null;
                var fmt = Utils.formatReturn(val);
                tr.innerHTML += '<td class="' + fmt.className + '">' + fmt.text + '</td>';
            }
            tbody.appendChild(tr);
        });
    }

    /* --- Volatility --- */
    function renderVolatility() {
        var tbody = document.querySelector('#volatility-table tbody');
        tbody.innerHTML = '';
        var MS_PER_DAY = 86400000;

        commodityNames.forEach(function (name) {
            var entries = commodityData[name];
            var latest = entries[entries.length - 1].date;

            function filterByDays(days) {
                var cutoff = new Date(latest.getTime() - days * MS_PER_DAY);
                return entries.filter(function (e) { return e.date >= cutoff; });
            }

            var vol30  = Returns.volatility(filterByDays(30));
            var vol90  = Returns.volatility(filterByDays(90));
            var vol1Y  = Returns.volatility(filterByDays(365));
            var volAll = Returns.volatility(entries);

            function fmtVol(v) {
                if (v === null || v === undefined || isNaN(v)) return '<td class="neutral">—</td>';
                return '<td>' + (v * 100).toFixed(2) + '%</td>';
            }

            var tr = document.createElement('tr');
            tr.innerHTML = '<td>' + escapeHtml(name) + '</td>' +
                fmtVol(vol30) + fmtVol(vol90) + fmtVol(vol1Y) + fmtVol(volAll);
            tbody.appendChild(tr);
        });
    }

    /* --- Max Drawdown --- */
    function renderDrawdown() {
        var tbody = document.querySelector('#drawdown-table tbody');
        tbody.innerHTML = '';

        commodityNames.forEach(function (name) {
            var dd = Returns.maxDrawdown(commodityData[name]);
            var tr = document.createElement('tr');

            if (!dd || dd.maxDrawdown === 0) {
                tr.innerHTML = '<td>' + escapeHtml(name) + '</td>' +
                    '<td class="neutral">—</td><td class="neutral">—</td>' +
                    '<td class="neutral">—</td><td class="neutral">—</td><td class="neutral">—</td>';
            } else {
                var fmt = Utils.formatReturn(-dd.maxDrawdown);
                tr.innerHTML = '<td>' + escapeHtml(name) + '</td>' +
                    '<td class="' + fmt.className + '">' + fmt.text + '</td>' +
                    '<td>' + Utils.formatDateShort(dd.peakDate)   + '</td>' +
                    '<td>' + Utils.formatNumber(dd.peakPrice)     + '</td>' +
                    '<td>' + Utils.formatDateShort(dd.troughDate) + '</td>' +
                    '<td>' + Utils.formatNumber(dd.troughPrice)   + '</td>';
            }
            tbody.appendChild(tr);
        });
    }

    /* --- Summary Stats --- */
    function renderSummary() {
        var tbody = document.querySelector('#summary-table tbody');
        tbody.innerHTML = '';

        commodityNames.forEach(function (name) {
            var s = Returns.summaryStats(commodityData[name]);
            var tr = document.createElement('tr');

            if (!s) {
                tr.innerHTML = '<td>' + escapeHtml(name) + '</td>' +
                    '<td class="neutral" colspan="8">—</td>';
            } else {
                var fmtHigh = Utils.formatReturn(s.pctFromHigh);
                var fmtLow  = Utils.formatReturn(s.pctFromLow);
                tr.innerHTML = '<td>' + escapeHtml(name)          + '</td>' +
                    '<td>'                + Utils.formatNumber(s.current) + '</td>' +
                    '<td>'                + Utils.formatNumber(s.min)     + '</td>' +
                    '<td>'                + Utils.formatNumber(s.max)     + '</td>' +
                    '<td>'                + Utils.formatNumber(s.avg)     + '</td>' +
                    '<td class="' + fmtHigh.className + '">' + fmtHigh.text + '</td>' +
                    '<td class="' + fmtLow.className  + '">' + fmtLow.text  + '</td>' +
                    '<td>'                + s.count                        + '</td>' +
                    '<td>'                + escapeHtml(s.frequency)        + '</td>';
            }
            tbody.appendChild(tr);
        });
    }

    /* --- Charts Setup --- */
    function setupCharts() {
        chartCommodity.innerHTML = '';
        commodityNames.forEach(function (name) {
            var opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            chartCommodity.appendChild(opt);
        });

        updatePriceChart();
    }

    function updatePriceChart() {
        var name = chartCommodity.value;
        var period = chartPeriod.value;
        if (name && commodityData[name]) {
            Charts.renderPriceChart(name, commodityData[name], period);
        }
    }

    /* ---------- Data Loading ---------- */

    function loadData(csvText, nameStr) {
        commodityData = parseCSV(csvText);
        commodityNames = Object.keys(commodityData);

        if (commodityNames.length === 0) {
            alert('No valid commodity data found. Please check your CSV format.');
            return;
        }

        // Update UI
        dropZone.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        fileName.textContent = '📄 File: ' + escapeHtml(nameStr);
        dataSummary.textContent = '✅ Loaded ' + commodityNames.length + ' commodities';

        renderDashboard();
    }

    function loadSampleData() {
        fetch('data/sample_commodity_prices.csv')
            .then(function (res) {
                if (!res.ok) throw new Error('Failed to load sample data');
                return res.text();
            })
            .then(function (text) {
                loadData(text, 'sample_commodity_prices.csv (built-in sample)');
            })
            .catch(function (err) {
                alert('Could not load sample data: ' + err.message);
            });
    }

    function clearData() {
        commodityData = {};
        commodityNames = [];
        dashboard.classList.add('hidden');
        fileInfo.classList.add('hidden');
        dropZone.classList.remove('hidden');
        fileInput.value = '';
    }

    /* ---------- Event Handlers ---------- */

    fileInput.addEventListener('change', function (e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
            loadData(ev.target.result, file.name);
        };
        reader.readAsText(file);
    });

    dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function () {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        var file = e.dataTransfer.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
            loadData(ev.target.result, file.name);
        };
        reader.readAsText(file);
    });

    loadSampleLink.addEventListener('click', function (e) {
        e.preventDefault();
        loadSampleData();
    });

    clearBtn.addEventListener('click', clearData);

    refreshBtn.addEventListener('click', function () {
        fileInput.click();
    });

    chartCommodity.addEventListener('change', updatePriceChart);
    chartPeriod.addEventListener('change', updatePriceChart);

    /* ---------- Helpers ---------- */

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

})();
