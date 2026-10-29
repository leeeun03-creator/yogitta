import { describe, expect, it } from "vitest";
import { defaultSpaceName } from "./defaultSpaceName";

describe("defaultSpaceName", () => {
  it("첫 공간은 '내 방'이다", () => {
    expect(defaultSpaceName([])).toBe("내 방");
  });

  it("'내 방'이 있으면 '새 공간', 그것도 있으면 '새 공간 2'", () => {
    expect(defaultSpaceName(["내 방"])).toBe("새 공간");
    expect(defaultSpaceName(["내 방", "새 공간"])).toBe("새 공간 2");
  });

  it("엣지: 번호가 비어 있으면 빈 번호를 쓰지 않고 다음으로 간다 (2, 3이 있으면 4)", () => {
    expect(defaultSpaceName(["내 방", "새 공간", "새 공간 2", "새 공간 3"])).toBe("새 공간 4");
  });

  it("엣지: '내 방'을 지워 비었으면 다시 '내 방'", () => {
    expect(defaultSpaceName(["형 방", "새 공간"])).toBe("내 방");
  });

  it("엣지: 앞뒤 공백만 다른 이름도 같은 이름으로 본다", () => {
    expect(defaultSpaceName([" 내 방 "])).toBe("새 공간");
  });
});
