import { clamp } from "@/shared/lib/clamp";
import type { Point } from "@/shared/types";
import type { ViewBox } from "./fitViewBox";

type Half = { x: number; y: number }; // 글자 상자의 절반 크기 (cm)

const isInside = (point: Point, box: ViewBox, half: Half) =>
  point.x >= box.x + half.x &&
  point.x <= box.x + box.width - half.x &&
  point.y >= box.y + half.y &&
  point.y <= box.y + box.height - half.y;

/** 선분과 직각인 단위 벡터 중 위쪽(세로선이면 왼쪽)을 향한 것. 길이 0이면 (0, 0). */
function upOrLeftNormal(a: Point, b: Point): Point {
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  if (length === 0) return { x: 0, y: 0 };
  const normal = { x: -(b.y - a.y) / length, y: (b.x - a.x) / length };
  const isUpOrLeft = normal.y < 0 || (normal.y === 0 && normal.x < 0);
  return isUpOrLeft ? normal : { x: -normal.x, y: -normal.y };
}

/**
 * 선분 a–b의 길이 표시 자리(글자 가운데). 선 가운데에서 선과 직각으로, 글자 상자가 선에서 gap만큼 떨어지게 둔다.
 * 위쪽(세로선이면 왼쪽)에 먼저 두고, 글자가 화면 밖이면 반대쪽, 그래도 밖이면 화면 안으로 당긴다.
 */
export function labelPosition(a: Point, b: Point, gap: number, half: Half, box: ViewBox): Point {
  const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const normal = upOrLeftNormal(a, b);
  // 글자 상자를 normal 방향으로 쟀을 때의 절반 두께만큼 더 띄워야 선에 닿지 않는다
  const offset = gap + Math.abs(normal.x) * half.x + Math.abs(normal.y) * half.y;
  const sides = [1, -1].map((sign) => ({
    x: middle.x + normal.x * offset * sign,
    y: middle.y + normal.y * offset * sign,
  }));
  const chosen = sides.find((point) => isInside(point, box, half)) ?? sides[0] ?? middle;
  return {
    x: clamp(chosen.x, box.x + half.x, box.x + box.width - half.x),
    y: clamp(chosen.y, box.y + half.y, box.y + box.height - half.y),
  };
}
