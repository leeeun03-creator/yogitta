import { useState } from "react";
import type { Item } from "@/shared/types";

/**
 * 가구 상세 패널에서 누른 물건과, 다른 가구로 옮긴 뒤 안내. 물건을 누르면 안내를 지우고,
 * 옮기면 그 물건이 이 가구에서 사라지므로 누른 물건을 풀고 안내를 남긴다.
 */
export function usePickedItem(items: readonly Item[]) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  return {
    pickedId,
    picked: items.find((item) => item.id === pickedId),
    notice,
    pick: (itemId: string) => {
      setPickedId(itemId);
      setNotice("");
    },
    close: () => setPickedId(null),
    moved: (message: string) => {
      setPickedId(null);
      setNotice(message);
    },
  };
}
