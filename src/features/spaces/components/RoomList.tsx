import { useId, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRoomFocus, type RoomFocusTarget } from "../hooks/useRoomFocus";
import { RenameRoomForm } from "./RenameRoomForm";
import { RoomChips } from "./RoomChips";
import styles from "./RoomList.module.css";

type RoomListProps = { rooms: string[] };

/**
 * 2D 평면도 아래 줄 왼쪽의 구역 칩 목록 (시안 04). 칩을 누르거나 2D 평면도에서 구역을 누르면 골라져
 * 이름 바꾸기·삭제 입력칸이 나온다. 구역은 2D 평면도에서 구획을 눌러 만든다.
 */
export function RoomList({ rooms }: RoomListProps) {
  const labelId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const focus = useAppStore((state) => state.ui.roomFocus);
  const setRoomFocus = useAppStore((state) => state.setRoomFocus);
  const [focusTarget, setFocusTarget] = useState<RoomFocusTarget>();
  useRoomFocus(listRef, focusTarget);
  // 되돌리기로 고른 구역이 없어지면 입력칸도 닫힌 것으로 본다
  const selected = focus?.type === "rename" && rooms.includes(focus.room) ? focus.room : undefined;
  const close = (room?: string) => {
    setRoomFocus(null);
    setFocusTarget({ room });
  };
  // 칩을 누르면 그 구역을 고르고, 고른 칩을 다시 누르면 닫는다
  const toggle = (room: string) =>
    room === selected ? close(room) : setRoomFocus({ type: "rename", room });

  return (
    <div ref={listRef} className={styles.list}>
      <span id={labelId} className={styles.label}>
        구역
      </span>
      <div className={styles.items}>
        <RoomChips rooms={rooms} selected={selected} labelId={labelId} onSelect={toggle} />
        {rooms.length === 0 && (
          <span className={styles.hint}>구역 선으로 나눈 바닥을 누르면 구역이 생겨요</span>
        )}
        {selected && <RenameRoomForm key={selected} room={selected} onClose={close} />}
      </div>
    </div>
  );
}
