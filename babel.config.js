module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      require.resolve("expo-router/babel"),
      "nativewind/babel",
      [
        "module-resolver",
        {
          alias: {
            "@": "./app",  // root alias
          },
        },
      ],
      "react-native-reanimated/plugin", // must be last
    ],
  };
};
