import { boxFootprint } from "@/shared/lib/boxFootprint";
import { canStackOn } from "@/shared/lib/canStackOn";
import { clampBoxCenter } from "@/shared/lib/clampBoxCenter";
import { stackedElevation } from "@/shared/lib/stackedElevation";
import type { AppData, Box, Point, Space } from "@/shared/types";
import { updateBox } from "./updateBox";

/** 옮길 받침 가구. undefined면 지금 받침 가구 그대로(없어진 받침 가구면 바닥), 올릴 수 없는 가구면 false. */
function baseFor(box: Box, space: Space, parentId: string | null | undefined): Box | null | false {
  const id = parentId === undefined ? box.parentId : parentId;
  const base = space.boxes.find((candidate) => candidate.id === id);
  if (!base) return parentId ? false : null;
  return canStackOn(space.boxes, box, base) && base;
}

/**
 * 현재 공간의 가구 하나를 가운데가 center(cm, 2D)인 자리로 옮긴다. 바닥 밖으로는 나가지 않는다.
 * parentId를 주면 그 가구 위에 올리고(설치 높이 = 받침 가구 위, T29), null이면 바닥으로 내린다.
 * 주지 않으면 받침 가구는 그대로다. 올릴 수 없는 가구(벽걸이, 자기 위 가구 등)면 옮기지 않는다.
 */
export function moveBox(
  data: AppData,
  id: string,
  center: Point,
  parentId?: string | null,
): AppData {
  return updateBox(data, id, (box, space) => {
    const base = baseFor(box, space, parentId);
    if (base === false) return box;
    const next = clampBoxCenter(center, boxFootprint(box), space.floor);
    const elevation = stackedElevation(box, base);
    const isSame = next.x === box.x && next.y === box.z && elevation === box.elevation;
    if (isSame && base?.id === box.parentId) return box;
    const moved: Box = { ...box, x: next.x, z: next.y, elevation }; // 2D y = 3D z
    if (base) moved.parentId = base.id;
    else delete moved.parentId;
    return moved;
  });
}
