import { KEYBOARD_PAN_PX, ZOOM_STEP } from "@/shared/constants/floorPlan";
import type { Point } from "@/shared/types";

type KeyboardAction =
  | { type: "zoom"; factor: number }
  | { type: "pan"; delta: Point } // 바닥이 움직이는 방향 (px)
  | { type: "reset" };

const PAN_KEYS: Record<string, Point> = {
  ArrowLeft: { x: KEYBOARD_PAN_PX, y: 0 },
  ArrowRight: { x: -KEYBOARD_PAN_PX, y: 0 },
  ArrowUp: { x: 0, y: KEYBOARD_PAN_PX },
  ArrowDown: { x: 0, y: -KEYBOARD_PAN_PX },
};

/** 2D 평면도에서 누른 키를 줌·이동·처음 보기로 바꾼다. 관계없는 키는 null. */
export function keyboardAction(key: string): KeyboardAction | null {
  if (key === "+" || key === "=") return { type: "zoom", factor: ZOOM_STEP };
  if (key === "-") return { type: "zoom", factor: 1 / ZOOM_STEP };
  if (key === "0") return { type: "reset" };
  const delta = PAN_KEYS[key];
  return delta ? { type: "pan", delta } : null;
}
