import type { Box } from "@/shared/types";

/**
 * 가구 위 가구 코드 테스트에서 함께 쓰는 가구 (T29). 안 적은 값은 40 × 30 × 40cm 보관함, 가운데 (100, 100), 바닥.
 * 책상(desk)은 가운데 (300, 200)의 120 × 60 × 73cm다.
 */
export function stackBox(id: string, patch: Partial<Box> = {}): Box {
  return {
    id,
    name: id,
    type: "box",
    x: 100,
    z: 100,
    rotation: 0,
    w: 40,
    d: 30,
    h: 40,
    elevation: 0,
    rows: 1,
    cols: 1,
    items: [],
    ...patch,
  };
}

export const STACK_DESK = stackBox("desk", { type: "desk", x: 300, z: 200, w: 120, d: 60, h: 73 });
