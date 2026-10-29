import { createId } from "@/shared/lib/createId";
import type { Floor } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";

/** 새 공간을 만드는 함수(만들면 store가 편집 모드로 연다)와, 이름 중복 검사에 쓸 기존 공간 이름을 준다. */
export function useCreateSpace() {
  const spaces = useAppStore((state) => state.data.spaces);
  const addSpace = useAppStore((state) => state.addSpace);

  const existingNames = spaces.map((space) => space.name);
  const createSpace = (name: string, floor: Floor): boolean => {
    return addSpace({ id: createId("space"), name, floor }).ok;
  };

  return { existingNames, createSpace };
}
