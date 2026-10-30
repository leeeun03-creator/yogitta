import type { Point } from "@/shared/types";

const ARROW_STEPS: Record<string, Point> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

/** 가구를 방향키로 옮길 방향 (한 칸 = 1, 2D y는 아래가 +). 방향키가 아니면 null. */
export function boxKeyStep(key: string): Point | null {
  return ARROW_STEPS[key] ?? null;
}
