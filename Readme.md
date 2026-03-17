# Trash Dash — WebGL Endless Runner с Webhook-интеграцией

Форк [Unity EndlessRunnerSampleGame](https://github.com/Unity-Technologies/EndlessRunnerSampleGame) с добавленной системой авторизации по deviceHash и вебхуками для отслеживания игровых событий (сбор монет, конец игры).

---

## Требования

| Компонент | Версия | Зачем |
|-----------|--------|-------|
| **Unity** | 2021.3.x LTS или 6000.x (Unity 6) | Сборка проекта |
| **WebGL Build Support** | модуль Unity | Билд под браузер (установить через Unity Hub → Installs → Add Modules) |
| **Python 3.x** | 3.8+ | Локальный сервер для тестирования |
| **Браузер** | Chrome / Firefox / Edge (современный) | Запуск WebGL-игры |
| **Git** | любая версия | Клонирование репозитория |

> Unity Hub → Installs → шестерёнка у вашей версии Unity → Add Modules → галочка **WebGL Build Support** → Install

---

## Быстрый старт

### 1. Клонировать

```bash
git clone https://github.com/robertkhairislamov-afk/trashcat_coin.git
cd trashcat_coin
```

### 2. Открыть в Unity

Открыть папку проекта через Unity Hub. При первом открытии Unity мигрирует пакеты — это нормально, подождите.

### 3. Собрать WebGL билд

**Вариант A — через Unity Editor:**
1. `File → Build Settings → WebGL → Switch Platform`
2. Нажать `Build` → выбрать папку `Build/WebGL`
3. Подождать 5-15 минут

**Вариант B — через командную строку (headless):**
```bash
# Windows
"C:\Program Files\Unity\Hub\Editor\<версия>\Editor\Unity.exe" ^
  -batchmode -nographics -quit ^
  -projectPath . -buildTarget WebGL ^
  -executeMethod BuildScript.Build ^
  -logFile build.log

# macOS/Linux
/path/to/Unity -batchmode -nographics -quit \
  -projectPath . -buildTarget WebGL \
  -executeMethod BuildScript.Build \
  -logFile build.log
```

### 4. Настроить эндпоинты бэкенда

Открыть `Build/WebGL/index.html`, добавить **перед** `</head>`:

```html
<script>
window.WEBHOOK_CONFIG = {
    registerEndpoint: 'https://ВАШ-ДОМЕН/register',
    coinEndpoint:     'https://ВАШ-ДОМЕН/game/coin',
    gameOverEndpoint: 'https://ВАШ-ДОМЕН/game/over',
};
</script>
```

Если не указать — по умолчанию `https://api.example.com/...` (не будет работать, но игра будет играться).

### 5. Запустить локально

```bash
cd Build/WebGL

# Терминал 1 — игровой сервер
python server.py
# → http://localhost:8080

# Терминал 2 — мок-бэкенд (для тестирования вебхуков)
python mock_backend.py
# → слушает на порту 8081, логирует все запросы в консоль
```

Открыть **http://localhost:8080** в браузере.

### 6. Управление

| Клавиша | Действие |
|---------|----------|
| Клик мышкой | Старт игры |
| ← → | Смена полосы |
| ↑ | Прыжок |
| ↓ | Подкат (слайд) |

---

## Как работает Webhook-система

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Unity C#   │────▶│  WebBridge   │────▶│   Backend   │
│  GameLogic  │     │   .jslib     │     │   (ваш)     │
└─────────────┘     └──────────────┘     └─────────────┘
                          │
                    ┌─────┴─────┐
                    │localStorage│
                    │ (token)    │
                    └───────────┘
```

### Поток авторизации

1. При первом запуске генерируется `deviceHash` (GUID, хранится в PlayerPrefs)
2. `POST /register {hash}` → бэкенд возвращает `{token}`
3. Token кешируется в `localStorage['trashdash_auth_token']`
4. Все последующие запросы отправляются с заголовком `Authorization: Bearer <token>`
5. При ответе 401 — автоматическая перерегистрация и повтор запроса
6. Retry с exponential backoff (3 попытки: 500мс, 1с, 2с)

### Поток игровых событий

- **Монеты** — батчатся по 10 штук или каждые 3 секунды → `POST /game/coin`
- **Game Over** — отправляется при смерти персонажа → `POST /game/over`
- Перед game over — принудительный flush оставшихся монет

---

## Тестирование вебхуков

### С мок-бэкендом (рекомендуется)

Для тестирования без настоящего бэкенда — добавьте в `index.html`:

```html
<script>
window.WEBHOOK_CONFIG = {
    registerEndpoint: 'http://localhost:8081/register',
    coinEndpoint:     'http://localhost:8081/game/coin',
    gameOverEndpoint: 'http://localhost:8081/game/over',
};
</script>
```

Запустите `python mock_backend.py` — в терминале увидите:

```
============================================================
  REGISTER (new device)
  hash:  e94ca50e26f14d9792ec2158a004f99d
  token: tok_aeb1dd8dfd4f4872...
============================================================

  COINS  | batch #1 | 10 regular + 0 premium = 10 events | total coins: 55

************************************************************
  GAME OVER #1
  Score:    624
  Coins:    306 regular, 0 premium
  Distance: 608.8m
  Duration: 61s
************************************************************
```

### С webhook.site

См. [QUICK_TEST.md](QUICK_TEST.md) — бесплатный способ без запуска своего сервера.

### В консоли браузера (F12)

```
[WebBridge] InitAuth hash=a1b2c3d4...
[WebBridge] Registered, token cached
[WebBridge] GameOver sent: {"type":"game_over","finalScore":624,...}
```

---

## Требования к бэкенду

Бэкенд должен реализовать 3 эндпоинта. Подробная спецификация: **[API_SPEC.md](API_SPEC.md)**

| Эндпоинт | Метод | Тело запроса | Ответ |
|----------|-------|-------------|-------|
| `/register` | POST | `{hash: "..."}` | `{token: "..."}` |
| `/game/coin` | POST | `{type:"coin_batch", events:[...]}` | `{ok: true}` |
| `/game/over` | POST | `{type:"game_over", finalScore, coins, premium, distance, duration}` | `{ok: true}` |

**Обязательно:**
- CORS: разрешить Origin домена где хостится игра
- При невалидном/отсутствующем токене вернуть 401
- Все эндпоинты принимают `Content-Type: application/json`

---

## Деплой на продакшн

1. Собрать WebGL билд
2. Прописать реальные URL в `index.html` (WEBHOOK_CONFIG)
3. Залить папку `Build/WebGL/` на хостинг:
   - **Vercel**: `npx vercel --prod`
   - **Netlify**: drag-and-drop папки
   - **VPS/nginx**: скопировать в web root

Для gzip-сжатых билдов хостинг должен отдавать `.gz` файлы с правильными заголовками:
- `Content-Type: application/wasm` для `.wasm.gz`
- `Content-Type: application/javascript` для `.js.gz`
- `Content-Encoding: gzip` для всех `.gz`

---

## Структура добавленных файлов

| Файл | Назначение |
|------|-----------|
| `Assets/Plugins/WebGL/WebBridge.jslib` | JS-мост: auth, fetch с retry, батчинг монет |
| `Assets/Scripts/WebBridge.cs` | C# синглтон-обёртка (авто-создаётся) |
| `Assets/Editor/BuildWebGL.cs` | Headless билд-скрипт (Addressables + WebGL) |
| `Build/WebGL/server.py` | Локальный HTTP-сервер для gzip-билдов |
| `Build/WebGL/mock_backend.py` | Мок-бэкенд для тестирования |
| `API_SPEC.md` | Спецификация API эндпоинтов |
| `BUILD_INSTRUCTIONS.md` | Пошаговая инструкция сборки |
| `QUICK_TEST.md` | Тестирование через webhook.site |
| `SETUP.md` | Настройка WebBridge и конфигурация |

---

## Лицензия

Оригинальный проект — Unity Technologies.
