import { describe, expect, it } from "vitest";
import { FOUND_COLORS } from "@/shared/constants/colors3d";
import { SLOT_OPEN_CM } from "@/shared/constants/scene";
import type { Box, FurnitureType } from "@/shared/types";
import { slotOpening } from "./slotOpening";

const box = (type: FurnitureType, rows: number, cols = 1): Box => ({
  id: "box_1",
  name: "가구",
  type,
  x: 0,
  z: 0,
  rotation: 0,
  w: 100,
  d: 50,
  h: 90,
  elevation: 0,
  rows,
  cols,
  items: [],
});

describe("slotOpening", () => {
  it("서랍장: 그 서랍의 앞판·손잡이가 빠져나오고, 열린 칸 통(열린 칸 색·안쪽 윗면)이 뒤에 있다", () => {
    const opening = slotOpening(box("drawer", 3), 1);
    expect(opening?.slideKeys).toEqual(["front-1", "handle-1"]);
    const [tray] = opening?.sliding ?? [];
    expect(tray).toMatchObject({ color: FOUND_COLORS.openSlot, topColor: FOUND_COLORS.openInside });
    expect(tray?.size[2]).toBeCloseTo(SLOT_OPEN_CM);
    // 2번째 서랍 칸(높이 30~60) 안쪽
    expect(tray?.position[1]).toBeCloseTo(45);
    expect(opening?.hideKeys).toEqual([]);
  });

  it("양문 수납장: 그쪽 문·손잡이를 숨기고 바깥 경첩에서 90도 연 문을 더한다", () => {
    const right = slotOpening(box("cabinet", 4, 2), 3); // 오른쪽 2번째 칸
    expect(right?.hideKeys).toEqual(["door-right", "handle-right"]);
    const [door] = right?.fixed ?? [];
    expect(door?.position[0]).toBeGreaterThan(50); // 가구 오른쪽 바깥
    expect(door?.size[2]).toBeGreaterThan(40); // 문 폭만큼 앞으로 나온 판
    expect(right?.sliding[0]?.position[0]).toBeGreaterThan(0); // 오른쪽 칸
    expect(slotOpening(box("cabinet", 4, 2), 0)?.hideKeys).toEqual(["door-left", "handle-left"]);
  });

  it("선반·벽걸이: 그 칸에서 열린 칸 통이 앞으로 나온다", () => {
    for (const type of ["shelf", "wall"] as const) {
      const opening = slotOpening(box(type, 3), 2);
      expect(opening?.slideKeys).toEqual([]);
      expect(opening?.sliding).toHaveLength(1);
      expect(opening?.sliding[0]?.position[1]).toBeCloseTo(15); // 맨 아래 칸(0~30)
    }
  });

  it("엣지: 책상·테이블·침대·보관함과 칸 없음·칸 수 밖은 열지 않는다", () => {
    for (const type of ["desk", "table", "bed", "box"] as const) {
      expect(slotOpening(box(type, type === "bed" ? 2 : 1), 0)).toBeNull();
    }
    expect(slotOpening(box("drawer", 3))).toBeNull();
    expect(slotOpening(box("drawer", 3), 3)).toBeNull();
    expect(slotOpening(box("drawer", 3), -1)).toBeNull();
  });
});
