# Stock Exchange Web App

An Angular frontend (`frontend/`) served by an Express backend (`app.js`) that proxies
[Tiingo](https://www.tiingo.com) market data and [NewsAPI](https://newsapi.org) headlines.

## Configuration

The backend reads its API keys from the environment, or from a `.env` file next to `app.js`:

```sh
cp .env.example .env   # then fill in TIINGO_TOKEN and NEWS_API_KEY
```

`.env` files are git-ignored. Never commit keys.

## Development

```sh
npm install && npm --prefix frontend install
npm start                     # API on http://localhost:8080
npm --prefix frontend start   # app on http://localhost:4200, proxying /api to :8080
npm test                      # backend tests
```

The frontend is Angular 10, which predates Node 17's OpenSSL 3. On newer Node versions,
build and serve it with `NODE_OPTIONS=--openssl-legacy-provider`.

## API

| Route | Returns |
| --- | --- |
| `GET /api/stocks/:ticker` | Company profile |
| `GET /api/stocks/:ticker/intraday` | `[time, close]` pairs for the latest trading session |
| `GET /api/stocks/:ticker/history` | `[time, open, high, low, close, volume]` daily candles for two years |
| `GET /api/stocks/:ticker/news` | News articles |
| `GET /api/quotes?tickers=A,B` | Latest quotes for several tickers at once |
| `GET /api/search?q=` | Ticker suggestions |

Errors are JSON `{ "error": … }`. An unknown ticker is a 404, an upstream failure is a 502
and an upstream timeout is a 504. Every other path serves the frontend, so client-side routes survive a reload.

## Deployment (App Engine)

`deploy/` is the App Engine bundle. Rebuild it from the sources and deploy:

```sh
npm run bundle          # builds the frontend, copies it and app.js into deploy/
cp .env deploy/.env     # uploaded with the app, but never committed
cd deploy && gcloud app deploy
```
