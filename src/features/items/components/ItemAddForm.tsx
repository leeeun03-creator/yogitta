import type { Box } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { ItemForm } from "./ItemForm";

type ItemAddFormProps = {
  box: Box; // 넣을 가구 (boxes가 있으면 처음 골라 둔 가구)
  slot?: number; // 처음 골라 둘 칸(빈 칸의 [+ 추가]), 없으면 칸 없음
  onClose: () => void;
  name?: string; // 처음 이름 (결과 없음 카드에서는 검색어)
  boxes?: readonly Box[]; // 주면 넣을 가구도 고른다 (둘 이상일 때 [가구] 고르기)
};

/** 물건 넣기 입력. 가구 상세 패널에서는 그 가구에, 결과 없음 카드에서는 고른 가구에 넣는다. */
export function ItemAddForm({ box, slot, onClose, name = "", boxes }: ItemAddFormProps) {
  const addItem = useAppStore((state) => state.addItem);
  return (
    <ItemForm
      box={box}
      kind="add"
      initial={{ name, slot, boxId: box.id }}
      save={(fields) => addItem(fields.boxId ?? box.id, fields)}
      onClose={onClose}
      boxes={boxes}
    />
  );
}
