import { genExec } from "./genExec";
import { RealApolloCodegenWebpackPluginOptions } from "./index";

export const fetchSchema = (
  options: RealApolloCodegenWebpackPluginOptions
): Promise<void> => {
  const {
    endpoint,
    localSchemaFile,
    config,
    header,
    tag,
    skipSSLValidation,
    key,
    apolloPath,
  } = options;
  const command = ["service:download"];

  if (localSchemaFile) command.push(localSchemaFile);
  if (config) command.push(`-c="${config}"`);
  if (header) command.push(`--header="${header}"`);
  if (endpoint) command.push(`--endpoint="${endpoint}"`);
  if (tag) command.push(`-t="${tag}"`);
  if (skipSSLValidation) command.push(`--skipSSLValidation`);
  if (key) command.push(`--key="${key}"`);

  return genExec("Downloading schema", command.join(" "), apolloPath).catch(
    () => {
      if (options.critical) {
        process.exit(1);
      }
    }
  );
};
