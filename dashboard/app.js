// ─── Constants ──────────────────────────────────────────────────────────────

const FRED_SERIES = {
    WALCL:         { name: 'Fed Balance Sheet', unit: 'USD Millions', divisor: 1e6 },
    M2SL:          { name: 'US M2 Supply',      unit: 'USD Billions', divisor: 1e3 },
    ECBASSETSW:    { name: 'ECB Balance Sheet',  unit: 'EUR Millions', divisor: 1e6 },
    JPNASSETS:     { name: 'Bank of Japan',      unit: 'JPY Billions', divisor: 1 },
    MYAGM2CNM189N: { name: 'China M2',           unit: 'CNY Billions', divisor: 1e3 },
    MYAGM2AUM189N: { name: 'Australia M2',       unit: 'AUD Millions', divisor: 1e6 },
    DEXUSEU:       { name: 'USD/EUR Rate',       fx: true },
    DEXJPUS:       { name: 'JPY/USD Rate',       fx: true },
    DEXCHUS:       { name: 'CNY/USD Rate',       fx: true },
    DEXUSAL:       { name: 'USD/AUD Rate',       fx: true },
};

const RELEASE_SCHEDULES = {
    WALCL:         { frequency: 'weekly',  dayOfWeek: 4, hour: 16, minute: 30, tz: 'America/New_York' },
    M2SL:          { frequency: 'weekly',  dayOfWeek: 2, hour: 13, minute: 0,  tz: 'America/New_York' },
    ECBASSETSW:    { frequency: 'weekly',  dayOfWeek: 2, hour: 10, minute: 0,  tz: 'Europe/Berlin' },
    JPNASSETS:     { frequency: 'monthly', approxDay: 22 },
    MYAGM2CNM189N: { frequency: 'monthly', approxDay: 12 },
    MYAGM2AUM189N: { frequency: 'monthly', approxDay: 28 },
};

const DATASET_COLORS = {
    us:     '#3B82F6',
    eu:     '#10B981',
    cn:     '#EF4444',
    jp:     '#F59E0B',
    total:  '#94A3B8',
    walcl:  '#3B82F6',
    m2:     '#60A5FA',
    au_aud: '#14B8A6',
    au_usd: '#06B6D4',
    sp500:  '#A78BFA',
    nasdaq: '#FB923C',
    btc:    '#F97316',
};

const CACHE_PREFIX = 'liq_';
const CACHE_VERSION = 'v2';

// ─── State ──────────────────────────────────────────────────────────────────

let fredApiKey = '';
let allData = {};
let charts = {};
let chartRanges = { global: 5, us: 5, au: 5 };

// ─── Utilities ──────────────────────────────────────────────────────────────

function formatTrillion(v) {
    if (v == null || isNaN(v)) return '—';
    if (Math.abs(v) >= 1) return '$' + v.toFixed(2) + 'T';
    return '$' + (v * 1000).toFixed(0) + 'B';
}

