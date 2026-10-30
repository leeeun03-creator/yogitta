import type { AppData, Box, Floor } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";

const currentSpace = (data: AppData) =>
  data.spaces.find((space) => space.id === data.currentSpaceId);

/**
 * 현재 공간에서 고른 가구와 바닥. 고른 가구가 없으면 null.
 * store에 있는 객체를 그대로 골라 와서(새 객체를 만들지 않아) 바뀔 때만 다시 그린다.
 */
export function useSelectedBox(): { box: Box; floor: Floor } | null {
  const box = useAppStore((state) =>
    currentSpace(state.data)?.boxes.find((candidate) => candidate.id === state.ui.selectedBoxId),
  );
  const floor = useAppStore((state) => currentSpace(state.data)?.floor);
  return box && floor ? { box, floor } : null;
}
