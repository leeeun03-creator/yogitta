import { useEffect, useId, useRef } from "react";
import { useRoomAddForm } from "../hooks/useRoomAddForm";
import { RoomAddForm } from "./RoomAddForm";
import styles from "./RoomList.module.css";

type RoomListProps = { rooms: string[] };

/** 2D 평면도 아래 줄 왼쪽의 구역 칩 목록과 "+ 구역 추가" (시안 04). */
export function RoomList({ rooms }: RoomListProps) {
  const labelId = useId();
  const form = useRoomAddForm();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // 입력칸을 닫으면 초점을 "+ 구역 추가"로 돌려 키보드로 이어서 더할 수 있게 한다
  useEffect(() => {
    if (wasOpen.current && !form.isOpen) addButtonRef.current?.focus();
    wasOpen.current = form.isOpen;
  }, [form.isOpen]);

  return (
    <div className={styles.list}>
      <span id={labelId} className={styles.label}>
        구역
      </span>
      <div className={styles.items}>
        {rooms.length > 0 && (
          <ul className={styles.chips} aria-labelledby={labelId}>
            {rooms.map((room) => (
              <li key={room} className={styles.chip}>
                {room}
              </li>
            ))}
          </ul>
        )}
        {form.isOpen ? (
          <RoomAddForm
            value={form.value}
            error={form.error}
            onChange={form.change}
            onSubmit={form.submit}
            onCancel={form.close}
          />
        ) : (
          <button ref={addButtonRef} type="button" className={styles.add} onClick={form.open}>
            + 구역 추가
          </button>
        )}
      </div>
    </div>
  );
}
