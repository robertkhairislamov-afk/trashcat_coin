mergeInto(LibraryManager.library, {

    $WebBridge: {
        _initialized: false,
        _authState: null,
        _coinBatch: null,
        _coinBatchTimer: null,
        _sessionStart: 0,

        _ensureInit: function () {
            if (WebBridge._initialized) return;
            WebBridge._initialized = true;

            if (typeof window === 'undefined') return;

            window.WEBHOOK_CONFIG = window.WEBHOOK_CONFIG || {
                registerEndpoint: 'https://api.example.com/register',
                coinEndpoint:     'https://api.example.com/game/coin',
                gameOverEndpoint: 'https://api.example.com/game/over',
            };

            WebBridge._authState = {
                token: null,
                deviceHash: null,
                sessionId: null,
                ready: false,
                registering: false,
            };
            WebBridge._coinBatch = [];
            WebBridge._sessionStart = Date.now();

            // Batch flush timer — every 3 seconds
            WebBridge._coinBatchTimer = setInterval(function () {
                WebBridge._flushCoinBatch();
            }, 3000);
        },

        _generateSessionId: function () {
            return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
        },

        _sleep: function (ms) {
            return new Promise(function (resolve) { setTimeout(resolve, ms); });
        },

        _post: function (url, body, attempt) {
            attempt = attempt || 0;
            var maxRetries = 3;
            var state = WebBridge._authState;

            var headers = { 'Content-Type': 'application/json' };
            if (state.token) {
                headers['Authorization'] = 'Bearer ' + state.token;
            }
            if (state.sessionId) {
                headers['X-Session-Id'] = state.sessionId;
            }

            return fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            }).then(function (res) {
                if (res.status === 401 && state.deviceHash) {
                    return WebBridge._register(state.deviceHash).then(function () {
                        headers['Authorization'] = 'Bearer ' + state.token;
                        return fetch(url, {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify(body),
                        });
                    });
                }
                if (!res.ok && attempt < maxRetries) {
                    var delay = Math.pow(2, attempt) * 500;
                    return WebBridge._sleep(delay).then(function () {
                        return WebBridge._post(url, body, attempt + 1);
                    });
                }
                return res;
            }).catch(function (err) {
                if (attempt < maxRetries) {
                    var delay = Math.pow(2, attempt) * 500;
                    return WebBridge._sleep(delay).then(function () {
                        return WebBridge._post(url, body, attempt + 1);
                    });
                }
                console.error('[WebBridge] POST failed after retries:', url, err);
            });
        },

        _register: function (deviceHash) {
            var state = WebBridge._authState;

            if (state.registering) {
                return new Promise(function (resolve) {
                    var check = setInterval(function () {
                        if (!state.registering) {
                            clearInterval(check);
                            resolve();
                        }
                    }, 100);
                });
            }

            state.registering = true;
            var url = window.WEBHOOK_CONFIG.registerEndpoint;

            return fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hash: deviceHash }),
            })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data && data.token) {
                    state.token = data.token;
                    state.ready = true;
                    try { localStorage.setItem('trashdash_auth_token', data.token); } catch (e) {}
                    console.log('[WebBridge] Registered, token cached');
                } else {
                    console.warn('[WebBridge] /register response missing token:', data);
                }
            })
            .catch(function (err) {
                console.error('[WebBridge] Registration failed:', err);
            })
            .finally(function () {
                state.registering = false;
            });
        },

        _flushCoinBatch: function () {
            if (!WebBridge._coinBatch || WebBridge._coinBatch.length === 0) return;
            if (!WebBridge._authState || !WebBridge._authState.ready) return;

            var events = WebBridge._coinBatch.splice(0);

            var totalCoins = 0;
            var totalScore = 0;
            for (var i = 0; i < events.length; i++) {
                totalCoins += events[i].coins;
                if (events[i].score > totalScore) totalScore = events[i].score;
            }

            var payload = {
                type: 'coin_batch',
                events: events,
                totalCoins: totalCoins,
                totalScore: totalScore,
                timestamp: new Date().toISOString(),
            };

            WebBridge._post(window.WEBHOOK_CONFIG.coinEndpoint, payload);
        },
    },

    JS_InitAuth__deps: ['$WebBridge'],
    JS_InitAuth: function (deviceHashPtr) {
        WebBridge._ensureInit();
        var state = WebBridge._authState;
        if (!state) return;

        var deviceHash = UTF8ToString(deviceHashPtr);
        state.deviceHash = deviceHash;
        state.sessionId = WebBridge._generateSessionId();
        WebBridge._sessionStart = Date.now();

        console.log('[WebBridge] InitAuth hash=' + deviceHash.substring(0, 8) + '...');

        var cached = null;
        try { cached = localStorage.getItem('trashdash_auth_token'); } catch (e) {}

        if (cached) {
            state.token = cached;
            state.ready = true;
            console.log('[WebBridge] Token restored from localStorage');
        } else {
            WebBridge._register(deviceHash);
        }
    },

    JS_SendCoinEvent__deps: ['$WebBridge'],
    JS_SendCoinEvent: function (coins, score, isPremium) {
        WebBridge._ensureInit();
        if (!WebBridge._coinBatch) return;

        WebBridge._coinBatch.push({
            coins: coins,
            score: score,
            isPremium: isPremium !== 0,
            timestamp: new Date().toISOString(),
        });

        if (WebBridge._coinBatch.length >= 10) {
            WebBridge._flushCoinBatch();
        }
    },

    JS_SendGameOver__deps: ['$WebBridge'],
    JS_SendGameOver: function (finalScore, coins, premium, distance) {
        WebBridge._ensureInit();
        WebBridge._flushCoinBatch();

        var state = WebBridge._authState;
        if (!state || !state.ready) {
            console.warn('[WebBridge] GameOver called but auth not ready');
            return;
        }

        var duration = Math.floor((Date.now() - WebBridge._sessionStart) / 1000);

        var payload = {
            type: 'game_over',
            finalScore: finalScore,
            coins: coins,
            premium: premium,
            distance: distance,
            duration: duration,
            timestamp: new Date().toISOString(),
        };

        WebBridge._post(window.WEBHOOK_CONFIG.gameOverEndpoint, payload);
        console.log('[WebBridge] GameOver sent:', JSON.stringify(payload));
    },

    JS_FlushBatch__deps: ['$WebBridge'],
    JS_FlushBatch: function () {
        WebBridge._ensureInit();
        WebBridge._flushCoinBatch();
    },

});
