import { describe, expect, it } from "vitest";
import { ROOM_COLORS } from "@/shared/constants/colors2d";
import type { Point } from "@/shared/types";
import type { FloorLine } from "./blockFloorCells";
import { findRoomAt } from "./findRoomAt";
import { partRects } from "./partRects";
import { roomAreas } from "./roomAreas";
import { roomColor } from "./roomColor";

const FLOOR = { w: 600, h: 450 };
const at = (x: number, y: number): Point => ({ x, y });
const line = (...points: Point[]): FloorLine => ({ points });
const MIDDLE = [line(at(300, 0), at(300, 450))]; // 바닥을 왼쪽·오른쪽 구획으로
const ANCHORS = { 거실: at(100, 100), 안방: at(500, 100) };

/** 사각형들 넓이 합 (cm²). */
const areaOf = (rects: { w: number; h: number }[]) =>
  rects.reduce((sum, rect) => sum + rect.w * rect.h, 0);

describe("roomColor", () => {
  it("구역 목록 순서대로 6색을 돌려 쓴다", () => {
    expect(roomColor(0)).toBe(ROOM_COLORS[0]);
    expect(roomColor(5)).toBe(ROOM_COLORS[5]);
    expect(roomColor(6)).toBe(ROOM_COLORS[0]);
    expect(roomColor(13)).toBe(ROOM_COLORS[1]);
  });
});

describe("roomAreas", () => {
  it("구역마다 기준점이 든 구획을 칠하고, 색은 목록 순서다", () => {
    const areas = roomAreas(FLOOR, MIDDLE, ["거실", "안방"], ANCHORS);
    expect(areas.map((area) => [area.room, area.color])).toEqual([
      ["거실", ROOM_COLORS[0]],
      ["안방", ROOM_COLORS[1]],
    ]);
    expect(areas[0]?.label).toEqual(at(100, 100));
  });

  it("벽이 지나는 격자까지 칠해 두 구역이 바닥 전체를 빈틈없이 덮는다", () => {
    const areas = roomAreas(FLOOR, MIDDLE, ["거실", "안방"], ANCHORS);
    const total = areas.reduce((sum, area) => sum + areaOf(area.rects), 0);
    expect(total).toBe(FLOOR.w * FLOOR.h);
  });

  it("줄마다 이어진 격자는 가로 띠 하나로 묶는다", () => {
    const areas = roomAreas(FLOOR, [], ["거실"], { 거실: at(10, 10) });
    expect(areas[0]?.rects).toHaveLength(45); // 45줄 × 띠 1개
    expect(areas[0]?.rects[0]).toEqual({ x: 0, y: 0, w: 600, h: 10 });
  });

  it("엣지: 기준점이 없거나 선 위에 있는 구역은 칠하지 않는다", () => {
    const anchors = { 거실: at(100, 100), 안방: at(300, 200) };
    const areas = roomAreas(FLOOR, MIDDLE, ["거실", "안방", "서재"], anchors);
    expect(areas.map((area) => area.room)).toEqual(["거실"]);
  });

  it("엣지: 벽을 지워 두 구역이 한 구획이 되면 먼저 붙인 이름만 남는다", () => {
    const areas = roomAreas(FLOOR, [], ["거실", "안방", "서재"], { ...ANCHORS, 서재: at(10, 10) });
    expect(areas.map((area) => area.room)).toEqual(["거실"]);
  });

  it("엣지: 앞 구역이 칠해지지 않아도 색은 구역 목록 순서 그대로다", () => {
    const areas = roomAreas(FLOOR, MIDDLE, ["서재", "안방"], { 안방: at(500, 100) });
    expect(areas.map((area) => area.color)).toEqual([ROOM_COLORS[1]]);
  });

  it("엣지: 구역이 없으면 칠할 것도 없다", () => {
    expect(roomAreas(FLOOR, MIDDLE, [], {})).toEqual([]);
    expect(roomAreas(FLOOR, MIDDLE, ["거실"])).toEqual([]);
  });

  it("엣지: 10cm로 나눠떨어지지 않는 바닥은 바닥 끝에서 자른다", () => {
    const floor = { w: 605, h: 452 };
    const areas = roomAreas(floor, [], ["거실"], { 거실: at(10, 10) });
    expect(areaOf(areas[0]?.rects ?? [])).toBe(605 * 452);
  });
});

describe("partRects", () => {
  it("엣지: 한 줄에 떨어진 띠가 여럿이면 따로 묶는다", () => {
    const owned = Int32Array.from([0, 0, 1, 0, 0, 1]);
    expect(partRects(owned, 6, { w: 60, h: 10 }, 0)).toEqual([
      { x: 0, y: 0, w: 20, h: 10 },
      { x: 30, y: 0, w: 20, h: 10 },
    ]);
  });
});

describe("findRoomAt", () => {
  it("이미 구역인 구획을 누르면 그 구역이다", () => {
    const hit = findRoomAt(FLOOR, MIDDLE, ["거실", "안방"], ANCHORS, at(550, 400));
    expect(hit).toEqual({ type: "room", room: "안방" });
  });

  it("이름 없는 구획을 누르면 새 구역 자리다", () => {
    const hit = findRoomAt(FLOOR, MIDDLE, ["거실"], { 거실: at(100, 100) }, at(550, 400));
    expect(hit).toEqual({ type: "new", at: at(550, 400) });
  });

  it("엣지: 벽·구역 선 위나 바닥 밖을 누르면 null이다", () => {
    expect(findRoomAt(FLOOR, MIDDLE, [], {}, at(300, 200))).toBeNull();
    expect(findRoomAt(FLOOR, MIDDLE, [], {}, at(-5, 200))).toBeNull();
  });

  it("엣지: 한 구획에 구역이 여럿이면 목록 앞의 구역이다", () => {
    const hit = findRoomAt(FLOOR, [], ["안방", "거실"], ANCHORS, at(300, 300));
    expect(hit).toEqual({ type: "room", room: "안방" });
  });
});

describe("선 반대쪽 구획에 격자 붙이기", () => {
  /** 구역의 가장 오른쪽·왼쪽 끝 (cm). */
  const edges = (rects: { x: number; w: number }[]) => ({
    left: Math.min(...rects.map((rect) => rect.x)),
    right: Math.max(...rects.map((rect) => rect.x + rect.w)),
  });

  it("격자 경계 위 선(x = 300)이면 색이 선을 넘지 않는다", () => {
    const [left, right] = roomAreas(FLOOR, MIDDLE, ["거실", "안방"], ANCHORS);
    expect(edges(left?.rects ?? []).right).toBe(300);
    expect(edges(right?.rects ?? []).left).toBe(300);
  });

  it("엣지: 격자 오른쪽 끝 가까이 지나는 선(x = 309)이면 그 격자는 왼쪽 구획이다", () => {
    const lines = [line(at(309, 0), at(309, 450))];
    const [left] = roomAreas(FLOOR, lines, ["거실", "안방"], ANCHORS);
    expect(edges(left?.rects ?? []).right).toBe(310);
  });

  it("엣지: 가로 선이면 위아래 구획으로 붙인다", () => {
    const lines = [line(at(0, 200), at(600, 200))];
    const areas = roomAreas(FLOOR, lines, ["위", "아래"], { 위: at(100, 100), 아래: at(100, 300) });
    const bottomOf = (rects: { y: number; h: number }[]) =>
      Math.max(...rects.map((r) => r.y + r.h));
    expect(bottomOf(areas[0]?.rects ?? [])).toBe(200);
  });
});
