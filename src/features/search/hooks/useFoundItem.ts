import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { ItemMatch } from "../logic/matchItems";

/**
 * 고른 검색 결과. 고른 물건이 결과에 없으면(처음·검색어가 바뀜) 첫 결과를 고르고 그 가구의 가구 상세 패널을 연다.
 * 결과가 없으면 고른 것을 비운다(열린 패널은 그대로). pick은 여러 곳 중 하나를 고른다.
 */
export function useFoundItem(matches: readonly ItemMatch[]) {
  const foundId = useAppStore((state) => state.ui.foundItemId);
  const pickFound = useAppStore((state) => state.pickFound);
  const picked = matches.find((match) => match.item.id === foundId) ?? matches[0] ?? null;
  const pickedId = picked?.item.id ?? null;
  const pickedBoxId = picked?.box.id;
  useEffect(() => {
    if (pickedId !== foundId) pickFound(pickedId, pickedBoxId);
  }, [pickedId, pickedBoxId, foundId, pickFound]);
  return { picked, pick: (match: ItemMatch) => pickFound(match.item.id, match.box.id) };
}
