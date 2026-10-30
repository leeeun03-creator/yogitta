import type { AppData, Box, Floor } from "@/shared/types";
import { createWallTestData } from "./wallFixtures";

/**
 * 가구 코드 테스트에서 함께 쓰는 데이터. 현재 공간(내 방, 바닥 floor)에 가구를 놓는다.
 * 가구마다 안 적은 값은 60 × 50 × 90cm 보관함, 가운데 (300, 200), id는 box_1부터다.
 */
export function createBoxTestData(
  boxes: Partial<Box>[] = [],
  floor: Floor = { w: 600, h: 450 },
): AppData {
  const base = createWallTestData();
  const [mine, other] = base.spaces;
  if (!mine || !other) throw new Error("테스트 공간이 없다");
  const filled = boxes.map((box, index): Box => ({
    id: `box_${index + 1}`,
    name: `보관함 ${index + 1}`,
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
    ...box,
  }));
  return { ...base, spaces: [{ ...mine, floor, boxes: filled }, other] };
}
