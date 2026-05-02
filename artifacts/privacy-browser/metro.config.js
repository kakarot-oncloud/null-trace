const { getDefaultConfig } = require("expo/metro-config");
const { mergeConfig } = require("metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const defaultConfig = getDefaultConfig(projectRoot);

const config = {
  watchFolders: [monorepoRoot],

  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(monorepoRoot, "node_modules"),
    ],
    blockList: [
      // react-native-worklets creates _tmp_ dirs during postinstall that
      // disappear before Metro can watch them — exclude to prevent ENOENT crashes
      /.*react-native-worklets.*_tmp_.*/,
      /.*node_modules\/.*_tmp_.*/,
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);
