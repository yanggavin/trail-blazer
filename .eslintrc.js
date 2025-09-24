module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // Allow console.log for debugging
    'no-console': 'off',
    // Allow unused variables
    'no-unused-vars': 'off',
    // Allow undeclared variables (handled by TypeScript)
    'no-undef': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.expo/',
    'scripts/',
  ],
};
