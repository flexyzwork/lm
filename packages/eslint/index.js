import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default {
  overrides: [
    {
      files: ['**/*.{js,mjs,cjs,ts}'],
      parser: tsParser,
      plugins: [pluginJs, tseslint],
      extends: ['plugin:@eslint/recommended', 'plugin:@typescript-eslint/recommended'],
      languageOptions: {
        globals: globals.node,
      },
      env: {
        node: true, // Node.js 환경 지원
        jest: true, // Jest 테스트 환경 지원
      },
    },
  ],
};
