module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { project: './tsconfig.json' },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
