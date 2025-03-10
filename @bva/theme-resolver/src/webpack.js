/**
 * Override paths from an ordered list of directories.
 */

const {
  getIsAllowedPathType,
  getDirectoryData,
  walkDirectories,
} = require('./helpers.js');

class ThemeResolver {
  constructor(themes = [], options = {}) {
    const DEFAULTS = {
      excludePath: 'node_modules',
      excludeRequest: 'node_modules',
      parentSymbol: '*/',
    };

    this.themes = themes;
    this.options = { ...DEFAULTS, ...options };
  }

  apply(resolver) {
    const self = this;

    this.resolvedHook = resolver.ensureHook('parsedResolve');
    this.resolver = resolver;

    this.options = { ...this.resolver.options, ...this.options }

    this.resolver.getHook('beforeResolve').tapAsync('ThemeResolver', (requestContext, resolveContext, callback) => {
      const isAllowedPathType = getIsAllowedPathType(requestContext.request, { customPathTypes: [self.options.parentSymbol] });

      let startAt = 0;

      if (!isAllowedPathType || requestContext.path.match(self.options.excludePath) || requestContext.request.match(self.options.excludeRequest)) {
        return callback();
      }

      const directoryData = getDirectoryData(requestContext.path, self.themes);

      if (!directoryData) {
        return callback();
      }

      //Starting a file with `*/` indicates that it should look for the file on the next directory in line, as opposed to going through the entire `themes`.
      //This is useful to chain files with the same name and location without needing to specify the base directory name or alias.
      if (requestContext.request.startsWith(self.options.parentSymbol)) {
        startAt = directoryData.index + 1;
        requestContext.request = requestContext.request.replace(self.options.parentSymbol, './');
      }

      walkDirectories(
        {
          themes: self.themes,
          request: requestContext.request,
          ...directoryData,
          startAt,
          options: self.options,
        },
        (override) => self.resolveRequest(override, requestContext, resolveContext, callback),
        callback,
      );

      return null;
    });
  }

  /**
   * Resolves the request using the matched `requestContext.request` from `override`.
   */
  resolveRequest(override, requestContext, resolveContext, callback, newFile, resolutionMsg = 'source file') {
    const result = Object.assign({}, requestContext, {
      path: override.dir,
      request: override.request,
    });

    // Parse `requestContext.request` and add it to request.
    // This seems the only way to do the resolution without get caught in a infinite loop.
    const parsed = this.resolver.parse(result.request);
    const parsedResult = { ...result, ...parsed };

    return this.resolver.doResolve(this.resolvedHook, parsedResult, `Match found: ${resolutionMsg}`, resolveContext, callback);
  }
}

module.exports = ThemeResolver;
