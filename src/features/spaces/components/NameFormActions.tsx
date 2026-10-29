import { Check, Trash2, X } from "lucide-react";
import { Button, IconButton } from "@/shared/ui";

const ICON_SIZE = 20;
const REMOVE_ICON_SIZE = 18; // 글자 옆 아이콘이라 조금 작게

type NameFormActionsProps = {
  onCancel: () => void;
  onRemove?: () => void; // 있으면 삭제 버튼을 보인다 (구역 이름 바꾸기 때)
};

/** 이름 입력칸 옆 버튼들: 확인(제출)·취소·삭제. */
export function NameFormActions({ onCancel, onRemove }: NameFormActionsProps) {
  return (
    <>
      <IconButton type="submit" label="확인" icon={<Check size={ICON_SIZE} strokeWidth={2} />} />
      <IconButton label="취소" icon={<X size={ICON_SIZE} strokeWidth={2} />} onClick={onCancel} />
      {onRemove && (
        <Button
          variant="danger"
          icon={<Trash2 size={REMOVE_ICON_SIZE} strokeWidth={2} />}
          onClick={onRemove}
        >
          삭제
        </Button>
      )}
    </>
  );
}
