const genExec = require('./genExec');
import { RealApolloCodegenWebpackPluginOptions } from './index';

const fetchSchema = (options: RealApolloCodegenWebpackPluginOptions) => {
  const { endpoint, localSchemaFile, config, header, tag, skipSSLValidation, key } = options;
  const command = ['service:download'];

  if (localSchemaFile) command.push(localSchemaFile);
  if (config) command.push(`-c="${config}"`);
  if (header) command.push(`--header="${header}"`);
  if (endpoint) command.push(`--endpoint="${endpoint}"`);
  if (tag) command.push(`-t="${tag}"`);
  if (skipSSLValidation) command.push(`--skipSSLValidation`);
  if (key) command.push(`--key="${key}"`);

  return genExec('Downloading schema', command.join(' '), options.apolloPath).catch(() => {
    if (options.critical) {
      process.exit(1);
    }
  });
};

module.exports = fetchSchema;
