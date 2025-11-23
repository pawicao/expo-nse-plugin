import {
  ALWAYS_REQUIRE_FRAMEWORKS,
  DEFAULT_IPHONEOS_DEPLOYMENT_TARGET,
  DEFAULT_MARKETING_VERSION,
  NSE,
  STATIC_BUILD_SETTINGS,
  SWIFT_BUILD_SETTINGS,
} from './constants';
import type { XcodeProject } from '@expo/config-plugins';

export const createPbxGroup = (project: XcodeProject, bundleName: string, sources: string[]) => {
  const filePathsArray = [
    ...sources,
    `${bundleName}${NSE.PLIST_FILE_SUFFIX}`,
    `${bundleName}${NSE.ENTITLEMENTS_FILE_SUFFIX}`,
  ];

  const { uuid } = project.addPbxGroup(filePathsArray, bundleName, bundleName);

  return uuid as string;
};

export const addGroupToMainProject = (project: XcodeProject, groupId: string) => {
  const pbxGroups = project.hash.project.objects.PBXGroup;

  const groupEntry = Object.entries<PbxGroup>(pbxGroups).find(
    ([key, group]) => !group?.name && !group?.path && !key.endsWith('_comment')
  );

  if (groupEntry) {
    const [groupKey] = groupEntry;
    project.addToPbxGroup(groupId, groupKey);
  }
};

export const createTarget = (
  project: XcodeProject,
  bundleName: string,
  appBundleIdentifier: string
) => {
  ensurePbxObjects(project);
  const { uuid } = project.addTarget(
    bundleName,
    NSE.TARGET_TYPE,
    bundleName,
    `${appBundleIdentifier}.${bundleName}`
  );

  return uuid as string;
};

export const addBuildPhases = (project: XcodeProject, targetId: string, sources: string[]) => {
  project.addBuildPhase(sources, 'PBXSourcesBuildPhase', 'Sources', targetId);
  project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', targetId);
  project.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', targetId);
};

export const configureBuildSettings = (
  project: XcodeProject,
  bundleName: string,
  appName: string,
  developmentTeam?: string,
  extraBuildSettings?: Record<string, string>,
  hasSwiftFiles?: boolean
) => {
  // target name is the app name without spaces
  const appTargetName = appName.replaceAll(' ', '');
  const configurations = project.pbxXCBuildConfigurationSection();

  const { app, nse } = findConfigurations(configurations, appTargetName, bundleName);

  if (!nse.Debug || !nse.Release) {
    throw new Error(`Could not find the configurations for the target ${bundleName}`);
  }

  const debugIphoneOsDeploymentTarget =
    app.Debug?.buildSettings?.IPHONEOS_DEPLOYMENT_TARGET ||
    app.Release?.buildSettings?.IPHONEOS_DEPLOYMENT_TARGET ||
    DEFAULT_IPHONEOS_DEPLOYMENT_TARGET;
  const releaseIphoneOsDeploymentTarget =
    app.Release?.buildSettings?.IPHONEOS_DEPLOYMENT_TARGET ||
    app.Debug?.buildSettings?.IPHONEOS_DEPLOYMENT_TARGET ||
    DEFAULT_IPHONEOS_DEPLOYMENT_TARGET;

  const debugMarketingVersion =
    app.Debug?.buildSettings?.MARKETING_VERSION ||
    app.Release?.buildSettings?.MARKETING_VERSION ||
    DEFAULT_MARKETING_VERSION;
  const releaseMarketingVersion =
    app.Release?.buildSettings?.MARKETING_VERSION ||
    app.Debug?.buildSettings?.MARKETING_VERSION ||
    DEFAULT_MARKETING_VERSION;

  const swiftBuildSettings = hasSwiftFiles ? SWIFT_BUILD_SETTINGS : undefined

  nse.Debug.buildSettings = {
    ...STATIC_BUILD_SETTINGS,
    ...nse.Debug.buildSettings,
    ...swiftBuildSettings,
    ...(extraBuildSettings ?? {}),
    CODE_SIGN_ENTITLEMENTS: `${bundleName}/${bundleName}.entitlements`,
    IPHONEOS_DEPLOYMENT_TARGET: debugIphoneOsDeploymentTarget,
    MARKETING_VERSION: debugMarketingVersion,
  };

  nse.Release.buildSettings = {
    ...STATIC_BUILD_SETTINGS,
    ...nse.Release.buildSettings,
    ...swiftBuildSettings,
    ...(extraBuildSettings ?? {}),
    CODE_SIGN_ENTITLEMENTS: `${bundleName}/${bundleName}.entitlements`,
    IPHONEOS_DEPLOYMENT_TARGET: releaseIphoneOsDeploymentTarget,
    MARKETING_VERSION: releaseMarketingVersion,
  };

  if (developmentTeam) {
    nse.Debug.buildSettings.DEVELOPMENT_TEAM = developmentTeam;
    nse.Release.buildSettings.DEVELOPMENT_TEAM = developmentTeam;
  }
};

export const linkFrameworks = (project: XcodeProject, targetId: string, frameworks?: string[]) => {
  const frameworksSet = new Set([...ALWAYS_REQUIRE_FRAMEWORKS, ...(frameworks ?? [])]);
  for (const framework of frameworksSet) {
    project.addFramework(framework, { target: targetId, embed: false, link: true, sign: false });
  }
};

const ensurePbxObjects = (project: XcodeProject) => {
  // Fixing the bug in the dependency package.
  // https://github.com/apache/cordova-node-xcode/issues/121 - credits to this issue raised by the OneSignal team
  const pbxObjects = project.hash.project.objects;
  if (!pbxObjects.PBXTargetDependency) {
    pbxObjects.PBXTargetDependency = {};
  }
  if (!pbxObjects.PBXContainerItemProxy) {
    pbxObjects.PBXContainerItemProxy = {};
  }
};

const findConfigurations = (
  configurations: Record<string, Configuration>,
  appTargetName: string,
  bundleName: string
) => {
  const cfgs: ConfigurationGroups = {
    app: {},
    nse: {},
  };

  for (const key in configurations) {
    if (configurations[key].buildSettings?.PRODUCT_NAME === `"${appTargetName}"`) {
      cfgs.app[configurations[key].name] = configurations[key];
    }
    if (configurations[key].buildSettings?.PRODUCT_NAME === `"${bundleName}"`) {
      cfgs.nse[configurations[key].name] = configurations[key];
    }

    if (cfgs.app.Debug && cfgs.app.Release && cfgs.nse.Debug && cfgs.nse.Release) {
      break;
    }
  }

  return cfgs;
};

type Configuration = {
  buildSettings?: Record<string, string>;
  name: 'Debug' | 'Release';
};

type ConfigurationGroups = {
  app: {
    Debug?: Configuration;
    Release?: Configuration;
  };
  nse: {
    Debug?: Configuration;
    Release?: Configuration;
  };
};

type PbxGroup = { name?: string; path?: string };
