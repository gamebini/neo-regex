// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Possible Errors
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],

    // Best Practices
    'curly': 'error',
    'eqeqeq': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-wrappers': 'error',
    'no-throw-literal': 'error',
    'no-with': 'error',
    'prefer-promise-reject-errors': 'error',

    // Variables
    'no-shadow': 'error',
    'no-use-before-define': ['error', { functions: false }],

    // Stylistic Issues
    'indent': ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single', { allowTemplateLiterals: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'comma-spacing': 'error',
    'comma-style': 'error',
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always'
    }],
    'space-in-parens': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],

    // ES6+
    'arrow-spacing': 'error',
    'constructor-super': 'error',
    'no-const-assign': 'error',
    'no-dupe-class-members': 'error',
    'no-duplicate-imports': 'error',
    'no-new-symbol': 'error',
    'no-this-before-super': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-constructor': 'error',
    'no-useless-rename': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error'
  },
  overrides: [
    {
      files: ['frontend/**/*.js'],
      env: {
        browser: true,
        node: false
      },
      globals: {
        // Browser globals
        'crypto': 'readonly'
      }
    },
    {
      files: ['backend/**/*.js'],
      env: {
        node: true,
        browser: false
      },
      rules: {
        'no-console': 'off' // Allow console.log in backend
      }
    },
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-unused-expressions': 'off'
      }
    }
  ]
};