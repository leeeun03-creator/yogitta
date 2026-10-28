import type { Point } from "@/shared/types";

export type PolylineStep = { draft: Point[]; wall?: { points: Point[]; closed: boolean } };

const MIN_OPEN_POINTS = 2;
const MIN_CLOSED_POINTS = 3;

const isSame = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** 연속선을 Enter로 끝낸다. 점이 2개보다 적으면 벽을 만들지 않는다. */
export function finishPolyline(draft: readonly Point[]): PolylineStep {
  if (draft.length < MIN_OPEN_POINTS) return { draft: [...draft] };
  return { draft: [], wall: { points: [...draft], closed: false } };
}

/**
 * 연속선 도구에서 한 번 눌렀을 때.
 * - 마지막 점을 다시 누르면 끝낸다 (점이 1개뿐이면 무시)
 * - 점이 3개 이상일 때 첫 점 근처(closeRadius cm 안)를 누르면 닫힌 벽이 된다
 * - 그 밖에는 점을 이어 붙인다
 */
export function nextPolylineDraft(
  draft: readonly Point[],
  point: Point,
  closeRadius: number,
): PolylineStep {
  const first = draft[0];
  const last = draft.at(-1);
  if (!first || !last) return { draft: [point] };
  if (isSame(point, last)) return finishPolyline(draft);

  if (distance(point, first) <= closeRadius) {
    if (draft.length < MIN_CLOSED_POINTS) return { draft: [...draft] };
    return { draft: [], wall: { points: [...draft], closed: true } };
  }
  return { draft: [...draft, point] };
}
