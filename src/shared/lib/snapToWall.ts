import { WALL_MOUNT_SNAP_CM } from "@/shared/constants/furniture";
import { WALL_THICKNESS_CM } from "@/shared/constants/scene";
import type { Box, Point, Wall } from "@/shared/types";
import { lineSegments } from "./lineSegments";

/** 벽에 붙인 자리: 가운데(cm, 2D)와 정면이 벽 반대쪽을 보는 회전(도). */
export type WallMount = { center: Point; rotation: number };

const ALIGN_CM = 0.5; // 이만큼 안이면 가로·세로 벽으로 본다

/** 선분 하나에 붙인 자리와 벽 가운데선까지 거리. 가로·세로 선분이 아니거나, 선분 끝 너머이거나, 멀면 null. */
function mountOn(a: Point, b: Point, target: Point, depth: number) {
  const reach = WALL_THICKNESS_CM / 2 + depth / 2; // 벽 가운데선에서 붙은 가구 가운데까지
  const isHorizontal = Math.abs(a.y - b.y) <= ALIGN_CM;
  const isVertical = Math.abs(a.x - b.x) <= ALIGN_CM;
  if (!isHorizontal && !isVertical) return null;
  const [along, across] = isHorizontal ? (["x", "y"] as const) : (["y", "x"] as const);
  const isBeside =
    target[along] >= Math.min(a[along], b[along]) && target[along] <= Math.max(a[along], b[along]);
  const distance = Math.abs(target[across] - a[across]); // 가구 가운데에서 벽 가운데선까지
  if (!isBeside || distance - reach > WALL_MOUNT_SNAP_CM) return null; // 뒷면에서 벽 면까지가 멀다
  const side = target[across] >= a[across] ? 1 : -1;
  const center = { ...target, [across]: a[across] + side * reach };
  // 정면(0도 +y, 90도 -x, 180도 -y, 270도 +x)이 벽 반대쪽을 보게
  const rotation = isHorizontal ? (side > 0 ? 0 : 180) : side > 0 ? 270 : 90;
  return { mount: { center, rotation }, distance };
}

/**
 * 벽걸이를 target(cm, 2D)으로 끌 때 붙일 벽 자리 (T30-4). 가로·세로 벽 선분 옆(선분 끝 너머는 아님)에서 가구 뒷면이
 * 벽 면까지 WALL_MOUNT_SNAP_CM 안이면, 뒷면을 벽 면에 붙이고 정면이 벽 반대쪽을 보게 돌린다. 가까운 벽이 먼저다.
 * 붙일 벽이 없으면 null.
 */
export function snapToWall(
  box: Pick<Box, "d">,
  target: Point,
  walls: readonly Wall[],
): WallMount | null {
  let best: { mount: WallMount; distance: number } | null = null;
  for (const [a, b] of walls.flatMap(lineSegments)) {
    const found = mountOn(a, b, target, box.d);
    if (found && (!best || found.distance < best.distance)) best = found;
  }
  return best?.mount ?? null;
}
