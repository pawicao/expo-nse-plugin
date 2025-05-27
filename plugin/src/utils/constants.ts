export const BACKGROUND_MODES = {
  REMOTE_NOTIFICATION: "remote-notification",
  FETCH: "fetch",
} as const;

export const APP_DELEGATE_ANCHORS = {
  IMPORTS: '#import "AppDelegate.h"',
  REMOTE_NOTIFICATION_DELEGATE:
    "- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken\n{",
};

export const APP_GROUPS_KEY = "com.apple.security.application-groups";
export const PUSH_NOTIFICATIONS_ENTITLEMENT_KEY = "aps-environment";

export const NSE = {
  BUNDLE_NAME: "NotificationServiceExtension",
  BUNDLE_VERSION: "1",
  BUNDLE_SHORT_VERSION_STRING: "1.0",
  HEADER_FILE: "NotificationService.h",
  IMPLEMENTATION_FILE: "NotificationService.m",
  PLIST_FILE_SUFFIX: "-Info.plist",
  ENTITLEMENTS_FILE_SUFFIX: ".entitlements",
  TARGET_TYPE: "app_extension",
} as const;

export const STATIC_BUILD_SETTINGS = {
  PODS_ROOT: "\"${SRCROOT}/Pods\"",
} as const;

export const DEFAULT_IPHONEOS_DEPLOYMENT_TARGET = "12.0";
export const DEFAULT_MARKETING_VERSION = "1.0";

export const ALWAYS_REQUIRE_FRAMEWORKS = ["UserNotifications.framework"]
