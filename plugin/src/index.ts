import { validatePluginProperties } from './utils/validation';
import withNsePluginIos from './ios';
import withNsePluginAndroid from './android';

import type { ConfigPlugin } from '@expo/config-plugins';
import type { PluginPropsInput } from './utils/schema';

const withNsePlugin: ConfigPlugin<PluginPropsInput> = (config, props) => {
  const _props = validatePluginProperties(props);

  config = withNsePluginAndroid(config, _props);
  config = withNsePluginIos(config, _props);

  return config;
};

export default withNsePlugin;
