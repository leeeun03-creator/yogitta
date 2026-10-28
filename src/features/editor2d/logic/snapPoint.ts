import { clamp } from "@/shared/lib/clamp";
import { distance } from "@/shared/lib/distance";
import type { Floor, Point } from "@/shared/types";

export type SnapKind = "endpoint" | "grid" | "none";
export type SnapOptions = {
  enabled: boolean;
  endpointRadius: number;
  gridStep: number;
  floor: Floor;
}; // cm

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

/**
 * 누른 점(cm, 반올림 전)을 붙일 곳으로 옮긴다.
 * 반지름 안에 벽 점(targets)이 있으면 가장 가까운 그 점, 아니면 격자, 스냅을 끄면 1cm 반올림. 결과는 늘 바닥 안이다.
 */
export function snapPoint(
  raw: Point,
  targets: readonly Point[],
  { enabled, endpointRadius, gridStep, floor }: SnapOptions,
): { point: Point; kind: SnapKind } {
  const step = enabled ? gridStep : 1;
  const free = {
    x: clamp(roundTo(raw.x, step), 0, floor.w),
    y: clamp(roundTo(raw.y, step), 0, floor.h),
  };
  if (!enabled) return { point: free, kind: "none" };

  let nearest: Point | null = null;
  for (const target of targets) {
    const gap = distance(raw, target);
    if (gap <= endpointRadius && (!nearest || gap < distance(raw, nearest))) nearest = target;
  }
  return nearest ? { point: { ...nearest }, kind: "endpoint" } : { point: free, kind: "grid" };
}
