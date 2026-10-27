import js from "@eslint/js";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importX from "eslint-plugin-import-x";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// feature 내부 파일 직접 import와 깊은 상대 경로를 막는다 (yogitta-code 2장).
const FEATURE_INTERNAL = {
  group: ["@/features/*/*"],
  message: "다른 feature는 index.ts 공개 창구(@/features/이름)로만 import한다.",
};
const DEEP_RELATIVE = {
  group: ["../../*"],
  message: "깊은 상대 경로 대신 @/ 별칭을 쓴다.",
};

/** 의존 방향 shared ← store ← features ← app 을 지키도록 막을 경로를 만든다. */
function forbidLayers(layers) {
  return {
    group: layers.flatMap((layer) => [`@/${layer}`, `@/${layer}/*`]),
    message: "의존 방향은 shared ← store ← features ← app 이다.",
  };
}

export default tseslint.config(
  { ignores: ["dist", "node_modules", "coverage"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks, "import-x": importX },
    settings: {
      // import-x가 .ts/.tsx를 읽어야 no-cycle이 import를 따라갈 수 있다.
      "import-x/extensions": [".ts", ".tsx", ".js"],
      "import-x/parsers": { "@typescript-eslint/parser": [".ts", ".tsx"] },
      "import-x/resolver-next": [createTypeScriptImportResolver({ project: "tsconfig.app.json" })],
    },
    rules: {
      ...reactHooks.configs["recommended-latest"].rules,
      "@typescript-eslint/no-explicit-any": "error",
      "import-x/no-cycle": "error",
      "no-restricted-imports": ["error", { patterns: [FEATURE_INTERNAL, DEEP_RELATIVE] }],
    },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [FEATURE_INTERNAL, DEEP_RELATIVE, forbidLayers(["store", "features", "app"])] },
      ],
    },
  },
  {
    files: ["src/store/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [FEATURE_INTERNAL, DEEP_RELATIVE, forbidLayers(["features", "app"])] },
      ],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [FEATURE_INTERNAL, DEEP_RELATIVE, forbidLayers(["app"])] },
      ],
    },
  },
);
