import type { RefObject } from "react";
import { callAll } from "@/shared/lib/callAll";
import type { Floor, RoomLine, Wall } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { mergeHandlers } from "./mergeHandlers";
import { useEraserTool } from "./useEraserTool";
import { useLoupe } from "./useLoupe";
import { usePanZoom } from "./usePanZoom";
import { useRoomLineTool } from "./useRoomLineTool";
import { useSnapper } from "./useSnapper";
import { useTap } from "./useTap";
import { useWallTools } from "./useWallTools";

/** 2D 평면도에 그려 둔 것: 벽과 구역 선. */
export type PlanLines = { walls: readonly Wall[]; roomLines: readonly RoomLine[] };

/** 2D 평면도가 받는 입력(줌·이동, 누르기, 벽 도구, 구역 선, 지우개, 터치 돋보기)을 처리기 하나씩으로 묶는다. */
export function useFloorPlanInput(
  ref: RefObject<HTMLElement | null>,
  floor: Floor,
  lines: PlanLines,
) {
  const tool = useAppStore((state) => state.ui.tool);
  const { box, handlers: pan } = usePanZoom(ref, floor, tool === "select");
  const snapAt = useSnapper(lines.walls, box, floor);
  const wall = useWallTools(tool, box, snapAt);
  const roomLine = useRoomLineTool(tool, box, floor, [...lines.walls, ...lines.roomLines]);
  const eraser = useEraserTool(tool, box, lines.walls, lines.roomLines);
  const tap = useTap(callAll(wall.tap, eraser.tap));
  const loupe = useLoupe(tool);

  return {
    tool,
    box,
    scene: {
      ...wall.scene,
      erasing: eraser.erasing,
      roomLines: lines.roomLines,
      roomLineDraft: roomLine.draft,
    },
    finger: loupe.finger, // 돋보기를 띄울 손가락 자리
    // 같은 이벤트는 줌·이동 → 돋보기 → 누르기 → 그리기 도구 → 지우개 순서로 받는다
    handlers: mergeHandlers(
      pan,
      loupe.handlers,
      tap,
      wall.handlers,
      roomLine.handlers,
      eraser.handlers,
    ),
  };
}
