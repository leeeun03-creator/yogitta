import { josa } from "@/shared/lib/josa";
import type { Box, Item } from "@/shared/types";
import { slotPhrase } from "./slotPhrase";

/** 위치 문장 조각. mark가 있으면 화면에서 굵게(가구는 강조색도) 보인다. */
export type SentencePart = { text: string; mark?: "item" | "space" | "box" };

type LocationInput = {
  item: Item;
  box: Box;
  spaceName: string;
  baseName?: string; // 가구 위 가구면 받침 가구 이름 (T29)
};

/**
 * 위치 문장 (PRD F9, 시안 07): "[물건]은/는 [공간]의 [가구 이름] [칸 표현]에 보관 중이에요."
 * 가구 위 가구면 가구 이름 자리에 "[받침 가구] 위 [가구]"가 온다 ("책상 위 보관함 안", T29).
 * 은/는은 물건 이름 마지막 글자 받침으로 고른다. 굵게 보일 곳을 나눠 조각으로 돌려준다.
 */
export function buildLocationSentence(input: LocationInput): SentencePart[] {
  const { item, box, spaceName, baseName } = input;
  return [
    { text: item.name, mark: "item" },
    { text: `${josa(item.name, "은/는")} ` },
    { text: spaceName, mark: "space" },
    { text: "의 " },
    { text: baseName === undefined ? box.name : `${baseName} 위 ${box.name}`, mark: "box" },
    { text: ` ${slotPhrase(box, item.slot)}에 보관 중이에요.` },
  ];
}
