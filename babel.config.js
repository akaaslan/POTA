module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
          alias: {
            '@domains':       './src/domains',
            '@shared':        './src/shared',
            '@state':         './src/state',
            '@infrastructure':'./src/infrastructure',
            '@lib':           './src/lib',
            '@types':         './src/types',
            '@models':        './src/models',
            '@ui':            './src/ui',
            '@design':        './src/design',
          },
        },
      ],
    ],
  };
};
