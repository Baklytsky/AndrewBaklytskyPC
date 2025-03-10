const fs = require('fs');
const path = require('path');

const getIsAllowedPathType = (request, { customPathTypes = [] } = {}) => {
  return [ ...customPathTypes, './', '../' ].some(pathType => request.startsWith(pathType));
};

/**
 * Returns all path data that can be determined from the currently requested file.
 * This information is later used to determine if the file exists before attempting to resolve it,
 * and also to resolve the target file and continue the chain.
 */
const getRequestOverride = (baseDir, subDir, request) => {
  const dir = path.join(baseDir, subDir);
  const file = path.join(dir, request);
  const hasExt = !!path.extname(file);
  const main = !hasExt ? getMainFile(file) : '';

  return {
    dir,
    file: `${file}${main}`,
    request: `${request}${main}`,
    main,
    hasExt
  };
};

/**
 * Circumvent Webpack 5.x's change which will not resolve requests that point to directories with main files.
 * If `file` has an main file (i.e. `/index.js`), use that instead.
 * This might not be the best way to do this...
 */
const getMainFile = (file, mainFile = 'index') => {
  const pathWithMainFile = `${file}/${mainFile}.js`;

  return fs.existsSync(pathWithMainFile) ? `/${mainFile}.js` : '';
};

/**
 * Gets the directory fallback structure by looping through `themes` and comparing each item with the `request`.
 */
const getDirectoryData = (filePath, themes) => {
  for (let i = 0; i < themes.length; i++) {
    const currentDirPath = themes[i].path || themes[i];

    if (filePath.startsWith(currentDirPath)) {
      return {
        index: i,
        name: themes[i].name || currentDirPath,
        subDirectory: filePath.substring(currentDirPath.length + 1)
      }
    }
  }

  return null;
};

/**
 * Loops through the directory list [config.themes] and attempts to resolve the requests into the absolute path of the current directory.
 * @return {[null || Function]}         [description]
 */
const walkDirectories = (config = {}, onSuccess, onFail) => {
  const currIndex = config.startAt || 0;
  const nextIndex = currIndex + 1;
  const override = getRequestOverride(
    config.themes[currIndex].path || config.themes[currIndex],
    config.subDirectory,
    config.request,
  );

  fs.stat(override.file, (err, stat) => {
    // found, use it
    if (!err && stat && stat.isFile()) {
      return onSuccess?.(override);
    }

    //Recursively attempt to resolve the files following the directory list `config.themes` order.
    if (config.themes[nextIndex]) {
      config.startAt = nextIndex;

      walkDirectories(config, onSuccess, onFail);
    } else {
      // nothing worked, let other plugins try.
      return onFail?.();
    }

    return null;
  });
};

module.exports = {
  getIsAllowedPathType,
  getRequestOverride,
  getDirectoryData,
  walkDirectories,
};
