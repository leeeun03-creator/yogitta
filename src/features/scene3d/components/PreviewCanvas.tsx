import { Canvas } from "@react-three/fiber";
import { PREVIEW_FOV_DEG } from "@/shared/constants/scene";
import type { Floor, Wall } from "@/shared/types";
import { CameraRig } from "./CameraRig";
import { FloorMesh } from "./FloorMesh";
import { WallMeshes } from "./WallMeshes";

/** three.js를 쓰는 3D 미리보기 본체. 무거워서 ScenePreview가 처음 열 때 따로 불러온다. */
export function PreviewCanvas({ floor, walls }: { floor: Floor; walls: Wall[] }) {
  return (
    // flat: 색 보정(톤 매핑)을 끄고 yogitta-design 5장 색을 그대로 낸다
    // frameloop demand: 매 프레임 다시 그리지 않고 바뀔 때만 그린다 (휴대폰 배터리·CPU)
    <Canvas flat frameloop="demand" camera={{ fov: PREVIEW_FOV_DEG }} aria-hidden="true">
      <CameraRig floor={floor} />
      <FloorMesh floor={floor} />
      <WallMeshes walls={walls} />
    </Canvas>
  );
}
