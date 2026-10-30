import { Edges } from "@react-three/drei";
import { useMemo } from "react";
import { SCENE_COLORS } from "@/shared/constants/colors3d";
import type { Box } from "@/shared/types";
import { boxFaceColors } from "../logic/boxFaceColors";
import { boxToMesh } from "../logic/boxToMesh";
import type { FurniturePart } from "../logic/furniturePart";

/**
 * 가구를 종류별 모양(가구 부품들)으로 세운다 (yogitta-design 5장: 종류별 나무 톤, 면 음영 + 모서리 선, 단색 재질).
 * 가구마다 묶음을 바닥 자리·설치 높이로 옮기고 정면 방향으로 돌린다.
 */
export function BoxMeshes({ boxes }: { boxes: readonly Box[] }) {
  const meshes = useMemo(() => boxes.map(boxToMesh), [boxes]);
  return meshes.map((mesh) => (
    <group key={mesh.key} position={[mesh.x, mesh.base, mesh.z]} rotation-y={mesh.rotationY}>
      {mesh.parts.map((part) => (
        <PartMesh key={part.key} part={part} />
      ))}
    </group>
  ));
}

/** 가구 부품 하나. 부품의 로컬 x·z가 가구와 같아 벽처럼 ±x 옆면, ±z 앞뒤면, +y 윗면으로 칠한다. */
function PartMesh({ part }: { part: FurniturePart }) {
  const faces = useMemo(() => boxFaceColors(part.color), [part.color]);
  return (
    <mesh position={part.position}>
      <boxGeometry args={part.size} />
      {faces.map((color, face) => (
        <meshBasicMaterial key={face} attach={`material-${face}`} color={color} />
      ))}
      {part.hasEdges && <Edges color={SCENE_COLORS.edge} />}
    </mesh>
  );
}
