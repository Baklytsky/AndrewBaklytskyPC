#!/usr/bin/env node

"use strict";

/**
 * This script can update bulk as well as individual uses of a component name within the codebase.
 *
 * Usage examples.
 *
 * To rename all components in the codebase at once, use the `--prefix` and `--new` flags:
 *
 * yarn rename-components --prefix Sf --new Ra
 *
 * or
 *
 * npm run rename-components --prefix Sf --new Ra
 *
 * To rename a single component, use the `--name` and `--new` flags:
 *
 * yarn rename-components --name SfMyComponent --new RaMyComponent
 *
 * or
 *
 * npm run rename-components --name SfMyComponent --new RaMyComponent
 *
 * Note when using --css-classes option:
 * Some components do not match their class names, or certain class names
 * aren't represented as a component. For such cases, use this command:
 *
 * yarn rename-components --name sf- --new ra-
 *
 * or
 *
 * npm run rename-components --name sf- --new ra-
 *
 * Be weary when you follow that this approach though, as it may incorrectly replace certain strings.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const prompts = require('prompts');

const cwd = process.cwd();

const FRAMEWORK_TYPES = ['vue', 'react'];
const ACTION_TYPES = ['prefix', 'full-word'];
const INCLUDED_FILES = '+(tsx|jsx|vue)';

const questions = [
  {
    type: 'select',
    name: 'framework',
    message: 'Which framework are you using?',
    choices: FRAMEWORK_TYPES,
  },
  {
    type: 'select',
    name: 'actionType',
    message: 'This is prefix or a full word?',
    choices: ACTION_TYPES,
  },
  {
    type: 'text',
    name: 'renameFrom',
    message: 'What are you renaming from?',
    validate(input) {
      return !!input;
    },
  },
  {
    type: 'text',
    name: 'renameTo',
    message: 'The new name or keyword to use?',
    validate(input) {
      return !!input;
    },
  },
  {
    type: 'text',
    name: 'targetPath',
    message: 'Path with files to rename? This is relative to the CWD',
    initial: cwd,
  },
  {
    type: 'text',
    name: 'includedFileTypes',
    message: 'File types to rename? Use extension or glob',
    initial: INCLUDED_FILES,
  },
  {
    type: 'confirm',
    name: 'renameClasses',
    message: 'Rename CSS classes?',
    initial: true,
  },
  {
    type: 'confirm',
    name: 'renameLowerCase',
    message: 'Rename lower-case usage?',
    initial: true,
  },
];

/**
 * Updates the actual contents of a file, where `searchStr` is replaced with `replaceStr`.
 * @param  {String} currentFile [Required. Path to the file to be read and updated.]
 * @param  {String} searchStr   [Required. String or keyword to search for within the current file's contents.]
 * @param  {String} replaceStr  [Required. String or keyword to use as replacement.]
 */
function _updateFileContents(currentFile, searchStr, replaceStr, options = {}) {
  let parsedFileData = fs.readFileSync(currentFile, 'utf8');
  let regExpSearch = searchStr;

  if (parsedFileData.err) {
    return console.log(parsedFileData.err);
  }

  const replaceObj = {
    [searchStr]: replaceStr,
  };

  //When searching for kebab-cased strings, use a more complex search/replace
  //setup to avoid parsing the file's contents twice.
  if (options.includeKebab) {
    const kebabSearchStr = _makeKebab(searchStr);

    replaceObj[kebabSearchStr] = _makeKebab(replaceStr);

    regExpSearch += `|${kebabSearchStr}`;
  }

  if (options.includeLowercase) {
    replaceObj[searchStr.toLowerCase()] = replaceStr.toLowerCase();

    regExpSearch += `|${searchStr.toLowerCase()}`;
  }

  parsedFileData = parsedFileData.replace(
    new RegExp(regExpSearch, "g"),
    (match) => replaceObj[match]
  );

  //Since too many files are being processed at a time, use synchronous operations,
  //otherwise console will throw a memory error.
  fs.writeFileSync(currentFile, parsedFileData, 'utf8', function (err) {
    if (err) return console.log(err);
  });
}

/**
 * Transform a given string `str` from CamelCase to kebab-case.
 * @return {String}     [The transformed string]
 */
function _makeKebab(str) {
  return str?.split(/(?=[A-Z])/).join("-").toLowerCase();
}

/**
 * Generate a static list of file paths that can and should be mutated.
 * @param  {String} srcPath [Optional. Set the working directory for the glob search.]
 * @return {Array}         [File path list]
 */
function _getAllTransformableFiles(srcPath) {
  return glob.sync('**/*.*', {
    cwd: srcPath,
    ignore: [
      '**/node_modules/**/*.*',
      '**/.nuxt/**/*.*',
      '**/dist/**/*.*',
      '**/static/**/*.*',
    ],
    absolute: true,
  });
}

function _isAllowedExtension(extension) {
  return (
    ['.vue', '.js', '.ts', '.jsx', '.tsx', '.md', '.mdx', '.css', '.scss'].indexOf(extension) !== -1
  );
}

