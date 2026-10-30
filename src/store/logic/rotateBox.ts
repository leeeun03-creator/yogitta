import { rotatedBox } from "@/shared/lib/rotatedBox";
import type { AppData } from "@/shared/types";
import { updateBox } from "./updateBox";

/** 현재 공간의 가구 하나를 가운데를 축으로 시계 방향 90도 돌린다. 바닥에 들어가지 않으면 그대로 둔다. */
export function rotateBox(data: AppData, id: string): AppData {
  return updateBox(data, id, (box, floor) => rotatedBox(box, floor) ?? box);
}
