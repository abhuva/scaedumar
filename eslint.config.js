import js from "@eslint/js";

const browserGlobals = {
  Blob: "readonly",
  DOMException: "readonly",
  FileReader: "readonly",
  Image: "readonly",
  ImageData: "readonly",
  MouseEvent: "readonly",
  URL: "readonly",
  Worker: "readonly",
  AbortController: "readonly",
  AbortSignal: "readonly",
  cancelAnimationFrame: "readonly",
  confirm: "readonly",
  console: "readonly",
  document: "readonly",
  fetch: "readonly",
  localStorage: "readonly",
  self: "readonly",
  performance: "readonly",
  requestAnimationFrame: "readonly",
  setTimeout: "readonly",
  structuredClone: "readonly",
  window: "readonly",
};

const nodeGlobals = {
  Buffer: "readonly",
  console: "readonly",
  process: "readonly",
  setImmediate: "readonly",
  setTimeout: "readonly",
};

export default [
  {
    ignores: [
      ".cache/**",
      ".obsidian/**",
      ".tauri-dist/**",
      "assets/**",
      "node_modules/**",
      "site/**",
      "src-tauri/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: browserGlobals,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
      },
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["*.js", "scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: nodeGlobals,
      sourceType: "module",
    },
  },
];
