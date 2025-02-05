module.exports = {
  extends: ['airbnb', 'airbnb/hooks', 'expo', 'prettier'],
  plugins: ['prettier', 'import'],
  rules: {
    'prettier/prettier': 'error',
    'global-require': 'off',
    'import/extensions': ['error', 'never'],
    'react/react-in-jsx-scope': 'off',
    'react/style-prop-object': 'off',
    'react/function-component-definition': ['error', { namedComponents: 'arrow-function' }],
    'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
    'no-restricted-exports': 'off',
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    'default-case': 'off',
    'consistent-return': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/array-type': ['error', { default: 'generic' }],
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always-and-inside-groups',
      },
    ],
  },
}
