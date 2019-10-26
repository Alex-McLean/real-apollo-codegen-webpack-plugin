import chalk from 'chalk';
import cp from 'child_process';
import ora from 'ora';
import path from 'path';

export const genExec = (name: string, command: string) => {
  const spinner = ora(name).start();
  const apollo = path.join(__dirname, '..', 'node_modules', '.bin', 'apollo');

  return new Promise((resolve, reject) => {
    cp.exec(`${apollo} ${command}`, (error, stdout, stderr) => {
      if (error) {
        spinner.fail(`${name}\n${chalk.dim(error.message)}`);
        return reject();
      }

      if (stderr && stderr.indexOf('Warning: apollo update available') === -1) {
        spinner.fail(`${name}\n${chalk.dim(stderr)}`);
        return reject();
      }

      if (stdout) {
        spinner.succeed(`${name}\n${chalk.dim(stdout)}`);
      } else {
        spinner.succeed();
      }

      return resolve();
    });
  });
};
