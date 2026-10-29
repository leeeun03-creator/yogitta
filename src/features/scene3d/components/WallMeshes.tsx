import { Edges } from "@react-three/drei";
import { useMemo } from "react";
import { SCENE_COLORS } from "@/shared/constants/colors3d";
import type { Wall } from "@/shared/types";
import { boxFaceColors } from "../logic/boxFaceColors";
import { wallToBoxes } from "../logic/wallToBoxes";

const WALL_FACE_COLORS = boxFaceColors(SCENE_COLORS.wall);

/** 벽마다 선분을 벽 박스로 세운다. 면마다 밝기를 달리하고 모서리 선을 그린다. */
export function WallMeshes({ walls }: { walls: Wall[] }) {
  const boxes = useMemo(() => walls.flatMap(wallToBoxes), [walls]);
  return boxes.map((box) => (
    // 박스는 가운데 기준이라 높이의 절반만큼 올려 바닥 위에 세운다
    <mesh key={box.key} position={[box.x, box.height / 2, box.z]} rotation-y={box.rotationY}>
      <boxGeometry args={[box.length, box.height, box.thickness]} />
      {WALL_FACE_COLORS.map((color, face) => (
        <meshBasicMaterial key={face} attach={`material-${face}`} color={color} />
      ))}
      <Edges color={SCENE_COLORS.edge} />
    </mesh>
  ));
}
