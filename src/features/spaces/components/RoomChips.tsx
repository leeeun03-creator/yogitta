import styles from "./RoomList.module.css";

type RoomChipsProps = {
  rooms: string[];
  selected?: string; // 고른 구역 (강조색)
  labelId: string; // 목록 이름이 되는 "구역" 라벨
  onSelect: (room: string) => void;
};

/** 구역 칩 목록. 칩은 누르면 그 구역을 고르는 버튼이다. 구역이 없으면 목록도 없다. */
export function RoomChips({ rooms, selected, labelId, onSelect }: RoomChipsProps) {
  if (rooms.length === 0) return null;
  return (
    <ul className={styles.chips} aria-labelledby={labelId}>
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
