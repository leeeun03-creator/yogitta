import type { Footprint } from "@/shared/lib/boxFootprint";
import { clampBoxCenter } from "@/shared/lib/clampBoxCenter";
import type { Floor, Point } from "@/shared/types";
import { snapBoxCenter } from "./snapBoxCenter";

type MoveInput = {
  origin: Point; // 끌기 전 가구 가운데 (cm)
  delta: Point; // 끈 거리 (cm)
  size: Footprint; // 가구가 바닥에서 차지하는 크기
  gridStep: number | null; // 격자 스냅이 켜져 있으면 격자 간격 (cm)
  floor: Floor;
};

/**
 * 끈 만큼 옮긴 가구 가운데. 격자 스냅이 켜져 있으면 가구 왼쪽 위 모서리를 격자에 붙여 가장자리가 격자선에 오게 하고,
 * 가구가 바닥 밖으로 나가지 않게 당긴다.
 */
export function movedBoxCenter({ origin, delta, size, gridStep, floor }: MoveInput): Point {
  const moved = { x: origin.x + delta.x, y: origin.y + delta.y };
  const snapped = gridStep === null ? moved : snapBoxCenter(moved, size, gridStep);
  return clampBoxCenter(snapped, size, floor);
}
