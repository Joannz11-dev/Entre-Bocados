// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Unchanged template hook uses an intentional hydration transition.
    files: ['src/hooks/use-color-scheme.web.ts'],
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },
]);
