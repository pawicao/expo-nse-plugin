import fs from 'fs';
import path from 'path';
import { APP_GROUPS_KEY, NSE } from './constants';

const basePluginDirectory = require.resolve('expo-nse-plugin/package.json');
const defaultFilesDirectory = path.join(basePluginDirectory, '../assets/nse/');

export const copySourceFile = (projectRoot: string, bundleName: string, sourceFilePath: string) => {
  return copyNseFile(projectRoot, bundleName, sourceFilePath);
};

export const copyDefaultFiles = (projectRoot: string, bundleName: string) => {
  const headerFile = copyNseFile(
    projectRoot,
    bundleName,
    path.join(defaultFilesDirectory, NSE.HEADER_FILE)
  );
  const implementationFile = copyNseFile(
    projectRoot,
    bundleName,
    path.join(defaultFilesDirectory, NSE.IMPLEMENTATION_FILE)
  );
  return [headerFile, implementationFile];
};

export const generateInfoPlist = (
  projectRoot: string,
  bundleName: string,
  version?: string,
  buildNumber?: string,
  extraInfoPlist: Record<string, string> = {}
) => {
  let content = getInfoPlistContent(version, buildNumber);
  for (const [key, value] of Object.entries(extraInfoPlist)) {
    content += `
	<key>${key}</key>
	<string>${value}</string>`;
  }

  const infoPlist = BASE_PLIST.replace('__CONTENT__', content);

  fs.writeFileSync(
    path.join(projectRoot, 'ios', bundleName, `${bundleName}${NSE.PLIST_FILE_SUFFIX}`),
    infoPlist
  );
};

export const generateEntitlements = (
  projectRoot: string,
  bundleName: string,
  appGroup: string[] | undefined
) => {
  let plistContent = '';

  if (appGroup) {
    plistContent = `	<key>${APP_GROUPS_KEY}</key>
	<array>
${appGroup.map((a) => `\t\t<string>${a}</string>`).join('\n')}
	</array>`;
  }

  const entitlements = BASE_PLIST.replace('__CONTENT__', plistContent);

  fs.writeFileSync(
    path.join(projectRoot, 'ios', bundleName, `${bundleName}.entitlements`),
    entitlements
  );
};

const copyNseFile = (
  projectRoot: string,
  bundleName: string,
  filePath: string,
  destinationFileName?: string
) => {
  const bundleDestination = path.join(projectRoot, 'ios', bundleName);
  const _destinationFileName = destinationFileName || path.basename(filePath);
  fs.mkdirSync(bundleDestination, { recursive: true });
  fs.copyFileSync(filePath, path.join(bundleDestination, _destinationFileName));
  return _destinationFileName;
};

const BASE_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
__CONTENT__
</dict>
</plist>`;

const getInfoPlistContent = (version?: string, buildNumber?: string) => `  <key>NSExtension</key>
  <dict>
		<key>NSExtensionPointIdentifier</key>
		<string>com.apple.usernotifications.service</string>
		<key>NSExtensionPrincipalClass</key>
		<string>NotificationService</string>
	</dict>
  <key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundleDisplayName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundleShortVersionString</key>
	<string>${version}</string>
	<key>CFBundleVersion</key>
	<string>${buildNumber || '1'}</string>`;
