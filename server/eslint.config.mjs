// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    // กำหนด plugins ที่ระดับสูงสุดของอ็อบเจกต์การตั้งค่า
    plugins: {
      'unused-imports': eslintPluginUnusedImports,
      'simple-import-sort': eslintPluginSimpleImportSort,
    },

    rules: {
      // ปิดกฎที่ซ้ำซ้อนหรือขัดแย้งกับ @typescript-eslint หรือ unused-imports
      'no-unused-vars': 'off',
      'no-console': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // 'react/no-unescaped-entities': 'off', // ถ้าโปรเจกต์นี้ไม่ใช่ React ก็ลบทิ้งได้เลย
      // 'react/display-name': 'off',
      // 'react/jsx-curly-brace-presence': [
      //   'warn',
      //   { props: 'never', children: 'never' },
      // ],

      //#region  //*=========== Unused Import ===========
      '@typescript-eslint/no-unused-vars': 'off', // ปิดกฎของ TS เพื่อให้ unused-imports จัดการแทน
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      //#endregion  //*======== Unused Import ===========

      //#region  //*=========== Import Sort ===========
      'simple-import-sort/exports': 'warn',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            // ext library & side effect imports
            ['^@?\\w', '^\\u0000'],
            // Lib and hooks - อาจเปลี่ยนเป็น services หรือ utils
            ['^@/lib', '^@/hooks', '^@/src/services', '^@/src/utils'],
            // static data - อาจเป็นพวก configuration หรือ constants
            ['^@/data', '^@/src/config', '^@/src/constants'],
            // components - ใน NestJS อาจเป็นพวก DTOs, Entities หรือ Modules ที่มีความสำคัญ
            [
              '^@/components',
              '^@/container',
              '^@/src/dtos',
              '^@/src/entities',
              '^@/src/modules',
            ],
            // zustand store - ถ้ามี state management ที่แชร์
            ['^@/store', '^@/src/state'],
            // Other imports
            ['^@/'],
            // relative paths up until 3 level
            [
              '^\\./?$',
              '^\\.(?!/?$)',
              '^\\.\\./?$',
              '^\\.\\.(?!/?$)',
              '^\\.\\./\\.\\./?$',
              '^\\.\\./\\.\\.(?!/?$)',
              '^\\.\\./\\.\\./\\.\\./?$',
              '^\\.\\./\\.\\./\\.\\.(?!/?$)',
            ],
            ['^@/types', '^@/src/types'],
            // other that didnt fit in
            ['^'],
          ],
        },
      ],
      //#endregion  //*======== Import Sort ===========

      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  // ใช้ config ที่แนะนำจาก plugins ต่างๆ
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
);
