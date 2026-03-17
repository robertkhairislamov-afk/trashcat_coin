using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
#if UNITY_ANALYTICS
using UnityEngine.Analytics;
#endif
#if UNITY_PURCHASING
using UnityEngine.Purchasing;
#endif

public class StartButton : MonoBehaviour
{
    private bool m_Started = false;

    void Update()
    {
        if (m_Started) return;

        // Click or tap anywhere to start
        if (Input.GetMouseButtonDown(0) || (Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Began))
        {
            StartGame();
        }
    }

    public void StartGame()
    {
        if (m_Started) return;
        m_Started = true;

        if (PlayerData.instance.ftueLevel == 0)
        {
            PlayerData.instance.ftueLevel = 1;
            PlayerData.instance.Save();
#if UNITY_ANALYTICS
            AnalyticsEvent.FirstInteraction("start_button_pressed");
#endif
        }

#if UNITY_PURCHASING
        var module = StandardPurchasingModule.Instance();
#endif
        SceneManager.LoadScene("main");
    }
}
