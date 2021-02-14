import { Compiler } from 'webpack';

type Rule = string | RegExp | Array<string | RegExp>;

interface Options {
  test: Rule;
  include?: Rule;
  exclude?: Rule;
  search: string | RegExp;
  assetName: string | RegExp;
}

declare class ReplaceAssetNamePlugin {
  constructor(options: Options);
  apply(compiler: Compiler): void;
}

export = ReplaceAssetNamePlugin;
