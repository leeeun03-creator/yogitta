import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

// 테스트 대상은 순수 함수만이라 브라우저 환경 없이 node에서 돌린다.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  }),
);
