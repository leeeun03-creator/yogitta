import type { AppData } from "@/shared/types";
import { removeSegment } from "./removeSegment";
import { updateCurrentSpace } from "./updateCurrentSpace";

/** 현재 공간에서 벽 하나의 선분 하나를 지운다. 벽이 나뉘면 뒤쪽 조각은 newId를 쓴다. */
export function eraseSegment(
  data: AppData,
  target: { wallId: string; segment: number },
  newId: string,
): AppData {
  return updateCurrentSpace(data, (space) => {
    const index = space.walls.findIndex((wall) => wall.id === target.wallId);
    const wall = space.walls[index];
    if (!wall) return space;

    const pieces = removeSegment(wall, target.segment, newId);
    if (pieces.length === 1 && pieces[0] === wall) return space;
    const walls = [...space.walls.slice(0, index), ...pieces, ...space.walls.slice(index + 1)];
    return { ...space, walls };
  });
}
