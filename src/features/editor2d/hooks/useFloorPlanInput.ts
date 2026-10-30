import type { RefObject } from "react";
import { POINT_HIT_PX } from "@/shared/constants/floorPlan";
import { callAll } from "@/shared/lib/callAll";
import type { Point, Space } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { findBoxAt } from "../logic/findBoxAt";
import { findWallPointAt } from "../logic/findWallPointAt";
import { mergeHandlers } from "./mergeHandlers";
import { useBoxInput } from "./useBoxInput";
import { useEraserTool } from "./useEraserTool";
import { useLoupe } from "./useLoupe";
import { usePanZoom } from "./usePanZoom";
import { usePlanNotice } from "./usePlanNotice";
import { useRoomInput } from "./useRoomInput";
import { useSnapper } from "./useSnapper";
import { useTap } from "./useTap";
import { useWallTools } from "./useWallTools";

type Inputs = {
  wall: ReturnType<typeof useWallTools>;
  room: ReturnType<typeof useRoomInput>;
  furniture: ReturnType<typeof useBoxInput>;
  eraser: ReturnType<typeof useEraserTool>;
};

/** 2D 평면도·돋보기가 그릴 상태를 입력마다 모은다. 길이 표시는 벽 도구가 먼저, 없으면 끄는 가구 크기다. */
const sceneOf = ({ wall, room, furniture, eraser }: Inputs) => ({
  ...wall.scene,
  ...room.scene,
  ...furniture.scene,
  erasing: eraser.erasing,
  measure: wall.scene.measure ?? furniture.measure,
});

/** 2D 평면도가 받는 입력(줌·이동, 누르기, 벽 도구·벽 점 끌기, 구역, 가구, 지우개, 터치 돋보기)을 처리기 하나씩으로 묶는다. */
export function useFloorPlanInput(ref: RefObject<HTMLElement | null>, space: Space) {
  const tool = useAppStore((state) => state.ui.tool);
  // 선택 도구에서 가구·벽 점 위를 누르면 2D 평면도를 움직이거나 구획을 칠하는 대신 그것을 고르고 옮긴다
  const isOnBox = (point: Point) => tool === "select" && findBoxAt(space.boxes, point) !== null;
  const isOnWallPoint = (point: Point, cmPerPx: number) =>
    findWallPointAt(space.walls, point, POINT_HIT_PX * cmPerPx) !== null;
  const canPanAt = (point: Point, cmPerPx: number) =>
    tool === "select" && !isOnBox(point) && !isOnWallPoint(point, cmPerPx);
  const { box, handlers: pan } = usePanZoom(ref, space.floor, canPanAt);
  const snapAt = useSnapper(space.walls, box, space.floor);
  const notice = usePlanNotice();
  const wall = useWallTools(tool, box, { snapAt, ...space, notify: notice.show });
  const room = useRoomInput(tool, box, space, isOnBox);
  const furniture = useBoxInput(tool, box, space, { snapAt, notify: notice.show });
  const eraser = useEraserTool(tool, box, { ...space, roomLines: room.scene.roomLines });
  // 가구를 눌러 골랐으면 그 아래 구획은 누르지 않는다 (구역 입력칸이 뜨지 않게)
  const tap = useTap(callAll(wall.tap, eraser.tap, (at) => furniture.tap(at) || room.tap(at)));
  const loupe = useLoupe(tool, wall.isMovingPoint);
  return {
    tool,
    box,
    walls: wall.walls ?? space.walls, // 벽 점을 끄는 동안은 옮긴 벽
    scene: sceneOf({ wall, room, furniture, eraser }),
    finger: loupe.finger, // 돋보기를 띄울 손가락 자리
    notice: notice.text, // 잠깐 뜨는 안내 (가구를 놓거나 벽을 긋고 옮기려는 자리가 겹칠 때)
    // 같은 이벤트는 줌·이동 → 돋보기 → 누르기 → 벽 도구 → 구역 → 가구 → 지우개 순서로 받는다
    handlers: mergeHandlers(
      pan,
      loupe.handlers,
      tap,
      wall.handlers,
      room.handlers,
      furniture.handlers,
      eraser.handlers,
    ),
  };
}
