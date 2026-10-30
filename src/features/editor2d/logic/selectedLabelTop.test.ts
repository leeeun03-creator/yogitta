import { describe, expect, it } from "vitest";
import { selectedLabelTop } from "./selectedLabelTop";

describe("selectedLabelTop", () => {
  it("가구 위에 간격(50px)을 두고 알약(30px)을 띄운다", () => {
    expect(selectedLabelTop({ left: 0, top: 200, width: 100, height: 60 })).toBe(120);
  });

  it("엣지: 딱 맞게 자리가 있으면 위다", () => {
    expect(selectedLabelTop({ left: 0, top: 80, width: 100, height: 60 })).toBe(0);
  });

  it("엣지: 위에 자리가 없으면 가구 아래에 띄운다", () => {
    expect(selectedLabelTop({ left: 0, top: 79, width: 100, height: 60 })).toBe(189);
  });
});
