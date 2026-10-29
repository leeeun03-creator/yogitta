import { useAppStore } from "@/store/useAppStore";
import { useRoomNameForm } from "../hooks/useRoomNameForm";
import { RoomForm } from "./RoomForm";

type RenameRoomFormProps = {
  room: string;
  onClose: (room?: string) => void; // 닫은 뒤 초점을 둘 구역 칩 (지웠으면 없음)
};

/** 하단에서 고른 구역의 이름 바꾸기·삭제 입력칸. */
export function RenameRoomForm({ room, onClose }: RenameRoomFormProps) {
  const renameRoom = useAppStore((state) => state.renameRoom);
  const removeRoom = useAppStore((state) => state.removeRoom);
  const form = useRoomNameForm(room, (name) => renameRoom(room, name), onClose);
  const remove = () => {
    removeRoom(room);
    onClose();
  };
  return (
    <RoomForm
      label="구역 이름"
      value={form.value}
      error={form.error}
      onChange={form.change}
      onSubmit={form.submit}
      onCancel={() => onClose(room)}
      onRemove={remove}
    />
  );
}
