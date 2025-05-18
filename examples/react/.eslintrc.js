module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:react/recommended', 'plugin:@typescript-eslint/recommended', 'plugin:storybook/recommended', 'plugin:storybook/recommended'],
  plugins: ['react', '@typescript-eslint'],
  rules: {
    // Add custom rules here
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};