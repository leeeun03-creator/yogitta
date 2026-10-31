import { BOX_MAX_HEIGHT_CM } from "@/shared/constants/furniture";
import { boxFootprint } from "@/shared/lib/boxFootprint";
import { boxObstacles } from "@/shared/lib/boxObstacles";
import { isBoxBlocked } from "@/shared/lib/isBoxBlocked";
import type { AppData } from "@/shared/types";
import { updateBox } from "./updateBox";

/** 설치 높이를 못 바꾸는 까닭: 바닥보다 낮음, 설치 높이 + 높이가 240cm를 넘음, 높이가 겹치는 다른 가구에 걸림. */
export type ElevationBlock = "tooLow" | "tooHigh" | "blocked";
export type ElevationResult = { ok: true; data: AppData } | { ok: false; reason: ElevationBlock };

/**
 * 현재 공간의 벽걸이 하나의 설치 높이(cm)를 바꾼다 (T30-3). 바닥(0)부터 설치 높이 + 높이가 240cm까지이고,
 * 그 높이에서 다른 가구와 겹치면 바꾸지 않는다. 벽걸이가 아니거나 없는 가구, 같은 높이면 원본 그대로다.
 */
export function changeElevation(data: AppData, id: string, elevation: number): ElevationResult {
  const space = data.spaces.find((candidate) => candidate.id === data.currentSpaceId);
  const box = space?.boxes.find((candidate) => candidate.id === id);
  if (!space || !box || box.type !== "wall" || box.elevation === elevation) {
    return { ok: true, data };
  }
  const span = { bottom: elevation, top: elevation + box.h };
  if (elevation < 0) return { ok: false, reason: "tooLow" };
  if (span.top > BOX_MAX_HEIGHT_CM) return { ok: false, reason: "tooHigh" };
  const center = { x: box.x, y: box.z }; // 2D y = 3D z
  if (isBoxBlocked(center, boxFootprint(box), boxObstacles(space, id, span))) {
    return { ok: false, reason: "blocked" };
  }
  return { ok: true, data: updateBox(data, id, (target) => ({ ...target, elevation })) };
}
