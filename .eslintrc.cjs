/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'vue/multi-word-component-names': [
      'error',
      {
        ignores: ['App', 'index'],
      },
    ],
    indent: ['warn', 2],
    quotes: ['warn', 'single'],
    'comma-dangle': ['warn', 'only-multiline'],
  },
  overrides: [
    {
      files: ['src/views/**/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off',
      },
    },
  ],
}
