const fs = require('fs');
const {
  CachedInputFileSystem,
  ResolverFactory
} = require('enhanced-resolve');

const ThemeResolver = require('./webpack.js');

module.exports = (themes, options = {}) => {
  const DEFAULTS = {
    extensions: ['.css'],
    mainFields: ['style', 'main'],
    modules: ['node_modules'],
    fileSystem: options.fileSystem
      ? null
      : new CachedInputFileSystem(fs, 4000),
    useSyncFileSystemCalls: true,
    plugins: options.plugins || [
      new ThemeResolver(themes, options),
    ],
  };

  const resolver = ResolverFactory.createResolver({ ...DEFAULTS, ...options });

  return (id, basedir) => {
    return new Promise((resolve, reject) => {
      resolver.resolve({}, basedir, id, {}, (err, file) => err ? reject(err) : resolve(file));
    });
  };
}