function formatPrice(v) {
    if (v == null || isNaN(v)) return '—';
    return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatBTC(v) {
    if (v == null || isNaN(v)) return '—';
    return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function toMonthly(observations) {
    const monthly = {};
    for (const obs of observations) {
        if (obs.value === '.') continue;
        const key = obs.date.slice(0, 7);
        monthly[key] = parseFloat(obs.value);
    }
    return monthly;
}

function getMonthKeys(data) {
    const allKeys = new Set();
    for (const series of Object.values(data)) {
        if (series && typeof series === 'object') {
            for (const k of Object.keys(series)) allKeys.add(k);
        }
    }
    return [...allKeys].sort();
}

function forwardFill(monthlyObj, allMonths) {
    const result = {};
    let last = null;
    for (const m of allMonths) {
        if (monthlyObj[m] !== undefined) last = monthlyObj[m];
        if (last !== null) result[m] = last;
    }
    return result;
}

function filterByRange(months, rangeYears) {
    if (rangeYears === 'max') return months;
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - rangeYears);
    const cutoffStr = cutoff.toISOString().slice(0, 7);
    return months.filter(m => m >= cutoffStr);
}

function setLoadingStatus(msg) {
    const el = document.getElementById('loading-status');
    if (el) el.textContent = msg;
}

// ─── Cache ──────────────────────────────────────────────────────────────────

function getCacheKey(id) { return CACHE_PREFIX + CACHE_VERSION + '_' + id; }

function getCache(id) {
    try {
        const raw = localStorage.getItem(getCacheKey(id));
        if (!raw) return null;
        return JSON.parse(raw);
    } catch { return null; }
}

function saveCache(id, data) {
    const schedule = RELEASE_SCHEDULES[id];
    const entry = {
        data,
        fetchedAt: Date.now(),
        lastDataPointDate: data.length ? data[data.length - 1].date : null,
        nextExpectedRelease: schedule ? getNextRelease(id) : null,
    };
    try {
        localStorage.setItem(getCacheKey(id), JSON.stringify(entry));
    } catch { /* storage full */ }
}

// ─── Release Schedule ───────────────────────────────────────────────────────

function getNextRelease(seriesId) {
    const s = RELEASE_SCHEDULES[seriesId];
    if (!s) return null;
    const now = new Date();

    if (s.frequency === 'weekly') {
        const target = new Date(now);
        const diff = (s.dayOfWeek - now.getDay() + 7) % 7;
        target.setDate(now.getDate() + (diff === 0 && now.getHours() >= (s.hour || 0) ? 7 : diff));
        target.setHours(s.hour || 0, s.minute || 0, 0, 0);
        return target.getTime();
    }

    if (s.frequency === 'monthly') {
        const target = new Date(now.getFullYear(), now.getMonth() + 1, s.approxDay || 15);
        if (target.getTime() < now.getTime()) {
            target.setMonth(target.getMonth() + 1);
        }
        return target.getTime();
    }

    return null;
}

function shouldFetch(seriesId) {
    const cached = getCache(seriesId);
    if (!cached) return true;
    const now = Date.now();
    const next = cached.nextExpectedRelease;
    if (!next) return (now - cached.fetchedAt) > 6 * 3600 * 1000;
    if (now < next) return false;
    if (now > next + 30 * 60 * 1000) return true;
    return false;
}

// ─── FRED Fetch ─────────────────────────────────────────────────────────────

async function fetchFred(seriesId) {
    const url = new URL('https://api.stlouisfed.org/fred/series/observations');
    url.searchParams.set('series_id', seriesId);
    url.searchParams.set('api_key', fredApiKey);
    url.searchParams.set('file_type', 'json');
    url.searchParams.set('observation_start', '2005-01-01');
    url.searchParams.set('units', 'lin');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`FRED ${seriesId}: ${res.status}`);
    const json = await res.json();
    return (json.observations || []).filter(o => o.value !== '.');
}

async function loadFredSeries(seriesId, force = false) {
    if (!force && !shouldFetch(seriesId)) {
        const c = getCache(seriesId);
        return c ? c.data : [];
    }
    setLoadingStatus(`Fetching ${FRED_SERIES[seriesId]?.name || seriesId}...`);
    const data = await fetchFred(seriesId);
    saveCache(seriesId, data);
    return data;
}

// ─── Asset Data Fetch ───────────────────────────────────────────────────────

async function fetchBitcoin() {
    const cached = getCache('BTC');
    if (cached && (Date.now() - cached.fetchedAt) < 3600 * 1000) return cached.data;

    setLoadingStatus('Fetching Bitcoin data...');
    const url = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=max&interval=daily';
    const res = await fetch(url);
    if (!res.ok) throw new Error('CoinGecko: ' + res.status);
    const json = await res.json();
    const monthly = {};
    for (const [ts, price] of json.prices) {
        const d = new Date(ts);
        const key = d.toISOString().slice(0, 7);
        monthly[key] = price;
    }
    saveCache('BTC', json.prices);
    return json.prices;
}

