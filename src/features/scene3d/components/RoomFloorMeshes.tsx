import { useMemo } from "react";
import type { RoomArea } from "@/features/spaces";
import { ROOM_FLOOR_OPACITY } from "@/shared/constants/colors3d";
import { XYZ_PER_POINT } from "@/shared/constants/scene";
import { roomFloorPoints } from "../logic/roomFloorPoints";

/** 구역 하나의 바닥 색. 2D 평면도와 같은 색을 옅게 깐다. */
function RoomFloor({ area }: { area: RoomArea }) {
  const points = useMemo(() => new Float32Array(roomFloorPoints(area.rects)), [area.rects]);
  return (
    <mesh key={points.length}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, XYZ_PER_POINT]} />
      </bufferGeometry>
      {/* depthWrite를 끄면 투명 면이 그 위 격자선을 가리지 않는다 */}
      <meshBasicMaterial
        color={area.color}
        transparent
        opacity={ROOM_FLOOR_OPACITY}
        depthWrite={false}
      />
    </mesh>
  );
}

/** 3D 미리보기 바닥에 구역마다 색을 깐다 (yogitta-design 6장: 3D 바닥에도 같은 색을 옅게). */
export function RoomFloorMeshes({ areas }: { areas: readonly RoomArea[] }) {
  return (
    <>
      {areas.map((area) => (
        <RoomFloor key={area.room} area={area} />
      ))}
    </>
  );
}
