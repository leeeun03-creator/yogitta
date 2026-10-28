import { DATA_VERSION } from "@/shared/constants/storage";
import type { AppData, Wall } from "@/shared/types";

/** 벽 계산 코드 테스트에서 함께 쓰는 데이터 (공간 2개, 현재 공간은 내 방). */
export function createWallTestData(walls: Wall[] = []): AppData {
  const space = (id: string, name: string) => ({
    id,
    name,
    floor: { w: 600, h: 450 },
    rooms: [],
    walls: id === "space_1" ? walls : [],
    boxes: [],
  });
  return {
    version: DATA_VERSION,
    spaces: [space("space_1", "내 방"), space("space_2", "형 방")],
    currentSpaceId: "space_1",
  };
}
