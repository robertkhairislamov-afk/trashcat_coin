# Quick Test — Verify Webhooks Without a Backend

## Using webhook.site

[webhook.site](https://webhook.site) is a free service that captures and displays HTTP requests in real time.

### Step 1: Get a Test URL

1. Go to https://webhook.site
2. You will see a unique URL like: `https://webhook.site/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
3. Copy this URL

### Step 2: Configure the Game

Open `index.html` in the build folder. Add this block **before** `</head>`:

```html
<script>
window.WEBHOOK_CONFIG = {
    registerEndpoint: 'https://webhook.site/YOUR-UNIQUE-ID/register',
    coinEndpoint:     'https://webhook.site/YOUR-UNIQUE-ID/coin',
    gameOverEndpoint: 'https://webhook.site/YOUR-UNIQUE-ID/over',
};
</script>
```

Replace `YOUR-UNIQUE-ID` with the ID from your webhook.site URL.

> Note: webhook.site returns 200 by default, but without `{"token":"..."}` in the response. The game will log a warning about missing token but will continue to send requests. To test the full auth flow, use the "Edit Response" feature on webhook.site to return `{"token":"test123"}` for the /register endpoint.

### Step 3: Run the Game

```bash
cd Build/WebGL
python server.py
```

Open `http://localhost:8080`

### Step 4: Play and Observe

1. **On game load** — you should see a `/register` request on webhook.site:
   ```json
   {
     "hash": "a1b2c3d4e5f6789012345678abcdef01"
   }
   ```

2. **While playing** (collecting coins) — `/coin` requests appear every 10 coins or 3 seconds:
   ```json
   {
     "type": "coin_batch",
     "events": [...],
     "totalCoins": 12,
     "totalScore": 450
   }
   ```

3. **On death** — a `/over` request with final stats:
   ```json
   {
     "type": "game_over",
     "finalScore": 1842,
     "coins": 47,
     "premium": 3,
     "distance": 312.5,
     "duration": 95
   }
   ```

### What to Verify

- [ ] `/register` is called once on game start
- [ ] `Authorization: Bearer <token>` header is present on `/coin` and `/over` requests
- [ ] `X-Session-Id` header is present and consistent within a session
- [ ] `Content-Type: application/json` header is present on all requests
- [ ] Coin batches contain correct event data
- [ ] Game over contains all fields: finalScore, coins, premium, distance, duration
- [ ] Token is cached — on page reload, `/register` is NOT called again (token restored from localStorage)

### Alternative: RequestBin

If webhook.site is unavailable, use https://requestbin.com (same concept):

1. Create a new bin
2. Use the bin URL as your endpoint
3. Play the game
4. Check the bin for captured requests

### Clearing Cached Token

To force a new `/register` call, open browser DevTools (F12) → Application → Local Storage → localhost:8080 → delete `trashdash_auth_token`.

### Browser Console

Open DevTools (F12) → Console to see WebBridge logs:

```
[WebBridge] InitAuth hash=a1b2c3d4...
[WebBridge] Registered, token cached
[WebBridge] GameOver sent: {"type":"game_over",...}
```

If you see `[WebBridge] Token restored from localStorage` — the token was cached from a previous session.
