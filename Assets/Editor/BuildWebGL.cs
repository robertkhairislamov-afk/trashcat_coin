using UnityEditor;
using UnityEditor.AddressableAssets;
using UnityEditor.AddressableAssets.Settings;
using UnityEditor.AddressableAssets.Build;
using UnityEngine;

public class BuildScript
{
    public static void Build()
    {
        // Step 1: Build Addressables first
        Debug.Log("Building Addressable Assets...");
        AddressableAssetSettings.CleanPlayerContent(
            AddressableAssetSettingsDefaultObject.Settings.ActivePlayerDataBuilder);
        AddressableAssetSettings.BuildPlayerContent(out AddressablesPlayerBuildResult aaResult);
        if (!string.IsNullOrEmpty(aaResult.Error))
        {
            Debug.LogError("Addressables build failed: " + aaResult.Error);
            EditorApplication.Exit(1);
            return;
        }
        Debug.Log("Addressables built successfully");

        // Step 2: Build WebGL player
        string[] scenes = {
            "Assets/Scenes/Start.unity",
            "Assets/Scenes/Main.unity",
            "Assets/Scenes/Shop.unity"
        };

        var options = new BuildPlayerOptions
        {
            scenes = scenes,
            locationPathName = "Build/WebGL",
            target = BuildTarget.WebGL,
            options = BuildOptions.None
        };

        var report = BuildPipeline.BuildPlayer(options);
        if (report.summary.result != UnityEditor.Build.Reporting.BuildResult.Succeeded)
        {
            Debug.LogError("Build failed: " + report.summary.totalErrors + " errors");
            EditorApplication.Exit(1);
        }
        else
        {
            Debug.Log("Build succeeded: " + report.summary.outputPath);
        }
    }
}
