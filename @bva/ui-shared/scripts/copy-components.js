#!/usr/bin/env node

'use strict';

const fse = require('fs-extra');
const path = require('path');
const prompts = require('prompts');

const cwd = process.cwd();

const FRAMEWORK_TYPES = ['vue', 'react'];

const questions = [
  {
    type: "select",
    name: "framework",
    message: "Which framework are you using?",
    choices: FRAMEWORK_TYPES
  },
];

(async () => {
  const response = await prompts(questions);
  const selectedFramework = FRAMEWORK_TYPES[response.framework];
  const componentsPackageName = `ui-${selectedFramework}`;
  const sharedPackageName = 'ui-shared';

  const sourceSharedPath = path.join(__dirname, '..');
  const sourceComponentsPath = path.join(__dirname, `../../${componentsPackageName}`);

  const targetSharedPath = path.join(cwd, `./packages/${sharedPackageName}`);
  const targetComponentsPath = path.join(cwd, `./packages/${componentsPackageName}`);

  fse.copy(sourceSharedPath, targetSharedPath);
  fse.copy(sourceComponentsPath, targetComponentsPath);
})();

process.on('exit', code => {
  if (code === 0) {
    console.log('\x1b[36m%s\x1b[0m', `\n✓ Copying components completed!\n`);
  }
});
