import { describe, expect, it } from "vitest";
import { boxLabelFont } from "./boxLabelFont";

describe("boxLabelFont", () => {
  it("넉넉하면 화면 14px이다 (1px = 1cm)", () => {
    expect(boxLabelFont("보관함 1", { along: 120, across: 60 }, 1)).toBe(14);
  });

  it("줌에 따라 같은 화면 크기가 되게 cm로 준다 (1px = 2cm면 28cm)", () => {
    expect(boxLabelFont("보관함 1", { along: 300, across: 100 }, 2)).toBe(28);
  });

  it("엣지: 폭이 모자라면 줄인다 ('보관함 1' = 한글 3 + 띄어쓰기 + 숫자 ≈ 3.9글자)", () => {
    // (52 - 8) / 3.9 ≈ 11.3px → 최소 12px보다 작아 숨긴다, 56이면 (56 - 8) / 3.9 ≈ 12.3px
    expect(boxLabelFont("보관함 1", { along: 52, across: 60 }, 1)).toBeNull();
    expect(boxLabelFont("보관함 1", { along: 56, across: 60 }, 1)).toBeCloseTo(12.31, 1);
  });

  it("엣지: 높이(옆 방향)가 모자라도 줄이거나 숨긴다", () => {
    expect(boxLabelFont("보관함 1", { along: 200, across: 21 }, 1)).toBe(13);
    expect(boxLabelFont("보관함 1", { along: 200, across: 10 }, 1)).toBeNull();
  });

  it("엣지: 영어·숫자는 한글보다 좁게 어림한다", () => {
    // 같은 44px 폭: "AB 12" ≈ 2.7글자 → 13.3px, "가나 다라" ≈ 4.3글자 → 8.4px
    expect(boxLabelFont("AB 12", { along: 44, across: 60 }, 1)).toBeCloseTo(13.33, 1);
    expect(boxLabelFont("가나 다라", { along: 44, across: 60 }, 1)).toBeNull();
  });
});
