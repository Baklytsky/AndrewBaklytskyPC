/* eslint-disable no-process-env */
import path from 'path';

import {terser} from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import sizes from 'rollup-plugin-sizes';
import swc from 'rollup-plugin-swc';
import glob from 'glob';

const src = path.join(__dirname, './src');
const dist = path.join(__dirname, './dist');
const nodeModules = path.join(__dirname, './node_modules');
const production = process.env.NODE_ENV === 'production';

/* Use glob to get all .js files in the components directory */
const inputComponents = glob.sync(path.join(src, 'js/components/*.js'));

const minifiedComment = `
/*
* @license
* Carbon (c) Presidio Creative
*
* The contents of this file should not be modified.
* add any minor changes to assets/custom.js
*
*/
`;

const developmentComment = `
/*
* @license
* Carbon (c) Presidio Creative
*
* This file is included for advanced development by
* Shopify Agencies.  Modified versions of the theme
* code are not supported by Shopify or Presidio Creative.
*
* In order to use this file you will need to change
* theme.js to theme.dev.js in /layout/theme.liquid
*
*/
`;

const globalPackages = {
  '@shopify/theme-rte': 'themeVendor.themeRte',
  'scroll-lock': 'themeVendor.ScrollLock',
};

const externalPackages = ['@shopify/theme-product', '@shopify/theme-product-form', '@shopify/theme-rte', 'scroll-lock'];

const config = {
  development: [
    {
      input: path.join(src, 'js', 'theme.js'),
      external: externalPackages,
      output: [
        {
          file: path.join(dist, 'assets', 'theme.js'),
          format: 'iife',
          name: 'themeDevelopment',
          interop: 'default',
          sourcemap: true,
          banner: developmentComment,
          globals: globalPackages,
        },
      ],
      plugins: [
        resolve({
          rootDir: nodeModules,
          browser: true,
        }),
        injectProcessEnv({
          NODE_ENV: 'development',
        }),
      ],
    },
    {
      input: path.join(src, 'js', 'vendor.js'),
      output: [
        {
          file: path.join(dist, 'assets', 'vendor.js'),
          name: 'themeVendor',
          sourcemap: true,
          format: 'iife',
          plugins: [production && terser()],
        },
      ],
      plugins: [
        resolve({
          rootDir: nodeModules,
          browser: true,
        }),
        commonjs(),
        sizes(),
      ],
    },
    {
      input: path.join(src, 'js', 'theme-editor.js'),
      output: [
        {
          file: path.join(dist, 'assets', 'theme-editor.js'),
          name: 'themeEditor',
          sourcemap: true,
          format: 'iife',
          plugins: [],
        },
      ],
      plugins: [
        resolve({
          rootDir: nodeModules,
          browser: true,
        }),
        commonjs(),
        sizes(),
      ],
    },
    {
      input: path.join(src, 'js', 'photoswipe.js'),
      output: [
        {
          file: path.join(dist, 'assets', 'photoswipe.js'),
          name: 'themePhotoswipe',
          format: 'iife',
          sourcemap: true,
          plugins: [terser()],
        },
      ],
      plugins: [
        resolve({
          rootDir: nodeModules,
          browser: true,
        }),
        commonjs(),
      ],
    },
    {
      input: path.join(src, 'js', 'rellax.js'),
      output: [
        {
          file: path.join(dist, 'assets', 'rellax.js'),
          name: 'themeRellax',
          format: 'iife',
          sourcemap: true,
          plugins: [terser()],
        },
      ],
      plugins: [
        resolve({
          rootDir: nodeModules,
          browser: true,
        }),
        commonjs(),
      ],
    },
    ...inputComponents.map((inputFile) => {
      const fileName = path.basename(inputFile); // Extract the file name
      return {
        input: inputFile,
        output: {
          file: path.join(dist, 'assets', fileName),
          name: 'component',
          sourcemap: true,
          format: 'iife',
          plugins: [production && terser()],
        },
        plugins: [
          resolve({
            rootDir: nodeModules,
            browser: true,
          }),
          commonjs(),
          sizes(),
        ],
      };
    }),
  ],
  production: [
    {
      input: path.join(src, 'js', 'theme.js'),
      external: externalPackages,
      output: [
        {
          file: path.join(dist, 'assets', 'theme.dev.js'),
          format: 'iife',
          name: 'themeDevelopment',
          interop: 'default',
          sourcemap: false,
          banner: developmentComment,
          globals: globalPackages,
        },
      ],
      plugins: [
        resolve({
          rootDir: nodeModules,
          browser: true,
        }),
        injectProcessEnv({
          NODE_ENV: 'production',
        }),
      ],
    },
    {
      input: path.join(src, 'js', 'theme.js'),
      external: externalPackages,
      output: [
        {
          file: path.join(dist, 'assets', 'theme.js'),
          format: 'iife',
          name: 'themeMin',
          interop: 'default',
          sourcemap: false,
          banner: minifiedComment,
          globals: globalPackages,
          plugins: [production && terser()],
        },
      ],
      plugins: [
        resolve({
          rootDir: nodeModules,
          browser: true,
        }),
        production &&
          swc({
            jsc: {
              parser: {
                syntax: 'ecmascript',
              },
              target: 'es2019',
            },
          }),
        injectProcessEnv({
          NODE_ENV: 'production',
        }),
        sizes(),
      ],
    },
    {
      input: path.join(src, 'js', 'vendor.js'),
      output: [
        {
          file: path.join(dist, 'assets', 'vendor.js'),
          name: 'themeVendor',
          sourcemap: false,
          format: 'iife',
          plugins: [terser()],
        },
      ],
      plugins: [
        resolve({
          rootDir: nodeModules,
          browser: true,
        }),
        commonjs(),
        sizes(),
      ],
    },
    {
      input: path.join(src, 'js', 'theme-editor.js'),
      output: [
        {
          file: path.join(dist, 'assets', 'theme-editor.js'),
          name: 'themeEditor',
          sourcemap: false,
          format: 'iife',
          plugins: [production && terser()],
        },
      ],
      plugins: [
        resolve({
          rootDir: nodeModules,
          browser: true,
        }),
        commonjs(),
        sizes(),
      ],
    },
    {
      input: path.join(src, 'js', 'photoswipe.js'),
      output: [
        {
          file: path.join(dist, 'assets', 'photoswipe.js'),
          name: 'themePhotoswipe',
          format: 'iife',
          sourcemap: false,
          plugins: [terser()],
        },
      ],
      plugins: [
        resolve({
          rootDir: nodeModules,
          browser: true,
        }),
        commonjs(),
      ],
    },
    {
      input: path.join(src, 'js', 'rellax.js'),
      output: [
        {
          file: path.join(dist, 'assets', 'rellax.js'),
          name: 'themeRellax',
          format: 'iife',
          sourcemap: false,
          plugins: [terser()],
        },
      ],
      plugins: [
        resolve({
          rootDir: nodeModules,
          browser: true,
        }),
        commonjs(),
      ],
    },
    ...inputComponents.map((inputFile) => {
      const fileName = path.basename(inputFile); // Extract the file name
      return {
        input: inputFile,
        output: {
          file: path.join(dist, 'assets', fileName),
          name: 'component',
          sourcemap: false,
          format: 'iife',
          plugins: [production && terser()],
        },
        plugins: [
          resolve({
            rootDir: nodeModules,
            browser: true,
          }),
          commonjs(),
          sizes(),
        ],
      };
    }),
  ],
};

console.log('           rollup 🍣 is in ' + process.env.NODE_ENV + ' mode.');

export default config[process.env.NODE_ENV || 'development'];
