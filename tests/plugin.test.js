const fs = require('node:fs');
const path = require('node:path');
const { it, expect } = require('@jest/globals');

const getCompiler = require('./helpers/getCompiler');
const compile = require('./helpers/compile');

const ReplaceAssetNamePlugin = require('../src/index.js');

const getAssetNames = (stats) => {
  const { assets } = stats.compilation;
  return Object.keys(assets);
};

const hasAsset = (stats, assetName) => {
  const assets = getAssetNames(stats);
  if (assetName instanceof RegExp) {
    return assets.some((name) => assetName.test(name));
  }

  return assets.includes(assetName);
};

it('should replace the asset name correctly in dev mode', async () => {
  const compiler = getCompiler(true);

  new ReplaceAssetNamePlugin({
    asset: /main.js$/,
    rules: [
      {
        search: '{SECONDARY_FILE}',
        replace: /secondary.js/,
      },
    ],
  }).apply(compiler);

  const stats = await compile(compiler);

  const assets = getAssetNames(stats);
  expect(assets).toMatchSnapshot('assets');
  expect(assets.length).toBe(4);

  expect(hasAsset(stats, 'js/main.js')).toBeTruthy();

  const mainFilePath = path.resolve(process.cwd(), 'dist', 'js/main.js');

  const mainJS = await fs.promises.readFile(mainFilePath, 'utf-8');
  expect(mainJS).toContain('secondary.js');
});

it('should replace the asset name correctly when replace is a string', async () => {
  const compiler = getCompiler(true);

  new ReplaceAssetNamePlugin({
    asset: /main.js$/,
    rules: [
      {
        search: '{SECONDARY_FILE}',
        replace: 'js/secondary.js',
      },
    ],
  }).apply(compiler);

  const stats = await compile(compiler);

  const assets = getAssetNames(stats);
  expect(assets).toMatchSnapshot('assets');
  expect(assets.length).toBe(4);

  expect(hasAsset(stats, 'js/main.js')).toBeTruthy();

  const mainFilePath = path.resolve(process.cwd(), 'dist', 'js/main.js');

  const mainJS = await fs.promises.readFile(mainFilePath, 'utf-8');
  expect(mainJS).toContain('secondary.js');
});

it('should replace the asset name correctly in prod mode', async () => {
  const compiler = getCompiler();

  new ReplaceAssetNamePlugin({
    asset: /main(?:-.*)?.js$/,
    rules: [
      {
        search: '{SECONDARY_FILE}',
        replace: /secondary(?:-.*)?.js$/,
      },
    ],
  }).apply(compiler);

  const stats = await compile(compiler);

  const assets = getAssetNames(stats);
  expect(assets).toMatchSnapshot('assets');
  expect(assets.length).toBe(4);

  const mainFileName = assets.find((asset) => (/main(?:-.*)?.js$/).test(asset));
  const secondaryFileName = assets.find((asset) => (/secondary(?:-.*)?.js$/).test(asset));
  const mainFilePath = path.resolve(process.cwd(), 'dist', mainFileName);

  const mainJS = await fs.promises.readFile(mainFilePath, 'utf-8');
  expect(mainJS).toContain(secondaryFileName);
});

it('should replace the asset name correctly when search is a regex', async () => {
  const compiler = getCompiler();

  new ReplaceAssetNamePlugin({
    asset: /main(?:-.*)?.js$/,
    rules: [
      {
        search: /{SECONDARY_FILE}/g,
        replace: /secondary(?:-.*)?.js$/,
      },
    ],
  }).apply(compiler);

  const stats = await compile(compiler);

  const assets = getAssetNames(stats);
  expect(assets).toMatchSnapshot('assets');
  expect(assets.length).toBe(4);

  const mainFileName = assets.find((asset) => (/main(?:-.*)?.js$/).test(asset));
  const secondaryFileName = assets.find((asset) => (/secondary(?:-.*)?.js$/).test(asset));
  const mainFilePath = path.resolve(process.cwd(), 'dist', mainFileName);

  const mainJS = await fs.promises.readFile(mainFilePath, 'utf-8');
  expect(mainJS).toContain(secondaryFileName);
});

it('should transform the asset', async () => {
  const compiler = getCompiler();

  new ReplaceAssetNamePlugin({
    asset: /main(?:-.*)?.js$/,
    rules: [
      {
        search: /{SECONDARY_FILE}/g,
        replace: /secondary(?:-.*)?.js$/,
        transform: (asset) => path.basename(asset),
      },
    ],
  }).apply(compiler);

  const stats = await compile(compiler);

  const assets = getAssetNames(stats);
  expect(assets).toMatchSnapshot('assets');
  expect(assets.length).toBe(4);

  const mainFileName = assets.find((asset) => (/main(?:-.*)?.js$/).test(asset));
  const secondaryFileName = assets.find((asset) => (/secondary(?:-.*)?.js$/).test(asset));
  const mainFilePath = path.resolve(process.cwd(), 'dist', mainFileName);

  const mainJS = await fs.promises.readFile(mainFilePath, 'utf-8');
  expect(mainJS).not.toContain(secondaryFileName);
  expect(mainJS).toContain(secondaryFileName.split('js/')[1]);
  expect(mainJS).toMatchSnapshot('mainJS');
});

it('should do nothing when target asset is not found', async () => {
  const compiler = getCompiler();

  new ReplaceAssetNamePlugin({
    asset: /main(?:-.*)?.js$/,
    rules: [
      {
        search: '{SECONDARY_FILE}',
        replace: /unknown.js$/,
      },
    ],
  }).apply(compiler);

  const stats = await compile(compiler);

  const assets = getAssetNames(stats);
  expect(assets).toMatchSnapshot('assets');
  expect(assets.length).toBe(4);

  const mainFileName = assets.find((asset) => (/main(?:-.*)?.js$/).test(asset));
  const mainFilePath = path.resolve(process.cwd(), 'dist', mainFileName);

  expect(stats.toString()).toContain('no asset matches');

  const mainJS = await fs.promises.readFile(mainFilePath, 'utf-8');
  expect(mainJS).not.toContain('unknown.js');
});
