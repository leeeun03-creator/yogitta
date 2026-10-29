import { useEffect, useId, useRef } from "react";
import { useRoomForm } from "../hooks/useRoomForm";
import { RoomForm } from "./RoomForm";
import styles from "./RoomList.module.css";

type RoomListProps = { rooms: string[] };

/** 2D 평면도 아래 줄 왼쪽의 구역 칩 목록. 칩을 눌러 이름 바꾸기·삭제, "+ 구역 추가"로 더한다 (시안 04). */
export function RoomList({ rooms }: RoomListProps) {
  const labelId = useId();
  const form = useRoomForm(rooms);
  const listRef = useRef<HTMLDivElement>(null);
  const selected = form.mode?.type === "rename" ? form.mode.room : undefined;

  // 입력칸을 닫으면 초점을 칩이나 "+ 구역 추가"로 돌려 키보드로 이어서 할 수 있게 한다
  useEffect(() => {
    const room = form.focusTarget?.room;
    if (!form.focusTarget) return;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-room]");
    const chip = [...(buttons ?? [])].find((button) => button.dataset.room === room);
    const add = listRef.current?.querySelector<HTMLButtonElement>("button[data-add]");
    (chip ?? add)?.focus();
  }, [form.focusTarget]);

  const select = (room: string) =>
    room === selected ? form.cancel() : form.open({ type: "rename", room });

  return (
    <div ref={listRef} className={styles.list}>
      <span id={labelId} className={styles.label}>
        구역
      </span>
      <div className={styles.items}>
        {rooms.length > 0 && (
          <ul className={styles.chips} aria-labelledby={labelId}>
            {rooms.map((room) => (
              <li key={room}>
                <button
                  type="button"
                  className={styles.chip}
                  data-room={room}
                  aria-pressed={room === selected}
                  onClick={() => select(room)}
                >
                  {room}
                </button>
              </li>
            ))}
          </ul>
        )}
        {form.mode ? (
          <RoomForm
            key={selected ?? "add"}
            label={selected ? "구역 이름" : "새 구역 이름"}
            value={form.value}
            error={form.error}
            onChange={form.change}
            onSubmit={form.submit}
            onCancel={form.cancel}
            onRemove={selected ? form.remove : undefined}
          />
        ) : (
          <button
            type="button"
            className={styles.add}
            data-add
            onClick={() => form.open({ type: "add" })}
          >
            + 구역 추가
          </button>
        )}
      </div>
    </div>
  );
}
