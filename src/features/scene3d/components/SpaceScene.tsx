import { useMemo } from "react";
import type { Space } from "@/shared/types";
import type { FoundSpot } from "../logic/foundSpot";
import { useAppStore } from "@/store/useAppStore";
import { SceneView } from "./SceneView";

/**
 * 메인 화면의 3D 공간. 가구를 누르면 가구 상세 패널이 열리고(고른 가구는 3D에서 표시), 가구가 아닌 곳을 누르면 닫힌다.
 * 검색으로 찾은 물건(found)은 위치 표시한다: 고른 결과의 가구는 주황, 나머지 가구는 흐리게 (T28).
 */
export function SpaceScene({ space, found }: { space: Space; found: readonly FoundSpot[] }) {
  const selectBox = useAppStore((state) => state.selectBox);
  const selectedId = useAppStore((state) => state.ui.selectedBoxId);
  const picking = useMemo(
    () => ({ selectedId, onPick: selectBox, found }),
    [selectedId, selectBox, found],
  );
  return (
    <SceneView
      space={space}
      name="3D 공간"
      fallback="이 브라우저에서는 3D를 볼 수 없어요. [편집]을 누르면 2D 평면도로 볼 수 있어요."
      picking={picking}
    />
  );
}