async function fetchYahoo(symbol) {
    const cacheId = 'YF_' + symbol;
    const cached = getCache(cacheId);
    if (cached && (Date.now() - cached.fetchedAt) < 3600 * 1000) return cached.data;

    setLoadingStatus(`Fetching ${symbol}...`);
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1mo&range=20y`;
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(yahooUrl);

    try {
        const res = await fetch(proxyUrl);
        const json = await res.json();
        const parsed = JSON.parse(json.contents);
        const result = parsed.chart.result[0];
        const timestamps = result.timestamp;
        const closes = result.indicators.quote[0].close;
        const data = timestamps.map((ts, i) => [ts * 1000, closes[i]]).filter(d => d[1] != null);
        saveCache(cacheId, data);
        return data;
    } catch (e) {
        console.warn('Yahoo fetch failed for', symbol, e);
        return cached ? cached.data : [];
    }
}

function assetToMonthly(priceArray) {
    const monthly = {};
    for (const [ts, price] of priceArray) {
        const d = new Date(ts);
        const key = d.toISOString().slice(0, 7);
        monthly[key] = price;
    }
    return monthly;
}

// ─── Data Loading ───────────────────────────────────────────────────────────

async function loadAllData(force = false) {
    const fredIds = Object.keys(FRED_SERIES);
    const fredResults = await Promise.all(
        fredIds.map(id => loadFredSeries(id, force).catch(e => {
            console.warn('Failed to load', id, e);
            const c = getCache(id);
            return c ? c.data : [];
        }))
    );
    const fredData = {};
    fredIds.forEach((id, i) => { fredData[id] = toMonthly(fredResults[i]); });

    const [btcRaw, sp500Raw, nasdaqRaw] = await Promise.all([
        fetchBitcoin().catch(() => []),
        fetchYahoo('^GSPC').catch(() => []),
        fetchYahoo('^NDX').catch(() => []),
    ]);

    const btc = assetToMonthly(btcRaw);
    const sp500 = assetToMonthly(sp500Raw);
    const nasdaq = assetToMonthly(nasdaqRaw);

    const fxEur = fredData.DEXUSEU || {};
    const fxJpy = fredData.DEXJPUS || {};
    const fxCny = fredData.DEXCHUS || {};
    const fxAud = fredData.DEXUSAL || {};

    const allMonths = getMonthKeys({ ...fredData, btc, sp500, nasdaq });

    const ffFxEur = forwardFill(fxEur, allMonths);
    const ffFxJpy = forwardFill(fxJpy, allMonths);
    const ffFxCny = forwardFill(fxCny, allMonths);
    const ffFxAud = forwardFill(fxAud, allMonths);

    const usLiq = forwardFill(fredData.WALCL || {}, allMonths);
    const usM2  = forwardFill(fredData.M2SL || {}, allMonths);
    const ecbRaw = forwardFill(fredData.ECBASSETSW || {}, allMonths);
    const bojRaw = forwardFill(fredData.JPNASSETS || {}, allMonths);
    const cnyRaw = forwardFill(fredData.MYAGM2CNM189N || {}, allMonths);
    const audRaw = forwardFill(fredData.MYAGM2AUM189N || {}, allMonths);

    const toTrillions = (val, divisor) => val / divisor;

    const usTrillions = {};
    const euTrillions = {};
    const jpTrillions = {};
    const cnTrillions = {};
    const totalTrillions = {};
    const auAud = {};
    const auUsd = {};

    for (const m of allMonths) {
        const us = usLiq[m] != null ? usLiq[m] / 1e6 : null;
        const eu = (ecbRaw[m] != null && ffFxEur[m]) ? (ecbRaw[m] / 1e6) * ffFxEur[m] : null;
        const jp = (bojRaw[m] != null && ffFxJpy[m]) ? (bojRaw[m] / 1e3) / ffFxJpy[m] : null;
        const cn = (cnyRaw[m] != null && ffFxCny[m]) ? (cnyRaw[m] / 1e3) / ffFxCny[m] : null;

        usTrillions[m] = us;
        euTrillions[m] = eu;
        jpTrillions[m] = jp;
        cnTrillions[m] = cn;

        const parts = [us, eu, jp, cn].filter(v => v != null);
        totalTrillions[m] = parts.length > 0 ? parts.reduce((a, b) => a + b, 0) : null;

        auAud[m] = audRaw[m] != null ? audRaw[m] / 1e6 : null;
        auUsd[m] = (audRaw[m] != null && ffFxAud[m]) ? (audRaw[m] / 1e6) / ffFxAud[m] : null;
    }

    const usM2Trillions = {};
    const ffUsM2 = forwardFill(fredData.M2SL || {}, allMonths);
    for (const m of allMonths) {
        usM2Trillions[m] = ffUsM2[m] != null ? ffUsM2[m] / 1e3 : null;
    }

    const usFedTrillions = {};
    for (const m of allMonths) {
        usFedTrillions[m] = usLiq[m] != null ? usLiq[m] / 1e6 : null;
    }

    allData = {
        months: allMonths,
        global: { us: usTrillions, eu: euTrillions, jp: jpTrillions, cn: cnTrillions, total: totalTrillions },
        us: { walcl: usFedTrillions, m2: usM2Trillions },
        au: { au_aud: auAud, au_usd: auUsd },
        assets: { sp500: forwardFill(sp500, allMonths), nasdaq: forwardFill(nasdaq, allMonths), btc: forwardFill(btc, allMonths) },
    };
}

// ─── Chart Rendering ────────────────────────────────────────────────────────

function buildDatasets(chartId) {
    const months = allData.months;
    const range = chartRanges[chartId];
    const visibleMonths = filterByRange(months, range);

    const section = chartId === 'global' ? allData.global
                  : chartId === 'us' ? allData.us
                  : allData.au;

    const toggleContainer = document.getElementById(chartId + '-toggles');
    const activeToggles = new Set();
    const activeOverlays = new Set();
    toggleContainer.querySelectorAll('.toggle-btn').forEach(btn => {
        if (!btn.classList.contains('active')) return;
        if (btn.dataset.series) activeToggles.add(btn.dataset.series);
        if (btn.dataset.overlay) activeOverlays.add(btn.dataset.overlay);
    });

    const datasets = [];
    const labels = visibleMonths.map(m => m + '-15');

    for (const [key, data] of Object.entries(section)) {
        if (!activeToggles.has(key)) continue;
        datasets.push({
            label: key.toUpperCase(),
            data: visibleMonths.map(m => data[m] ?? null),
            borderColor: DATASET_COLORS[key],
            backgroundColor: DATASET_COLORS[key] + '18',
            borderWidth: key === 'total' ? 2.5 : 1.8,
            pointRadius: 0,
            pointHitRadius: 8,
            tension: 0.3,
            yAxisID: 'y',
            fill: chartId === 'global' && key !== 'total',
            spanGaps: true,
        });
    }

    for (const overlay of activeOverlays) {
        const data = allData.assets[overlay];
        if (!data) continue;
        datasets.push({
            label: overlay === 'sp500' ? 'S&P 500' : overlay === 'nasdaq' ? 'Nasdaq 100' : 'Bitcoin',
            data: visibleMonths.map(m => data[m] ?? null),
            borderColor: DATASET_COLORS[overlay],
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderDash: [6, 3],
            pointRadius: 0,
            pointHitRadius: 8,
            tension: 0.3,
            yAxisID: 'y1',
            spanGaps: true,
        });
    }

    return { labels, datasets, hasOverlay: activeOverlays.size > 0 };
}

function getChartOptions(chartId, hasOverlay) {
    const liqLabel = chartId === 'au' ? 'Liquidity (Trillions)' : 'Liquidity (USD Trillions)';

    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15,23,42,0.95)',
                titleColor: '#F1F5F9',
                bodyColor: '#CBD5E1',
                borderColor: '#334155',
                borderWidth: 1,
                padding: 12,
                titleFont: { family: "'IBM Plex Sans'", weight: '600' },
                bodyFont: { family: "'IBM Plex Mono'", size: 12 },
                callbacks: {
                    title(items) {
                        if (!items.length) return '';
                        const d = new Date(items[0].label);
                        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                    },
                    label(ctx) {
                        const yAxisID = ctx.dataset.yAxisID;
                        const val = ctx.parsed.y;
                        const label = ctx.dataset.label;
                        if (yAxisID === 'y1') {
                            if (label === 'Bitcoin') return `  ${label}: ${formatBTC(val)}`;
                            return `  ${label}: ${formatPrice(val)}`;
                        }
                        return `  ${label}: ${formatTrillion(val)}`;
                    },
                },
            },
            zoom: {
                pan: { enabled: true, mode: 'x' },
                zoom: {
                    drag: { enabled: true, backgroundColor: 'rgba(59,130,246,0.15)', borderColor: '#3B82F6', borderWidth: 1 },
                    mode: 'x',
                    onZoomComplete({ chart }) { chart.__zoomed = true; },
                },
            },
        },
        scales: {
            x: {
                type: 'time',
                time: { unit: 'month', displayFormats: { month: 'MMM yyyy' } },
                grid: { color: 'rgba(51,65,85,0.4)' },
                ticks: { color: '#64748B', font: { family: "'IBM Plex Mono'", size: 10 }, maxTicksLimit: 12 },
            },
            y: {
                type: 'linear',
                position: 'left',
                title: { display: true, text: liqLabel, color: '#64748B', font: { family: "'IBM Plex Sans'", size: 11 } },
                grid: { color: 'rgba(51,65,85,0.3)' },
                ticks: {
                    color: '#64748B',
                    font: { family: "'IBM Plex Mono'", size: 10 },
                    callback: v => formatTrillion(v),
                },
            },
            y1: {
                type: 'linear',
                position: 'right',
                display: hasOverlay,
                title: { display: hasOverlay, text: 'Asset Price', color: '#64748B', font: { family: "'IBM Plex Sans'", size: 11 } },
                grid: { drawOnChartArea: false },
                ticks: {
                    color: '#64748B',
                    font: { family: "'IBM Plex Mono'", size: 10 },
                    callback: v => formatPrice(v),
                },
            },
        },
    };
}

function renderChart(chartId) {
    const canvasId = chartId + '-chart';
    const { labels, datasets, hasOverlay } = buildDatasets(chartId);

    if (charts[chartId]) {
        charts[chartId].data.labels = labels;
        charts[chartId].data.datasets = datasets;
        charts[chartId].options.scales.y1.display = hasOverlay;
        charts[chartId].update('none');
        return;
    }

    const ctx = document.getElementById(canvasId).getContext('2d');
    charts[chartId] = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: getChartOptions(chartId, hasOverlay),
    });

    ctx.canvas.addEventListener('dblclick', () => {
        if (charts[chartId].__zoomed) {
            charts[chartId].resetZoom();
            charts[chartId].__zoomed = false;
        }
    });
}

function renderAllCharts() {
    renderChart('global');
    renderChart('us');
    renderChart('au');
}

// ─── Status Panel ───────────────────────────────────────────────────────────

function renderStatus() {
    const grid = document.getElementById('status-grid');
    if (!grid) return;

    const items = [
        { id: 'WALCL',         label: 'Fed Balance Sheet' },
        { id: 'ECBASSETSW',    label: 'ECB Balance Sheet' },
        { id: 'M2SL',          label: 'US M2' },
        { id: 'JPNASSETS',     label: 'Japan BOJ' },
        { id: 'MYAGM2CNM189N', label: 'China M2' },
        { id: 'MYAGM2AUM189N', label: 'Australia M2' },
    ];

    grid.innerHTML = items.map(item => {
        const cached = getCache(item.id);
        const schedule = RELEASE_SCHEDULES[item.id];
        const lastDate = cached?.lastDataPointDate || '—';
        const next = cached?.nextExpectedRelease || getNextRelease(item.id);

        let dotClass = 'amber';
        let nextStr = '';

        if (next) {
            const now = Date.now();
            const diff = next - now;
            const nextDate = new Date(next);
            nextStr = 'Next: ' + nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            if (schedule?.frequency === 'weekly') {
                if (diff > 24 * 3600 * 1000) dotClass = 'green';
                else if (diff > 0) dotClass = 'yellow';
                else dotClass = 'red';
            }
        }

        return `<div class="status-item">
            <span class="status-dot ${dotClass}"></span>
            <span class="status-name">${item.label}</span>
            <span class="status-date">${lastDate}</span>
            <span class="status-next">${nextStr}</span>
        </div>`;
    }).join('');
}

// ─── Event Wiring ───────────────────────────────────────────────────────────

function wireToggles() {
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const section = btn.closest('.chart-section');
            const chartId = section.querySelector('canvas').id.replace('-chart', '');
            renderChart(chartId);
        });
    });
}

function wireRangeButtons() {
    document.querySelectorAll('.range-group').forEach(group => {
        group.querySelectorAll('.range-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                group.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const section = btn.closest('.chart-section');
                const chartId = section.querySelector('canvas').id.replace('-chart', '');
                const range = btn.dataset.range;
                chartRanges[chartId] = range === 'max' ? 'max' : parseInt(range);

                if (charts[chartId]) {
                    charts[chartId].destroy();
                    delete charts[chartId];
                }
                renderChart(chartId);
            });
        });
    });
}

function wireStatusToggle() {
    const panel = document.getElementById('status-panel');
    const toggle = document.getElementById('status-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => panel.classList.toggle('collapsed'));
    }
}

function wireRefresh() {
    const btn = document.getElementById('refresh-btn');
    btn.addEventListener('click', async () => {
        btn.classList.add('refreshing');
        btn.disabled = true;
        try {
            await loadAllData(true);
            renderAllCharts();
            renderStatus();
        } catch (e) {
            console.error('Refresh failed:', e);
        } finally {
            btn.classList.remove('refreshing');
            btn.disabled = false;
        }
    });
}

// ─── API Key Flow ───────────────────────────────────────────────────────────

function getStoredApiKey() {
    return localStorage.getItem('fred_api_key') || '';
}

function showApiKeyModal() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('hidden');

    const modal = document.getElementById('api-key-modal');
    modal.style.display = 'flex';

    document.getElementById('api-key-submit').addEventListener('click', () => {
        const key = document.getElementById('api-key-input').value.trim();
        if (!key) return;
        localStorage.setItem('fred_api_key', key);
        fredApiKey = key;
        modal.style.display = 'none';
        if (overlay) overlay.classList.remove('hidden');
        initDashboard();
    });

    document.getElementById('api-key-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('api-key-submit').click();
    });
}

// ─── Init ───────────────────────────────────────────────────────────────────

async function initDashboard() {
    const overlay = document.getElementById('loading-overlay');

    try {
        setLoadingStatus('Loading data...');
        await loadAllData();
        renderAllCharts();
        renderStatus();

        wireToggles();
        wireRangeButtons();
        wireStatusToggle();
        wireRefresh();

        if (overlay) overlay.classList.add('hidden');
    } catch (e) {
        console.error('Dashboard init failed:', e);
        setLoadingStatus('Error: ' + e.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fredApiKey = getStoredApiKey();

    if (typeof CONFIG !== 'undefined' && CONFIG.FRED_API_KEY && CONFIG.FRED_API_KEY !== 'YOUR_FRED_API_KEY_HERE') {
        fredApiKey = CONFIG.FRED_API_KEY;
        localStorage.setItem('fred_api_key', fredApiKey);
    }

    if (!fredApiKey) {
        showApiKeyModal();
    } else {
        initDashboard();
    }
});
