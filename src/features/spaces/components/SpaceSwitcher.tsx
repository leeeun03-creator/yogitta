import { ChevronDown, ChevronUp } from "lucide-react";
import { useId, type Ref } from "react";
import { useSpaceSwitcher } from "../hooks/useSpaceSwitcher";
import { NewSpaceDialog } from "./NewSpaceDialog";
import { SpaceList } from "./SpaceList";
import styles from "./SpaceSwitcher.module.css";

const ICON_SIZE = 16;

/**
 * 메인 화면 머리의 공간 알약: "공간" 라벨 + 지금 공간 이름 + 화살표 (시안 01). 누르면 공간 전환 목록이 열리고,
 * 공간을 고르면 그 공간으로 바꾼다. 목록의 "+ 새 공간 만들기"는 새 공간 대화상자를 연다. 대화상자를 닫으면 초점을 알약으로 돌린다.
 */
export function SpaceSwitcher() {
  const { spaces, current, popover, isCreating, select, startCreating, stopCreating } =
    useSpaceSwitcher();
  const { isOpen, rootRef, buttonRef, toggle, close, handleKeyDown } = popover;
  const listId = useId();
  if (!current) return null;

  return (
    <div ref={rootRef} className={styles.root} onKeyDown={handleKeyDown}>
      <SpacePill
        ref={buttonRef}
        name={current.name}
        isOpen={isOpen}
        listId={listId}
        onClick={toggle}
      />
      {isOpen && (
        <SpaceList
          id={listId}
          spaces={spaces}
          currentId={current.id}
          onSelect={select}
          onRemoved={() => close(true)}
          onCreate={startCreating}
        />
      )}
      <NewSpaceDialog isOpen={isCreating} onClose={stopCreating} />
    </div>
  );
}

type SpacePillProps = {
  name: string;
  isOpen: boolean;
  listId: string; // 여닫는 공간 전환 목록
  onClick: () => void;
  ref: Ref<HTMLButtonElement>;
};

/** 공간 알약 버튼 (휴대폰에서는 "공간" 글자를 화면에서 숨긴다). */
function SpacePill({ name, isOpen, listId, onClick, ref }: SpacePillProps) {
  const Arrow = isOpen ? ChevronUp : ChevronDown;
  return (
    <button
      ref={ref}
      type="button"
      className={styles.switcher}
      aria-expanded={isOpen}
      aria-controls={listId}
      onClick={onClick}
    >
      <span className={styles.label}>공간</span>
      <span className={styles.name}>{name}</span>
      <Arrow className={styles.arrow} size={ICON_SIZE} aria-hidden="true" />
    </button>
  );
}
