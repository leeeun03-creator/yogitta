import { boxFootprint } from "@/shared/lib/boxFootprint";
import { boxObstacles } from "@/shared/lib/boxObstacles";
import { clampBoxCenter } from "@/shared/lib/clampBoxCenter";
import { heightSpan } from "@/shared/lib/heightSpan";
import { resolveBoxMove } from "@/shared/lib/resolveBoxMove";
import type { Box, Point, Space } from "@/shared/types";
import { clampOntoBase } from "./clampOntoBase";

/**
 * 방향키로 가구를 한 칸(step cm) 옮긴 가운데. 바닥 밖으로 나가지 않고, 벽·높이가 겹치는 다른 가구가 한 칸보다 가까우면
 * 그 면에 딱 붙는 데까지만 간다 (이미 붙어 있으면 그대로). 가구 위 가구는 받침 가구 윗면을 벗어나지 않는다.
 */
export function boxKeyMove(box: Box, direction: Point, step: number, space: Space): Point {
  const size = boxFootprint(box);
  const from = { x: box.x, y: box.z }; // 2D y = 3D z
  const moved = clampBoxCenter(
    { x: from.x + direction.x * step, y: from.y + direction.y * step },
    size,
    space.floor,
  );
  const base = space.boxes.find((candidate) => candidate.id === box.parentId);
  const to = base ? clampOntoBase(moved, base) : moved;
  return resolveBoxMove({
    from,
    to,
    size,
    obstacles: boxObstacles(space, box.id, heightSpan(box)),
  });
}
