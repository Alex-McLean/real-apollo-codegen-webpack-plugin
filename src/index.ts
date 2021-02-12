const minimatch = require('minimatch');
const fetchSchema = require('./fetchSchema');
const genTypes = require('./genTypes');

interface Compilation {
  modifiedFiles: Set<string>;
  options: {
    context: string;
  }
}

export interface RealApolloCodegenWebpackPluginOptions {
  endpoint?: string;
  localSchemaFile?: string;
  config?: string;
  header?: string;
  tag?: string;
  skipSSLValidation?: boolean;
  key?: string;
  critical?: boolean;
  includes: string;
  apolloPath?: string;
  output?: string;
  [key: string]: boolean | string | undefined;
}
class RealApolloCodegenWebpackPlugin {
  private readonly id: string;
  private readonly options: RealApolloCodegenWebpackPluginOptions;
  private readonly startTime: number;

  private schemaFetched: boolean;

  constructor(options: RealApolloCodegenWebpackPluginOptions) {
    this.id = 'ApolloWebpackPlugin';
    this.options = options;
    this.startTime = Date.now();

    this.schemaFetched = false;
  }

  hasChanged(compilation: Compilation) {
    const timestamps = new Map<string, number>();
    let hasChanged = !compilation.modifiedFiles?.size; // initial compilation

    compilation.modifiedFiles?.forEach((file) => {
      if (minimatch(file.replace(compilation.options.context, '.'), this.options.includes)) {
        console.log(`Apollo Codegen: File changed: ${file}`);
        hasChanged = true;
      }
    });

    return hasChanged;
  }

  apply(compiler: any) {
    const run = (compilation: Compilation) => {
      const hasChanged = this.hasChanged(compilation);

      if (!hasChanged) {
        console.log('Apollo Codegen: No files changed');
        return Promise.resolve();
      }

      if (!this.schemaFetched) {
        return fetchSchema(this.options).then(() => {
          this.schemaFetched = true;

          return genTypes(this.options);
        });
      }

      return genTypes(this.options);
    };

    compiler.hooks.beforeRun.tapPromise(this.id, run);
    compiler.hooks.watchRun.tapPromise(this.id, run);
  }
}

module.exports = RealApolloCodegenWebpackPlugin;
