import { useState } from "react";
import { useAppStore, type RoomResult } from "@/store/useAppStore";
import { roomNameMessage } from "../logic/roomNameMessage";

/** 구역 입력칸이 하는 일: 새 구역 더하기(add) 또는 고른 구역 이름 바꾸기(rename). */
export type RoomFormMode = { type: "add" } | { type: "rename"; room: string };
/**
 * 입력칸을 닫은 뒤 초점을 둘 곳: room이 있으면 그 구역 칩, 없으면 "+ 구역 추가".
 * 같은 곳이어도 매번 새 객체라 초점 옮기기가 다시 돈다.
 */
export type RoomFocusTarget = { room?: string };

/** 입력칸 글자와 안내 문구. 글자를 고치면 안내 문구를 지운다 (다시 확인할 때 검사). */
function useNameField() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();
  const reset = (next: string) => {
    setValue(next);
    setError(undefined);
  };
  const show = (result: RoomResult) => {
    if (!result.ok) setError(roomNameMessage(result.reason));
  };
  return { value, error, change: reset, reset, show };
}

/** 구역 입력칸의 열림·글자·안내 문구. 데이터 변경은 store 액션으로만 한다. */
export function useRoomForm(rooms: string[]) {
  const addRoom = useAppStore((state) => state.addRoom);
  const renameRoom = useAppStore((state) => state.renameRoom);
  const removeRoom = useAppStore((state) => state.removeRoom);
  const field = useNameField();
  const [mode, setMode] = useState<RoomFormMode | null>(null);
  const [focusTarget, setFocusTarget] = useState<RoomFocusTarget>();
  // 되돌리기로 고른 구역이 없어지면 입력칸도 닫힌 것으로 본다
  const active = mode?.type === "rename" && !rooms.includes(mode.room) ? null : mode;

  const open = (next: RoomFormMode) => {
    setMode(next);
    field.reset(next.type === "rename" ? next.room : "");
  };
  const close = (target: RoomFocusTarget) => {
    setMode(null);
    field.reset("");
    setFocusTarget(target);
  };
  const finish = (result: RoomResult, target: RoomFocusTarget) =>
    result.ok ? close(target) : field.show(result);
  const submit = () => {
    if (active?.type === "add") finish(addRoom(field.value), {});
    if (active?.type === "rename") {
      const to = field.value.trim();
      finish(renameRoom(active.room, to), { room: to });
    }
  };
  const cancel = () => close({ room: active?.type === "rename" ? active.room : undefined });
  const remove = () => {
    if (active?.type === "rename") removeRoom(active.room);
    close({});
  };
  // 칩을 누르면 그 구역을 고르고, 고른 칩을 다시 누르면 닫는다
  const selected = active?.type === "rename" ? active.room : undefined;
  const toggle = (room: string) => (room === selected ? cancel() : open({ type: "rename", room }));

  return { mode: active, selected, ...field, focusTarget, open, toggle, submit, cancel, remove };
}
