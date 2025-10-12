import { z } from 'zod';
import { NSE } from './constants';

const DEFAULTS = {
  MODE: 'development',
  ENABLE_BACKGROUND_REMOTE_NOTIFICATIONS: true,
  ENABLED_BACKGROUND_FETCH: false,
} as const;

// Let user provide (string | string[] | undefined), but auto-wrap the bare string to return (string[] | undefined)
const zArrayStringFuzzyOptional = z
  .union([z.string().transform((val) => [val]), z.array(z.string())])
  .optional();

export const PluginPropsSchema = z
  .object({
    mode: z.enum(['development', 'production']).default(DEFAULTS.MODE),
    appGroup: zArrayStringFuzzyOptional,
    intents: z.array(z.string()).optional(),
    backgroundModes: z
      .object({
        remoteNotifications: z.boolean().default(DEFAULTS.ENABLE_BACKGROUND_REMOTE_NOTIFICATIONS),
        fetch: z.boolean().default(DEFAULTS.ENABLED_BACKGROUND_FETCH),
      })
      .default({}),
    appDelegate: z
      .object({
        remoteNotificationsDelegate: z.string().optional(),
        imports: zArrayStringFuzzyOptional,
      })
      .optional(),
    nse: z
      .object({
        sourceFiles: zArrayStringFuzzyOptional,
        frameworks: z.array(z.string()).optional(),
        extraBuildSettings: z.object({}).optional(),
        bundleName: z.string().default(NSE.BUNDLE_NAME),
      })
      .default({}),
  })
  .default({});

export type PluginProps = z.infer<typeof PluginPropsSchema>;
