import { WALL_HEIGHT_CM } from "@/shared/constants/scene";
import {
  THUMBNAIL_HEIGHT_PX,
  THUMBNAIL_ISO_DEG,
  THUMBNAIL_PADDING_PX,
  THUMBNAIL_WIDTH_PX,
} from "@/shared/constants/spaceThumbnail";
import { lineSegments } from "@/shared/lib/lineSegments";
import type { Point, Space } from "@/shared/types";

/** 벽 면 하나: SVG polygon 점들(px)과 면 방향(앞면·옆면, 음영이 다르다). */
export type ThumbnailWall = { points: Point[]; face: "front" | "side" };
/** 썸네일에 그릴 바닥(점 4개)과 벽 면들 (뒤에서 앞 순서). */
export type Thumbnail = { floor: Point[]; walls: ThumbnailWall[] };

const RADIANS = (THUMBNAIL_ISO_DEG * Math.PI) / 180;

/** 바닥 위 점(cm, 2D y = 3D z)과 높이(cm)를 등각 화면 좌표로. 오른쪽 앞 대각선 위에서 본다. */
const iso = (point: Point, height = 0): Point => ({
  x: (point.x - point.y) * Math.cos(RADIANS),
  y: (point.x + point.y) * Math.sin(RADIANS) - height,
});

/** 벽 선분 하나를 바닥부터 벽 높이까지 세운 면. 가로로 긴 벽은 앞면, 세로로 긴 벽은 옆면이다. */
function wallFace(a: Point, b: Point) {
  const face: ThumbnailWall["face"] = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y) ? "front" : "side";
  const depth = a.x + a.y + b.x + b.y; // 클수록 앞(보는 쪽)
  const points = [iso(a), iso(b), iso(b, WALL_HEIGHT_CM), iso(a, WALL_HEIGHT_CM)];
  return { points, face, depth };
}

/** 점들을 썸네일 칸(여백 안)에 가운데 맞춰 꽉 차게 줄이는 함수. */
function fitToBox(points: readonly Point[]) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const room = {
    w: THUMBNAIL_WIDTH_PX - THUMBNAIL_PADDING_PX * 2,
    h: THUMBNAIL_HEIGHT_PX - THUMBNAIL_PADDING_PX * 2,
  };
  const scale = Math.min(room.w / (maxX - minX || 1), room.h / (maxY - minY || 1));
  const left = (THUMBNAIL_WIDTH_PX - (maxX - minX) * scale) / 2;
  const top = (THUMBNAIL_HEIGHT_PX - (maxY - minY) * scale) / 2;
  return (point: Point): Point => ({
    x: left + (point.x - minX) * scale,
    y: top + (point.y - minY) * scale,
  });
}

/**
 * 공간 전환 목록의 공간 썸네일: 바닥과 벽을 비스듬히 위에서 본 모양(등각)으로 76 × 56 칸에 맞춘다.
 * 3D 그림을 공간마다 띄우지 않으려고 SVG로 그릴 점만 계산한다. 벽은 뒤에서 앞 순서라 앞 벽이 뒤 벽을 가린다.
 */
export function spaceThumbnail({ floor, walls }: Pick<Space, "floor" | "walls">): Thumbnail {
  const corners = [
    { x: 0, y: 0 },
    { x: floor.w, y: 0 },
    { x: floor.w, y: floor.h },
    { x: 0, y: floor.h },
  ].map((corner) => iso(corner));
  const faces = walls
    .flatMap(lineSegments)
    .map(([a, b]) => wallFace(a, b))
    .sort((first, second) => first.depth - second.depth);
  const fit = fitToBox([...corners, ...faces.flatMap((face) => face.points)]);
  return {
    floor: corners.map(fit),
    walls: faces.map(({ points, face }) => ({ points: points.map(fit), face })),
  };
}
