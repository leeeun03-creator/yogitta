import { useAppStore } from "@/store/useAppStore";
import { EmptyScreen } from "./screens/EmptyScreen";

/** 화면을 조립하는 최상위 컴포넌트. 메인 화면 ↔ 편집 모드 전환은 T25에서 붙인다. */
export function App() {
  const hasSpace = useAppStore((state) => state.data.currentSpaceId !== null);

  // TODO(T2-5): 공간이 있으면 편집 모드를 보여 준다
  return hasSpace ? null : <EmptyScreen />;
}
