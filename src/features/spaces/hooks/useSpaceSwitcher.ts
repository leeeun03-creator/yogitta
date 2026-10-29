import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useSpaceListPopover } from "./useSpaceListPopover";

/**
 * 공간 알약이 쓰는 상태와 일: 공간들·지금 공간, 공간 전환 목록 열기·닫기, 공간 고르기,
 * 새 공간 대화상자 열기·닫기 (닫으면 초점을 알약으로).
 */
export function useSpaceSwitcher() {
  const spaces = useAppStore((state) => state.data.spaces);
  const currentId = useAppStore((state) => state.data.currentSpaceId);
  const switchSpace = useAppStore((state) => state.switchSpace);
  const popover = useSpaceListPopover();
  const [isCreating, setIsCreating] = useState(false);
  const { close, focusButton } = popover;

  return {
    spaces,
    current: spaces.find((space) => space.id === currentId),
    popover,
    isCreating,
    select: (id: string) => {
      switchSpace(id);
      close(true);
    },
    startCreating: () => {
      close(false);
      setIsCreating(true);
    },
    stopCreating: () => {
      setIsCreating(false);
      focusButton();
    },
  };
}
