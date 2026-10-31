import type { AppData } from "@/shared/types";
import { backupFileName } from "./logic/backupFileName";

/** 전체 데이터를 백업 파일(JSON)로 내려받게 한다 (T17). 사람이 읽을 수 있게 들여 쓴다. */
export function saveBackupFile(data: AppData, now = new Date()) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = backupFileName(now);
  link.click();
  URL.revokeObjectURL(url);
}
