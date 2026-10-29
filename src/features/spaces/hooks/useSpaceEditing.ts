import { useState } from "react";
import type { Space } from "@/shared/types";
import { useAppStore, type SpaceNameError } from "@/store/useAppStore";

/** 공간 줄에서 하는 일: "⋯"로 연 버튼들(actions) 또는 이름 입력칸(rename). */
export type SpaceEditMode = "actions" | "rename";

/**
 * 공간 전환 목록의 이름 바꾸기·삭제 상태. 한 번에 한 줄만 고친다. 삭제는 확인 대화상자를 거쳐 지우고,
 * 지운 뒤 onRemoved(목록 닫기)를 부른다.
 */
export function useSpaceEditing(onRemoved: () => void) {
  const renameSpace = useAppStore((state) => state.renameSpace);
  const removeSpace = useAppStore((state) => state.removeSpace);
  const [editing, setEditing] = useState<{ id: string; mode: SpaceEditMode } | null>(null);
  const [removing, setRemoving] = useState<Space | null>(null);

  const modeOf = (id: string) => (editing?.id === id ? editing.mode : null);
  /** 이름을 바꾼다. 틀리면 그 까닭, 바꿨으면 null (입력칸을 닫는다). */
  const rename = (id: string, name: string): SpaceNameError | null => {
    const result = renameSpace(id, name);
    if (!result.ok) return result.reason;
    setEditing(null);
    return null;
  };
  const confirmRemove = () => {
    if (removing) removeSpace(removing.id);
    setRemoving(null);
    setEditing(null);
    onRemoved();
  };

  return {
    modeOf,
    toggleActions: (id: string) => setEditing(modeOf(id) ? null : { id, mode: "actions" }),
    startRename: (id: string) => setEditing({ id, mode: "rename" }),
    stopEditing: () => setEditing(null),
    rename,
    removing,
    askRemove: (space: Space) => setRemoving(space),
    cancelRemove: () => setRemoving(null),
    confirmRemove,
  };
}
