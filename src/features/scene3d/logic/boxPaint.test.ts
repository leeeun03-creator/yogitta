import { describe, expect, it } from "vitest";
import {
  DIM_RATIO,
  FOUND_COLORS,
  FURNITURE_COLORS,
  SCENE_COLORS,
} from "@/shared/constants/colors3d";
import { mixColor } from "@/shared/lib/mixColor";
import { boxPaint } from "./boxPaint";

describe("boxPaint", () => {
  it("찾은 가구는 몸통(종류 나무 톤)만 찾은 가구 색, 손잡이·매트리스는 그대로", () => {
    const paint = boxPaint("bed", "found");
    expect(paint(FURNITURE_COLORS.bed)).toBe(FOUND_COLORS.box);
    expect(paint(SCENE_COLORS.mattress)).toBe(SCENE_COLORS.mattress);
    expect(boxPaint("drawer", "found")(SCENE_COLORS.edge)).toBe(SCENE_COLORS.edge);
  });

  it("흐리게는 모든 색을 바탕색 쪽으로 55% 섞는다", () => {
    const paint = boxPaint("drawer", "dim");
    expect(paint(FURNITURE_COLORS.drawer)).toBe(
      mixColor(FURNITURE_COLORS.drawer, SCENE_COLORS.dimTarget, DIM_RATIO),
    );
    expect(paint(SCENE_COLORS.edge)).not.toBe(SCENE_COLORS.edge);
  });

  it("엣지: 보통이면 그대로", () => {
    expect(boxPaint("box", "normal")(FURNITURE_COLORS.box)).toBe(FURNITURE_COLORS.box);
  });
});
