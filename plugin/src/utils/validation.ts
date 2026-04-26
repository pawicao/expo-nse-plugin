import { PLUGIN_DEFAULTS, type PluginMode, type PluginProps, type PluginPropsInput } from './schema';

const VALID_MODES = ['development', 'production'] as const;

export function validatePluginProperties(props?: PluginPropsInput): PluginProps {
  const errors: string[] = [];
  const config = isObject(props) ? props : {};

  if (props !== undefined && !isObject(props)) {
    errors.push('`properties` must be an object.');
  }

  const mode = config.mode ?? PLUGIN_DEFAULTS.mode;
  if (!VALID_MODES.includes(mode as PluginMode)) {
    errors.push('`mode` must be "development" or "production".');
  }

  const backgroundModes = isObject(config.backgroundModes) ? config.backgroundModes : {};
  if (config.backgroundModes !== undefined && !isObject(config.backgroundModes)) {
    errors.push('`backgroundModes` must be an object.');
  }

  const appDelegate = isObject(config.appDelegate) ? config.appDelegate : undefined;
  if (config.appDelegate !== undefined && !isObject(config.appDelegate)) {
    errors.push('`appDelegate` must be an object.');
  }

  const nse = isObject(config.nse) ? config.nse : {};
  if (config.nse !== undefined && !isObject(config.nse)) {
    errors.push('`nse` must be an object.');
  }

  const parsed: PluginProps = {
    mode: VALID_MODES.includes(mode as PluginMode) ? (mode as PluginMode) : PLUGIN_DEFAULTS.mode,
    backgroundModes: {
      remoteNotifications: readBoolean(
        backgroundModes.remoteNotifications,
        'backgroundModes.remoteNotifications',
        PLUGIN_DEFAULTS.backgroundModes.remoteNotifications,
        errors
      ),
      fetch: readBoolean(
        backgroundModes.fetch,
        'backgroundModes.fetch',
        PLUGIN_DEFAULTS.backgroundModes.fetch,
        errors
      ),
    },
    nse: {
      bundleName: readString(nse.bundleName, 'nse.bundleName', errors) ?? PLUGIN_DEFAULTS.nse.bundleName,
    },
  };

  const appGroup = readStringList(config.appGroup, 'appGroup', errors);
  const intents = readStringArray(config.intents, 'intents', errors);
  const remoteNotificationsDelegate = readString(
    appDelegate?.remoteNotificationsDelegate,
    'appDelegate.remoteNotificationsDelegate',
    errors
  );
  const imports = readStringList(appDelegate?.imports, 'appDelegate.imports', errors);
  const sourceFiles = readStringList(nse.sourceFiles, 'nse.sourceFiles', errors);
  const frameworks = readStringArray(nse.frameworks, 'nse.frameworks', errors);
  const resources = readStringArray(nse.resources, 'nse.resources', errors);

  if (appGroup) parsed.appGroup = appGroup;
  if (intents) parsed.intents = intents;
  if (remoteNotificationsDelegate !== undefined || imports) {
    parsed.appDelegate = {
      ...(remoteNotificationsDelegate !== undefined ? { remoteNotificationsDelegate } : {}),
      ...(imports ? { imports } : {}),
    };
  }
  if (sourceFiles) parsed.nse.sourceFiles = sourceFiles;
  if (frameworks) parsed.nse.frameworks = frameworks;
  if (resources) parsed.nse.resources = resources;

  if (nse.extraBuildSettings !== undefined) {
    if (isStringRecord(nse.extraBuildSettings)) {
      parsed.nse.extraBuildSettings = nse.extraBuildSettings;
    } else {
      errors.push('`nse.extraBuildSettings` must be an object with string values.');
    }
  }

  if (nse.extraInfoPlist !== undefined) {
    if (isStringRecord(nse.extraInfoPlist)) {
      parsed.nse.extraInfoPlist = nse.extraInfoPlist;
    } else {
      errors.push('`nse.extraInfoPlist` must be an object with string values.');
    }
  }

  if (errors.length > 0) {
    throw new Error(
      'provided expo-nse-plugin properties are invalid\n' +
        errors.map((error) => `- ${error}`).join('\n')
    );
  }

  return parsed;
}

function readString(value: unknown, path: string, errors: string[]): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;

  errors.push(`\`${path}\` must be a string.`);
  return undefined;
}

function readBoolean(value: unknown, path: string, fallback: boolean, errors: string[]): boolean {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;

  errors.push(`\`${path}\` must be a boolean.`);
  return fallback;
}

function readStringList(value: unknown, path: string, errors: string[]): string[] | undefined {
  if (typeof value === 'string') return [value];
  return readStringArray(value, path, errors);
}

function readStringArray(value: unknown, path: string, errors: string[]): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    errors.push(`\`${path}\` must be an array of strings.`);
    return undefined;
  }

  const invalidIndex = value.findIndex((item) => typeof item !== 'string');
  if (invalidIndex !== -1) {
    errors.push(`\`${path}[${invalidIndex}]\` must be a string.`);
    return undefined;
  }

  return value;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isObject(value) && Object.values(value).every((entry) => typeof entry === 'string');
}
