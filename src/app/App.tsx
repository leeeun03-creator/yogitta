import { StorageNotice } from "@/features/storage";
import { useAppStore } from "@/store/useAppStore";
import { EditScreen } from "./screens/EditScreen";
import { EmptyScreen } from "./screens/EmptyScreen";
import { MainScreen } from "./screens/MainScreen";

/** 화면을 고른다: 공간이 없으면 첫 실행 화면, 있으면 모드에 따라 메인 화면 또는 편집 모드. 저장 안내는 어느 화면에서나 뜬다. */
export function App() {
  const hasSpace = useAppStore((state) => state.data.currentSpaceId !== null);
  const mode = useAppStore((state) => state.ui.mode);
  const screen = mode === "edit" ? <EditScreen /> : <MainScreen />;
  return (
    <>
      {hasSpace ? screen : <EmptyScreen />}
      <StorageNotice />
    </>
  );
}
