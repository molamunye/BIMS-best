import js from "@eslint/js";

export default [
  { ignores: ["dist"] },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-unused-vars": "off",
    },
  },
];
