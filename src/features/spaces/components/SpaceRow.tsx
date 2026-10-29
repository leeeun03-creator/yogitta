import { Check, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Fragment, useEffect, useRef, type Ref } from "react";
import type { Space } from "@/shared/types";
import { Button, IconButton } from "@/shared/ui";
import type { SpaceNameError } from "@/store/useAppStore";
import type { SpaceEditMode } from "../hooks/useSpaceEditing";
import { spaceSummaryParts } from "../logic/spaceSummaryParts";
import styles from "./SpaceList.module.css";
import { SpaceRenameForm } from "./SpaceRenameForm";
import { SpaceThumbnail } from "./SpaceThumbnail";

const ICON_SIZE = 18;

/** 공간 줄에서 부르는 일들. */
export type SpaceRowActions = {
  onSelect: (id: string) => void;
  onToggle: (id: string) => void; // "⋯" 열기·닫기
  onRename: (id: string) => void; // 이름 입력칸 열기
  onSave: (id: string, name: string) => SpaceNameError | null;
  onCancel: () => void; // 이름 입력칸 닫기
  onRemove: (space: Space) => void; // 삭제 확인 열기
};

type SpaceRowProps = {
  space: Space;
  isCurrent: boolean;
  mode: SpaceEditMode | null;
  actions: SpaceRowActions;
};

/**
 * 공간 전환 목록의 공간 한 줄: 누르면 그 공간을 고르는 버튼(썸네일·이름·한 줄 설명) + "⋯"(이름 바꾸기·삭제).
 * 이름 바꾸기 중에는 줄이 입력칸이 되고, 끝나면 공간 버튼에 초점을 돌린다.
 */
export function SpaceRow({ space, isCurrent, mode, actions }: SpaceRowProps) {
  const itemRef = useRef<HTMLButtonElement>(null);
  const wasRenaming = useRef(false);
  useEffect(() => {
    if (wasRenaming.current && mode !== "rename") itemRef.current?.focus();
    wasRenaming.current = mode === "rename";
  }, [mode]);

  if (mode === "rename") {
    return (
      <div className={styles.rename}>
        <SpaceRenameForm
          space={space}
          onSave={(name) => actions.onSave(space.id, name)}
          onCancel={actions.onCancel}
        />
      </div>
    );
  }
  return (
    <>
      <div className={styles.line} data-current={isCurrent}>
        <SpaceButton
          ref={itemRef}
          space={space}
          isCurrent={isCurrent}
          onClick={() => actions.onSelect(space.id)}
        />
        <IconButton
          label={`${space.name} 이름 바꾸기·삭제`}
          icon={<MoreHorizontal size={ICON_SIZE} />}
          aria-expanded={mode === "actions"}
          onClick={() => actions.onToggle(space.id)}
        />
      </div>
      {mode === "actions" && <RowButtons space={space} actions={actions} />}
    </>
  );
}

type SpaceButtonProps = {
  space: Space;
  isCurrent: boolean;
  onClick: () => void;
  ref: Ref<HTMLButtonElement>;
};

/** 누르면 그 공간을 고르는 버튼: 썸네일 · 이름 · 한 줄 설명 (지금 공간은 체크). */
function SpaceButton({ space, isCurrent, onClick, ref }: SpaceButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      className={styles.item}
      data-space={space.id}
      aria-current={isCurrent ? "true" : undefined}
      onClick={onClick}
    >
      <SpaceThumbnail space={space} />
      <span className={styles.texts}>
        <span className={styles.name}>{space.name}</span>
        <SummaryLine space={space} />
      </span>
      {isCurrent && <Check className={styles.check} size={ICON_SIZE} aria-hidden="true" />}
    </button>
  );
}

/** 공간 한 줄 설명 "6.0 × 4.5 m · 가구 0 · 물건 0". 좁으면 조각 사이에서만 줄을 바꾼다 ("물건 / 0"처럼 끊기지 않게). */
function SummaryLine({ space }: { space: Space }) {
  return (
    <span className={styles.summary}>
      {spaceSummaryParts(space).map((part, index) => (
        <Fragment key={part}>
          {index > 0 && " · "}
          <span className={styles.part}>{part}</span>
        </Fragment>
      ))}
    </span>
  );
}

/** "⋯"를 누르면 줄 아래에 나오는 [이름 바꾸기] [삭제]. */
function RowButtons({ space, actions }: { space: Space; actions: SpaceRowActions }) {
  return (
    <div className={styles.rowButtons}>
      <Button
        icon={<Pencil size={ICON_SIZE} aria-hidden="true" />}
        onClick={() => actions.onRename(space.id)}
      >
        이름 바꾸기
      </Button>
      <Button
        variant="danger"
        icon={<Trash2 size={ICON_SIZE} aria-hidden="true" />}
        onClick={() => actions.onRemove(space)}
      >
        삭제
      </Button>
    </div>
  );
}
