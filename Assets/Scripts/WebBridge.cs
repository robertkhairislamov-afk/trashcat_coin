using UnityEngine;
using System.Runtime.InteropServices;

/// <summary>
/// Bridge between Unity C# and browser JavaScript (WebBridge.jslib).
/// Handles deviceHash auth registration and webhook events (coins, game over).
/// Singleton — add to a GameObject in the Main scene.
/// </summary>
public class WebBridge : MonoBehaviour
{
    public static WebBridge Instance { get; private set; }

#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")] private static extern void JS_InitAuth(string deviceHash);
    [DllImport("__Internal")] private static extern void JS_SendCoinEvent(int coins, int score, int isPremium);
    [DllImport("__Internal")] private static extern void JS_SendGameOver(int finalScore, int coins, int premium, float distance);
    [DllImport("__Internal")] private static extern void JS_FlushBatch();
#endif

    private string m_DeviceHash;

    void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;

        // In WebGL SystemInfo.deviceUniqueIdentifier is not reliable — use persisted GUID
        m_DeviceHash = PlayerPrefs.GetString("device_hash", "");
        if (string.IsNullOrEmpty(m_DeviceHash))
        {
            m_DeviceHash = System.Guid.NewGuid().ToString("N");
            PlayerPrefs.SetString("device_hash", m_DeviceHash);
            PlayerPrefs.Save();
        }
    }

    // ------------------------------------------------------------------
    // Public static API — safe to call from anywhere
    // ------------------------------------------------------------------

    private static void EnsureInstance()
    {
        if (Instance == null)
        {
            var go = new GameObject("WebBridge");
            Instance = go.AddComponent<WebBridge>();
        }
    }

    public static void InitAuth()
    {
        EnsureInstance();

#if UNITY_WEBGL && !UNITY_EDITOR
        JS_InitAuth(Instance.m_DeviceHash);
#else
        Debug.Log("[WebBridge] InitAuth (editor) hash=" + Instance.m_DeviceHash.Substring(0, 8) + "...");
#endif
    }

    public static void SendCoin(int coins, int score, bool isPremium)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        JS_SendCoinEvent(coins, score, isPremium ? 1 : 0);
#else
        Debug.Log("[WebBridge] SendCoin coins=" + coins + " score=" + score + " premium=" + isPremium);
#endif
    }

    public static void SendGameOver(int score, int coins, int premium, float distance)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        JS_FlushBatch();
        JS_SendGameOver(score, coins, premium, distance);
#else
        Debug.Log("[WebBridge] SendGameOver score=" + score + " coins=" + coins + " premium=" + premium + " dist=" + distance);
#endif
    }
}
