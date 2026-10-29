import type { AppData, Floor, Space } from "@/shared/types";
import { spaceNameError, type SpaceResult } from "./spaceNameError";

export type NewSpaceInput = { id: string; name: string; floor: Floor };

export type AddSpaceResult = SpaceResult;

/** 빈 공간 하나를 전체 데이터에 붙이고 현재 공간으로 바꾼 새 데이터를 돌려준다. 원본은 바꾸지 않는다. */
export function addSpace(data: AppData, input: NewSpaceInput): AddSpaceResult {
  const error = spaceNameError(data.spaces, input.name);
  if (error) return { ok: false, reason: error };

  const space: Space = {
    id: input.id,
    name: input.name.trim(),
    floor: { ...input.floor },
    rooms: [],
    walls: [],
    boxes: [],
  };
  return {
    ok: true,
    data: { ...data, spaces: [...data.spaces, space], currentSpaceId: space.id },
  };
}
