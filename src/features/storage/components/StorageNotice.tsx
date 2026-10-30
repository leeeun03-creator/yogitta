import { X } from "lucide-react";
import { IconButton } from "@/shared/ui";
import { useStorageStatus, type StorageNoticeKind } from "../hooks/useStorageStatus";
import styles from "./StorageNotice.module.css";

const CLOSE_ICON_SIZE = 18;

const MESSAGES: Record<StorageNoticeKind, string> = {
  broken: "저장된 데이터를 읽지 못해 샘플 공간으로 시작했어요. 원래 데이터는 따로 남겨 뒀어요.",
  saveFailed:
    "저장하지 못했어요. 브라우저 저장 공간이 꽉 찼거나 막혀 있어요. 이 창을 닫으면 바뀐 내용이 사라질 수 있어요.",
};

/** 저장 안내 (깨진 저장 값으로 시작함·저장 실패). 화면 아래에 뜨고 [닫기]로 닫는다. 앱은 그대로 쓸 수 있다. */
export function StorageNotice() {
  const notice = useStorageStatus((state) => state.notice);
  const dismiss = useStorageStatus((state) => state.dismiss);
  return (
    <div className={styles.area} role="status">
      {notice && (
        <div className={styles.notice}>
          <p className={styles.message}>{MESSAGES[notice]}</p>
          <IconButton
            label="안내 닫기"
            icon={<X size={CLOSE_ICON_SIZE} aria-hidden="true" />}
            onClick={dismiss}
          />
        </div>
      )}
    </div>
  );
}
