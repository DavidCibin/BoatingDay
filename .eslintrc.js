module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
    env: {
      browser: true,
      node: true,
      "react-native/react-native": true,
    },
    plugins: ["react", "react-native", "@typescript-eslint"],
    extends: [
      "airbnb",
      "airbnb/hooks",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:react-native/all",
    ],
    rules: {
      "react-native/no-inline-styles": "off",
      "react-native/no-raw-text": "off",
      "react-native/no-color-literals": "off",
      "react-native/no-single-element-style-arrays": "off",
      "react-native/no-unused-styles": "off",
      "react-native/sort-styles": ["error", "asc"],
      "react-native/no-raw-text": ["error", { skip: ["Text"] }],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    ignorePatterns: [
      "node_modules/",
      "dist/",
      "build/",
      "coverage/",
      ".next/",
      ".turbo/",
      ".vercel/",
      ".expo/",
      ".expo-shared/",
    ],
  };
  