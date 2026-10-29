import { RoomNamePopover } from "@/features/spaces";
import { useAppStore } from "@/store/useAppStore";
import type { ViewBox } from "../logic/fitViewBox";

type PlanRoomPopoverProps = {
  box: ViewBox; // 지금 2D 평면도가 보여주는 범위 (cm → 화면 px)
  onClose: () => void;
};

/** 이름 없는 구획을 누른 자리에 새 구역 이름 입력칸을 띄운다. 줌·이동하면 그 자리를 따라간다. */
export function PlanRoomPopover({ box, onClose }: PlanRoomPopoverProps) {
  const focus = useAppStore((state) => state.ui.roomFocus);
  if (focus?.type !== "new") return null;
  const { at } = focus;
  return (
    <RoomNamePopover
      key={`${at.x},${at.y}`}
      at={at}
      screen={{ x: (at.x - box.x) / box.cmPerPx, y: (at.y - box.y) / box.cmPerPx }}
      viewport={{ width: box.width / box.cmPerPx, height: box.height / box.cmPerPx }}
      onClose={onClose}
    />
  );
}
