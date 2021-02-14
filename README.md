# replace-asset-name-webpack-plugin

> Replace blocks with asset name matching given regex or string

[![Tests](https://github.com/sibiraj-s/replace-asset-name-webpack-plugin/workflows/Tests/badge.svg)](https://github.com/sibiraj-s/replace-asset-name-webpack-plugin/actions)
[![License](https://badgen.net/github/license/sibiraj-s/replace-asset-name-webpack-plugin)](https://github.com/sibiraj-s/replace-asset-name-webpack-plugin)
[![Version](https://badgen.net/npm/v/replace-asset-name-webpack-plugin)](https://npmjs.com/replace-asset-name-webpack-plugin)
[![Node Version](https://badgen.net/npm/node/replace-asset-name-webpack-plugin)](https://npmjs.com/replace-asset-name-webpack-plugin)
[![Webpack Version](https://badgen.net/badge/webpack/%3E=5/orange)](https://webpack.js.org/)

## Getting Started

### Installation

```bash
npm i -D replace-asset-name-webpack-plugin
# or
yarn add replace-asset-name-webpack-plugin --dev
```

### Usage

```js
// webpack.config.js
const ReplaceAssetNamePlugin = require('replace-asset-name-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    main: 'src/index.js',
    app: 'src/app.js',
  },
  output: {
    filename: 'js/[name]-[contenthash].js',
  },
  plugins: [
    new ReplaceAssetNamePlugin({
      asset: /main(-.*)?.js$/,
      rules: [
        {
          search: '{APP_ENTRY_REF}',
          replace: /app(-.*)?.js$/,
        },
      ],
    }),
  ],
};
```

This will replace the occurrence of `{APP_ENTRY_REF}` in `main.js` with the output chunk name of the `app` entry.

In development mode. If you use `contenthash` for testing. Make sure to enable [realContentHash](https://webpack.js.org/configuration/optimization/#optimizationrealcontenthash) so that chunk names will be updated after replace. This is enabled by default in production mode.

### Options

#### asset

Include all assets that pass test assertion

Type: `String|RegExp|Array<String|RegExp>`.

#### rules

Array of rules to search and replace assets

```js
new ReplaceAssetNamePlugin({
  asset: /main(-.*)?.js$/,
  rules: [
    {
      search: '{APP_ENTRY_REF}',
      replace: /app(-.*)?.js$/,
    },
  ],
});
```

**search**

Type: `String|RegExp`

Replace the occurrence of given string or regex with the asset name

**replace**

Type: `String|RegExp`.

Name of the asset to be replaced with the matching search term

### Related Plugins

- [copy-asset-in-memory-webpack-plugin](https://github.com/sibiraj-s/copy-asset-in-memory-webpack-plugin)
