import type { Space } from "@/shared/types";
import { SceneView } from "./SceneView";

/** 편집 모드의 3D 미리보기. 그리는 중인 벽·구역이 3D로 어떻게 서는지 본다. */
export function ScenePreview({ space }: { space: Space }) {
  return (
    <SceneView
      space={space}
      name="3D 미리보기"
      fallback="이 브라우저에서는 3D를 볼 수 없어요. 2D 평면도에서 계속 그릴 수 있어요."
    />
  );
}
