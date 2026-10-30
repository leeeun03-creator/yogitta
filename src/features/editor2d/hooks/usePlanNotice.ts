import { useEffect, useState } from "react";
import { PLAN_NOTICE_MS } from "@/shared/constants/floorPlan";

type Notice = { text: string; key: number }; // key: 같은 안내를 또 띄우면 시간을 처음부터 다시 센다

/** 2D 평면도에 잠깐(PLAN_NOTICE_MS) 떴다가 사라지는 안내. 예) 겹치는 자리에 가구를 놓거나 벽을 그으려 할 때. */
export function usePlanNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), PLAN_NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const show = (text: string) => setNotice((previous) => ({ text, key: (previous?.key ?? 0) + 1 }));
  return { text: notice?.text ?? null, show };
}
