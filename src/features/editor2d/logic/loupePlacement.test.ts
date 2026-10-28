import { describe, expect, it } from "vitest";
import { loupePlacement } from "./loupePlacement";

const VIEWPORT = { width: 360, height: 500 };
const LAYOUT = { size: 120, lift: 100, margin: 8 };

describe("loupePlacement", () => {
  it("손가락 위 lift만큼에 둔다", () => {
    expect(loupePlacement({ x: 180, y: 300 }, VIEWPORT, LAYOUT)).toEqual({ x: 180, y: 200 });
  });

  it("엣지: 위 공간이 딱 맞으면 위에 둔다 (경계 바로 안)", () => {
    // 300 - 100 - 60 = 8 = margin
    expect(loupePlacement({ x: 180, y: 168 }, VIEWPORT, LAYOUT)).toEqual({ x: 180, y: 68 });
  });

  it("엣지: 위가 모자라면 손가락 옆(화면 가운데 쪽)에 둔다", () => {
    expect(loupePlacement({ x: 100, y: 150 }, VIEWPORT, LAYOUT)).toEqual({ x: 200, y: 150 });
    expect(loupePlacement({ x: 260, y: 150 }, VIEWPORT, LAYOUT)).toEqual({ x: 160, y: 150 });
  });

  it("엣지: 화면 맨 위 모서리에서도 영역 안에 들어온다", () => {
    expect(loupePlacement({ x: 5, y: 5 }, VIEWPORT, LAYOUT)).toEqual({ x: 105, y: 68 });
  });

  it("엣지: 좌우 가장자리에서는 영역 안으로 당긴다", () => {
    expect(loupePlacement({ x: 10, y: 300 }, VIEWPORT, LAYOUT)).toEqual({ x: 68, y: 200 });
    expect(loupePlacement({ x: 355, y: 300 }, VIEWPORT, LAYOUT)).toEqual({ x: 292, y: 200 });
  });

  it("엣지: 영역이 돋보기보다 작으면 가운데에 둔다", () => {
    expect(loupePlacement({ x: 10, y: 10 }, { width: 100, height: 100 }, LAYOUT)).toEqual({
      x: 50,
      y: 50,
    });
  });
});
