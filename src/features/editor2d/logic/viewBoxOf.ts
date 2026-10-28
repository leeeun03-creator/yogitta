import type { Floor, Point } from "@/shared/types";
import { fitViewBox, type Size, type ViewBox } from "./fitViewBox";

/** 2D 평면도를 어디서 얼마나 크게 보고 있는지. zoom 1 = 바닥이 화면에 꽉 찬다. */
export type View = { zoom: number; center: Point }; // center: cm

export function initialView(floor: Floor): View {
  return { zoom: 1, center: { x: floor.w / 2, y: floor.h / 2 } };
}

/** 보는 위치(View)를 SVG viewBox로 바꾼다. */
export function viewBoxOf(floor: Floor, viewport: Size, marginPx: number, view: View): ViewBox {
  const fitted = fitViewBox(floor, viewport, marginPx);
  if (viewport.width <= 0 || viewport.height <= 0) return fitted;

  const cmPerPx = fitted.cmPerPx / view.zoom;
  const width = viewport.width * cmPerPx;
  const height = viewport.height * cmPerPx;
  return { x: view.center.x - width / 2, y: view.center.y - height / 2, width, height, cmPerPx };
}
