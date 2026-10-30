import { describe, expect, it } from "vitest";
import type { Box, Wall } from "@/shared/types";
import { resizedBox } from "./resizedBox";

const FLOOR = { w: 600, h: 450 };
const box = (patch: Partial<Box> = {}): Box => ({
  id: "box_1",
  name: "보관함 1",
  type: "box",
  x: 300,
  z: 200,
  rotation: 0,
  w: 60,
  d: 50,
  h: 90,
  elevation: 0,
  rows: 1,
  cols: 1,
  items: [],
  ...patch,
});
const space = (boxes: Box[], walls: Wall[] = []) => ({ floor: FLOOR, walls, boxes });

describe("resizedBox", () => {
  it("가운데는 그대로 두고 크기를 바꾼다", () => {
    const result = resizedBox(box(), { w: 120, d: 60, h: 180 }, space([box()]));
    expect(result).toEqual({ ok: true, box: box({ w: 120, d: 60, h: 180 }) });
  });

  it("엣지: 바닥 가장자리에서 키우면 바닥 안으로 당긴다", () => {
    const edge = box({ x: 570 }); // 오른쪽 면 600
    const result = resizedBox(edge, { w: 100, d: 50, h: 90 }, space([edge]));
    expect(result.ok && result.box.x).toBe(550);
  });

  it("엣지: 10cm는 되고 9cm는 막는다, 240cm는 되고 241cm는 막는다", () => {
    const target = box();
    expect(resizedBox(target, { w: 10, d: 10, h: 10 }, space([target])).ok).toBe(true);
    expect(resizedBox(target, { w: 9, d: 50, h: 90 }, space([target]))).toEqual({
      ok: false,
      reason: "tooSmall",
    });
    expect(resizedBox(target, { w: 60, d: 50, h: 240 }, space([target])).ok).toBe(true);
    expect(resizedBox(target, { w: 60, d: 50, h: 241 }, space([target]))).toEqual({
      ok: false,
      reason: "tooTall",
    });
  });

  it("엣지: 바닥과 같은 길이는 되고, 더 길면 막는다 (돌린 가구는 돌린 모양으로 본다)", () => {
    const target = box();
    expect(resizedBox(target, { w: 600, d: 50, h: 90 }, space([target])).ok).toBe(true);
    expect(resizedBox(target, { w: 601, d: 50, h: 90 }, space([target]))).toEqual({
      ok: false,
      reason: "tooLong",
    });
    const turned = box({ rotation: 90 }); // 가로가 세로(바닥 450cm) 방향이 된다
    expect(resizedBox(turned, { w: 500, d: 50, h: 90 }, space([turned]))).toEqual({
      ok: false,
      reason: "tooLong",
    });
  });

  it("엣지: 키워서 벽·다른 가구에 파고들면 막고, 맞닿는 크기는 된다", () => {
    const target = box({ x: 100, z: 100 }); // x 70 ~ 130
    const other = box({ id: "box_2", x: 200, z: 100 }); // x 170 ~ 230
    expect(resizedBox(target, { w: 140, d: 50, h: 90 }, space([target, other])).ok).toBe(true);
    expect(resizedBox(target, { w: 142, d: 50, h: 90 }, space([target, other]))).toEqual({
      ok: false,
      reason: "blocked",
    });
  });

  it("엣지: 높이를 바꾸면 정해 둔 칸 높이를 지우고, 가로만 바꾸면 남긴다", () => {
    const shelf = box({ type: "shelf", rows: 2, rowHeights: [50, 40] });
    const taller = resizedBox(shelf, { w: 60, d: 50, h: 120 }, space([shelf]));
    expect(taller.ok && taller.box).not.toHaveProperty("rowHeights");
    const wider = resizedBox(shelf, { w: 80, d: 50, h: 90 }, space([shelf]));
    expect(wider.ok && wider.box.rowHeights).toEqual([50, 40]);
  });
});
