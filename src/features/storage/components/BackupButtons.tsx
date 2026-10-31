import { Download } from "lucide-react";
import { Button } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import { saveBackupFile } from "../saveBackupFile";
import styles from "./BackupButtons.module.css";

const ICON_SIZE = 16;

/** 백업 파일 버튼 (T17): [백업 파일 내보내기]는 전체 데이터를 JSON 파일로 내려받는다. */
export function BackupButtons() {
  const data = useAppStore((state) => state.data);
  return (
    <div className={styles.backup}>
      <Button
        icon={<Download size={ICON_SIZE} aria-hidden="true" />}
        onClick={() => saveBackupFile(data)}
      >
        백업 파일 내보내기
      </Button>
    </div>
  );
}
