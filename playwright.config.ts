import { defineConfig, devices } from "@playwright/test";
import { DATA_VERSION, STORAGE_KEY } from "./src/shared/constants/storage";

// E2E_BASE_URL을 주면 배포 주소를 검사하고, 없으면 빌드 결과를 vite preview로 띄워 검사한다.
const DEPLOYED_URL = process.env.E2E_BASE_URL;
const PREVIEW_PORT = 4173;
const BASE_URL = DEPLOYED_URL ?? `http://localhost:${PREVIEW_PORT}/yogitta/`;

// 실제 테스트는 공간이 없는 저장 데이터로 시작해 첫 실행 화면부터 본다. 처음 열면 나오는 샘플 공간은
// 그 테스트에서만 저장 데이터 없이(storageState 비움) 연다. 새로고침해도 저장 데이터는 남는다.
const EMPTY_SAVED = { version: DATA_VERSION, spaces: [], currentSpaceId: null };
const STORAGE_STATE = {
  cookies: [],
  origins: [
    {
      origin: new URL(BASE_URL).origin,
      localStorage: [{ name: STORAGE_KEY, value: JSON.stringify(EMPTY_SAVED) }],
    },
  ],
};

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  workers: process.env.CI ? undefined : 7, // 로컬은 코어 8개 중 7개로 (CI는 기본값)
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    storageState: STORAGE_STATE,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    // 비기능 요구사항: 화면 폭 360px까지 지원한다.
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 360, height: 740 } } },
  ],
  webServer: DEPLOYED_URL
    ? undefined
    : {
        command: `npm run build && npx vite preview --port ${PREVIEW_PORT} --strictPort`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
