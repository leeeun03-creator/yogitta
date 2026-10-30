import { Canvas } from "@react-three/fiber";
import { useCallback, useRef, useState } from "react";
import { PREVIEW_FOV_DEG } from "@/shared/constants/scene";
import type { RoomArea } from "@/features/spaces";
import type { Box, Floor, Wall } from "@/shared/types";
import type { ViewStatus, ZoomDirection } from "../logic/cameraView";
import { BoxMeshes } from "./BoxMeshes";
import { BoxPicker, type BoxPicking } from "./BoxPicker";
import { FloorMesh } from "./FloorMesh";
import styles from "./PreviewCanvas.module.css";
import { PreviewCamera, type CameraCommands } from "./PreviewCamera";
import { RoomFloorMeshes } from "./RoomFloorMeshes";
import { ViewButtons } from "./ViewButtons";
import { WallMeshes } from "./WallMeshes";

type PreviewCanvasProps = {
  floor: Floor;
  walls: Wall[];
  boxes: readonly Box[];
  areas: readonly RoomArea[];
  label: string;
  picking?: BoxPicking; // 가구 고르기 (메인 화면만)
};

// 카메라가 준비되기 전에는 눌러도 아무 일이 없으므로 모두 막아 둔다
const NOT_READY: ViewStatus = { isStart: true, canZoomIn: false, canZoomOut: false };
const isSameStatus = (a: ViewStatus, b: ViewStatus) =>
  a.isStart === b.isStart && a.canZoomIn === b.canZoomIn && a.canZoomOut === b.canZoomOut;

/** three.js를 쓰는 3D 그림 본체와 보기 버튼. 무거워서 SceneView가 처음 열 때 따로 불러온다. */
export function PreviewCanvas(props: PreviewCanvasProps) {
  const { floor, walls, boxes, areas, label, picking } = props;
  const camera = useRef<CameraCommands>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null); // 마우스를 올린 가구
  const [status, setStatus] = useState(NOT_READY);
  // 끄는 동안 매번 불리므로 바뀐 때만 다시 그린다
  const handleViewChange = useCallback(
    (next: ViewStatus) => setStatus((prev) => (isSameStatus(prev, next) ? prev : next)),
    [],
  );
  return (
    <div className={styles.wrap}>
      <div
        className={hoveredId ? `${styles.scene} ${styles.hovering}` : styles.scene}
        role="img"
        aria-label={label}
      >
        {/* flat: 색 보정(톤 매핑)을 끄고 yogitta-design 5장 색을 그대로 낸다
            frameloop demand: 매 프레임 다시 그리지 않고 바뀔 때만 그린다 (휴대폰 배터리·CPU) */}
        <Canvas flat frameloop="demand" camera={{ fov: PREVIEW_FOV_DEG }} aria-hidden="true">
          <PreviewCamera floor={floor} ref={camera} onViewChange={handleViewChange} />
          <FloorMesh floor={floor} />
          <RoomFloorMeshes areas={areas} />
          <WallMeshes walls={walls} />
          <BoxMeshes boxes={boxes} selectedId={picking?.selectedId} hoveredId={hoveredId} />
          {picking && <BoxPicker onPick={picking.onPick} onHover={setHoveredId} />}
        </Canvas>
      </div>
      <ViewButtons
        status={status}
        onReset={() => camera.current?.reset()}
        onZoom={(direction: ZoomDirection) => camera.current?.zoom(direction)}
      />
    </div>
  );
}
