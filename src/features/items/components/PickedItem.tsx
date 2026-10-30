import { useState } from "react";
import type { Box, Item } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import type { ItemFields } from "../hooks/useItemForm";
import { movedMessage } from "../logic/movedMessage";
import { ItemBar } from "./ItemBar";
import { ItemForm } from "./ItemForm";

type PickedItemProps = {
  box: Box;
  boxes: readonly Box[]; // 같은 공간의 가구 (옮길 곳)
  item: Item;
  onClose: () => void;
  onMoved: (message: string) => void; // 다른 가구로 옮긴 뒤 안내
};

/**
 * 누른 물건: 자세한 내용(ItemBar)을 보이다가 [고치기]를 누르면 이름·가구·칸·메모가 채워진 고치기 입력으로 바뀐다.
 * 저장하거나 [취소]·Esc면 자세한 내용으로 돌아온다. 다른 가구로 옮기면 이 가구에서 사라지므로 onMoved로 알린다.
 */
export function PickedItem({ box, boxes, item, onClose, onMoved }: PickedItemProps) {
  const updateItem = useAppStore((state) => state.updateItem);
  const [isEditing, setIsEditing] = useState(false);
  if (!isEditing) {
    return <ItemBar box={box} item={item} onEdit={() => setIsEditing(true)} onClose={onClose} />;
  }
  const save = (fields: ItemFields) => {
    const target = boxes.find((candidate) => candidate.id === fields.boxId) ?? box;
    const result = updateItem(box.id, { ...fields, id: item.id }, target.id);
    if (result.ok && target !== box) onMoved(movedMessage(fields.name.trim(), target.name));
    return result;
  };
  return (
    <ItemForm
      box={box}
      kind="edit"
      initial={{ ...item, boxId: box.id }}
      save={save}
      onClose={() => setIsEditing(false)}
      boxes={boxes}
    />
  );
}
