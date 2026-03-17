"""
Mock backend for Trash Dash webhooks.
Logs all requests to console with colors.
Run: python mock_backend.py
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import uuid
import time

# In-memory storage
devices = {}
stats = {"registers": 0, "coin_batches": 0, "total_coins": 0, "game_overs": 0}

class MockHandler(BaseHTTPRequestHandler):

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Id')

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def _read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        if length == 0:
            return {}
        return json.loads(self.rfile.read(length))

    def _respond(self, code, data):
        self.send_response(code)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_POST(self):
        path = self.path.rstrip('/')
        body = self._read_body()
        auth = self.headers.get('Authorization', '')
        session = self.headers.get('X-Session-Id', '')

        if path.endswith('/register'):
            self._handle_register(body)
        elif path.endswith('/coin'):
            self._handle_coin(body, auth, session)
        elif path.endswith('/over'):
            self._handle_game_over(body, auth, session)
        else:
            self._respond(404, {"error": "not found"})

    def _handle_register(self, body):
        h = body.get('hash', 'unknown')
        stats["registers"] += 1

        if h in devices:
            token = devices[h]
            print(f"\n{'='*60}")
            print(f"  REGISTER (returning existing)")
            print(f"  hash:  {h}")
            print(f"  token: {token[:20]}...")
            print(f"{'='*60}")
        else:
            token = "tok_" + uuid.uuid4().hex
            devices[h] = token
            print(f"\n{'='*60}")
            print(f"  REGISTER (new device)")
            print(f"  hash:  {h}")
            print(f"  token: {token[:20]}...")
            print(f"{'='*60}")

        self._respond(200, {"token": token})

    def _handle_coin(self, body, auth, session):
        events = body.get('events', [])
        total = body.get('totalCoins', 0)
        score = body.get('totalScore', 0)
        stats["coin_batches"] += 1
        stats["total_coins"] += total

        regular = sum(1 for e in events if not e.get('isPremium'))
        premium = sum(1 for e in events if e.get('isPremium'))

        print(f"\n  COINS  | batch #{stats['coin_batches']} | "
              f"{regular} regular + {premium} premium = {len(events)} events | "
              f"total coins: {stats['total_coins']} | score: {score}")

        self._respond(200, {"ok": True})

    def _handle_game_over(self, body, auth, session):
        stats["game_overs"] += 1
        print(f"\n{'*'*60}")
        print(f"  GAME OVER #{stats['game_overs']}")
        print(f"  Score:    {body.get('finalScore', '?')}")
        print(f"  Coins:    {body.get('coins', '?')} regular, {body.get('premium', '?')} premium")
        print(f"  Distance: {body.get('distance', '?')}m")
        print(f"  Duration: {body.get('duration', '?')}s")
        print(f"  Session:  {body.get('sessionId', session)}")
        print(f"{'*'*60}")

        self._respond(200, {"ok": True})

    def log_message(self, format, *args):
        pass  # suppress default access log

print("Mock backend running on http://localhost:8081")
print("Waiting for game events...\n")
HTTPServer(('', 8081), MockHandler).serve_forever()
