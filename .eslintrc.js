module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'node': false
  },
  'globals': {
    'process': true
  },
  'plugins': [
    'react'
  ],
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 2018
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'max-len': [
      'error',
      {
        'code': 100,
        'comments': 120,
        'ignoreUrls': true,
        'ignoreStrings': true,
        'ignoreRegExpLiterals': true
      }
    ],
    'no-console': [
      'error'
    ],
    'react/prop-types': 0
  }
};
