import { Check, Plus } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { Space } from "@/shared/types";
import { Button } from "@/shared/ui";
import { spaceSummary } from "../logic/spaceSummary";
import styles from "./SpaceList.module.css";

const ICON_SIZE = 18;

type SpaceListProps = {
  id: string; // 알약 버튼의 aria-controls
  spaces: readonly Space[];
  currentId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

/**
 * 공간 전환 목록 (시안 01): 공간마다 이름과 "바닥 크기 · 가구 · 물건", 지금 공간은 강조 바탕 + 체크.
 * 맨 아래 점선 "+ 새 공간 만들기". 열리면 지금 공간에 초점을 둔다.
 */
export function SpaceList({ id, spaces, currentId, onSelect, onCreate }: SpaceListProps) {
  const headingId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    listRef.current?.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus();
  }, []);

  return (
    <section id={id} className={styles.list} aria-labelledby={headingId}>
      <span id={headingId} className={styles.heading}>
        공간 바꾸기
      </span>
      <ul ref={listRef} className={styles.items}>
        {spaces.map((space) => (
          <li key={space.id}>
            <SpaceItem space={space} isCurrent={space.id === currentId} onSelect={onSelect} />
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
    </section>
  );
}

type SpaceItemProps = { space: Space; isCurrent: boolean; onSelect: (id: string) => void };

/** 목록의 공간 한 줄. 누르면 그 공간을 고른다. */
function SpaceItem({ space, isCurrent, onSelect }: SpaceItemProps) {
  return (
    <button
      type="button"
      className={styles.item}
      aria-current={isCurrent ? "true" : undefined}
      onClick={() => onSelect(space.id)}
    >
      {/* TODO(T27-4): 공간 썸네일 */}
      <span className={styles.texts}>
        <span className={styles.name}>{space.name}</span>
        <span className={styles.summary}>{spaceSummary(space)}</span>
      </span>
      {isCurrent && <Check className={styles.check} size={ICON_SIZE} aria-hidden="true" />}
    </button>
  );
}
