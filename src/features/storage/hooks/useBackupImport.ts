import { useState } from "react";
import type { AppData } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { readSavedData } from "../logic/readSavedData";

/**
 * 백업 파일 가져오기 (T17-2). choose는 고른 파일을 읽어, 저장 데이터 모양이면 바꿀지 묻게(pending) 하고
 * 깨졌으면 isBroken만 알린다(지금 데이터는 그대로). confirm은 백업 데이터로 바꾸고, cancel은 묻기를 닫는다.
 */
export function useBackupImport() {
  const loadData = useAppStore((state) => state.loadData);
  const [pending, setPending] = useState<AppData | null>(null);
  const [isBroken, setBroken] = useState(false);
  const choose = async (file: File) => {
    const saved = readSavedData(await file.text());
    setBroken(saved.kind !== "ok");
    setPending(saved.kind === "ok" ? saved.data : null);
  };
  const confirm = () => {
    if (pending) loadData(pending);
    setPending(null);
  };
  return { pending, isBroken, choose, confirm, cancel: () => setPending(null) };
}
