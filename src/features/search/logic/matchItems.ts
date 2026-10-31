import type { Box, Item, Space } from "@/shared/types";

/** 찾은 물건 하나: 어느 공간·가구에 있는지와 이름으로 찾았는지(아니면 메모로). */
export type ItemMatch = { space: Space; box: Box; item: Item; byName: boolean };

/** 띄어쓰기를 모두 빼고 영어는 소문자로 (검색어와 물건을 같은 모양으로 견준다). */
const squash = (text: string) => text.replace(/\s+/g, "").toLowerCase();

/**
 * 공간들에서 검색어에 맞는 물건을 찾는다 (PRD F8). 이름·메모 부분 일치이고 띄어쓰기·영어 대소문자는 무시한다
 * ("겨울패딩" → "작년 겨울 패딩"). 이름에 맞은 물건이 먼저, 그다음 메모에만 맞은 물건이다. 검색어가 비면 없다.
 */
export function matchItems(spaces: readonly Space[], query: string): ItemMatch[] {
  const needle = squash(query);
  if (needle === "") return [];
  const found = spaces.flatMap((space) =>
    space.boxes.flatMap((box) =>
      box.items.flatMap((item) => {
        const byName = squash(item.name).includes(needle);
        const byMemo = squash(item.memo ?? "").includes(needle);
        return byName || byMemo ? [{ space, box, item, byName }] : [];
      }),
    ),
  );
  return [...found.filter((match) => match.byName), ...found.filter((match) => !match.byName)];
}
