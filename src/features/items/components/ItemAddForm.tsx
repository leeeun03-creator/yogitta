import type { Box } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { ItemForm } from "./ItemForm";

/** 물건 넣기 입력. slot은 처음 골라 둘 칸(빈 칸의 [+ 추가]), 없으면 칸 없음이다. */
export function ItemAddForm({
  box,
  slot,
  onClose,
}: {
  box: Box;
  slot?: number;
  onClose: () => void;
}) {
  const addItem = useAppStore((state) => state.addItem);
  return (
    <ItemForm
      box={box}
      label="물건 넣기"
      submitLabel="넣기"
      initial={{ name: "", slot }}
      save={(fields) => addItem(box.id, fields)}
      onClose={onClose}
    />
  );
}
