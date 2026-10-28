import { Redo2, Undo2 } from "lucide-react";
import { IconButton } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import styles from "./HistoryButtons.module.css";

const ICON_SIZE = 20;

/** 상단 바의 되돌리기·다시하기 버튼 (시안 04). 기록이 없는 쪽은 막힌다. */
export function HistoryButtons() {
  const canUndo = useAppStore((state) => state.history.past.length > 0);
  const canRedo = useAppStore((state) => state.history.future.length > 0);
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);

  return (
    <div role="group" aria-label="되돌리기·다시하기" className={styles.group}>
      <IconButton
        label="되돌리기"
        icon={<Undo2 size={ICON_SIZE} />}
        disabled={!canUndo}
        onClick={undo}
      />
      <IconButton
        label="다시하기"
        icon={<Redo2 size={ICON_SIZE} />}
        disabled={!canRedo}
        onClick={redo}
      />
    </div>
  );
}
