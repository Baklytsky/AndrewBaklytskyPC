/* eslint-disable no-process-env */
import path from 'path';

import {terser} from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import sizes from 'rollup-plugin-sizes';
import swc from 'rollup-plugin-swc';

const src = path.join(__dirname, './src');
const dist = path.join(__dirname, './dist');
const nodeModules = path.join(__dirname, './node_modules');
const production = process.env.NODE_ENV === 'production';

const minifiedComment = `
/*
* @license
* Palo Alto Theme (c)
*
* The contents of this file should not be modified.
* add any minor changes to assets/custom.js
*
*/
`;

const developmentComment = `
/*
* @license
* Palo Alto Theme (c)
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
  '@shopify/theme-a11y': 'themeVendor.a11y',
  '@shopify/theme-addresses': 'themeVendor.themeAddresses',
  '@shopify/theme-currency': 'themeVendor.themeCurrency',
  '@shopify/theme-images': 'themeVendor.themeImages',
  '@shopify/theme-rte': 'themeVendor.themeRte',
  ajaxinate: 'themeVendor.ajaxinate',
  aos: 'themeVendor.AOS',
  flickity: 'themeVendor.Flickity',
  'flickity-imagesloaded': 'themeVendor.FlickityImagesLoaded',
  'flickity-as-nav-for': 'themeVendor.FlickityAsNavFor',
  'flickity-fade': 'themeVendor.FlickityFade',
  'scroll-lock': 'themeVendor.ScrollLock',
};

const externalPackages = [
  '@shopify/theme-a11y',
  '@shopify/theme-addresses',
  '@shopify/theme-currency',
  '@shopify/theme-images',
  '@shopify/theme-product',
  '@shopify/theme-product-form',
  '@shopify/theme-rte',
  'ajaxinate',
  'aos',
  'flickity',
  'flickity-imagesloaded',
  'flickity-as-nav-for',
  'flickity-fade',
  'scroll-lock',
];

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
      ],
    },
  ],
};

console.log('           rollup 🍣 is in ' + process.env.NODE_ENV + ' mode.');

export default config[process.env.NODE_ENV || 'development'];
