module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: '> 1%, not dead',
          node: '12.0',
        }
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
  ignore: ['node_modules']
}
