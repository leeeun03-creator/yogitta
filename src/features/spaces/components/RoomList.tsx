import { useId, useRef } from "react";
import { useRoomFocus } from "../hooks/useRoomFocus";
import { useRoomForm } from "../hooks/useRoomForm";
import { RoomChips } from "./RoomChips";
import { RoomForm } from "./RoomForm";
import styles from "./RoomList.module.css";

type RoomListProps = { rooms: string[] };

/** 2D 평면도 아래 줄 왼쪽의 구역 칩 목록. 칩을 눌러 이름 바꾸기·삭제, "+ 구역 추가"로 더한다 (시안 04). */
export function RoomList({ rooms }: RoomListProps) {
  const labelId = useId();
  const form = useRoomForm(rooms);
  const listRef = useRef<HTMLDivElement>(null);
  useRoomFocus(listRef, form.focusTarget);
  const { selected } = form;

  return (
    <div ref={listRef} className={styles.list}>
      <span id={labelId} className={styles.label}>
        구역
      </span>
      <div className={styles.items}>
        <RoomChips rooms={rooms} selected={selected} labelId={labelId} onSelect={form.toggle} />
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
