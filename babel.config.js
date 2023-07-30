module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '^@src/(.+)': './src/\\1',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
  env: {
    production: {
      // remove all console logs from release builds
      plugins: ['transform-remove-console'],
    },
  },
};
