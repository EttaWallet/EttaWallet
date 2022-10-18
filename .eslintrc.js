module.exports = {
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended',
    //'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  rules: {
    'react/prop-types': 'off',
    'no-console': ['warn'],
    'import/no-extraneous-dependencies': ['off'],
  },
  overrides: [
    {
      files: ['*.{test,spec,story}.ts{,x}'],
      rules: {
        'import/no-extraneous-dependencies': ['off', { packageDir: './' }],
      },
    },
  ],
};
