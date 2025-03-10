

# Theme Resolver

> Resolves files from a "theme" directory list. Allows overriding and extending files.

## Install

```sh
yarn add @bva/theme-resolver
```

Or

```sh
npm install @bva/theme-resolver
```

## Setup
The basic signature takes a `themes` Array, plus an optional `options` Object:
```js
ThemeResolver(themes, options);
```


### Webpack
Create a new instance of the `ThemeResolver` and pass it a `themes` array:

```js
const path = require('path');
const ThemeResolver = require('@bva/theme-resolver/webpack');

module.exports = {
  //...
  resolve: {
    plugins: [
      new ThemeResolver(
        [
          path.resolve(__dirname, 'path/to/override-theme'),
          path.resolve(__dirname, 'path/to/base-theme'),
        ],
        {
          //Options...
        }
      )
    ],
  },
}
```

### PostCSS
When using PostCSS [postcss-import](https://www.npmjs.com/package/postcss-import), since it utilizes its own resolving mechanism, the `resolve` option must be configured.

In your `postcss.config.js`:
```js
const path = require('path');
const ThemeResolver = require('@bva/theme-resolver/postcss');

module.exports = {
  plugins: {
    'postcss-import': {
      resolve: ThemeResolver(
        [
          path.resolve(__dirname, 'path/to/override-theme'),
          path.resolve(__dirname, 'path/to/base-theme'),
        ],
        {
          //Options...
        }
      ),
    },
    //...
  }
};
```

## Usage

Files are matched and resolved against the `themes` array.

For the following examples, assume your `themes` array is set to:
```js
[
  'path/to/override-theme',
  'path/to/base-theme'
]
```
With this file structure:
```
├── app
│   ├── base-theme
│   │   ├── entry.js
│   │   ├── bar.js
│   │   └── foo.js
│   └── override-theme
│   │   └── foo.js
```

### Relative imports
Relative imports (`./`, `../`) are resolved in the **indexed** order set by the `themes` array.

In this case, `override-theme` (index 0) is higher in the array and therefore has higher priority than `base-theme` (index 1).

For a `base-theme/entry.js` configured like this:
```js
import foo from './foo.js'; //Imports from `override-theme`.
import bar from './bar.js'; //Imports from `base-theme`.

//Do something with `foo` and `bar`...
foo();
bar();
```

At compilation time, since  `override-theme` has a higher priority than `base-theme` and because there is a `override-theme/foo.js`, the plugin will import `override-theme/foo.js` instead of `base-theme/foo.js`.

### Parent imports
Parent imports (`*/`) are resolved by starting from the **next index** in the `themes` array, as opposed to starting from the beginning of the `themes` array as relative imports do.

For a `override-theme/foo.js` with this code:
```js
import '*/foo.js'; //Imports from `base-theme`.

//Run some extra logic here...
```
Using a parent import in `override-theme` (index 0) will import files from `base-theme` (index 1).

#### Extending and re-exporting
Parent imports' main utility is extending code that needs to be reused from a parent theme.
Logic can be shared and re-exported from one theme to the next:
```js
import foo from '*/foo.js'; //Imports from `base-theme`.

foo.customMethod = () => {};

export default foo;
```

#### Traversing relative files
The parent import symbol (`*/`) is equivalent to the "current directory" symbol (`./`) but resolved from the **next index** in the `themes` array.
This means that files may also be imported using regular relative directory navigation patterns:
```js
import '*/../../path/to/bez.js'; //Imports from `base-theme`.
```

## Arguments
| Name | Type | Description |
|--|--|--|
| `themes` | [Array]<br />**(REQUIRED)**| Two or more absolute paths to where your files are located, sorted by priority. |


## Options
| Name | Type | Description |
|--|--|--|
| `excludePath` | [RegEx String]<br />**Default: `node_modules`** | Matches a path that should not be resolved (i.e. the path leading to the file you're importing). |
| `excludeRequest` | [RegEx String]<br />**Default: `node_modules`** | Matches a file that should not be resolved (i.e. the file name that you import). |
| `parentSymbol` | [String]<br />**Default: `*/`** | Set the symbol to use for signaling parent imports. |


You may pass additional [options from Webpack's resolve](https://webpack.js.org/configuration/resolve/#resolve).
