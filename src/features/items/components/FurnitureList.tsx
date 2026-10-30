import type { Box } from "@/shared/types";
import styles from "./FurniturePanel.module.css";

type FurnitureListProps = { boxes: readonly Box[]; onChoose: (id: string) => void };

/** 가구 목록: 가구마다 이름·물건 수 버튼. 고르면 그 가구의 가구 상세 패널이 열린다 (3D에서 누르기는 T9). */
export function FurnitureList({ boxes, onChoose }: FurnitureListProps) {
  return (
    <>
      <h2 className={styles.title}>가구</h2>
      {boxes.length === 0 ? (
        <p className={styles.guide}>아직 가구가 없어요. [편집]에서 가구를 놓아 보세요</p>
      ) : (
        <ul className={styles.list}>
          {boxes.map((box) => (
            <li key={box.id}>
              <button type="button" className={styles.boxButton} onClick={() => onChoose(box.id)}>
                <span className={styles.boxName}>{box.name}</span>
                <span className={styles.count}>물건 {box.items.length}개</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
