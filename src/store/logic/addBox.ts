import { BOX_DEFAULT_SIZE, FURNITURE_LABELS } from "@/shared/constants/furniture";
import { fitBoxPlacement, type BoxPlacement } from "@/shared/lib/fitBoxPlacement";
import { isPlacementBlocked } from "@/shared/lib/isPlacementBlocked";
import type { AppData, Box, Floor } from "@/shared/types";
import { nextBoxName } from "./nextBoxName";
import { updateCurrentSpace } from "./updateCurrentSpace";

/** 새 가구를 놓을 자리와 새 가구 id. */
export type NewBoxInput = BoxPlacement & { id: string };

/** 새 가구 하나를 만든다. 크기는 최소 크기 ~ 바닥 크기로, 위치는 바닥 안으로 맞춘다. */
function createBox(input: NewBoxInput, floor: Floor, name: string): Box {
  const { center, w, d } = fitBoxPlacement(input, floor);
  return {
    id: input.id,
    name,
    type: "box",
    x: center.x,
    z: center.y, // 2D y = 3D z
    rotation: 0,
    w,
    d,
    h: BOX_DEFAULT_SIZE.h,
    elevation: 0,
    rows: 1,
    cols: 1,
    items: [],
  };
}

/**
 * 현재 공간에 보관함 하나를 더한다. 이름은 "보관함 1"부터 비어 있는 번호다.
 * 그 자리가 벽·다른 가구에 파고들면 놓지 않고 그대로 둔다 (맞닿는 것은 된다).
 */
export function addBox(data: AppData, input: NewBoxInput): AppData {
  return updateCurrentSpace(data, (space) => {
    if (isPlacementBlocked(input, space)) return space;
    const name = nextBoxName(
      space.boxes.map((box) => box.name),
      FURNITURE_LABELS.box,
    );
    return { ...space, boxes: [...space.boxes, createBox(input, space.floor, name)] };
  });
}
