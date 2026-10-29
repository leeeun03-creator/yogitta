import { useState } from "react";
import type { RoomResult } from "@/store/useAppStore";
import { roomNameMessage } from "../logic/roomNameMessage";

/**
 * 구역 이름 입력칸의 글자와 안내 문구. 확인하면 save를 부르고, 막히면 까닭을 안내 문구로 보인다.
 * 글자를 고치면 안내 문구를 지운다 (다시 확인할 때 검사).
 */
export function useRoomNameForm(
  initial: string,
  save: (name: string) => RoomResult,
  onSaved: (name: string) => void,
) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string>();
  const change = (next: string) => {
    setValue(next);
    setError(undefined);
  };
  const submit = () => {
    const result = save(value);
    if (result.ok) onSaved(value.trim());
    else setError(roomNameMessage(result.reason));
  };
  return { value, error, change, submit };
}
