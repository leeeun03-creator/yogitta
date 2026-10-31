import { describe, expect, it } from "vitest";
import { backupFileName } from "./backupFileName";

describe("backupFileName", () => {
  it("날짜를 넣은 이름이고, 한 자리 월·일은 0을 붙인다", () => {
    expect(backupFileName(new Date(2026, 10, 1))).toBe("yogitta-backup-2026-11-01.json");
    expect(backupFileName(new Date(2027, 0, 9))).toBe("yogitta-backup-2027-01-09.json");
  });
});
