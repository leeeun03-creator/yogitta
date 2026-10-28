import { Toggle } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";

/** 편집 모드 아래쪽의 격자 스냅 켬·끔. 끄면 끝점 스냅도 함께 꺼진다. */
export function SnapToggle() {
  const snap = useAppStore((state) => state.ui.snap);
  const setSnap = useAppStore((state) => state.setSnap);
  return <Toggle label="격자 스냅" checked={snap} onChange={setSnap} />;
}
