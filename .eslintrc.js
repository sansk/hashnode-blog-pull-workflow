module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    // Code style rules
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    indent: ['error', 2],
    quotes: ['error', 'single'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1, maxBOF: 0 }],

    // Best practices
    'no-console': 'off', // Allow console for logging in GitHub Actions
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-destructuring': [
      'error',
      {
        array: false,
        object: true
      }
    ],

    // Error prevention
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-duplicate-imports': 'error',
    'no-self-compare': 'error',
    'no-template-curly-in-string': 'error',

    // Function rules
    'arrow-spacing': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-parens': ['error', 'as-needed'],

    // Object/Array rules
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'comma-spacing': ['error', { before: false, after: true }],

    // String rules
    'template-curly-spacing': 'error',
    'prefer-template': 'error',

    // Comment rules
    'spaced-comment': [
      'error',
      'always',
      {
        line: {
          markers: ['/'],
          exceptions: ['-', '+']
        },
        block: {
          markers: ['!'],
          exceptions: ['*'],
          balanced: true
        }
      }
    ],

    // Import rules
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single']
      }
    ]
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/__tests__/**/*.js'],
      env: {
        jest: true
      },
      rules: {
        // Allow more relaxed rules in tests
        'no-unused-expressions': 'off'
      }
    }
  ],
  globals: {
    // Add any global variables here if needed
  }
};
