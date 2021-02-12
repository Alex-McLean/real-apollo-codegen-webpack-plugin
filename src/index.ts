import { Compiler, Plugin } from "webpack";

const minimatch = require('minimatch');
const fetchSchema = require('./fetchSchema');
const genTypes = require('./genTypes');

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
class RealApolloCodegenWebpackPlugin extends Plugin {
  private readonly id: string;
  private readonly options: RealApolloCodegenWebpackPluginOptions;
  private readonly startTime: number;

  private prevTimestamps: Map<string, number>;
  private schemaFetched: boolean;

  constructor(options: RealApolloCodegenWebpackPluginOptions) {
    super();

    this.id = 'ApolloWebpackPlugin';
    this.options = options;
    this.startTime = Date.now();

    this.prevTimestamps = new Map<string, number>();
    this.schemaFetched = false;
  }

  hasChanged(compiler: Compiler) {
    const timestamps = new Map<string, number>();
    let hasChanged = !compiler.fileTimestamps?.size; // initial compilation

    compiler.fileTimestamps.forEach((timestamp, file) => {
      if (minimatch(file.replace(compiler.options.context ?? '', '.'), this.options.includes)) {
        timestamps.set(file, timestamp);
        const prevTimestamp = this.prevTimestamps.get(file);
        if ((prevTimestamp || this.startTime) < (timestamp || Infinity)) {
          console.log(`Apollo Codegen: File changed: ${file}`);
          hasChanged = true;
        }
      }
    });

    this.prevTimestamps = timestamps;

    return hasChanged;
  }

  apply(compiler: Compiler) {
    const run = (compiler: Compiler) => {
      const hasChanged = this.hasChanged(compiler);

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
