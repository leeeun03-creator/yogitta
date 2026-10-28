import { clamp } from "@/shared/lib/clamp";
import { ZOOM_MAX, ZOOM_MIN } from "@/shared/constants/floorPlan";
import type { Floor, Point } from "@/shared/types";
import { clampCenter } from "./clampCenter";
import type { Size, ViewBox } from "./fitViewBox";
import { screenToCm } from "./screenToCm";
import type { View } from "./viewBoxOf";

type ZoomInput = { view: View; box: ViewBox; viewport: Size; floor: Floor };

/** 화면의 한 점(px)을 붙잡은 채로 factor배 줌한다. 줌은 최소·최대 안으로 묶는다. */
export function zoomAt(
  { view, box, viewport, floor }: ZoomInput,
  factor: number,
  anchor: Point,
): View {
  const zoom = clamp(view.zoom * factor, ZOOM_MIN, ZOOM_MAX);
  if (zoom === view.zoom) return view;

  const anchorCm = screenToCm(anchor, box);
  const cmPerPx = (box.cmPerPx * view.zoom) / zoom;
  const center = {
    x: anchorCm.x - (anchor.x - viewport.width / 2) * cmPerPx,
    y: anchorCm.y - (anchor.y - viewport.height / 2) * cmPerPx,
  };
  return { zoom, center: clampCenter(center, floor) };
}
