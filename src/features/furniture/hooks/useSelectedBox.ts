import { useMemo } from "react";
import { boxRooms } from "@/features/spaces";
import type { Box, Floor } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";

/** 고른 가구, 바닥, 가구가 놓인 구역(없으면 null). */
export type SelectedBox = { box: Box; floor: Floor; room: string | null };

/**
 * 현재 공간에서 고른 가구와 그 바닥·구역. 고른 가구가 없으면 null.
 * 구역은 구획 계산이 바닥 격자를 모두 훑어서, 현재 공간이 바뀔 때만 다시 계산한다.
 */
export function useSelectedBox(): SelectedBox | null {
  const space = useAppStore((state) =>
    state.data.spaces.find((candidate) => candidate.id === state.data.currentSpaceId),
  );
  const selectedId = useAppStore((state) => state.ui.selectedBoxId);
  const rooms = useMemo(() => (space ? boxRooms(space) : null), [space]);
  const box = space?.boxes.find((candidate) => candidate.id === selectedId);
  if (!space || !box) return null;
  return { box, floor: space.floor, room: rooms?.get(box.id) ?? null };
}
