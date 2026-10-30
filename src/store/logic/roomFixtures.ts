import type { AppData } from "@/shared/types";
import { createWallTestData } from "./wallFixtures";

/** 구역 코드 테스트에서 함께 쓰는 데이터 (현재 공간 내 방에 구역, 형 방에도 같은 이름 구역). */
export function createRoomTestData(rooms: string[] = []): AppData {
  const base = createWallTestData();
  const [mine, other] = base.spaces;
  if (!mine || !other) throw new Error("테스트 공간이 없다");
  return {
    ...base,
    spaces: [
      { ...mine, rooms },
      { ...other, rooms: ["안방"] },
    ],
  };
}
