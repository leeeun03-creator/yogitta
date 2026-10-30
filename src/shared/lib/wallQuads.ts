import { WALL_THICKNESS_CM } from "@/shared/constants/scene";
import type { Point, Wall } from "@/shared/types";
import { lineSegments } from "./lineSegments";

/**
 * 벽이 바닥에서 차지하는 모양: 선분마다 두께 12cm, 끝이 각진(양 끝으로 두께 절반씩 더 나온) 사각형 꼭짓점.
 * 2D 평면도의 벽 선(끝 square)과 같은 모양이라, 꺾인 자리도 빈틈 없이 막힌다. 길이 0인 선분은 뺀다.
 */
export function wallQuads(walls: readonly Pick<Wall, "points" | "closed">[]): Point[][] {
  const half = WALL_THICKNESS_CM / 2;
  return walls.flatMap((wall) =>
    lineSegments(wall).flatMap(([a, b]) => {
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      if (length === 0) return [];
      const along = { x: ((b.x - a.x) / length) * half, y: ((b.y - a.y) / length) * half };
      const across = { x: -along.y, y: along.x };
      return [
        [
          { x: a.x - along.x + across.x, y: a.y - along.y + across.y },
          { x: b.x + along.x + across.x, y: b.y + along.y + across.y },
          { x: b.x + along.x - across.x, y: b.y + along.y - across.y },
          { x: a.x - along.x - across.x, y: a.y - along.y - across.y },
        ],
      ];
    }),
  );
}