/**
 * Replaces instances of `prevName` with `newName` in a given `fileList`.
 * This method will both rename matching dir/file names with `newName`,
 * as well as uses of said keyword within the contents of files in the codebase.
 *
 * Tip: Take a look at `_getAllTransformableFiles()` for a list of file types and directories that are allowed.
 *
 * @param  {Array} fileList [Required. A static list of file paths to be looped through in search for uses of `prevName` in either directories, file names, or file contents.]
 * @param  {String} prevName  [Required. Component name you want replaced, for example "SfMyComponent". Case sensitive.]
 * @param  {String} newName  [Required. Component name you want to be used, for example "RaMyComponent".]
 */
function renameComponent(fileList, options = {}) {
  if (options.prevName && options.newName) {
    fileList.forEach((currentFile, index) => {
      const nameMatchesInPath = currentFile.indexOf(options.prevName) !== -1;

      //Handles renaming the actual component's file name throughout the codebase.
      if (nameMatchesInPath) {
        const newFilePath = currentFile.replace(
          new RegExp(options.prevName, 'g'),
          options.newName
        );
        const newDirName = path.dirname(newFilePath);
        const oldDirName = path.dirname(currentFile);

        //`fs.renameSync()` does not create directories if they're missing.
        if (!fs.existsSync(newDirName)) {
          fs.mkdirSync(newDirName, { recursive: true });
        }

        fs.renameSync(currentFile, newFilePath);

        //Delete empty directories after renaming them.
        fs.rmdir(oldDirName, () => true);

        //Replace the `fileList[index]` and `currentFile` pointers with `newFilePath` so that
        //subsequent file updates can reference the renamed file.
        fileList[index] = newFilePath;
        currentFile = newFilePath;
      }

      //Do not update the contents of a file if it's not allowed, to prevent weird mutations.
      //Check is done here and not when generating the `fileList` with `_getAllTransformableFiles()`
      //because we want to include all possible file paths since the directories or file names could still
      //need to be changed.
      if (_isAllowedExtension(path.extname(currentFile))) {
        _updateFileContents(currentFile, options.prevName, options.newName, {
          includeKebab: options.cssClasses,
          includeLowercase: options.lowerCase,
        });
      }
    });
  }
}

/**
 * Update's a component's `searchPrefix` with `replacePrefix`.
 */
function _updatePrefix(componentName, searchPrefix, replacePrefix) {
  return componentName.replace(new RegExp(`^${searchPrefix}`), replacePrefix || "");
}

/**
 * Recursively rename components and their uses in the codebase by using a prefix.
 * @param  {String} searchLocation [Required. Path to the common directory where components are stored.]
 * @param  {String} prevPrefix      [Required. Prefix you want replaced, for example "Sf". Case sensitive.]
 * @param  {String} newPrefix      [Optional. Prefix you want to be used, for example "Ra".]
 */
function renameAllComponents(searchLocation, options = {}) {
  const fileList = _getAllTransformableFiles(options.targetPath);

  glob(
    `*/**/*.${options.fileType}`,
    {
      cwd: searchLocation,
      ignore: options.ignore,
    },
    function (err, files) {
      files.forEach((currentFile) => {
        const fileExtension = path.extname(currentFile);

        let prevName = path.basename(currentFile).replace(`.${fileExtension}`, '');
        let newName = _updatePrefix(prevName, options.prevPrefix, options.newPrefix);

        //Use case for when the component list had previously been updated but new changes were introduced.
        //For example, when pulling new code when adding integratons from 3rd parties.
        if (prevName === newName) {
          prevName = _updatePrefix(prevName, options.newPrefix, options.prevPrefix);
        }

        process.stdout.write(`${prevName} => ${newName}`);

        renameComponent(fileList, {
          prevName,
          newName,
          cssClasses: options.cssClasses,
        });

        //Add some fancy styling to the already-processed previous line.
        process.stdout.clearLine();
        process.stdout.cursorTo(0);

        console.log('\x1b[36m%s\x1b[0m', `✓ ${prevName} => ${newName}`);
      });
    }
  );
}

(async () => {
  const onCancel = () => {
    return process.exit(-1);
  };
  const response = await prompts(questions, { onCancel });
  const selectedFramework = FRAMEWORK_TYPES[response.framework];
  const componentsPackageName = `ui-${selectedFramework}`;

  //Static reference to `componentsPath` since it is the main components location.
  const componentsPath = path.join(__dirname, `../../${componentsPackageName}/src/components`);
  const componentFileIgnores = ['*/**/*.stories.*', '*/**/*.spec.*'];

  if (response.actionType === 0) {
    renameAllComponents(componentsPath, {
      fileType: response.includedFileTypes,
      ignore: componentFileIgnores,
      targetPath: response.targetPath,
      prevPrefix: response.renameFrom,
      newPrefix: response.renameTo,
      cssClasses: response.renameClasses,
      lowerCase: response.renameLowerCase,
    });
  } else {
    renameComponent(_getAllTransformableFiles(response.targetPath), {
      prevName: response.renameFrom,
      newName: response.renameTo,
      cssClasses: response.renameClasses,
      lowerCase: response.renameLowerCase,
    });
  }
})();

process.on('exit', code => {
  if (code === 0) {
    console.log('\x1b[36m%s\x1b[0m', `\n✓ Renaming completed. Remember to refresh your file trees.\n`);
  }

  if (code === -1) {
    console.log('\x1b[33m%s\x1b[0m', `\n✗ Renaming cancelled.\n`);
  }
});
