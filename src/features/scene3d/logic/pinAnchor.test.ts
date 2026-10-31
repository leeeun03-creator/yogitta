import { describe, expect, it } from "vitest";
import { SLOT_OPEN_CM } from "@/shared/constants/scene";
import type { Box } from "@/shared/types";
import { pinAnchor } from "./pinAnchor";
import { slotOpening } from "./slotOpening";

const DRAWER: Box = {
  id: "box_1",
  name: "서랍장",
  type: "drawer",
  x: 0,
  z: 0,
  rotation: 0,
  w: 100,
  d: 50,
  h: 90,
  elevation: 0,
  rows: 3,
  cols: 1,
  items: [],
};

describe("pinAnchor", () => {
  it("칸이 열렸으면 다 빠져나온 열린 칸의 앞쪽 윗면 가운데", () => {
    const opening = slotOpening(DRAWER, 1);
    const tray = opening?.sliding[0];
    const [x, y, z] = pinAnchor(DRAWER.h, opening);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo((tray?.position[1] ?? 0) + (tray?.size[1] ?? 0) / 2);
    expect(z).toBeCloseTo((tray?.position[2] ?? 0) + (tray?.size[2] ?? 0) / 2 + SLOT_OPEN_CM);
    expect(y).toBeLessThan(60); // 2번째 서랍(30~60) 윗면 아래
  });

  it("엣지: 열지 않으면 가구 맨 위 가운데", () => {
    expect(pinAnchor(73, null)).toEqual([0, 73, 0]);
  });
});
