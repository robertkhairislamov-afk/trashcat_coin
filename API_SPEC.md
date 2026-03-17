# API Specification — Trash Dash WebGL Webhooks

## Authentication Flow

```
[Game Start] → POST /register {hash} → {token}
            → token cached in localStorage
            → all requests use Authorization: Bearer <token>
            → on 401: re-register with same hash, retry request
```

---

## POST /register — Device Registration

One-time device registration. Returns auth token for all subsequent requests.

### Request

```
POST /register
Content-Type: application/json
```

```json
{
  "hash": "a1b2c3d4e5f6789012345678abcdef01"
}
```

| Field | Type   | Description                                      |
|-------|--------|--------------------------------------------------|
| hash  | string | Unique device ID, generated once, persisted in localStorage |

### Response 200

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logic

- If `hash` already exists in the database — return existing valid token
- If `hash` is new — create a record, generate token, return it
- Token should not expire (or expire after a very long period, e.g. 1 year)
- Repeated requests with the same `hash` must always return a working token
- No rate limiting required — called once per session

---

## POST /game/coin — Coin Batch Events

Batched coin collection events. Sent every 10 coins or every 3 seconds (whichever comes first).

### Request

```
POST /game/coin
Authorization: Bearer <token>
Content-Type: application/json
X-Session-Id: sess_m1abc23_4def56ghi
```

```json
{
  "type": "coin_batch",
  "events": [
    {
      "coins": 15,
      "score": 1250,
      "isPremium": false,
      "timestamp": "2026-03-17T12:00:01.123Z"
    },
    {
      "coins": 16,
      "score": 1300,
      "isPremium": false,
      "timestamp": "2026-03-17T12:00:02.456Z"
    },
    {
      "coins": 1,
      "score": 1350,
      "isPremium": true,
      "timestamp": "2026-03-17T12:00:03.789Z"
    }
  ],
  "totalCoins": 32,
  "totalScore": 1350,
  "timestamp": "2026-03-17T12:00:03.800Z"
}
```

| Field      | Type    | Description                                    |
|------------|---------|------------------------------------------------|
| type       | string  | Always `"coin_batch"`                          |
| events     | array   | Individual coin pickup events                  |
| events[].coins | int | Cumulative coin count at time of pickup        |
| events[].score | int | Current score at time of pickup (0 if not tracked) |
| events[].isPremium | bool | `true` for premium currency (anchovies), `false` for regular (fishbones) |
| events[].timestamp | string | ISO 8601 timestamp of the pickup          |
| totalCoins | int     | Sum of coins in this batch                     |
| totalScore | int     | Highest score in this batch                    |
| timestamp  | string  | ISO 8601 timestamp of the batch flush          |

### Response 200

```json
{
  "ok": true
}
```

### Response 401

```json
{
  "error": "unauthorized"
}
```

On 401, the client automatically re-registers via `/register` with the same `deviceHash` and retries the request.

### Frequency

- Every 10 coins collected, OR
- Every 3 seconds (timer-based flush), OR
- Immediately before game over (forced flush)

---

## POST /game/over — Game Over

Sent when the player dies. The remaining coin batch is flushed first (separate request), then this request is sent.

### Request

```
POST /game/over
Authorization: Bearer <token>
Content-Type: application/json
X-Session-Id: sess_m1abc23_4def56ghi
```

```json
{
  "type": "game_over",
  "finalScore": 5840,
  "coins": 47,
  "premium": 3,
  "distance": 892.5,
  "duration": 124,
  "deviceHash": "a1b2c3d4e5f6789012345678abcdef01",
  "sessionId": "sess_m1abc23_4def56ghi",
  "timestamp": "2026-03-17T12:02:04.000Z"
}
```

| Field      | Type   | Description                                       |
|------------|--------|---------------------------------------------------|
| type       | string | Always `"game_over"`                              |
| finalScore | int    | Final score at death                              |
| coins      | int    | Total regular coins (fishbones) collected this run |
| premium    | int    | Total premium coins (anchovies) collected this run |
| distance   | float  | Distance traveled in meters                       |
| duration   | int    | Game duration in seconds                          |
| deviceHash | string | Same hash used for registration                   |
| sessionId  | string | Unique session ID for this game run               |
| timestamp  | string | ISO 8601 timestamp                                |

### Response 200

```json
{
  "ok": true
}
```

---

## Common Headers

All authenticated requests include:

| Header          | Value                        | Description               |
|-----------------|------------------------------|---------------------------|
| Authorization   | `Bearer <token>`             | Token from /register      |
| Content-Type    | `application/json`           | Always JSON               |
| X-Session-Id    | `sess_<timestamp>_<random>`  | Unique per game launch    |

---

## Backend Requirements

- **CORS**: Allow `Origin` header from the domain where the game is hosted. For local testing, allow `http://localhost:8080`
- **JSON**: All endpoints accept and return `application/json`
- **401 handling**: Return 401 with `{"error": "unauthorized"}` when token is invalid or missing. The client will automatically re-register and retry
- **deviceHash stability**: The hash is stable across sessions — stored in `localStorage` under key `device_hash` (PlayerPrefs) and `trashdash_auth_token` (token cache)
- **sessionId**: Unique per game launch (format: `sess_<base36_timestamp>_<random>`), sent via `X-Session-Id` header and in game_over body
- **Idempotency**: Game over events may be sent twice in edge cases — use `sessionId` + `timestamp` for deduplication
