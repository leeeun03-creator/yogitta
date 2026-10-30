import { boxFootprint } from "@/shared/lib/boxFootprint";
import { clampBoxCenter } from "@/shared/lib/clampBoxCenter";
import type { AppData, Point } from "@/shared/types";
import { updateBox } from "./updateBox";

/** 현재 공간의 가구 하나를 가운데가 center(cm, 2D)인 자리로 옮긴다. 바닥 밖으로는 나가지 않는다. */
export function moveBox(data: AppData, id: string, center: Point): AppData {
  return updateBox(data, id, (box, floor) => {
    const next = clampBoxCenter(center, boxFootprint(box), floor);
    if (next.x === box.x && next.y === box.z) return box;
    return { ...box, x: next.x, z: next.y }; // 2D y = 3D z
  });
}
