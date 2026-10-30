import { resizedBox, type BoxSize, type ResizeBlock } from "@/shared/lib/resizedBox";
import type { AppData } from "@/shared/types";
import { updateBox } from "./updateBox";

/** 가구 크기를 바꾼 결과. 막히면 데이터는 그대로이고 까닭을 돌려준다. */
export type ResizeBoxResult = { ok: true; data: AppData } | { ok: false; reason: ResizeBlock };

/** 현재 공간의 가구 하나의 크기를 바꾼다 (`resizedBox`). 크기가 같거나 없는 가구면 원본 그대로다. */
export function resizeBox(data: AppData, id: string, size: BoxSize): ResizeBoxResult {
  const space = data.spaces.find((candidate) => candidate.id === data.currentSpaceId);
  const box = space?.boxes.find((candidate) => candidate.id === id);
  if (!space || !box) return { ok: true, data };
  if (box.w === size.w && box.d === size.d && box.h === size.h) return { ok: true, data };
  const result = resizedBox(box, size, space);
  if (!result.ok) return result;
  return { ok: true, data: updateBox(data, id, () => result.box) };
}
