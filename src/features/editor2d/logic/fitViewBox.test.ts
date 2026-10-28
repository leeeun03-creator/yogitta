import { describe, expect, it } from "vitest";
import { fitViewBox } from "./fitViewBox";

const MARGIN = 50;

describe("fitViewBox", () => {
  it("가로로 긴 바닥은 가로를 꽉 채우고 세로 가운데에 둔다", () => {
    const box = fitViewBox({ w: 3000, h: 100 }, { width: 1100, height: 600 }, MARGIN);
    expect(box.cmPerPx).toBeCloseTo(3); // 3000cm / (1100 - 100)px
    expect(box.x).toBeCloseTo(-150); // 여백 50px × 3cm
    expect(box.y + box.height / 2).toBeCloseTo(50); // 바닥 세로 가운데
  });

  it("세로로 긴 바닥은 세로를 꽉 채우고 가로 가운데에 둔다", () => {
    const box = fitViewBox({ w: 100, h: 1000 }, { width: 600, height: 600 }, MARGIN);
    expect(box.cmPerPx).toBeCloseTo(2); // 1000cm / 500px
    expect(box.y).toBeCloseTo(-100);
    expect(box.x + box.width / 2).toBeCloseTo(50);
  });

  it("viewBox 비율은 화면 비율과 같다 (찌그러지지 않는다)", () => {
    const box = fitViewBox({ w: 600, h: 450 }, { width: 900, height: 500 }, MARGIN);
    expect(box.width / box.height).toBeCloseTo(900 / 500);
  });

  it("화면 크기를 아직 모르면(0) 바닥 그대로를 돌려준다", () => {
    expect(fitViewBox({ w: 600, h: 450 }, { width: 0, height: 0 }, MARGIN)).toEqual({
      x: 0,
      y: 0,
      width: 600,
      height: 450,
      cmPerPx: 1,
    });
  });

  it("여백보다 작은 화면도 바닥 그대로를 돌려준다", () => {
    expect(fitViewBox({ w: 600, h: 450 }, { width: 80, height: 300 }, MARGIN).cmPerPx).toBe(1);
  });
});
