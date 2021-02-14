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

  replace(compiler, compilation, assets) {
    const { ModuleFilenameHelpers, sources: { RawSource } } = compiler.webpack;

    const logger = compilation.getLogger(PLUGIN_NAME);
    const allAssets = Object.keys(assets);

    const assetsToSearch = allAssets.filter((assetName) => {
      return ModuleFilenameHelpers.matchObject.bind(undefined, {
        test: this.options.asset,
      })(assetName);
    });

    assetsToSearch.forEach((assetName) => {
      const { source, info } = compilation.getAsset(assetName);
      const assetContent = source.source();

      let assetString = assetContent.toString('utf8');

      this.options.rules.forEach((rule) => {
        const searchRegex = rule.search instanceof RegExp ? rule.search : new RegExp(rule.search, 'g');

        const assetToReplace = allAssets.find((asset) => {
          if (rule.replace instanceof RegExp) {
            return rule.replace.test(asset);
          }

          return asset === rule.replace;
        });

        if (!assetToReplace) {
          logger.warn(`no asset matches: ${rule.replace}`);
          return;
        }

        assetString = assetString.replace(searchRegex, assetToReplace);
      });

      compilation.updateAsset(assetName, new RawSource(assetString), info);
    });
  }

  apply(compiler) {
    const { Compilation } = compiler.webpack;

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        (assets) => {
          this.replace(compiler, compilation, assets);
        },
      );
    });
  }
}

module.exports = ReplaceAssetNamePlugin;
