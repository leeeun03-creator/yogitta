import { useAppStore } from "@/store/useAppStore";
import { EditScreen } from "./screens/EditScreen";
import { EmptyScreen } from "./screens/EmptyScreen";
import { MainScreen } from "./screens/MainScreen";

/** 화면을 고른다: 공간이 없으면 첫 실행 화면, 있으면 모드에 따라 메인 화면 또는 편집 모드. */
export function App() {
  const hasSpace = useAppStore((state) => state.data.currentSpaceId !== null);
  const mode = useAppStore((state) => state.ui.mode);

  if (!hasSpace) return <EmptyScreen />;
  return mode === "edit" ? <EditScreen /> : <MainScreen />;
}
