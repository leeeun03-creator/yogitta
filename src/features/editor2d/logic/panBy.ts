import type { Floor, Point } from "@/shared/types";
import { clampCenter } from "./clampCenter";
import type { View } from "./viewBoxOf";

/** 화면에서 delta(px)만큼 끌었을 때의 보는 위치. 바닥은 손가락을 따라 같은 방향으로 움직인다. */
export function panBy(view: View, delta: Point, cmPerPx: number, floor: Floor): View {
  const center = { x: view.center.x - delta.x * cmPerPx, y: view.center.y - delta.y * cmPerPx };
  return { ...view, center: clampCenter(center, floor) };
}
