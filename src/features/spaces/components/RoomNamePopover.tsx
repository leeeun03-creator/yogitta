import type { Point } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { useRoomNameForm } from "../hooks/useRoomNameForm";
import { popoverPlacement } from "../logic/popoverPlacement";
import { RoomForm } from "./RoomForm";
import styles from "./RoomList.module.css";

type RoomNamePopoverProps = {
  at: Point; // 누른 자리 (cm) = 새 구역 기준점
  screen: Point; // 누른 자리의 화면 위치 (px, 2D 평면도 영역 왼쪽 위 기준)
  viewport: { width: number; height: number }; // 2D 평면도 영역 크기 (px)
  onClose: () => void; // 닫힌 뒤 (초점을 2D 평면도로 돌린다)
};

/** 이름 없는 구획을 누르면 그 자리에 뜨는 새 구역 이름 입력칸. 이름을 정하면 그 구획이 구역이 된다. */
export function RoomNamePopover({ at, screen, viewport, onClose }: RoomNamePopoverProps) {
  const addRoom = useAppStore((state) => state.addRoom);
  const setRoomFocus = useAppStore((state) => state.setRoomFocus);
  const close = () => {
    setRoomFocus(null);
    onClose();
  };
  const form = useRoomNameForm("", (name) => addRoom(name, at), close);
  const place = popoverPlacement(screen, viewport);

  return (
    <div className={styles.popover} style={{ left: place.x, top: place.y }}>
      <RoomForm
        label="새 구역 이름"
        value={form.value}
        error={form.error}
        onChange={form.change}
        onSubmit={form.submit}
        onCancel={close}
      />
    </div>
  );
}
