'use strict';

const fs = require('fs-extra');
const sysPath = require('path');
const chalk = require('chalk');
const hostedGitInfo = require('hosted-git-info');
const execa = require('execa');
const commandExists = require('command-exists');

const initGit = require('../utils/init-git');
const messages = require('../utils/messages');
const getInstallCmd = require('../utils/get-install-cmd');
const output = require('../utils/output');

const install = async (projectName) => {
  const installCmd = getInstallCmd();

  output.info('Installing packages...');
  process.chdir(projectName);

  return new Promise((resolve, reject) => {
    commandExists(installCmd)
      .then(() => execa(installCmd, ['install']))
      .then(() => {
        output.success(`Installed dependencies for ${output.cmd(projectName)}`);
        resolve();
      })
      .catch(() => reject(new Error(`${installCmd} installation failed`)));
  }).catch((error) => output.error(error.message));
};

async function next(projectName, projectPath, projectStyle) {
  output.info(
    `🚀 Creating ${chalk.bold(chalk.green(projectName))} using ${chalk.bold(
      'r3f-next-starter',
    )}...`,
  );

  const isPmndrs = projectStyle === 'pmndrs';
  const hostedInfo = hostedGitInfo.fromUrl('https://github.com/pmndrs/react-three-next');
  const url = hostedInfo.https({ noCommittish: !isPmndrs, noGitPlus: true });
  const branch = isPmndrs ? ['--branch', 'pmndrs'] : ['--branch', 'main'];
  const recursive = isPmndrs ? [] : ['--recursive'];
  const args = [
    'clone',
    url,
    ...branch,
    projectName,
    '--single-branch',
    ...recursive,
  ].filter((arg) => Boolean(arg));
  await execa('git', args, { stdio: 'inherit' });

  output.success(`Folder and files created for ${output.cmd(projectName)}`);

  await fs.remove(sysPath.join(projectName, '.git'));
  await install(projectName);
  process.chdir(projectPath);
  await initGit('Next');

  messages.start(projectName, 'next');
}

module.exports = next;
