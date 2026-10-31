import { Html } from "@react-three/drei";
import { useMemo } from "react";
import { SCENE_COLORS } from "@/shared/constants/colors3d";
import { BOX_LABEL_GAP_CM, BOX_LABEL_Z_RANGE } from "@/shared/constants/scene";
import type { Box } from "@/shared/types";
import { boxPaint, type PaintMode } from "../logic/boxPaint";
import { boxToMesh, type BoxMesh } from "../logic/boxToMesh";
import type { FoundSpot } from "../logic/foundSpot";
import { slotOpening, type SlotOpening } from "../logic/slotOpening";
import styles from "./BoxMeshes.module.css";
import { PartMesh, type Look } from "./PartMesh";
import { SlidingParts } from "./SlidingParts";

type BoxMeshesProps = {
  boxes: readonly Box[];
  selectedId?: string | null; // 고른 가구: 모서리 선과 이름 라벨을 진하게
  hoveredId?: string | null; // 마우스를 올린 가구: 살짝 밝게
  found?: FoundSpot; // 위치 표시할 찾은 물건: 그 가구는 주황·칸 열림, 나머지 가구는 흐리게
};
type Marks = Omit<BoxMeshesProps, "boxes">;

/** 가구 하나를 어떻게 칠할지: 마우스 올림(밝게), 고름(진한 모서리 선), 위치 표시(찾은 가구 주황·나머지 흐리게). */
function lookOf(box: Box, marks: Marks): Look {
  const mode: PaintMode = !marks.found ? "normal" : box.id === marks.found.boxId ? "found" : "dim";
  const paint = boxPaint(box.type, mode);
  const edge = box.id === marks.selectedId ? SCENE_COLORS.selectedEdge : SCENE_COLORS.edge;
  return { isLit: box.id === marks.hoveredId, edgeColor: paint(edge), paint };
}

/**
 * 가구를 종류별 모양(가구 부품들)으로 세운다 (yogitta-design 5장: 종류별 나무 톤, 면 음영 + 모서리 선, 단색 재질).
 * 가구마다 묶음을 바닥 자리·설치 높이로 옮기고 정면 방향으로 돌리며, 맨 위에 이름 라벨을 띄운다.
 * 묶음과 이름 라벨에 가구 id를 달아 누르기(BoxPicker)가 어느 가구인지 알게 한다. 찾은 가구는 찾은 칸을 연다.
 */
export function BoxMeshes({ boxes, ...marks }: BoxMeshesProps) {
  const meshes = useMemo(() => boxes.map(boxToMesh), [boxes]);
  return meshes.map((mesh, index) => {
    const box = boxes[index];
    if (!box) return null;
    const isFound = box.id === marks.found?.boxId;
    return (
      <FurnitureGroup
        key={mesh.key}
        mesh={mesh}
        look={lookOf(box, marks)}
        opening={isFound ? slotOpening(box, marks.found?.slot) : null}
        label={{ isSelected: box.id === marks.selectedId, isFound }}
      />
    );
  });
}

type FurnitureGroupProps = {
  mesh: BoxMesh;
  look: Look;
  opening: SlotOpening | null; // 찾은 칸 열기 (없으면 닫힌 모양)
  label: { isSelected: boolean; isFound: boolean };
};

/** 가구 하나: 부품들(열린 칸은 빠져나오는 묶음으로 따로)과 이름 라벨. */
function FurnitureGroup({ mesh, look, opening, label }: FurnitureGroupProps) {
  const moving = new Set([...(opening?.slideKeys ?? []), ...(opening?.hideKeys ?? [])]);
  const sliding = mesh.parts.filter((part) => opening?.slideKeys.includes(part.key));
  return (
    <group
      position={[mesh.x, mesh.base, mesh.z]}
      rotation-y={mesh.rotationY}
      userData={{ boxId: mesh.key }}
    >
      {[...mesh.parts.filter((part) => !moving.has(part.key)), ...(opening?.fixed ?? [])].map(
        (part) => (
          <PartMesh key={part.key} part={part} look={look} />
        ),
      )}
      {opening && <SlidingParts parts={[...sliding, ...opening.sliding]} look={look} />}
      <Html
        position={[0, mesh.top + BOX_LABEL_GAP_CM, 0]}
        center
        zIndexRange={BOX_LABEL_Z_RANGE}
        pointerEvents="none"
      >
        <span
          data-testid="box-label"
          data-box-id={mesh.key}
          data-selected={label.isSelected || undefined}
          data-hovered={look.isLit || undefined}
          data-found={label.isFound || undefined}
          className={styles.label}
        >
          {mesh.name}
        </span>
      </Html>
    </group>
  );
}
