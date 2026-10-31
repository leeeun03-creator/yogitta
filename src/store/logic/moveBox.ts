import { baseOf } from "@/shared/lib/baseOf";
import { boxFootprint } from "@/shared/lib/boxFootprint";
import { canStackOn } from "@/shared/lib/canStackOn";
import { clampBoxCenter } from "@/shared/lib/clampBoxCenter";
import { stackedElevation } from "@/shared/lib/stackedElevation";
import type { AppData, Box, Point, Space } from "@/shared/types";
import { updateStackedBox } from "./updateStackedBox";

/** 옮길 받침 가구. undefined면 지금 받침 가구 그대로(없어진 받침 가구면 바닥), 올릴 수 없는 가구면 false. */
function baseFor(box: Box, space: Space, parentId: string | null | undefined): Box | null | false {
  const base = baseOf({ parentId: parentId === undefined ? box.parentId : parentId }, space.boxes);
  if (!base) return parentId ? false : null;
  return canStackOn(space.boxes, box, base) && base;
}

/** 옮길 때 함께 바꿀 것: 받침 가구(null이면 바닥, 없으면 그대로)와 회전(벽에 붙인 벽걸이, 없으면 그대로). */
export type MoveOptions = { parentId?: string | null; rotation?: number };

/**
 * 현재 공간의 가구 하나를 가운데가 center(cm, 2D)인 자리로 옮긴다. 바닥 밖으로는 나가지 않는다.
 * parentId를 주면 그 가구 위에 올리고(설치 높이 = 받침 가구 위, T29), null이면 바닥으로 내린다.
 * 주지 않으면 받침 가구는 그대로다. 올릴 수 없는 가구(벽걸이, 자기 위 가구 등)면 옮기지 않는다.
 * rotation을 주면 그 방향으로 돌려 놓는다(벽에 붙인 벽걸이, T30-4). 그 위에 올린 가구도 같이 옮긴다 (T29-2).
 */
export function moveBox(
  data: AppData,
  id: string,
  center: Point,
  options: MoveOptions = {},
): AppData {
  return updateStackedBox(data, id, (box, space) => {
    const turned = options.rotation === undefined ? box : { ...box, rotation: options.rotation };
    const base = baseFor(turned, space, options.parentId);
    if (base === false) return box;
    const next = clampBoxCenter(center, boxFootprint(turned), space.floor);
    const elevation = stackedElevation(box, base);
    const isSame = next.x === box.x && next.y === box.z && elevation === box.elevation;
    if (isSame && turned.rotation === box.rotation && base?.id === box.parentId) return box;
    const moved: Box = { ...turned, x: next.x, z: next.y, elevation }; // 2D y = 3D z
    if (base) moved.parentId = base.id;
    else delete moved.parentId;
    return moved;
  });
}
