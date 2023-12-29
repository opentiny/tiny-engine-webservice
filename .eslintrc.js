module.exports = {
 
  parserOptions: {
    // recommend to use another config file like tsconfig.eslint.json and extends tsconfig.json in it.
    // because you may be need to lint test/**/*.test.ts but no need to emit to js.
    project: './tsconfig.eslint.json'
  },
  rules: {
    '@typescript-eslint/no-empty-interface': [
      'error',
      {
        'allowSingleExtends': true
      }
    ],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/comma-spacing': [
      'error', { before: false, after: true }
    ],
    'arrow-spacing': [
      'error', { before: true, after: true }
    ],
    '@typescript-eslint/keyword-spacing': 'warn',
    '@typescript-eslint/space-infix-ops': 'warn',
    '@typescript-eslint/type-annotation-spacing': 'warn',
    "@typescript-eslint/semi": "warn",
    "max-len": [
      "error",
      { 
        "code": 160, 
        "comments": 160,
        "tabWidth": 2 
      },
    ],
  }
};
