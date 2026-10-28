import { GRID_SNAP_CM } from "@/shared/constants/grid";
import { SNAP_ENDPOINT_PX } from "@/shared/constants/floorPlan";
import type { Floor, Point, Wall } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import type { ViewBox } from "../logic/fitViewBox";
import { screenToCm } from "../logic/screenToCm";
import { snapPoint, type SnapKind } from "../logic/snapPoint";

export type Snapped = { point: Point; kind: SnapKind };
export type SnapAt = (screen: Point, draft?: readonly Point[]) => Snapped;

/** 화면 좌표(px)를 붙을 바닥 점으로 바꾸는 함수를 준다. 붙을 대상은 벽의 모든 점 + 그리던 점. */
export function useSnapper(walls: readonly Wall[], box: ViewBox, floor: Floor): SnapAt {
  const enabled = useAppStore((state) => state.ui.snap);
  return (screen, draft = []) =>
    snapPoint(screenToCm(screen, box), [...walls.flatMap((wall) => wall.points), ...draft], {
      enabled,
      endpointRadius: SNAP_ENDPOINT_PX * box.cmPerPx,
      gridStep: GRID_SNAP_CM,
      floor,
    });
}
