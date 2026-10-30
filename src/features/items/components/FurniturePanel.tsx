import type { KeyboardEvent } from "react";
import { useSelectedBox } from "@/features/furniture";
import type { Space } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { FurnitureDetail } from "./FurnitureDetail";
import { FurnitureList } from "./FurnitureList";
import styles from "./FurniturePanel.module.css";

/**
 * 메인 화면의 가구 상세 패널 (시안 01·02). 고른 가구가 없으면 가구 목록을, 있으면 그 가구의 칸별 물건을 보인다.
 * 닫기·Esc면 목록으로 돌아간다. 데스크톱은 3D 공간 오른쪽, 휴대폰은 3D 공간 아래에 둔다(3D 보기 버튼을 가리지 않게).
 */
export function FurniturePanel({ space }: { space: Space }) {
  const selection = useSelectedBox();
  const selectBox = useAppStore((state) => state.selectBox);
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && selection) selectBox(null);
  };
  return (
    <aside className={styles.panel} aria-label="가구 상세 패널" onKeyDown={handleKeyDown}>
      {selection ? (
        <FurnitureDetail
          key={selection.box.id} // 다른 가구를 고르면 입력·누른 물건을 비운다
          selection={selection}
          onClose={() => selectBox(null)}
        />
      ) : (
        <FurnitureList boxes={space.boxes} onChoose={selectBox} />
      )}
    </aside>
  );
}
