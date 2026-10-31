import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { countBySpace } from "../logic/countBySpace";
import { matchItems } from "../logic/matchItems";

/**
 * 메인 화면 검색어와 찾은 물건: 지금 공간의 결과(matches)와 다른 공간마다 찾은 수(elsewhere).
 * 검색어가 공백뿐이면 찾지 않는다(isSearching false). goToSpace는 그 공간으로 바꾼다(검색어는 그대로).
 */
export function useSearch() {
  const query = useAppStore((state) => state.ui.searchQuery);
  const setQuery = useAppStore((state) => state.setSearchQuery);
  const spaces = useAppStore((state) => state.data.spaces);
  const currentId = useAppStore((state) => state.data.currentSpaceId);
  const goToSpace = useAppStore((state) => state.switchSpace);
  const found = useMemo(() => {
    const all = matchItems(spaces, query);
    const elsewhere = countBySpace(all.filter((match) => match.space.id !== currentId));
    return { matches: all.filter((match) => match.space.id === currentId), elsewhere };
  }, [spaces, currentId, query]);
  return { query, setQuery, isSearching: query.trim() !== "", ...found, goToSpace };
}
