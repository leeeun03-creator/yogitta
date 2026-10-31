import { Edges, Html } from "@react-three/drei";
import { useMemo } from "react";
import { HOVER_SHADE, SCENE_COLORS } from "@/shared/constants/colors3d";
import { BOX_LABEL_GAP_CM, BOX_LABEL_Z_RANGE } from "@/shared/constants/scene";
import { shadeColor } from "@/shared/lib/shadeColor";
import type { Box, FurnitureType } from "@/shared/types";
import { boxPaint, type PaintMode } from "../logic/boxPaint";
import { boxFaceColors } from "../logic/boxFaceColors";
import { boxToMesh } from "../logic/boxToMesh";
import type { FurniturePart } from "../logic/furniturePart";
import styles from "./BoxMeshes.module.css";

type BoxMeshesProps = {
  boxes: readonly Box[];
  selectedId?: string | null; // 고른 가구: 모서리 선과 이름 라벨을 진하게
  hoveredId?: string | null; // 마우스를 올린 가구: 살짝 밝게
  foundId?: string; // 위치 표시할 찾은 가구: 주황, 나머지 가구는 흐리게
};
type Look = { isLit: boolean; edgeColor: string; paint: (color: string) => string };
type Marks = Pick<BoxMeshesProps, "selectedId" | "hoveredId" | "foundId">;

/** 가구 하나를 어떻게 칠할지: 마우스 올림(밝게), 고름(진한 모서리 선), 위치 표시(찾은 가구 주황·나머지 흐리게). */
function lookOf(id: string, type: FurnitureType, marks: Marks): Look {
  const mode: PaintMode = !marks.foundId ? "normal" : id === marks.foundId ? "found" : "dim";
  const paint = boxPaint(type, mode);
  const edge = id === marks.selectedId ? SCENE_COLORS.selectedEdge : SCENE_COLORS.edge;
  return { isLit: id === marks.hoveredId, edgeColor: paint(edge), paint };
}

/**
 * 가구를 종류별 모양(가구 부품들)으로 세운다 (yogitta-design 5장: 종류별 나무 톤, 면 음영 + 모서리 선, 단색 재질).
 * 가구마다 묶음을 바닥 자리·설치 높이로 옮기고 정면 방향으로 돌리며, 맨 위에 이름 라벨을 띄운다.
 * 묶음과 이름 라벨에 가구 id를 달아 누르기(BoxPicker)가 어느 가구인지 알게 한다.
 */
export function BoxMeshes({ boxes, ...marks }: BoxMeshesProps) {
  const meshes = useMemo(() => boxes.map(boxToMesh), [boxes]);
  return meshes.map((mesh, index) => {
    const isSelected = mesh.key === marks.selectedId;
    const look = lookOf(mesh.key, boxes[index]?.type ?? "box", marks);
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
            data-found={mesh.key === marks.foundId || undefined}
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
  const painted = look.paint(part.color);
  const base = look.isLit ? shadeColor(painted, HOVER_SHADE) : painted;
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
