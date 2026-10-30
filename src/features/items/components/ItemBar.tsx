import { NotebookPen } from "lucide-react";
import { NO_SLOT_LABEL } from "@/shared/constants/item";
import { slotLabels } from "@/shared/lib/slotLabels";
import type { Box, Item } from "@/shared/types";
import { Button } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import styles from "./ItemForms.module.css";

const MEMO_ICON_SIZE = 16;

type ItemBarProps = { box: Box; item: Item; onEdit: () => void; onClose: () => void };

/** 누른 물건 칩의 자세한 내용: 이름·칸·메모와 [닫기]·[고치기]·[빼기]. 빼면 닫힌다. */
export function ItemBar({ box, item, onEdit, onClose }: ItemBarProps) {
  const removeItem = useAppStore((state) => state.removeItem);
  const slot =
    item.slot === undefined ? NO_SLOT_LABEL : (slotLabels(box)[item.slot] ?? NO_SLOT_LABEL);
  return (
    <section className={styles.itemBar} aria-label={`${item.name} 물건`}>
      <p className={styles.itemName}>
        {item.name} <span className={styles.itemSlot}>· {slot}</span>
      </p>
      {item.memo && (
        <p className={styles.memo}>
          <NotebookPen size={MEMO_ICON_SIZE} aria-hidden="true" />
          {item.memo}
        </p>
      )}
      <div className={styles.formActions}>
        <Button onClick={onClose}>닫기</Button>
        <Button onClick={onEdit}>고치기</Button>
        <Button
          variant="danger"
          onClick={() => {
            removeItem(box.id, item.id);
            onClose();
          }}
        >
          빼기
        </Button>
      </div>
    </section>
  );
}
