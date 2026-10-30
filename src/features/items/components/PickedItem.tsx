import { useState } from "react";
import type { Box, Item } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { ItemBar } from "./ItemBar";
import { ItemForm } from "./ItemForm";

type PickedItemProps = { box: Box; item: Item; onClose: () => void };

/**
 * 누른 물건: 자세한 내용(ItemBar)을 보이다가 [고치기]를 누르면 이름·칸·메모가 채워진 고치기 입력으로 바뀐다.
 * 저장하거나 [취소]·Esc면 자세한 내용으로 돌아온다.
 */
export function PickedItem({ box, item, onClose }: PickedItemProps) {
  const updateItem = useAppStore((state) => state.updateItem);
  const [isEditing, setIsEditing] = useState(false);
  if (!isEditing) {
    return <ItemBar box={box} item={item} onEdit={() => setIsEditing(true)} onClose={onClose} />;
  }
  return (
    <ItemForm
      box={box}
      label="물건 고치기"
      submitLabel="저장"
      initial={item}
      save={(fields) => updateItem(box.id, { ...fields, id: item.id })}
      onClose={() => setIsEditing(false)}
    />
  );
}
