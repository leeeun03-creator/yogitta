import { Edges } from "@react-three/drei";
import { useMemo } from "react";
import { SCENE_COLORS } from "@/shared/constants/colors3d";
import { BOX_HANDLE_3D } from "@/shared/constants/scene";
import type { Box } from "@/shared/types";
import { boxFaceColors } from "../logic/boxFaceColors";
import { boxToMesh } from "../logic/boxToMesh";

// 가구의 로컬 x가 가로, z가 깊이라 벽과 같이 ±x 옆면, ±z 앞뒤면, +y 윗면으로 칠한다
const BOX_FACE_COLORS = boxFaceColors(SCENE_COLORS.box);

/**
 * 가구를 보관함 색 상자로 세운다 (yogitta-design 5장: 면 음영 + 모서리 선, 단색 재질).
 * 정면 위쪽에 손잡이 홈을 붙여 2D 평면도의 정면 삼각형과 같은 쪽이 정면인 게 보이게 한다. 가구 종류별 모양은 T7.
 */
export function BoxMeshes({ boxes }: { boxes: readonly Box[] }) {
  const meshes = useMemo(() => boxes.map(boxToMesh), [boxes]);
  return meshes.map((mesh) => (
    <group key={mesh.key} position={[mesh.x, mesh.base, mesh.z]} rotation-y={mesh.rotationY}>
      {/* 박스는 가운데 기준이라 높이의 절반만큼 올려 아랫면을 base에 둔다 */}
      <mesh position-y={mesh.h / 2}>
        <boxGeometry args={[mesh.w, mesh.h, mesh.d]} />
        {BOX_FACE_COLORS.map((color, face) => (
          <meshBasicMaterial key={face} attach={`material-${face}`} color={color} />
        ))}
        <Edges color={SCENE_COLORS.edge} />
      </mesh>
      <mesh position={[0, mesh.handle.y, mesh.handle.z]}>
        <boxGeometry args={[mesh.handle.width, mesh.handle.height, BOX_HANDLE_3D.depth]} />
        <meshBasicMaterial color={SCENE_COLORS.edge} />
      </mesh>
    </group>
  ));
}
