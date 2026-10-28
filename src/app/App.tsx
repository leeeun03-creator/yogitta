import { useAppStore } from "@/store/useAppStore";
import { EditScreen } from "./screens/EditScreen";
import { EmptyScreen } from "./screens/EmptyScreen";

/** 화면을 조립하는 최상위 컴포넌트. 메인 화면 ↔ 편집 모드 전환은 T25에서 붙인다. */
export function App() {
  const hasSpace = useAppStore((state) => state.data.currentSpaceId !== null);

  // 메인 화면이 생기기 전(T25)까지는 공간이 있으면 편집 모드를 보여 준다
  return hasSpace ? <EditScreen /> : <EmptyScreen />;
}
