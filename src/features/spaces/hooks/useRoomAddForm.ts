import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { roomNameMessage } from "../logic/roomNameMessage";

/** "+ 구역 추가" 입력칸의 열림·글자·안내 문구. 더하기는 store 액션으로만 한다. */
export function useRoomAddForm() {
  const addRoom = useAppStore((state) => state.addRoom);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();

  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    setValue("");
    setError(undefined);
  };
  // 글자를 고치면 안내 문구를 지운다 (다시 확인할 때 검사)
  const change = (next: string) => {
    setValue(next);
    setError(undefined);
  };
  const submit = () => {
    const result = addRoom(value);
    if (result.ok) close();
    else setError(roomNameMessage(result.reason));
  };

  return { isOpen, value, error, open, close, change, submit };
}
