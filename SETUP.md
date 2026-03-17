# WebBridge Integration — Setup Guide

## 1. Add WebBridge to the scene

1. Open **Assets/Scenes/Main.unity** in Unity
2. Create an empty GameObject: `GameObject > Create Empty`
3. Rename it to **WebBridge**
4. Drag `Assets/Scripts/WebBridge.cs` onto it (Add Component)
5. Save the scene (`Ctrl+S`)

The WebBridge singleton initializes automatically via `GameManager.OnEnable()`.

## 2. Configure endpoints

Edit `Assets/Plugins/WebGL/WebBridge.jslib`, lines 7-11:

```javascript
window.WEBHOOK_CONFIG = window.WEBHOOK_CONFIG || {
    registerEndpoint: 'https://your-api.com/register',
    coinEndpoint:     'https://your-api.com/game/coin',
    gameOverEndpoint: 'https://your-api.com/game/over',
};
```

Alternatively, override in your hosting page's `<script>` before Unity loads:

```html
<script>
window.WEBHOOK_CONFIG = {
    registerEndpoint: 'https://your-api.com/register',
    coinEndpoint:     'https://your-api.com/game/coin',
    gameOverEndpoint: 'https://your-api.com/game/over',
};
</script>
```

## 3. Build for WebGL

1. `File > Build Settings`
2. Select **WebGL** platform, click **Switch Platform** (if not already)
3. Click **Build** and choose an output folder
4. Wait for the build to complete

## 4. Run locally

```bash
cd /path/to/build/folder
python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser.

## 5. Auth flow

```
Browser starts -> WebBridge.Awake() generates deviceHash (GUID, persisted in PlayerPrefs)
               -> GameManager.OnEnable() calls WebBridge.InitAuth()
               -> JS_InitAuth checks localStorage['trashdash_auth_token']
                  -> If cached: restores token, ready immediately
                  -> If not: POST /register -> receives token -> caches in localStorage
               -> All subsequent webhook calls include Authorization: Bearer <token>
```

## 6. API data formats

### POST /register

Request:
```json
{
    "hash": "a1b2c3d4e5f6789012345678abcdef01"
}
```

Response:
```json
{
    "token": "eyJhbGciOi..."
}
```

### POST /game/coin (batched, every 10 coins or 3 seconds)

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
X-Session-Id: sess_m1abc23_4def56ghi
```

Body:
```json
{
    "type": "coin_batch",
    "events": [
        { "coins": 5, "score": 0, "isPremium": false, "timestamp": "2026-03-17T12:00:01.123Z" },
        { "coins": 6, "score": 0, "isPremium": false, "timestamp": "2026-03-17T12:00:01.456Z" },
        { "coins": 1, "score": 0, "isPremium": true,  "timestamp": "2026-03-17T12:00:02.789Z" }
    ],
    "totalCoins": 12,
    "totalScore": 0,
    "timestamp": "2026-03-17T12:00:03.000Z"
}
```

### POST /game/over

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
X-Session-Id: sess_m1abc23_4def56ghi
```

Body:
```json
{
    "type": "game_over",
    "finalScore": 1842,
    "coins": 47,
    "premium": 3,
    "distance": 312.5,
    "duration": 95,
    "timestamp": "2026-03-17T12:01:35.000Z"
}
```

## 7. Files modified

| File | Change |
|------|--------|
| `Assets/Plugins/WebGL/WebBridge.jslib` | **NEW** — JS bridge with auth + webhooks |
| `Assets/Scripts/WebBridge.cs` | **NEW** — C# singleton wrapper |
| `Assets/Scripts/GameManager/GameManager.cs` | +1 line: `WebBridge.InitAuth()` in OnEnable |
| `Assets/Scripts/Characters/CharacterCollider.cs` | +2 lines: `WebBridge.SendCoin()` on coin pickup |
| `Assets/Scripts/GameManager/GameOverState.cs` | +5 lines: `WebBridge.SendGameOver()` in FinishRun |

No gameplay, UI, models, animations, or other scripts were touched.
