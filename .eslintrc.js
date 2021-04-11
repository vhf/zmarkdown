module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    'packages/**/node_modules/',
    'packages/**/__tests__/',
    'packages/**/dist/',
    'packages/zmarkdown/webpack.config.js',
    'packages/zmarkdown/client/dist/*',
    'packages/zmarkdown/public/'
  ]
}
