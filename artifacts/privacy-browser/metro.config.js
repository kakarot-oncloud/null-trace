const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [...(config.watchFolders || []), monorepoRoot];

config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(monorepoRoot, "node_modules"),
  ],
  blockList: [
    ...(config.resolver?.blockList
      ? Array.isArray(config.resolver.blockList)
        ? config.resolver.blockList
        : [config.resolver.blockList]
      : []),
    // react-native-worklets creates _tmp_ dirs during postinstall that
    // disappear before Metro can watch them — exclude to prevent ENOENT crashes
    /.*react-native-worklets.*_tmp_.*/,
    /.*node_modules\/.*_tmp_.*/,
  ],
};

module.exports = config;
