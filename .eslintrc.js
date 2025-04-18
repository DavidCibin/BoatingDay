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
    plugins: ["react", "react-native", "@typescript-eslint", "prettier"],
    extends: [
        "airbnb",
        "airbnb/hooks",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-native/all",
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ],
    rules: {
        "no-plusplus": "off",
        "no-console": ["warn", { allow: ["error"] }],
        "react/jsx-filename-extension": [1, { extensions: [".tsx", ".jsx"] }],
        "react-native/no-inline-styles": "off",
        "react-native/no-color-literals": "off",
        "react-native/no-single-element-style-arrays": "off",
        "react-native/no-unused-styles": "off",
        "react-native/sort-styles": ["error", "asc"],
        "react-native/no-raw-text": ["error", { skip: ["Text"] }],
        indent: ["error", 4],
        quotes: ["error", "double", { avoidEscape: true }],
        "prettier/prettier": [
            "error",
            {
                tabWidth: 4,
                singleQuote: false,
            },
        ],
        "import/extensions": [
            "error",
            "ignorePackages",
            {
                ts: "never",
                tsx: "never",
            },
        ],
    },
    settings: {
        "import/resolver": {
            node: {
                extensions: [".js", ".jsx", ".ts", ".tsx"],
            },
        },
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
