import type { KeyboardEvent } from "react";
import { ROTATE_HANDLE_HIT_PX } from "@/shared/constants/floorPlan";
import { distance } from "@/shared/lib/distance";
import type { Box, Point } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import { boxKeyAction } from "../logic/boxKeyAction";
import { findBoxAt } from "../logic/findBoxAt";
import type { ViewBox } from "../logic/fitViewBox";
import { rotateHandleAt } from "../logic/rotateHandleAt";
import { screenToCm } from "../logic/screenToCm";

/** 고른 가구의 회전 핸들을 눌렀는지 (화면 22px 안). */
const isOnHandle = (box: Box, point: Point, cmPerPx: number) =>
  distance(point, rotateHandleAt(box, cmPerPx)) <= ROTATE_HANDLE_HIT_PX * cmPerPx;

/**
 * 선택 도구로 누르기: 고른 가구의 회전 핸들이면 90도 돌리고, 가구면 고르고, 빈 곳이면 푼다.
 * 2D 평면도에 초점이 있으면 고른 가구를 R로 돌리고, Delete·Backspace로 지우고, Esc로 푼다.
 * tap은 핸들이나 가구를 눌렀으면 true를 돌려준다 (그 아래 구획을 눌러 구역 입력칸이 뜨지 않게).
 */
export function useBoxSelect(tool: DrawingTool, view: ViewBox, boxes: readonly Box[]) {
  const selected = useAppStore((state) => state.ui.selectedBoxId);
  const selectBox = useAppStore((state) => state.selectBox);
  const rotateBox = useAppStore((state) => state.rotateBox);
  const requestRemoveBox = useAppStore((state) => state.requestRemoveBox); // 물건이 든 가구는 먼저 묻는다
  const current = boxes.find((box) => box.id === selected);

  const tap = (screen: Point) => {
    if (tool !== "select") return false;
    const point = screenToCm(screen, view);
    if (current && isOnHandle(current, point, view.cmPerPx)) {
      rotateBox(current.id);
      return true;
    }
    const hit = findBoxAt(boxes, point);
    selectBox(hit?.id ?? null);
    return hit !== null;
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const action = boxKeyAction(event);
    // 방향키는 2D 평면도를 움직인다 (가구 옮기기는 가구 버튼에 초점이 있을 때)
    if (!current || !action || action.type === "move") return;
    event.preventDefault();
    if (action.type === "rotate") rotateBox(current.id);
    else if (action.type === "remove") requestRemoveBox(current.id);
    else selectBox(null);
  };
  return { tap, handlers: { onKeyDown } };
}
