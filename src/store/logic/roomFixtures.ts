import type { AppData, Box } from "@/shared/types";
import { createWallTestData } from "./wallFixtures";

/** 구역 코드 테스트용 가구 하나. room이 없으면 구역 없음이다. */
export function createTestBox(id: string, room?: string): Box {
  return {
    id,
    name: `보관함 ${id}`,
    type: "box",
    ...(room === undefined ? {} : { room }),
    x: 100,
    z: 100,
    rotation: 0,
    w: 40,
    d: 30,
    h: 30,
    elevation: 0,
    rows: 1,
    cols: 1,
    items: [],
  };
}

/** 구역 코드 테스트에서 함께 쓰는 데이터 (현재 공간 내 방에 구역·가구, 형 방에도 같은 이름 구역). */
export function createRoomTestData(rooms: string[] = [], boxes: Box[] = []): AppData {
  const base = createWallTestData();
  const [mine, other] = base.spaces;
  if (!mine || !other) throw new Error("테스트 공간이 없다");
  return {
    ...base,
    spaces: [
      { ...mine, rooms, boxes },
      { ...other, rooms: ["안방"] },
    ],
  };
}
