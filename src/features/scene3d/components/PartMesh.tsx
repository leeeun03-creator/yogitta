import { Edges } from "@react-three/drei";
import { useMemo } from "react";
import { HOVER_SHADE } from "@/shared/constants/colors3d";
import { shadeColor } from "@/shared/lib/shadeColor";
import { boxFaceColors } from "../logic/boxFaceColors";
import type { FurniturePart } from "../logic/furniturePart";

const TOP_FACE = 2; // three.js 박스 면 순서 (+x, -x, +y, -y, +z, -z)에서 윗면

/** 가구 하나를 칠하는 법: 마우스 올림(밝게), 모서리 선 색, 위치 표시 색 바꾸기(찾은 가구 주황·나머지 흐리게). */
export type Look = { isLit: boolean; edgeColor: string; paint: (color: string) => string };

/**
 * 가구 부품 하나. 부품의 로컬 x·z가 가구와 같아 벽처럼 ±x 옆면, ±z 앞뒤면, +y 윗면으로 칠한다.
 * 윗면 색이 따로 있으면(열린 칸의 안쪽) 윗면만 그 색이다.
 */
export function PartMesh({ part, look }: { part: FurniturePart; look: Look }) {
  const painted = look.paint(part.color);
  const base = look.isLit ? shadeColor(painted, HOVER_SHADE) : painted;
  const top = part.topColor;
  const faces = useMemo(
    () => boxFaceColors(base).map((color, face) => (face === TOP_FACE && top ? top : color)),
    [base, top],
  );
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
