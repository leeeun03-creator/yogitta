import { FURNITURE_DEFAULTS, FURNITURE_LABELS } from "@/shared/constants/furniture";
import type { AppData, Box, FurnitureType, Space } from "@/shared/types";
import { isAutoName } from "./isAutoName";
import { itemsWithinSlots } from "./itemsWithinSlots";
import { nextBoxName } from "./nextBoxName";
import { updateBox } from "./updateBox";

/**
 * 옛 종류의 자동 이름이면 새 종류의 자동 이름으로, 사용자가 지은 이름이면 그대로.
 * 옛 이름은 다른 종류 이름으로 시작해 새 자동 이름과 겹치지 않으니 공간의 모든 이름과 견준다.
 */
function renamedFor(box: Box, type: FurnitureType, space: Space): string {
  if (!isAutoName(box.name, FURNITURE_LABELS[box.type])) return box.name;
  return nextBoxName(
    space.boxes.map((other) => other.name),
    FURNITURE_LABELS[type],
  );
}

/**
 * 현재 공간의 가구 하나를 다른 종류로 바꾼다. 가로·깊이·높이와 자리·정면은 그대로이고,
 * 칸 수·설치 높이는 새 종류의 기본값이 된다(칸 높이는 칸 수가 바뀌니 균등 분배로 돌린다). 가구 위 가구는
 * 받침 가구 위 높이를 지키고, 벽걸이로 바꾸면 벽에 거는 가구라 받침 가구에서 내려 기본 설치 높이로 띄운다(T29).
 * 물건은 남기되 새 칸 수보다 뒤 칸의 물건은 칸 없음으로 옮긴다. 같은 종류면 그대로 둔다.
 */
export function changeBoxType(data: AppData, id: string, type: FurnitureType): AppData {
  return updateBox(data, id, (box, space) => {
    if (box.type === type) return box;
    const { rows, cols, elevation: typeElevation } = FURNITURE_DEFAULTS[type];
    const isStacked = box.parentId !== undefined && type !== "wall";
    const elevation = isStacked ? box.elevation : typeElevation;
    const next: Box = {
      ...box,
      type,
      name: renamedFor(box, type, space),
      rows,
      cols,
      elevation,
      items: itemsWithinSlots(box.items, rows * cols),
    };
    delete next.rowHeights;
    if (!isStacked) delete next.parentId;
    return next;
  });
}
