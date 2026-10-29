import { Check, Trash2, X } from "lucide-react";
import { Button, IconButton } from "@/shared/ui";

type RoomFormActionsProps = {
  onCancel: () => void;
  onRemove?: () => void; // 있으면 삭제 버튼을 보인다 (이름 바꾸기 때)
};

/** 구역 이름 입력칸 옆 버튼들: 확인(제출)·취소·삭제. */
export function RoomFormActions({ onCancel, onRemove }: RoomFormActionsProps) {
  return (
    <>
      <IconButton type="submit" label="확인" icon={<Check size={20} strokeWidth={2} />} />
      <IconButton label="취소" icon={<X size={20} strokeWidth={2} />} onClick={onCancel} />
      {onRemove && (
        <Button variant="danger" icon={<Trash2 size={18} strokeWidth={2} />} onClick={onRemove}>
          삭제
        </Button>
      )}
    </>
  );
}
