using UnityEngine;

public class OpenURL : MonoBehaviour
{
    public string websiteAddress;

    public void OpenURLOnClick()
    {
        // Disabled — prevents redirect to external site in WebGL build
        // Application.OpenURL(websiteAddress);
    }
}