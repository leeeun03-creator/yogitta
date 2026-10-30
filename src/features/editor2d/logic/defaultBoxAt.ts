import { BOX_DEFAULT_SIZE } from "@/shared/constants/furniture";
import type { Point } from "@/shared/types";
import type { BoxPlacement } from "./boxFromDrag";

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

/**
 * 가구 도구로 누르기만 했을 때의 가구: 누른 자리가 가운데인 기본 크기(60 × 50 cm).
 * 격자 스냅(gridStep)이 켜져 있으면 가장자리가 격자선에 오도록 왼쪽 위 모서리를 격자에 붙인다.
 */
export function defaultBoxAt(point: Point, gridStep: number | null): BoxPlacement {
  const { w, d } = BOX_DEFAULT_SIZE;
  if (gridStep === null) return { center: point, w, d };
  const corner = { x: roundTo(point.x - w / 2, gridStep), y: roundTo(point.y - d / 2, gridStep) };
  return { center: { x: corner.x + w / 2, y: corner.y + d / 2 }, w, d };
}
