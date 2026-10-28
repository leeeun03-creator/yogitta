import { clamp } from "@/shared/lib/clamp";
import type { Point } from "@/shared/types";
import type { Size } from "./fitViewBox";

type LoupeLayout = { size: number; lift: number; margin: number }; // px

/**
 * 돋보기 가운데 자리(px). 손가락 위 lift만큼에 두고, 위가 모자라면 손가락 옆(화면 가운데 쪽)에 둔다.
 * 어느 쪽이든 2D 평면도 영역 밖으로 나가지 않게 당긴다.
 */
export function loupePlacement(finger: Point, viewport: Size, { size, lift, margin }: LoupeLayout) {
  const half = size / 2;
  const fitsAbove = finger.y - lift - half >= margin;
  const side = finger.x < viewport.width / 2 ? 1 : -1;
  const center = fitsAbove
    ? { x: finger.x, y: finger.y - lift }
    : { x: finger.x + side * lift, y: finger.y };
  return {
    x: clamp(center.x, margin + half, viewport.width - margin - half),
    y: clamp(center.y, margin + half, viewport.height - margin - half),
  };
}
