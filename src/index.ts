import minimatch from 'minimatch';
import { fetchSchema } from './fetchSchema';
import { genTypes } from './genTypes';

interface Compilation {
  fileTimestamps: Map<string, number>;
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
  [key: string]: boolean | string | undefined;
}
class RealApolloCodegenWebpackPlugin {
  private readonly id: string;
  private readonly options: RealApolloCodegenWebpackPluginOptions;
  private readonly startTime: number;

  private prevTimestamps: Map<string, number>;
  private schemaFetched: boolean;

  constructor(options: RealApolloCodegenWebpackPluginOptions) {
    this.id = 'ApolloWebpackPlugin';
    this.options = options;
    this.startTime = Date.now();

    this.prevTimestamps = new Map<string, number>();
    this.schemaFetched = false;
  }

  hasChanged(compilation: Compilation) {
    const timestamps = new Map<string, number>();
    let hasChanged = compilation.fileTimestamps.size === 0; // initial compilation

    compilation.fileTimestamps.forEach((timestamp, file) => {
      if (minimatch(file.replace(compilation.options.context, '.'), this.options.includes)) {
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
