import { NSE } from './constants';

export type PluginMode = 'development' | 'production';

export type StringListInput = string | string[];

export type PluginPropsInput = {
  mode?: PluginMode;
  appGroup?: StringListInput;
  intents?: string[];
  backgroundModes?: {
    remoteNotifications?: boolean;
    fetch?: boolean;
  };
  appDelegate?: {
    remoteNotificationsDelegate?: string;
    imports?: StringListInput;
  };
  nse?: {
    sourceFiles?: StringListInput;
    frameworks?: string[];
    resources?: string[];
    extraBuildSettings?: Record<string, string>;
    extraInfoPlist?: Record<string, string>;
    bundleName?: string;
  };
};

export type PluginProps = {
  mode: PluginMode;
  appGroup?: string[];
  intents?: string[];
  backgroundModes: {
    remoteNotifications: boolean;
    fetch: boolean;
  };
  appDelegate?: {
    remoteNotificationsDelegate?: string;
    imports?: string[];
  };
  nse: {
    sourceFiles?: string[];
    frameworks?: string[];
    resources?: string[];
    extraBuildSettings?: Record<string, string>;
    extraInfoPlist?: Record<string, string>;
    bundleName: string;
  };
};

export const PLUGIN_DEFAULTS = {
  mode: 'development',
  backgroundModes: {
    remoteNotifications: true,
    fetch: false,
  },
  nse: {
    bundleName: NSE.BUNDLE_NAME,
  },
} as const;
