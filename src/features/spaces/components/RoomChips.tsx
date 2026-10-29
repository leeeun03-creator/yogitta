import { useEffect, useRef } from "react";
import styles from "./RoomList.module.css";

type RoomChipsProps = {
  rooms: string[];
  selected?: string; // 고른 구역 (강조색)
  labelId: string; // 목록 이름이 되는 "구역" 라벨
  onSelect: (room: string) => void;
};

/**
 * 구역 칩 목록. 칩은 누르면 그 구역을 고르는 버튼이다. 구역이 없으면 목록도 없다.
 * 칩이 많으면 두 줄만 보이므로, 2D 평면도에서 구역을 눌러 고르면 그 칩이 보이게 넘긴다.
 */
export function RoomChips({ rooms, selected, labelId, onSelect }: RoomChipsProps) {
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const chip = listRef.current?.querySelector('[aria-pressed="true"]');
    chip?.scrollIntoView({ block: "nearest" });
  }, [selected]);
  if (rooms.length === 0) return null;
  return (
    <ul ref={listRef} className={styles.chips} aria-labelledby={labelId}>
      {rooms.map((room) => (
        <li key={room}>
          <button
            type="button"
            className={styles.chip}
            data-room={room}
            aria-pressed={room === selected}
            onClick={() => onSelect(room)}
          >
            {room}
          </button>
        </li>
      ))}
    </ul>
  );
}
