import type { Space } from "@/shared/types";
import { SceneView } from "./SceneView";

/** 메인 화면의 3D 공간. 검색한 물건의 위치 표시(T28)와 가구 누르기(T9)가 여기에 붙는다. */
export function SpaceScene({ space }: { space: Space }) {
  return (
    <SceneView
      space={space}
      name="3D 공간"
      fallback="이 브라우저에서는 3D를 볼 수 없어요. [편집]을 누르면 2D 평면도로 볼 수 있어요."
    />
  );
}
