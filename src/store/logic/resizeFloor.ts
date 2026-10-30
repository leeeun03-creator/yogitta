import { boxFootprint } from "@/shared/lib/boxFootprint";
import type { AppData, Floor, Point, Space } from "@/shared/types";
import { updateCurrentSpace } from "./updateCurrentSpace";

/** 바닥 크기를 바꾼 결과. 줄여서 벽·구역 선·구역 기준점·가구가 바닥 밖으로 나가면 막는다. */
export type FloorResizeResult = { ok: true; data: AppData } | { ok: false; reason: "outside" };

const isInside = (point: Point, floor: Floor) =>
  point.x >= 0 && point.x <= floor.w && point.y >= 0 && point.y <= floor.h;

/** 공간의 벽·구역 선·구역 기준점·가구가 모두 새 바닥 안에 드는지 (경계에 딱 걸린 것은 안이다). */
function fitsFloor(space: Space, floor: Floor): boolean {
  const points = [
    ...space.walls.flatMap((wall) => wall.points),
    ...(space.roomLines ?? []).flatMap((line) => line.points),
    ...Object.values(space.roomAnchors ?? {}),
  ];
  const boxes = space.boxes.every((box) => {
    const { w, d } = boxFootprint(box);
    const corners = [
      { x: box.x - w / 2, y: box.z - d / 2 }, // 2D y = 3D z
      { x: box.x + w / 2, y: box.z + d / 2 },
    ];
    return corners.every((corner) => isInside(corner, floor));
  });
  return boxes && points.every((point) => isInside(point, floor));
}

/** 현재 공간의 바닥 크기를 바꾼다. 같은 크기면 원본 그대로, 무언가 바닥 밖으로 나가면 막는다. */
export function resizeFloor(data: AppData, floor: Floor): FloorResizeResult {
  const space = data.spaces.find((candidate) => candidate.id === data.currentSpaceId);
  if (!space || (space.floor.w === floor.w && space.floor.h === floor.h)) return { ok: true, data };
  if (!fitsFloor(space, floor)) return { ok: false, reason: "outside" };
  return {
    ok: true,
    data: updateCurrentSpace(data, (current) => ({ ...current, floor: { ...floor } })),
  };
}
