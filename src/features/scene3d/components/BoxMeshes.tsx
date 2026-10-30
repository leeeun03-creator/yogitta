import { Edges, Html } from "@react-three/drei";
import { useMemo } from "react";
import { HOVER_SHADE, SCENE_COLORS } from "@/shared/constants/colors3d";
import { BOX_LABEL_GAP_CM, BOX_LABEL_Z_RANGE } from "@/shared/constants/scene";
import { shadeColor } from "@/shared/lib/shadeColor";
import type { Box } from "@/shared/types";
import { boxFaceColors } from "../logic/boxFaceColors";
import { boxToMesh } from "../logic/boxToMesh";
import type { FurniturePart } from "../logic/furniturePart";
import styles from "./BoxMeshes.module.css";

type BoxMeshesProps = {
  boxes: readonly Box[];
  selectedId?: string | null; // 고른 가구: 모서리 선과 이름 라벨을 진하게
  hoveredId?: string | null; // 마우스를 올린 가구: 살짝 밝게
};
type Look = { isLit: boolean; edgeColor: string };

/**
 * 가구를 종류별 모양(가구 부품들)으로 세운다 (yogitta-design 5장: 종류별 나무 톤, 면 음영 + 모서리 선, 단색 재질).
 * 가구마다 묶음을 바닥 자리·설치 높이로 옮기고 정면 방향으로 돌리며, 맨 위에 이름 라벨을 띄운다.
 * 묶음과 이름 라벨에 가구 id를 달아 누르기(BoxPicker)가 어느 가구인지 알게 한다.
 */
export function BoxMeshes({ boxes, selectedId, hoveredId }: BoxMeshesProps) {
  const meshes = useMemo(() => boxes.map(boxToMesh), [boxes]);
  return meshes.map((mesh) => {
    const isSelected = mesh.key === selectedId;
    const look = {
      isLit: mesh.key === hoveredId,
      edgeColor: isSelected ? SCENE_COLORS.selectedEdge : SCENE_COLORS.edge,
    };
    return (
      <group
        key={mesh.key}
        position={[mesh.x, mesh.base, mesh.z]}
        rotation-y={mesh.rotationY}
        userData={{ boxId: mesh.key }}
      >
        {mesh.parts.map((part) => (
          <PartMesh key={part.key} part={part} look={look} />
        ))}
        <Html
          position={[0, mesh.top + BOX_LABEL_GAP_CM, 0]}
          center
          zIndexRange={BOX_LABEL_Z_RANGE}
          pointerEvents="none"
        >
          <span
            data-testid="box-label"
            data-box-id={mesh.key}
            data-selected={isSelected || undefined}
            data-hovered={look.isLit || undefined}
            className={styles.label}
          >
            {mesh.name}
          </span>
        </Html>
      </group>
    );
  });
}

/** 가구 부품 하나. 부품의 로컬 x·z가 가구와 같아 벽처럼 ±x 옆면, ±z 앞뒤면, +y 윗면으로 칠한다. */
function PartMesh({ part, look }: { part: FurniturePart; look: Look }) {
  const base = look.isLit ? shadeColor(part.color, HOVER_SHADE) : part.color;
  const faces = useMemo(() => boxFaceColors(base), [base]);
  return (
    <mesh position={part.position}>
      <boxGeometry args={part.size} />
      {faces.map((color, face) => (
        <meshBasicMaterial key={face} attach={`material-${face}`} color={color} />
      ))}
      {part.hasEdges && <Edges color={look.edgeColor} />}
    </mesh>
  );
}
