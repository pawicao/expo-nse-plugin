# Expo NSE Plugin

An Expo config plugin for iOS that allows you to easily add a Notification Service Extension to your project.

A lightweight, unrestricted alternative for creating NSE with Expo under a standard MIT license. No vendor lock-in, no usage limitations - just clean code you can use anywhere.

# Scope

- creation of the Notification Service Extension target inside your project
- configurable Objective-C implementation and header files of the Notification Service Extension
- configurable App Group identifier, bridging your application with the Notification Service Extension
- automation of the Xcode `pbxproj` file modifications - build settings, groups, build phases and others
- an option to provide your own code to be injected into App Delegate's imports fragment and into its `didRegisterForRemoteNotificationsWithDeviceToken` function signature

> [!IMPORTANT]
> This config plugin does not serve as any kind of replacement of the [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) module. Instead, it builds on top of it. While **Expo NSE Plugin** exposes some configuration options that may overalp with the aforementioned module, ideally, you should use **Expo Notifications** to configure your app's notifications (both for iOS and Android) and then in case you need the NSE enhancement, add this config plugin to the mixture.

## Provisioning profiles

The developer team will be copied from your `app.json` into the Notification Service Extension, so if your Xcode project "Automatically manage[s] signing" this may be sufficient to sign it.  
Otherwise, this plugin **does nothing else** related to the signing process and does not automate the process of choosing the provisioning profile for the NSE target. For this purpose it's probably best if you use Expo Application Services and its [multitarget configuration](https://docs.expo.dev/app-signing/local-credentials/#multi-target-project).

# Installation and usage

## Add the package to your npm dependencies

```
npx expo install expo-nse-plugin
```

## Config plugin setup

To setup, just add the config plugin to the plugins array of your `app.json` or `app.config.js` as shown below, then rebuild the app.

Simple:

```json
{
  "expo": {
    ...
    "plugins": [
      ...,
      "expo-nse-plugin"
    ],
  }
}
```

Advanced:

```json
{
  "expo": {
    ...
    "plugins": [
      ...,
      [
        "expo-nse-plugin",
        {
          "mode": "development",
          "appGroup": "group.com.github.pawicao.app",
          "intents": ["INSendMessageIntent"],
          "backgroundModes": {
            "remoteNotifications": true,
            "fetch": true
          },
          "appDelegate": {
            "remoteNotificationsDelegate": "[SomeOtherService setPushIdentifier:deviceToken];",
            "imports": "#import \"SomeOtherService.h\"" // or array of import lines
          },
          "nse": {
            "sourceFiles": ["./my_path/to_a_custom_nse_implementation_file", "./my_path/to_a_custom_nse_header_file", "./my_path/to_a_custom_swift_file"],
            "bundleName": "NotificationServiceExtension",
            "frameworks": ["Intents.framework"],
            "extraBuildSettings": {
              "OTHER_LDFLAGS": "$(inherited) -lstdc++"
            },
            "extraInfoPlist": {
              "com.github.pawicao.app.MyMetadataKey": "value"
            }
          }
        }
      ]
    ],
  }
}
```

# API documentation

All the options of the plugin configurable from the `app.json` / `app.config.js` file are listed below:

| **Property**                              | **Type**                        | **Required** | **Default**                      | **Description**                                                                                                                                               |
|-------------------------------------------|---------------------------------|--------------|----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `mode`                                    | `"development" \| "production"` | No           | `"development"`                  | Determines the APNs environment. Use `development` for testing and `production` for App Store builds                                                          |
| `appGroup`                                | `string \| string[]`            | No           | None                             | The App Group identifier or identifiers used to share data between the main app and the NSE. Format: `group.your.bundle.id`                                   |
| `intents`                                 | `string[]`                      | No           | None                             | Registers intents for your main app in `NSUserActivityTypes`, which can be required for SiriKit integration and Communication Notifications                   |
| `backgroundModes.remoteNotifications`     | `boolean`                       | No           | `true`                           | Enables remote notifications background mode in your app's capabilities (if set to false, keeps as-is)                                                        |
| `backgroundModes.fetch`                   | `boolean`                       | No           | `false`                          | Enables background fetch capability in your app's capabilities (if set to false, keeps as-is)                                                                 |
| `appDelegate.remoteNotificationsDelegate` | `string`                        | No           | None                             | Custom code to be injected into the `didRegisterForRemoteNotificationsWithDeviceToken` method of your AppDelegate                                             |
| `appDelegate.imports`                     | `string \| string[]`            | No           | None                             | Additional import statements to be added to your AppDelegate                                                                                                  |
| `nse.sourceFiles`                         | `string \| string[]`            | No           | Default Xcode's NSE content      | Path to custom source files (.swift, .m, .h) for the Notification Service Extension. Automatically enables Swift build settings when Swift files are present. |
| `nse.bundleName`                          | `string`                        | No           | `"NotificationServiceExtension"` | The name of your Notification Service Extension target                                                                                                        |
| `nse.frameworks`                          | `string[]`                      | No           | None                             | Additional iOS Frameworks to link with the Notification Service Extension (UserNotifications.framework always included)                                       |
| `nse.extraBuildSettings`                  | `object`                        | No           | None                             | Additional string keys/values to add to the Notification Service Extension's build settings                                                                   |
| `nse.extraInfoPlist`                      | `object`                        | No           | None                             | Additional string keys/values to add to the Notification Service Extension's Info.plist (not the main app's Info.plist)                                       |

# Contributing & testing

PRs and feedback are more than welcome! If you see a way of extending this plugin's configuration options or capabilities, do let me know!

This plugin has not been thoroughly tested over different range of Xcode versions, I simply created it for my own use case. Therefore there's a chance that it may fail in some specific configurations of your particular project and your environment. If this is the case, feel free to raise an issue and I'll try to do something about it!

Refer to [`expo-module-scripts`](https://www.npmjs.com/package/expo-module-scripts) documentation for information about useful commands while developing the plugin.

## Flexible Source Files Support

Starting with v2.0.0 the plugin simplifies the source files configuration for your Notification Service Extension, allowing you to e.g. include swift files. When you provide source files via the `sourceFiles` option, the plugin will automatically:

- Add the source files to the NSE target's Compile Sources phase
- Enable Swift build settings (`ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES: YES`) when Swift files are detected
- Set the Swift version to 5.0 when Swift files are present (if needed, this can be overwritten with setting `SWIFT_VERSION` via the `extraBuildSettings` property)

### Breaking Change Notice

**Version 2.0+ Breaking Change**: The `mFilePath` and `hFilePath` options have been removed in favor of the unified `sourceFiles` option. If you were using the legacy options, update your configuration:

**Before (v1.x):**
```json
{
  "nse": {
    "mFilePath": "./src/NotificationService.m",
    "hFilePath": "./src/NotificationService.h"
  }
}
```

**After (v2.0+):**
```json
{
  "nse": {
    "sourceFiles": ["./src/NotificationService.m", "./src/NotificationService.h"]
  }
}
```
