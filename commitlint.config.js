module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
    'scope-enum': [2, 'always', ['root', 'server', 'client', 'ai']],
    'subject-case': [2, 'never', ['start-case', 'pascal-case']],
    'header-max-length': [0],
    'body-max-line-length': [0],
  },
};
