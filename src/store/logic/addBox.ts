import { BOX_DEFAULT_SIZE, BOX_MIN_SIZE_CM, FURNITURE_LABELS } from "@/shared/constants/furniture";
import { clamp } from "@/shared/lib/clamp";
import { clampBoxCenter } from "@/shared/lib/clampBoxCenter";
import type { AppData, Box, Floor, Point } from "@/shared/types";
import { nextBoxName } from "./nextBoxName";
import { updateCurrentSpace } from "./updateCurrentSpace";

/** 새 가구를 놓을 자리: 가운데(cm, 2D)와 가로·깊이(cm). */
export type NewBoxInput = { id: string; center: Point; w: number; d: number };

/** 새 가구 하나를 만든다. 크기는 최소 크기 ~ 바닥 크기로, 위치는 바닥 안으로 맞춘다. */
function createBox(input: NewBoxInput, floor: Floor, name: string): Box {
  const w = clamp(input.w, BOX_MIN_SIZE_CM, floor.w);
  const d = clamp(input.d, BOX_MIN_SIZE_CM, floor.h);
  const center = clampBoxCenter(input.center, { w, d }, floor);
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

/** 현재 공간에 보관함 하나를 더한다. 이름은 "보관함 1"부터 비어 있는 번호다. */
export function addBox(data: AppData, input: NewBoxInput): AppData {
  return updateCurrentSpace(data, (space) => {
    const name = nextBoxName(
      space.boxes.map((box) => box.name),
      FURNITURE_LABELS.box,
    );
    return { ...space, boxes: [...space.boxes, createBox(input, space.floor, name)] };
  });
}
