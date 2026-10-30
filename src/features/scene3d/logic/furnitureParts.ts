import type { Box, FurnitureType } from "@/shared/types";
import { bedParts } from "./bedParts";
import { boxParts } from "./boxParts";
import { cabinetParts } from "./cabinetParts";
import { drawerParts } from "./drawerParts";
import type { FurniturePart } from "./furniturePart";
import { shelfParts } from "./shelfParts";
import { tableParts } from "./tableParts";

const PARTS_BY_TYPE: Record<FurnitureType, (box: Box) => FurniturePart[]> = {
  cabinet: cabinetParts,
  drawer: drawerParts,
  shelf: shelfParts,
  wall: shelfParts, // 벽걸이는 얇은 선반을 설치 높이에 띄운 모양
  desk: tableParts,
  table: tableParts,
  bed: bedParts,
  box: boxParts,
};

/**
 * 가구 종류에 맞는 3D 모양을 같은 크기 안의 가구 부품들로 만든다.
 * 보관함 손잡이 홈만 정면으로 반 나오고, 침대 머리판만 침대 높이 위로 올라온다.
 */
export function furnitureParts(box: Box): FurniturePart[] {
  return PARTS_BY_TYPE[box.type](box);
}
