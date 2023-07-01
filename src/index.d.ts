import { Compiler, WebpackPluginInstance } from 'webpack';

type Rule = string | RegExp | Array<string | RegExp>;

interface ReplaceRules {
  search: string | RegExp;
  replace: string | RegExp;
}

interface Options {
  asset: Rule;
  rules: ReplaceRules[];
  transform: (assetName: string) => string;
}

declare class ReplaceAssetNamePlugin implements WebpackPluginInstance {
  constructor(options: Options);
  apply(compiler: Compiler): void;
}

export = ReplaceAssetNamePlugin;
