const genExec = require('./genExec');
import { RealApolloCodegenWebpackPluginOptions } from './index';

const genTypes = (options: RealApolloCodegenWebpackPluginOptions) => {
  const { output, ...flags } = options;
  const command = Object.keys(flags).reduce((acc, option) => {
    if (flags[option] === true) return `${acc} --${option}`;

    return `${acc} --${option}="${flags[option]}"`;
  }, `client:codegen ${output || ''}`);

  return genExec('Generating types', command, options.apolloPath).catch(() => {
    if (options.critical) {
      process.exit(1);
    }
  });
};

module.exports = genTypes;
