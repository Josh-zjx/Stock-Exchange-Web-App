'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const staticDir = fs.mkdtempSync(path.join(os.tmpdir(), 'static-'));
fs.writeFileSync(path.join(staticDir, 'index.html'), '<app-root></app-root>');
Object.assign(process.env, { TIINGO_TOKEN: 'tiingo-token', NEWS_API_KEY: 'news-key', STATIC_DIR: staticDir });
const app = require('../app');

// Every upstream call is answered by the current test's `upstream(url)`
const request = global.fetch;
let upstream;
let upstreamCalls;
global.fetch = async url => {
    upstreamCalls.push(new URL(url));
    const { status = 200, body } = await upstream(new URL(url));
    return new Response(JSON.stringify(body), { status });
};

let server;
let base;
before(() => new Promise(resolve => {
    server = app.listen(0, () => {
        base = `http://localhost:${server.address().port}`;
        resolve();
    });
}));
after(() => server.close());

async function get(route, answer) {
    upstream = answer;
    upstreamCalls = [];
    const res = await request(base + route);
    const type = res.headers.get('content-type') ?? '';
    return { status: res.status, body: type.includes('json') ? await res.json() : await res.text() };
}

const ok = body => () => ({ body });
const HOUR = 3600 * 1000;

test('intraday keeps only the latest session, shifted to Pacific time', async () => {
    const friday = ['2026-10-09T19:52:00Z', '2026-10-09T19:56:00Z'];
    const monday = ['2026-10-12T13:30:00Z', '2026-10-12T13:34:00Z'];
    const prices = [...friday, ...monday].map((date, i) => ({ date, close: 100 + i }));

    const { status, body } = await get('/api/stocks/aapl/intraday', ok(prices));

    assert.equal(status, 200);
    assert.deepEqual(body, monday.map((date, i) => [Date.parse(date) - 8 * HOUR, 102 + i]));
    const [call] = upstreamCalls;
    assert.equal(call.pathname, '/iex/AAPL/prices');
    assert.equal(call.searchParams.get('resampleFreq'), '4min');
    assert.equal(call.searchParams.get('startDate'), new Date(Date.now() - 7 * 24 * HOUR).toISOString().slice(0, 10));
});

test('intraday with no prices is an empty series', async () => {
    assert.deepEqual(await get('/api/stocks/EMPTY/intraday', ok([])), { status: 200, body: [] });
});

test('a malformed upstream payload is a 502 and the server keeps serving', async () => {
    const rateLimited = ok({ detail: 'Error: You have run over your hourly request allocation.' });
    for (const resource of ['intraday', 'history', 'news']) {
        const { status, body } = await get(`/api/stocks/RATE/${resource}`, rateLimited);
        assert.equal(status, 502, resource);
        assert.deepEqual(body, { error: 'Bad Gateway' });
    }
    assert.equal((await get('/api/stocks/ALIVE', ok({ ticker: 'ALIVE' }))).status, 200);
});

test('upstream 404 is passed on as 404', async () => {
    const { status, body } = await get('/api/stocks/NOPE', () => ({ status: 404, body: { detail: 'Not found.' } }));
    assert.equal(status, 404);
    assert.deepEqual(body, { error: 'Not found' });
});

test('other upstream failures are 502, and a timeout is 504', async () => {
    assert.equal((await get('/api/quotes?tickers=X', () => ({ status: 429, body: {} }))).status, 502);
    const timeout = () => { throw new DOMException('timed out', 'TimeoutError'); };
    assert.equal((await get('/api/quotes?tickers=X', timeout)).status, 504);
});

test('history is reshaped into OHLCV tuples from two years back', async () => {
    const bar = { date: '2026-10-12T00:00:00.000Z', open: 1, high: 2, low: 0.5, close: 1.5, volume: 100 };
    const { body } = await get('/api/stocks/AAPL/history', ok([bar]));
    assert.deepEqual(body, [[Date.parse(bar.date), 1, 2, 0.5, 1.5, 100]]);
    const startDate = upstreamCalls[0].searchParams.get('startDate');
    assert.equal(startDate.slice(0, 4), String(new Date().getUTCFullYear() - 2));
});

test('news keeps articles that have no source', async () => {
    const articles = [{ url: 'u', title: 't', source: null }, { url: 'v', title: 'w', source: { name: 'Reuters' } }];
    const { body } = await get('/api/stocks/NEWS/news', ok({ status: 'ok', articles }));
    assert.deepEqual(body.map(article => article.source), [undefined, 'Reuters']);
    assert.equal(upstreamCalls[0].searchParams.get('q'), 'NEWS');
});

test('quotes are fetched for all tickers in one upstream call, uncached', async () => {
    const quotes = [{ ticker: 'AAPL', last: 1 }, { ticker: 'MSFT', last: 2 }];
    for (let i = 0; i < 2; i++) {
        const { body } = await get('/api/quotes?tickers=AAPL,MSFT', ok(quotes));
        assert.deepEqual(body, quotes);
        assert.equal(upstreamCalls.length, 1);
        assert.equal(upstreamCalls[0].searchParams.get('tickers'), 'AAPL,MSFT');
    }
});

test('metadata is cached, failures are not', async () => {
    assert.equal((await get('/api/stocks/FLAKY', () => ({ status: 500, body: {} }))).status, 502);
    assert.equal((await get('/api/stocks/FLAKY', ok({ ticker: 'FLAKY' }))).status, 200);
    const cached = await get('/api/stocks/flaky', ok({ ticker: 'OTHER' }));
    assert.deepEqual(cached.body, { ticker: 'FLAKY' });
    assert.equal(upstreamCalls.length, 0);
});

test('missing query parameters are a 400', async () => {
    assert.deepEqual(await get('/api/search', ok([])), { status: 400, body: { error: 'Missing query parameter: q' } });
    assert.equal((await get('/api/quotes', ok([]))).status, 400);
});

test('client-side routes serve the app, unknown API routes do not', async () => {
    assert.deepEqual(await get('/details/AAPL'), { status: 200, body: '<app-root></app-root>' });
    assert.deepEqual(await get('/'), { status: 200, body: '<app-root></app-root>' });
    assert.deepEqual(await get('/api/nope'), { status: 404, body: { error: 'Not found' } });
});
