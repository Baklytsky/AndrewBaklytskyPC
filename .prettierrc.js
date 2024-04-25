module.exports = {
  // Spaces 4 lyfe
  useTabs: false,

  // 1 tab = 2 spaces
  tabWidth: 2,

  // Set preferred width in atom also, so the line matches
  printWidth: 200,

  // {foo: bar}
  bracketSpacing: false,

  // Print semicolons at the end of lines
  semi: true,

  // let always = (x) => x
  // let avoid = x => x
  arrowParens: 'always',

  // "" =>
  singleQuote: true,

  overrides: [
    /**
     * Use this to override options for specific files
     */
    {
      files: '*.something_special.js',
      options: {
        semi: true,
      },
    },
    {
      files: '**/*.liquid',
      options: {
        singleQuote: false,
        printWidth: 120,
      },
    },
  ],
};
