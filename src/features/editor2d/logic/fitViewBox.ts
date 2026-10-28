import type { Floor } from "@/shared/types";

export type Size = { width: number; height: number }; // px
export type ViewBox = { x: number; y: number; width: number; height: number; cmPerPx: number };

/** 화면(px) 가운데에 바닥(cm)이 여백을 두고 꽉 차게 보이는 SVG viewBox를 구한다. */
export function fitViewBox(floor: Floor, viewport: Size, marginPx: number): ViewBox {
  const usableWidth = viewport.width - marginPx * 2;
  const usableHeight = viewport.height - marginPx * 2;
  // 화면 크기를 아직 모르면 바닥만 그대로 보여 준다
  if (usableWidth <= 0 || usableHeight <= 0) {
    return { x: 0, y: 0, width: floor.w, height: floor.h, cmPerPx: 1 };
  }

  const cmPerPx = Math.max(floor.w / usableWidth, floor.h / usableHeight);
  const width = viewport.width * cmPerPx;
  const height = viewport.height * cmPerPx;
  return { x: (floor.w - width) / 2, y: (floor.h - height) / 2, width, height, cmPerPx };
}
