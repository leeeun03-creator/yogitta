import type { AppData, Wall } from "@/shared/types";
import { updateCurrentSpace } from "./updateCurrentSpace";

const MIN_POINTS = 2;

/** 현재 공간에 벽 하나를 더한다. 점이 2개보다 적은 벽은 더하지 않는다. */
export function addWall(data: AppData, wall: Wall): AppData {
  if (wall.points.length < MIN_POINTS) return data;
  return updateCurrentSpace(data, (space) => ({ ...space, walls: [...space.walls, wall] }));
}
