import { Compiler } from 'webpack';

type Rule = string | RegExp | Array<string | RegExp>;

interface ReplaceRules {
  search: string | RegExp;
  replace: string | RegExp;
}

interface Options {
  asset: Rule;
  rules: ReplaceRules[];
}

declare class ReplaceAssetNamePlugin {
  constructor(options: Options);
  apply(compiler: Compiler): void;
}

export = ReplaceAssetNamePlugin;
