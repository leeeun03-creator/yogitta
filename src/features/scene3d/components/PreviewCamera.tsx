import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  type ComponentRef,
  type Ref,
} from "react";
import type { Vector3 } from "three";
import { PREVIEW_FOV_DEG } from "@/shared/constants/scene";
import type { Floor } from "@/shared/types";
import {
  cameraLimits,
  clampTarget,
  viewStatus,
  zoomDistance,
  type ViewStatus,
  type ZoomDirection,
} from "../logic/cameraView";
import { startCamera, type Vector } from "../logic/startCamera";

/** 3D 밖(버튼)에서 카메라를 움직이는 명령. */
export type CameraCommands = { reset: () => void; zoom: (direction: ZoomDirection) => void };

type PreviewCameraProps = {
  floor: Floor;
  ref: Ref<CameraCommands>;
  onViewChange: (status: ViewStatus) => void;
};

type Controls = ComponentRef<typeof OrbitControls>;

const toVector = (vector: Vector3): Vector => [vector.x, vector.y, vector.z];

/**
 * 3D 미리보기 카메라. 처음에는 바닥 전체가 보이게 두고,
 * 끌기 회전 · 휠·두 손가락 줌 · 오른쪽 끌기·두 손가락 이동을 정해진 범위 안에서 받는다.
 */
export function PreviewCamera({ floor, ref, onViewChange }: PreviewCameraProps) {
  const controls = useRef<Controls>(null);
  const isMoved = useRef(false); // 사용자가 움직였으면 화면 크기가 바뀌어도 처음 자리로 되돌리지 않는다
  const get = useThree((state) => state.get);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const start = useMemo(
    () => startCamera(floor, PREVIEW_FOV_DEG, width / height),
    [floor, width, height],
  );
  const limits = useMemo(() => cameraLimits(start), [start]);

  const report = useCallback(() => {
    const current = controls.current;
    if (!current) return;
    const view = { position: toVector(current.object.position), target: toVector(current.target) };
    onViewChange(viewStatus(view, start, limits));
  }, [onViewChange, start, limits]);

  const moveTo = useCallback(
    (position: Vector, target: Vector) => {
      const current = controls.current;
      if (!current) return;
      current.object.position.set(...position);
      current.target.set(...target);
      current.update();
      get().invalidate(); // frameloop demand라 직접 다시 그리게 한다
      report();
    },
    [get, report],
  );

  // three.js 카메라는 바꿔 쓰는 객체라 effect 안에서 꺼내 고친다
  useLayoutEffect(() => {
    const { camera } = get();
    camera.near = start.near;
    camera.far = start.far;
    camera.updateProjectionMatrix();
    if (isMoved.current) report();
    else moveTo(start.position, start.target);
  }, [get, start, moveTo, report]);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        isMoved.current = false;
        moveTo(start.position, start.target);
      },
      zoom: (direction) => {
        const current = controls.current;
        if (!current) return;
        isMoved.current = true;
        const offset = current.object.position.clone().sub(current.target);
        offset.setLength(zoomDistance(offset.length(), direction, limits));
        moveTo(toVector(current.target.clone().add(offset)), toVector(current.target));
      },
    }),
    [start, limits, moveTo],
  );

  /** 이동으로 보는 곳이 바닥 밖으로 나가면 카메라째 바닥 안으로 당긴다. */
  const handleChange = useCallback(() => {
    const current = controls.current;
    if (!current) return;
    const target = toVector(current.target);
    const [x, y, z] = clampTarget(target, floor);
    if (x !== target[0] || y !== target[1] || z !== target[2]) {
      const position = current.object.position;
      position.set(
        position.x + x - target[0],
        position.y + y - target[1],
        position.z + z - target[2],
      );
      current.target.set(x, y, z);
    }
    report();
  }, [floor, report]);

  return (
    <OrbitControls
      ref={controls}
      enableDamping={false}
      screenSpacePanning={false}
      minDistance={limits.minDistance}
      maxDistance={limits.maxDistance}
      maxPolarAngle={limits.maxPolarAngle}
      onStart={() => {
        isMoved.current = true;
      }}
      onChange={handleChange}
    />
  );
}
