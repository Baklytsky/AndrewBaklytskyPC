#!/usr/bin/env node

'use strict';

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const fileSave = require('file-save');
const uppercamelcase = require('uppercamelcase');
const prompts = require('prompts');
const IndexComponents = require('./index-components');

const cwd = process.cwd();

// @todo: before adding new framework, ensure to also generate the
// correct files for said framework (ie. component.vue, etc.).
const PACKAGE_TYPE = ['vue', 'react'];
const ATOMIC_TYPE = ['atoms', 'molecules', 'organisms'];

const INFERRED_PACKAGE = PACKAGE_TYPE.find((type) => cwd.includes(`ui-${type}`));
const INFERRED_PACKAGE_INDEX = INFERRED_PACKAGE ? PACKAGE_TYPE.indexOf(INFERRED_PACKAGE) : 0;

const questions = [
  {
    type: 'select',
    name: 'framework',
    message: 'Which framework do you want to create the component with?',
    choices: PACKAGE_TYPE,
    initial: INFERRED_PACKAGE_INDEX,
  },
  {
    type: 'select',
    name: 'atomic',
    message: 'What type of component do you want to create?',
    choices: ATOMIC_TYPE
  },
  {
    type: 'text',
    name: 'name',
    message: 'Enter the name for the component',
    initial: 'banner'
  },
  {
    type: 'text',
    name: 'prefix',
    message: 'Enter the prefix for the component',
    initial: 'Ra'
  }
];

(async () => {
  const response = await prompts(questions);

  createComponent(
    PACKAGE_TYPE[response.framework],
    ATOMIC_TYPE[response.atomic],
    response.name,
    response.prefix
  );
})();

function createComponent(framework, classification, name, prefix) {
  const frameworkDir = `ui-${framework}`;
  const ComponentType = uppercamelcase(classification);
  const ComponentName = uppercamelcase(name);
  const ComponentNameCamelCase = ComponentName.startsWith(prefix)
    ? ComponentName
    : prefix + ComponentName;

  const BoilerplatePath = path.resolve(
    __dirname,
    `../../${frameworkDir}/component-boilerplate/`
  );

  const FrameworkPath = path.resolve(
    __dirname,
    `../../${frameworkDir}/src/components/${classification}`,
    `${ComponentNameCamelCase}`
  );

  const SharedFilesPath = path.resolve(
    __dirname,
    `../styles/components/${classification}`
  );

  const ComponentNameKebabCase =
    prefix.toLowerCase() +
    ComponentName.replace(/([A-Z])(?=\w)/g, (s1, s2) => `-${s2.toLowerCase()}`);

  const ret = glob.sync(`${FrameworkPath}/${ComponentNameCamelCase}.js`);

  if (ret.length > 0) {
    console.warn(`${ComponentNameCamelCase} component was already created. \n`);
    process.exit(-1);
  }

  const sharedFiles = [
    {
      fileName: `${ComponentNameCamelCase}.css`,
      filePath: SharedFilesPath,
      content: `

.${ComponentNameKebabCase} {}

.${ComponentNameKebabCase}__child {
}

.${ComponentNameKebabCase}--modifier {
}`
    }
  ];

  if (!fs.existsSync(BoilerplatePath)) {
    console.error(`\n\nComponent not created. No component templates available for ${frameworkDir}. \n`);

    process.exit(-1);
  }

  let completedFileCount = 0;
  const boilerplateList = fs.readdirSync(BoilerplatePath);

  boilerplateList.forEach(file => {
    const fileName = file.replace('component', ComponentNameCamelCase);
    const newFilePath = path.join(FrameworkPath, fileName);

    let content = fs.readFileSync(`${BoilerplatePath}/${file}`, 'utf8');

    content = content.replace(/ComponentFolder/g, classification);
    content = content.replace(/ComponentNameCamelCase/g, ComponentNameCamelCase);
    content = content.replace(/ComponentNameKebabCase/g, ComponentNameKebabCase);
    content = content.replace(/ComponentName/g, ComponentName);
    content = content.replace(/ComponentType/g, ComponentType);

    fileSave(newFilePath)
      .write(content, 'utf8')
      .end('\n')
      .finish(() => {
        //Since this operation happens asynchronously,
        //ensures all files are written before re-indexing.
        if (++completedFileCount >= boilerplateList.length) {
          IndexComponents.createIndexFiles();
          IndexComponents.createIndexFiles({ build: 'styles' });
        }
      });
  });

  sharedFiles.forEach(file => {
    let filePath = path.join(file.filePath || FrameworkPath, file.fileName);
    if (!fs.existsSync(filePath)) {
      fileSave(filePath)
        .write(file.content, 'utf8')
        .end('\n');
    }
  });
}

process.on('exit', code => {
  if (code === 0) {
    console.log('\x1b[36m%s\x1b[0m', `\n✓ Component created successfully. Refresh your file trees.\n`);
  }
});
