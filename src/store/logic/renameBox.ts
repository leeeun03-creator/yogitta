import { BOX_NAME_MAX_LENGTH } from "@/shared/constants/furniture";
import { checkName, type NameError } from "@/shared/lib/checkName";
import type { AppData } from "@/shared/types";
import { updateBox } from "./updateBox";

/** 가구 이름을 바꾼 결과. 막히면 데이터는 그대로이고 까닭을 돌려준다. */
export type BoxNameResult = { ok: true; data: AppData } | { ok: false; reason: NameError };

/**
 * 현재 공간의 가구 이름을 바꾼다 (앞뒤 공백을 지운다). 같은 공간의 다른 가구와 같은 이름
 * (띄어쓰기·대소문자만 다른 것 포함)·빈 이름·너무 긴 이름은 막는다. 다른 공간의 같은 이름은 된다.
 */
export function renameBox(data: AppData, id: string, input: string): BoxNameResult {
  const space = data.spaces.find((candidate) => candidate.id === data.currentSpaceId);
  if (!space?.boxes.some((box) => box.id === id)) return { ok: true, data };
  const others = space.boxes.filter((box) => box.id !== id).map((box) => box.name);
  const check = checkName(others, input, BOX_NAME_MAX_LENGTH);
  if (!check.ok) return check;
  const name = check.name;
  return {
    ok: true,
    data: updateBox(data, id, (box) => (box.name === name ? box : { ...box, name })),
  };
}
