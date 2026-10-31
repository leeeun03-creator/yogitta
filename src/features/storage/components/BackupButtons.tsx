import { Download, Upload } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { Button, ConfirmDialog } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import { useBackupImport } from "../hooks/useBackupImport";
import { saveBackupFile } from "../saveBackupFile";
import styles from "./BackupButtons.module.css";

const ICON_SIZE = 16;

/**
 * 백업 파일 버튼 (T17): [백업 파일 내보내기]는 전체 데이터를 JSON 파일로 내려받고, [백업 파일 가져오기]는 고른 파일로
 * 바꿀지 물은 뒤 바꾼다. canExport가 아니면(공간 없음) 가져오기만 보인다.
 */
export function BackupButtons({ canExport = true }: { canExport?: boolean }) {
  const data = useAppStore((state) => state.data);
  return (
    <div className={styles.backup}>
      {canExport && (
        <Button
          icon={<Download size={ICON_SIZE} aria-hidden="true" />}
          onClick={() => saveBackupFile(data)}
        >
          백업 파일 내보내기
        </Button>
      )}
      <BackupImport currentCount={data.spaces.length} />
    </div>
  );
}

/** [백업 파일 가져오기]와 파일 고르기, 깨진 파일 안내, 바꿀지 묻기. 깨진 파일은 지금 데이터를 덮어쓰지 않는다. */
function BackupImport({ currentCount }: { currentCount: number }) {
  const backup = useBackupImport();
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // 같은 파일을 다시 골라도 읽게
    if (file) void backup.choose(file);
  };
  return (
    <>
      <Button
        icon={<Upload size={ICON_SIZE} aria-hidden="true" />}
        onClick={() => fileRef.current?.click()}
      >
        백업 파일 가져오기
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className={styles.file}
        aria-label="백업 파일 고르기"
        onChange={handleFile}
      />
      {backup.isBroken && (
        <p role="status" className={styles.error}>
          백업 파일을 읽지 못했어요. 지금 데이터는 그대로예요
        </p>
      )}
      {backup.pending && (
        <ConfirmDialog
          title="백업 파일로 바꿀까요?"
          message={`지금 공간 ${currentCount}개가 백업 파일의 공간 ${backup.pending.spaces.length}개로 바뀌어요`}
          confirmLabel="바꾸기"
          onConfirm={backup.confirm}
          onCancel={backup.cancel}
        />
      )}
    </>
  );
}
