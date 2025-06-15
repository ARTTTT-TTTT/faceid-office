// * SOLUTION 1
// module.exports = {
//   'client/**/*.{js,ts,jsx,tsx}': [
//     // 'pnpm --filter client format',
//     'pnpm --filter client lint',
//   ],
//   'server/**/*.{js,ts,jsx,tsx}': [
//     // 'pnpm --filter server format',
//     'pnpm --filter server lint',
//   ],
//   'ai/**/*.py': [
//     // 'cd ai && poetry run black .',
//     'cd ai && poetry run ruff check . --fix',
//   ],
//   '*.{js,json,md}': 'prettier -w --ignore-unknown',
// };

// * SOLUTION 2
module.exports = {
  'client/**/*.{js,ts,jsx,tsx}': [
    () => 'cd client && pnpm format',
    () => 'cd client && pnpm lint',
  ],
  'server/**/*.{js,ts,jsx,tsx}': [
    () => 'cd server && pnpm format',
    () => 'cd server && pnpm lint',
  ],
  'ai/**/*.py': [
    'cd ai && poetry run black .',
    'cd ai && poetry run ruff check . --fix',
  ],
  '*.{js,json,md}': 'prettier -w --ignore-unknown',
};
