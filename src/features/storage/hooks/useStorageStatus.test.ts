import { beforeEach, describe, expect, it } from "vitest";
import { useStorageStatus } from "./useStorageStatus";

const status = () => useStorageStatus.getState();

describe("useStorageStatus", () => {
  beforeEach(() => useStorageStatus.setState({ notice: null, saveFailed: false }));

  it("저장에 실패하면 안내를 띄우고, 다시 저장되면 실패 표시를 푼다", () => {
    status().reportSave(false);
    expect(status()).toMatchObject({ notice: "saveFailed", saveFailed: true });
    status().reportSave(true);
    expect(status().saveFailed).toBe(false);
  });

  it("엣지: 안내를 닫으면 실패가 이어져도 다시 뜨지 않고, 성공 뒤 다시 실패하면 뜬다", () => {
    status().reportSave(false);
    status().dismiss();
    status().reportSave(false);
    expect(status().notice).toBeNull();
    status().reportSave(true);
    status().reportSave(false);
    expect(status().notice).toBe("saveFailed");
  });

  it("엣지: 읽지 못한 저장 값 안내는 닫을 때까지 남는다 (저장 성공으로 지워지지 않음)", () => {
    status().showBroken();
    status().reportSave(true);
    expect(status().notice).toBe("broken");
  });
});
