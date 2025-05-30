const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    ...require("node-libs-browser"),
    stream: require.resolve("stream-browserify"),
    crypto: require.resolve("crypto-browserify"),
    process: require.resolve("process/browser"),
};

module.exports = config;
