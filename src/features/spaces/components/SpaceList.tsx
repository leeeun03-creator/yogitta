import { Plus } from "lucide-react";
import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { josa } from "@/shared/lib/josa";
import type { Space } from "@/shared/types";
import { Button, ConfirmDialog } from "@/shared/ui";
import { useSpaceEditing } from "../hooks/useSpaceEditing";
import { listFocusIndex } from "../logic/listFocusIndex";
import styles from "./SpaceList.module.css";
import { SpaceRow, type SpaceRowActions } from "./SpaceRow";

const ICON_SIZE = 18;

type SpaceListProps = {
  id: string; // 알약 버튼의 aria-controls
  spaces: readonly Space[];
  currentId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRemoved: () => void; // 공간을 지운 뒤 (목록을 닫는다)
};

/**
 * 공간 전환 목록 (시안 01): 공간마다 공간 썸네일·이름·"바닥 크기 · 가구 · 물건", 지금 공간은 강조 바탕 + 체크.
 * 줄마다 "⋯"로 이름 바꾸기·삭제(확인 후). 맨 아래 점선 "+ 새 공간 만들기".
 * 열리면 지금 공간에 초점을 두고, ↑↓·Home·End로 공간 사이를 옮긴다.
 */
export function SpaceList({
  id,
  spaces,
  currentId,
  onSelect,
  onCreate,
  onRemoved,
}: SpaceListProps) {
  const editing = useSpaceEditing(onRemoved);
  const actions: SpaceRowActions = {
    onSelect,
    onToggle: editing.toggleActions,
    onRename: editing.startRename,
    onSave: editing.rename,
    onCancel: editing.stopEditing,
    onRemove: editing.askRemove,
  };
  const headingId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    listRef.current?.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus();
  }, []);
  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("[data-space]")];
    const current = items.findIndex((item) => item === document.activeElement);
    const next = listFocusIndex(current, items.length, event.key);
    if (next === null) return;
    event.preventDefault(); // 목록·화면이 스크롤되지 않게
    items[next]?.focus();
  };

  return (
    <section id={id} className={styles.list} aria-labelledby={headingId}>
      <span id={headingId} className={styles.heading}>
        공간 바꾸기
      </span>
      <ul ref={listRef} className={styles.items} onKeyDown={handleKeyDown}>
        {spaces.map((space) => (
          <li key={space.id} className={styles.row}>
            <SpaceRow
              space={space}
              isCurrent={space.id === currentId}
              mode={editing.modeOf(space.id)}
              actions={actions}
            />
          </li>
        ))}
      </ul>
      <Button
        variant="add"
        className={styles.create}
        icon={<Plus size={ICON_SIZE} aria-hidden="true" />}
        onClick={onCreate}
      >
        새 공간 만들기
      </Button>
      {editing.removing && (
        <ConfirmDialog
          title={`'${editing.removing.name}'${josa(editing.removing.name, "을/를")} 지울까요?`}
          message="벽·가구·물건이 모두 사라지고 되돌릴 수 없어요."
          confirmLabel="지우기"
          onConfirm={editing.confirmRemove}
          onCancel={editing.cancelRemove}
        />
      )}
    </section>
  );
}
