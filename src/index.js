const { validate } = require('schema-utils');

const optionsSchema = require('./options.schema.json');

const PLUGIN_NAME = 'ReplaceAssetNamePlugin';

class ReplaceAssetNamePlugin {
  constructor(options) {
    validate(optionsSchema, options, {
      name: PLUGIN_NAME,
      baseDataPath: 'options',
    });

    this.options = options;
  }

  apply(compiler) {
    const { search } = this.options;

    const { webpack } = compiler;
    const { Compilation, ModuleFilenameHelpers } = webpack;
    const { RawSource } = webpack.sources;

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      const logger = compilation.getLogger(PLUGIN_NAME);

      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        (assets) => {
          const allAssets = Object.keys(assets);

          const assetsToSearch = allAssets.filter((assetName) => {
            return ModuleFilenameHelpers.matchObject.bind(undefined, this.options)(assetName);
          });

          const searchRegex = search instanceof RegExp ? search : new RegExp(search, 'g');

          const assetToReplace = allAssets.find((assetName) => {
            if (this.options.assetName instanceof RegExp) {
              return this.options.assetName.test(assetName);
            }

            return assetName === this.options.assetName;
          });

          if (!assetToReplace) {
            logger.warn(`no asset matches: ${this.options.assetName}`);
            return;
          }

          assetsToSearch.forEach((assetName) => {
            const asset = compilation.getAsset(assetName);
            const assetContent = asset.source.source();
            const assetString = assetContent.toString('utf8');

            const newAsset = assetString.replace(searchRegex, assetToReplace);

            compilation.updateAsset(assetName, new RawSource(newAsset), asset.info);
          });
        },
      );
    });
  }
}

module.exports = ReplaceAssetNamePlugin;
