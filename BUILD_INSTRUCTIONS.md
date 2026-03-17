# Build Instructions — Trash Dash WebGL

## Prerequisites

- Unity 2021.3.x (LTS) or Unity 6000.x with WebGL Build Support module installed
- Project: `EndlessRunnerSampleGame`

## Step 1: Open the Project

Open the project folder in Unity Hub. If prompted to upgrade, confirm the upgrade.

## Step 2: Add WebBridge to the Scene

1. Open `Assets/Scenes/Main.unity`
2. Check if a GameObject with `WebBridge.cs` component exists
3. If not — create one:
   - `GameObject > Create Empty`
   - Rename to **WebBridgeManager**
   - In Inspector: `Add Component > WebBridge`
4. Save the scene (`Ctrl+S`)

## Step 3: Configure Build Settings

1. `File > Build Settings`
2. Select **WebGL** in the platform list
3. Click **Switch Platform** (if not already on WebGL)
4. Verify all three scenes are in the build list:
   - `Scenes/Start` (index 0)
   - `Scenes/Main` (index 1)
   - `Scenes/Shop` (index 2)

## Step 4: Player Settings

1. Click **Player Settings** in Build Settings window
2. **Resolution and Presentation**:
   - Default Canvas Width: `960`
   - Default Canvas Height: `600`
3. **Publishing Settings**:
   - Compression Format: `Disabled` (for local testing) or `Gzip` (for production)
   - Data Caching: enabled for production
4. **Other Settings**:
   - Scripting Define Symbols should include `URP_COMPATIBILITY_MODE` (for Unity 6)

## Step 5: Build

1. Click **Build** in Build Settings
2. Select output folder (e.g. `Build/WebGL`)
3. Wait for the build to complete (5-15 minutes)

The output will contain:
```
Build/WebGL/
├── index.html          ← main page
├── Build/
│   ├── WebGL.data.gz   ← game assets
│   ├── WebGL.framework.js.gz
│   ├── WebGL.loader.js
│   └── WebGL.wasm.gz   ← compiled game code
├── StreamingAssets/     ← Addressable bundles
└── TemplateData/       ← UI template assets
```

## Step 6: Configure Endpoints

Open `index.html` and add this block **before** `</head>`:

```html
<script>
window.WEBHOOK_CONFIG = {
    registerEndpoint: 'https://YOUR-DOMAIN/register',
    coinEndpoint:     'https://YOUR-DOMAIN/game/coin',
    gameOverEndpoint: 'https://YOUR-DOMAIN/game/over',
};
</script>
```

Replace `YOUR-DOMAIN` with your actual backend URL.

If no config is provided, the game defaults to `https://api.example.com/...` (will fail silently — game still playable).

## Step 7: Run Locally

### Option A: Simple Python server (if build uses Gzip compression)

Create `server.py` in the build folder:

```python
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class Handler(SimpleHTTPRequestHandler):
    GZ_TYPES = {
        '.wasm.gz': 'application/wasm',
        '.js.gz':   'application/javascript',
        '.data.gz': 'application/octet-stream',
    }

    def do_GET(self):
        path = self.translate_path(self.path)
        for ext, ctype in self.GZ_TYPES.items():
            if path.endswith(ext) and os.path.isfile(path):
                f = open(path, 'rb')
                self.send_response(200)
                self.send_header('Content-Type', ctype)
                self.send_header('Content-Encoding', 'gzip')
                self.send_header('Content-Length', str(os.fstat(f.fileno()).st_size))
                self.end_headers()
                self.copyfile(f, self.wfile)
                f.close()
                return
        super().do_GET()

os.chdir(os.path.dirname(os.path.abspath(__file__)))
HTTPServer(('', 8080), Handler).serve_forever()
```

Run: `python server.py` → open `http://localhost:8080`

### Option B: Simple server (if build uses Disabled compression)

```bash
cd Build/WebGL
python3 -m http.server 8080
```

Open `http://localhost:8080`

## Step 8: Deploy to Production

Upload the entire build folder to any static hosting:

- **Vercel**: `npx vercel --prod`
- **Netlify**: drag-and-drop the folder
- **Nginx**: copy to web root, add gzip headers config
- **GitHub Pages**: push to `gh-pages` branch

For Gzip-compressed builds, ensure your hosting serves `.gz` files with correct `Content-Encoding: gzip` and `Content-Type` headers.

## Controls

- **Arrow keys**: Left/Right to change lanes, Up to jump, Down to slide
- **Click anywhere** on the start screen to begin
