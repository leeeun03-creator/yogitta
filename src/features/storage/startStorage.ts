import { STORAGE_KEY } from "@/shared/constants/storage";
import { useAppStore } from "@/store/useAppStore";
import { readSavedData } from "./logic/readSavedData";

/** localStorage에서 읽는다. 막혀 있으면(사생활 보호 모드 등) 없는 것으로 본다. */
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn("저장된 데이터를 읽지 못했다", error);
    return null;
  }
}

/** localStorage에 쓴다. 실패하면(용량 초과·막힘) false. */
function writeStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn("데이터를 저장하지 못했다", error);
    return false;
  }
}

/**
 * 앱을 그리기 전에 부른다(첫 화면이 깜빡이지 않게). 저장된 데이터가 있으면 불러오고, 그 뒤로 데이터가 바뀔 때마다
 * 저장한다(PRD F14 자동 저장). 되돌리기 기록·화면 상태(모드·고른 가구)는 저장하지 않는다. 저장 그만두기를 돌려준다.
 */
export function startStorage(): () => void {
  const saved = readSavedData(readStorage(STORAGE_KEY));
  if (saved.kind === "ok") useAppStore.getState().loadData(saved.data);
  return useAppStore.subscribe((state, previous) => {
    if (state.data !== previous.data) writeStorage(STORAGE_KEY, JSON.stringify(state.data));
  });
}
