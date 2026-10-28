import { createId } from "@/shared/lib/createId";
import type { Floor } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";

/** 새 공간을 만들고 편집 모드로 바꾸는 함수와, 이름 중복 검사에 쓸 기존 공간 이름을 준다. */
export function useCreateSpace() {
  const spaces = useAppStore((state) => state.data.spaces);
  const addSpace = useAppStore((state) => state.addSpace);
  const setMode = useAppStore((state) => state.setMode);

  const existingNames = spaces.map((space) => space.name);
  const createSpace = (name: string, floor: Floor): boolean => {
    const result = addSpace({ id: createId("space"), name, floor });
    if (result.ok) setMode("edit");
    return result.ok;
  };

  return { existingNames, createSpace };
}
