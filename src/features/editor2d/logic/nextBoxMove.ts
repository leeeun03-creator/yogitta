import { baseOf } from "@/shared/lib/baseOf";
import { boxFootprint } from "@/shared/lib/boxFootprint";
import { boxObstacles } from "@/shared/lib/boxObstacles";
import { findBase } from "@/shared/lib/findBase";
import { isBoxBlocked } from "@/shared/lib/isBoxBlocked";
import { resolveBoxMove } from "@/shared/lib/resolveBoxMove";
import { snapToWall } from "@/shared/lib/snapToWall";
import { stackedElevation } from "@/shared/lib/stackedElevation";
import type { Box, Point, Space } from "@/shared/types";
import { clampOntoBase } from "./clampOntoBase";

/** 끄는 가구가 갈 자리: 가운데(cm, 2D)와 받침 가구 id (바닥이면 null), 벽에 붙였으면 그 회전(도). */
export type BoxMove = { center: Point; parentId: string | null; rotation?: number };

type StepInput = {
  box: Box; // 끄는 가구 (끌기 전 데이터)
  space: Pick<Space, "walls" | "boxes">;
  previous: BoxMove; // 바로 앞 자리 (막히지 않은 자리)
  target: Point; // 끈 만큼 옮긴 가운데 (바닥 안으로 맞춘 것)
};

/**
 * 가구를 끄는 동안 다음 자리 (T29). 가운데가 다른 가구 윗면 안에 오고 그 높이에 자리가 있으면 그 가구 위로 올라가고,
 * 윗면 밖으로 나가 바닥에 자리가 있으면 바닥으로 내려온다. 그 밖에는 지금 높이에서 벽·높이가 겹치는 가구를 뚫지 않고
 * 미끄러지며(resolveBoxMove), 가구 위 가구는 받침 가구 윗면을 벗어나지 않는다. 벽걸이는 벽 가까이 오면 벽에 붙는다
 * (T30-4, 붙인 자리가 막히면 붙이지 않는다).
 */
export function nextBoxMove({ box, space, previous, target }: StepInput): BoxMove {
  const size = boxFootprint(box);
  const obstaclesOn = (base: Box | null) => {
    const bottom = stackedElevation(box, base);
    return boxObstacles(space, box.id, { bottom, top: bottom + box.h });
  };
  const mount = box.type === "wall" ? snapToWall(box, target, space.walls) : null;
  const mounted = mount && boxFootprint({ ...box, rotation: mount.rotation });
  if (mount && mounted && !isBoxBlocked(mount.center, mounted, obstaclesOn(null))) {
    return { center: mount.center, parentId: null, rotation: mount.rotation };
  }
  const base = findBase(space.boxes, box, target);
  const baseId = base?.id ?? null;
  if (baseId !== previous.parentId && !isBoxBlocked(target, size, obstaclesOn(base))) {
    return { center: target, parentId: baseId };
  }
  const current = baseOf(previous, space.boxes) ?? null;
  const goal = current ? clampOntoBase(target, current) : target;
  const obstacles = obstaclesOn(current);
  return {
    center: resolveBoxMove({ from: previous.center, to: goal, size, obstacles }),
    parentId: previous.parentId,
  };
}
