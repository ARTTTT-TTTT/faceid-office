module.exports = {
  'client/**/*.{js,ts,jsx,tsx}': [
    // 'pnpm --filter client format',
    'pnpm --filter client lint',
  ],
  'server/**/*.{js,ts,jsx,tsx}': [
    // 'pnpm --filter server format',
    'pnpm --filter server lint',
  ],
  'ai/**/*.py': [
    // 'cd ai && poetry run black .',
    'cd ai && poetry run ruff check . --fix',
  ],
  '*.{js,json,md}': 'prettier -w --ignore-unknown',
};
