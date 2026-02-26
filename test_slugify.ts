import { slugify } from './lib/utils/slugify';

const tests = [
  { input: "St. John's Academy", expected: "st-johns-academy" },
  { input: "Hello World!!!", expected: "hello-world" },
  { input: "  Spaces at both ends  ", expected: "spaces-at-both-ends" },
  { input: "Multiple---Dashes", expected: "multiple-dashes" },
  { input: "School Name 2024", expected: "school-name-2024" },
];

tests.forEach(({ input, expected }) => {
  const result = slugify(input);
  console.log(`Input: "${input}" | Expected: "${expected}" | Result: "${result}" | ${result === expected ? '✅' : '❌'}`);
});
