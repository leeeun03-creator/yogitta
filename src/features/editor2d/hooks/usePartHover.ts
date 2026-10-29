import { useState, type PointerEvent } from "react";
import type { Rect } from "@/features/spaces";
import type { Point } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import { canTapPart } from "../logic/canTapPart";
import type { ViewBox } from "../logic/fitViewBox";
import { screenToCm } from "../logic/screenToCm";
import { eventPoint } from "./eventPoint";

/**
 * 누르면 새 구역이 될 구획을 옅게 칠할 사각형들. 마우스를 올린 이름 없는 구획, 이름 입력칸이 떠 있으면 그 구획이다.
 * 어디까지가 한 구획인지 구역을 만들기 전에 보이게 한다. 휴대폰은 올리기가 없어 누른 뒤(입력칸이 뜬 동안)만 보인다.
 */
export function usePartHover(
  tool: DrawingTool,
  box: ViewBox,
  findUnnamed: (point: Point) => Rect[] | null,
) {
  const focus = useAppStore((state) => state.ui.roomFocus);
  const [hovered, setHovered] = useState<Rect[] | null>(null);
  const handlers = {
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      // 끄는 중(버튼을 누른 채)에는 선을 그리는 중이라 칠하지 않는다
      const isHover = event.pointerType === "mouse" && event.buttons === 0;
      setHovered(isHover ? findUnnamed(screenToCm(eventPoint(event), box)) : null);
    },
    onPointerLeave: () => setHovered(null),
  };
  const target = focus?.type === "new" ? findUnnamed(focus.at) : hovered;
  return { rects: canTapPart(tool) ? target : null, handlers };
}
