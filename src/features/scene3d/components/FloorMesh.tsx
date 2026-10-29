import { useMemo } from "react";
import { SCENE_COLORS } from "@/shared/constants/colors3d";
import { XYZ_PER_POINT } from "@/shared/constants/scene";
import type { Floor } from "@/shared/types";
import { floorGridPoints } from "../logic/floorGridPoints";

/** 3D 바닥 (마루색 판 + 50cm 격자선). 원점은 2D 평면도의 왼쪽 위 귀퉁이와 같다. */
export function FloorMesh({ floor }: { floor: Floor }) {
  const grid = useMemo(() => new Float32Array(floorGridPoints(floor)), [floor]);
  return (
    <>
      {/* 판은 xy 평면에 생기므로 x축으로 -90도 눕혀 위(+y)를 보게 한다 */}
      <mesh position={[floor.w / 2, 0, floor.h / 2]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[floor.w, floor.h]} />
        <meshBasicMaterial color={SCENE_COLORS.floor} />
      </mesh>
      <lineSegments key={grid.length}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[grid, XYZ_PER_POINT]} />
        </bufferGeometry>
        <lineBasicMaterial color={SCENE_COLORS.floorGrid} />
      </lineSegments>
    </>
  );
}
