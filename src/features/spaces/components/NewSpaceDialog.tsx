import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { IconButton } from "@/shared/ui";
import { FloorSizeCard } from "./FloorSizeCard";
import styles from "./NewSpaceDialog.module.css";

const ICON_SIZE = 20;

type NewSpaceDialogProps = { isOpen: boolean; onClose: () => void };

/**
 * 공간 전환 목록의 "+ 새 공간 만들기"로 여는 대화상자. 첫 실행 화면과 같은 바닥 크기 카드를 띄우고,
 * 만들면 store가 새 공간의 편집 모드를 연다. Esc·닫기·바깥 누르기로 취소한다. 열 때마다 카드를 새로 만든다.
 */
export function NewSpaceDialog({ isOpen, onClose }: NewSpaceDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) dialog.showModal();
  }, [isOpen]);
  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="floor-size-title"
      onClose={onClose}
      // 대화상자 바깥(뒤 배경)을 누르면 대상이 dialog 자신이다
      onClick={(event) => event.target === event.currentTarget && close()}
    >
      {isOpen && (
        <div className={styles.body}>
          <FloorSizeCard />
          <IconButton
            className={styles.close}
            label="닫기"
            icon={<X size={ICON_SIZE} />}
            onClick={close}
          />
        </div>
      )}
    </dialog>
  );
}
