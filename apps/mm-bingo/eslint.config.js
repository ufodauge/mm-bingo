import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

// oxlint already covers general JS/TS correctness rules (`@eslint/js` recommended,
// `typescript-eslint` recommended) and `react/only-export-components`
// (`eslint-plugin-react-refresh`'s vite config). This config only adds the
// react-compiler-oriented rules from `eslint-plugin-react-hooks` that oxlint's
// react plugin doesn't have yet.
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.base, reactHooks.configs.flat.recommended],
    rules: {
      // Already enforced by oxlint's react/rules-of-hooks and react/exhaustive-deps.
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
    },
    languageOptions: {
      ecmaVersion: 2026,
      globals: globals.browser,
    },
  },
]);
