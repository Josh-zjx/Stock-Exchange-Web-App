'use strict';
const express = require('express');
const path = require('path');
const { STATUS_CODES } = require('http');

try {
    process.loadEnvFile();
} catch (e) {
    if (e.code !== 'ENOENT') throw e;
}
const { TIINGO_TOKEN, NEWS_API_KEY, PORT = 8080, STATIC_DIR = 'frontend/dist/frontend' } = process.env;
if (!TIINGO_TOKEN || !NEWS_API_KEY) {
    console.error('TIINGO_TOKEN and NEWS_API_KEY must be set; see .env.example');
    process.exit(1);
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const UPSTREAM_TIMEOUT = 10 * 1000;
// Intraday prices sit minutes apart; consecutive sessions sit a night apart
const SESSION_GAP = 6 * HOUR;
// The intraday chart renders timestamps as UTC but is meant to read as US Pacific time
const PACIFIC_STANDARD_OFFSET = -8 * HOUR;

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.expose = true;
    }
}

const cache = new Map();
const MAX_CACHE_ENTRIES = 1000;

/** GETs JSON, sharing each response (including one still in flight) for `ttl` ms. */
function getJson(url, ttl = 0) {
    const key = url.href;
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.response;

    const response = fetchJson(url);
    if (ttl > 0) {
        cache.delete(key);
        cache.set(key, { response, expires: Date.now() + ttl });
        if (cache.size > MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value);
        response.catch(() => cache.get(key)?.response === response && cache.delete(key));
    }
    return response;
}

async function fetchJson(url) {
    const res = await fetch(url, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT) });
    if (res.status === 404) throw new HttpError(404, 'Not found');
    if (!res.ok) throw new HttpError(502, `Upstream responded ${res.status}`);
    return res.json();
}

function withQuery(base, params) {
    const url = new URL(base);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    return url;
}

const tiingo = (resource, params, ttl) =>
    getJson(withQuery(`https://api.tiingo.com${resource}`, { ...params, token: TIINGO_TOKEN }), ttl);

const tickerOf = req => encodeURIComponent(req.params.ticker.toUpperCase());

const isoDate = time => new Date(time).toISOString().slice(0, 10);

function queryParam(req, name) {
    const value = req.query[name];
    if (typeof value !== 'string' || !value) throw new HttpError(400, `Missing query parameter: ${name}`);
    return value;
}

/** Trims intraday prices spanning several days down to the most recent session. */
function latestSession(prices) {
    const times = prices.map(price => Date.parse(price.date));
    let start = times.length - 1;
    while (start > 0 && times[start] - times[start - 1] < SESSION_GAP) start--;
    return prices.slice(Math.max(start, 0));
}

const api = express.Router();

api.get('/stocks/:ticker', async (req, res) => {
    res.json(await tiingo(`/tiingo/daily/${tickerOf(req)}`, {}, 6 * HOUR));
});

api.get('/stocks/:ticker/intraday', async (req, res) => {
    // A week of history guarantees a session even across weekends and holidays
    const startDate = isoDate(Date.now() - 7 * DAY);
    const prices = await tiingo(`/iex/${tickerOf(req)}/prices`, { startDate, resampleFreq: '4min' }, MINUTE);
    res.json(latestSession(prices).map(price => [Date.parse(price.date) + PACIFIC_STANDARD_OFFSET, price.close]));
});

api.get('/stocks/:ticker/history', async (req, res) => {
    const startDate = new Date();
    startDate.setUTCFullYear(startDate.getUTCFullYear() - 2);
    const prices = await tiingo(`/tiingo/daily/${tickerOf(req)}/prices`, { startDate: isoDate(startDate), resampleFreq: 'daily' }, HOUR);
    res.json(prices.map(price => [Date.parse(price.date), price.open, price.high, price.low, price.close, price.volume]));
});

api.get('/stocks/:ticker/news', async (req, res) => {
    const url = withQuery('https://newsapi.org/v2/everything', { apiKey: NEWS_API_KEY, q: req.params.ticker });
    const { articles } = await getJson(url, 10 * MINUTE);
    res.json(articles.map(article => ({
        url: article.url,
        title: article.title,
        description: article.description,
        source: article.source?.name,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
    })));
});

api.get('/quotes', async (req, res) => {
    res.json(await tiingo('/iex/', { tickers: queryParam(req, 'tickers') }));
});

api.get('/search', async (req, res) => {
    res.json(await tiingo('/tiingo/utilities/search', { query: queryParam(req, 'q') }, HOUR));
});

api.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

const app = express();
const staticDir = path.resolve(__dirname, STATIC_DIR);

app.use('/api', api);
app.use(express.static(staticDir));
// Client-side routes such as /details/AAPL must survive a page reload
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
});

// Anything that is not ours to report (timeouts, malformed upstream payloads) is an upstream failure
app.use((err, req, res, next) => {
    const status = err.status ?? (err.name === 'TimeoutError' ? 504 : 502);
    if (status >= 500) console.error(err);
    res.status(status).json({ error: err.expose ? err.message : STATUS_CODES[status] });
});

if (require.main === module) {
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}

module.exports = app;
