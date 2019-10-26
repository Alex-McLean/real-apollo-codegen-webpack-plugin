const ora = require('ora');
const cp = require('child_process');
const chalk = require('chalk');

const genExec = (name: string, command: string, apolloPath?: string) => {
  const spinner = ora(name).start();
  const apollo = apolloPath || 'apollo';

  return new Promise((resolve, reject) => {
    cp.exec(`${apollo} ${command}`, (error: Error, stdout: string, stderr: string) => {
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

module.exports = genExec;
