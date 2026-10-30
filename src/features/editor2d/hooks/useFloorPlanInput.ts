import type { RefObject } from "react";
import { callAll } from "@/shared/lib/callAll";
import type { Point, Space } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { findBoxAt } from "../logic/findBoxAt";
import { mergeHandlers } from "./mergeHandlers";
import { useBoxInput } from "./useBoxInput";
import { useEraserTool } from "./useEraserTool";
import { useLoupe } from "./useLoupe";
import { usePanZoom } from "./usePanZoom";
import { useRoomInput } from "./useRoomInput";
import { useSnapper } from "./useSnapper";
import { useTap } from "./useTap";
import { useWallTools } from "./useWallTools";

/** 2D 평면도가 받는 입력(줌·이동, 누르기, 벽 도구, 구역, 가구, 지우개, 터치 돋보기)을 처리기 하나씩으로 묶는다. */
export function useFloorPlanInput(ref: RefObject<HTMLElement | null>, space: Space) {
  const tool = useAppStore((state) => state.ui.tool);
  // 선택 도구에서 가구 위를 누르면 2D 평면도를 움직이거나 구획을 칠하는 대신 가구를 고르고 옮긴다
  const isOnBox = (point: Point) => tool === "select" && findBoxAt(space.boxes, point) !== null;
  const canPanAt = (point: Point) => tool === "select" && !isOnBox(point);
  const { box, handlers: pan } = usePanZoom(ref, space.floor, canPanAt);
  const snapAt = useSnapper(space.walls, box, space.floor);
  const wall = useWallTools(tool, box, snapAt);
  const room = useRoomInput(tool, box, space, isOnBox);
  const furniture = useBoxInput(tool, box, space, snapAt);
  const eraser = useEraserTool(tool, box, space.walls, room.scene.roomLines);
  // 가구를 눌러 골랐으면 그 아래 구획은 누르지 않는다 (구역 입력칸이 뜨지 않게)
  const tap = useTap(callAll(wall.tap, eraser.tap, (at) => furniture.tap(at) || room.tap(at)));
  const loupe = useLoupe(tool);

  return {
    tool,
    box,
    scene: {
      ...wall.scene,
      ...room.scene,
      ...furniture.scene,
      erasing: eraser.erasing,
      measure: wall.scene.measure ?? furniture.measure,
    },
    finger: loupe.finger, // 돋보기를 띄울 손가락 자리
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
