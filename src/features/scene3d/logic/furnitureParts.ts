import type { Box, FurnitureType } from "@/shared/types";
import { boxParts } from "./boxParts";
import { cabinetParts } from "./cabinetParts";
import { drawerParts } from "./drawerParts";
import type { FurniturePart } from "./furniturePart";
import { shelfParts } from "./shelfParts";

const PARTS_BY_TYPE: Record<FurnitureType, (box: Box) => FurniturePart[]> = {
  cabinet: cabinetParts,
  drawer: drawerParts,
  shelf: shelfParts,
  wall: shelfParts, // 벽걸이는 얇은 선반을 설치 높이에 띄운 모양
  desk: boxParts, // TODO(T7-5): 상판 + 다리
  table: boxParts, // TODO(T7-5): 상판 + 다리
  bed: boxParts, // TODO(T7-5): 프레임 + 매트리스 + 머리판
  box: boxParts,
};

/** 가구 종류에 맞는 3D 모양을 같은 크기 안의 가구 부품들로 만든다 (보관함 손잡이 홈만 정면으로 반 나온다). */
export function furnitureParts(box: Box): FurniturePart[] {
  return PARTS_BY_TYPE[box.type](box);
}
