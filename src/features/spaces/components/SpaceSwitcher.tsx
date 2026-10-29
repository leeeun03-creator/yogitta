import { ChevronDown, ChevronUp } from "lucide-react";
import { useId, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useSpaceListPopover } from "../hooks/useSpaceListPopover";
import { NewSpaceDialog } from "./NewSpaceDialog";
import { SpaceList } from "./SpaceList";
import styles from "./SpaceSwitcher.module.css";

const ICON_SIZE = 16;

/**
 * 메인 화면 머리의 공간 알약: "공간" 라벨 + 지금 공간 이름 + 화살표 (시안 01). 누르면 공간 전환 목록이 열리고,
 * 공간을 고르면 그 공간으로 바꾼다. 목록의 "+ 새 공간 만들기"는 새 공간 대화상자를 연다. 대화상자를 닫으면 초점을 알약으로 돌린다.
 */
export function SpaceSwitcher() {
  const spaces = useAppStore((state) => state.data.spaces);
  const currentId = useAppStore((state) => state.data.currentSpaceId);
  const switchSpace = useAppStore((state) => state.switchSpace);
  const { isOpen, rootRef, buttonRef, toggle, close, focusButton, handleKeyDown } =
    useSpaceListPopover();
  const [isCreating, setIsCreating] = useState(false);
  const listId = useId();
  const current = spaces.find((space) => space.id === currentId);
  if (!current) return null;

  const Arrow = isOpen ? ChevronUp : ChevronDown;
  return (
    <div ref={rootRef} className={styles.root} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.switcher}
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={toggle}
      >
        <span className={styles.label}>공간</span>
        <span className={styles.name}>{current.name}</span>
        <Arrow className={styles.arrow} size={ICON_SIZE} aria-hidden="true" />
      </button>
      {isOpen && (
        <SpaceList
          id={listId}
          spaces={spaces}
          currentId={current.id}
          onSelect={(id) => {
            switchSpace(id);
            close(true);
          }}
          onRemoved={() => close(true)}
          onCreate={() => {
            close(false);
            setIsCreating(true);
          }}
        />
      )}
      <NewSpaceDialog
        isOpen={isCreating}
        onClose={() => {
          setIsCreating(false);
          focusButton();
        }}
      />
    </div>
  );
}
