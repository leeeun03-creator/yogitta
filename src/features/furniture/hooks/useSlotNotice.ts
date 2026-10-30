import { useState } from "react";
import { NO_SLOT_LABEL } from "@/shared/constants/item";
import type { AppData } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";

type Notice = { boxId: string; count: number; data: AppData };

/**
 * 칸 수를 줄이거나 칸이 적은 종류로 바꿔 칸 없음으로 옮긴 물건 알림 (PRD 인수 조건 "칸 수 감소").
 * 그 변경 바로 뒤 데이터에서 그 가구를 보고 있을 때만 보이므로, 다른 가구를 고르거나 되돌리기·다른 변경을 하면 사라진다.
 */
export function useSlotNotice(boxId: string) {
  const data = useAppStore((state) => state.data);
  const [notice, setNotice] = useState<Notice | null>(null);
  const isShown = notice !== null && notice.boxId === boxId && notice.data === data;
  return {
    text: isShown ? `물건 ${notice.count}개를 ${NO_SLOT_LABEL}으로 옮겼어요` : "",
    report: (count: number) => {
      // 이 렌더의 data는 바꾸기 전이라, 액션이 끝난 직후의 데이터에 묶는다
      setNotice(count > 0 ? { boxId, count, data: useAppStore.getState().data } : null);
    },
  };
}
