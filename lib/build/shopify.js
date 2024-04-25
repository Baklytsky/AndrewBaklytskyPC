/* eslint-disable require-await */
/* eslint-disable compat/compat */
const path = require('path');
const {spawn} = require('child_process');
const {existsSync} = require('fs');
const {cp} = require('fs/promises');

const yargs = require('yargs');
const log = require('fancy-log');
const colors = require('ansi-colors');

// Start shopify theme dev in a new process
exports.startShopifyDevProcesses = async function (done) {
  const {
    env,
    settings: settingsEnvironmentFolder,
    _: rest,
  } = yargs(process.argv.slice(3)).parserConfiguration({'unknown-options-as-args': true}).string('env').alias('e', 'env').alias('environment', 'env').string('settings').alias('s', 'settings').argv;
  let basePort = 9000;

  if (settingsEnvironmentFolder) {
    await copyEnvironmentConfigToDist(settingsEnvironmentFolder);
  }
  await startShopifyDevProcess(env, basePort, rest);

  done();
};

// Start shopify theme dev in a new process
exports.deployShopifyStores = async function (done) {
  // Extract "env" arg, and collect the rest to pass directly to shopify CLI
  const {env: envs, _: rest} = yargs(process.argv.slice(3)).parserConfiguration({'unknown-options-as-args': true}).string('env').alias('e', 'env').alias('environment', 'env').argv;

  for (const env of envs.split(',')) {
    await deployShopifyStore(env, rest);
  }

  done();
};

async function deployShopifyStore(env, initialArgs = []) {
  return new Promise((resolve, reject) => {
    const filteredArgs = initialArgs.filter((arg) => !arg.startsWith('--index'));
    const args = ['theme', 'push', '--path=dist', env && `--environment=${env}`, ...filteredArgs].filter(Boolean);

    log(colors.grey(['shopify', ...args].join(' ')));

    let shopifyProcess = spawn('shopify', args, {
      stdio: ['inherit', 'inherit', 'inherit'],
    });

    shopifyProcess.on('error', (error) => {
      log(colors.red(error.message));
      reject(error.message);
    });

    shopifyProcess.on('close', (code) => {
      if (code == 0) {
        resolve();
      } else {
        reject(`child process exited with code ${code}`);
      }
    });

    shopifyProcess.on('message', (message) => {
      console.log(`child process message ${message}`);
      resolve();
    });

    process.on('SIGINT', function () {
      // Make sure we kill shopify process when main gulp process dies
      if (shopifyProcess) {
        console.log(`Stopping PID...`);
        shopifyProcess.kill('SIGKILL');
      }
      process.exit(0);
    });

    return shopifyProcess;
  });
}

async function startShopifyDevProcess(env, port, initialArgs) {
  return new Promise((resolve, reject) => {
    const filteredArgs = initialArgs.filter((arg) => !arg.startsWith('--index'));
    const args = ['theme', 'dev', '--path=dist', `--port=${port}`, env && `--environment=${env}`, ...filteredArgs].filter(Boolean);

    log(colors.grey(['shopify', ...args].join(' ')));

    let shopifyProcess = spawn('shopify', args, {
      stdio: ['inherit', 'pipe', 'inherit'],
    });

    shopifyProcess.stdout.on('data', (data) => {
      const stringData = data.toString();

      if (stringData.match(/success/)) {
        // Once theme has been deployed, resolve to allow the next shopify process to start
        resolve();
      }

      process.stdout.write(data);
    });

    shopifyProcess.on('error', (error) => {
      log(colors.red(error.message));
      reject();
    });

    shopifyProcess.on('close', (code) => {
      if (code == 0) {
        resolve();
      } else {
        reject(`child process exited with code ${code}`);
      }
    });

    process.on('SIGINT', function () {
      // Make sure we kill shopify process when main gulp process dies
      if (shopifyProcess) {
        console.log(`Stopping PID ${shopifyProcess.pid}...`);
        shopifyProcess.kill('SIGKILL');
      }
      process.exit(0);
    });

    return shopifyProcess;
  });
}

async function copyEnvironmentConfigToDist(env) {
  const sourcePath = path.join(__dirname, '..', '..', 'environments', env);
  const destPath = path.join(__dirname, '..', '..', 'dist');

  if (existsSync(sourcePath)) {
    // TODO: wip config / templates first

    log(colors.white(`Copying environment config files from ${path.relative(path.join(__dirname, '..', '..'), sourcePath)} to ${path.relative(path.join(__dirname, '..', '..'), destPath)}`));
    return cp(sourcePath, destPath, {force: true, recursive: true});
  } else {
    throw new Error(`Environment folder for ${env} not found at ${sourcePath}`);
  }
}
