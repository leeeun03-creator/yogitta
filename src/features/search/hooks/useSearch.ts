import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { matchItems } from "../logic/matchItems";

/** 메인 화면 검색어와 지금 공간에서 찾은 물건. 검색어가 공백뿐이면 찾지 않는다(isSearching false). */
export function useSearch() {
  const query = useAppStore((state) => state.ui.searchQuery);
  const setQuery = useAppStore((state) => state.setSearchQuery);
  const space = useAppStore((state) =>
    state.data.spaces.find((candidate) => candidate.id === state.data.currentSpaceId),
  );
  const matches = useMemo(() => (space ? matchItems([space], query) : []), [space, query]);
  return { query, setQuery, isSearching: query.trim() !== "", matches };
}
