import ora from "ora";
import cp, { ExecException } from "child_process";
import chalk from "chalk";

export const genExec = (
  name: string,
  command: string,
  apolloPath?: string
): Promise<void> => {
  const spinner = ora(name).start();
  const apollo = apolloPath || "apollo";

  return new Promise<void>((resolve, reject) => {
    cp.exec(
      `${apollo} ${command}`,
      (error: ExecException | null, stdout: string, stderr: string) => {
        if (error) {
          spinner.fail(`${name}\n${chalk.dim(error.message)}`);
          return reject();
        }

        if (
          stderr &&
          stderr.indexOf("Warning: apollo update available") === -1
        ) {
          spinner.fail(`${name}\n${chalk.dim(stderr)}`);
          return reject();
        }

        if (stdout) {
          spinner.succeed(`${name}\n${chalk.dim(stdout)}`);
        } else {
          spinner.succeed();
        }

        return resolve();
      }
    );
  });
};
