import { z } from 'zod';
import { NSE } from './constants';

const DEFAULTS = {
  MODE: 'development',
  ENABLE_BACKGROUND_REMOTE_NOTIFICATIONS: true,
  ENABLED_BACKGROUND_FETCH: false,
} as const;

export const PluginPropsSchema = z
  .object({
    mode: z.enum(['development', 'production']).default(DEFAULTS.MODE),
    appGroup: z.union([z.string(), z.array(z.string())]).optional(),
    backgroundModes: z
      .object({
        remoteNotifications: z.boolean().default(DEFAULTS.ENABLE_BACKGROUND_REMOTE_NOTIFICATIONS),
        fetch: z.boolean().default(DEFAULTS.ENABLED_BACKGROUND_FETCH),
      })
      .default({}),
    appDelegate: z
      .object({
        remoteNotificationsDelegate: z.string().optional(),
        imports: z.union([z.string(), z.array(z.string())]).optional(),
      })
      .optional(),
    nse: z
      .object({
        mFilePath: z.union([z.string(), z.array(z.string())]).optional(),
        hFilePath: z.union([z.string(), z.array(z.string())]).optional(),
        frameworks: z.array(z.string()).optional(),
        extraBuildSettings: z.object({}).optional(),
        bundleName: z.string().default(NSE.BUNDLE_NAME),
      })
      .default({}),
  })
  .default({});

export type PluginProps = z.infer<typeof PluginPropsSchema>;
