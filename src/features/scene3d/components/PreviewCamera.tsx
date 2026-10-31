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
  type RefObject,
} from "react";
import { PREVIEW_FOV_DEG } from "@/shared/constants/scene";
import type { Floor } from "@/shared/types";
import { useFocusMove, type CameraFocus } from "../hooks/useFocusMove";
import { useViewShift } from "../hooks/useViewShift";
import {
  cameraLimits,
  keepViewOnFloor,
  viewStatus,
  zoomView,
  type CameraLimits,
  type CameraView,
  type ViewStatus,
  type ZoomDirection,
} from "../logic/cameraView";
import { startCamera, type CameraStart } from "../logic/startCamera";

/** 3D 밖(버튼)에서 카메라를 움직이는 명령. */
export type CameraCommands = { reset: () => void; zoom: (direction: ZoomDirection) => void };

type PreviewCameraProps = {
  floor: Floor;
  ref: Ref<CameraCommands>;
  onViewChange: (status: ViewStatus) => void;
  focus?: CameraFocus; // 볼 가구 (찾은 가구·고른 가구): 바뀌면 카메라를 그 가구 정면으로 옮긴다 (T15)
  shiftPx?: number; // 3D 그림 전체를 오른쪽으로 옮길 양 (검색 결과 카드에 가리지 않게, T15-2)
};

type Controls = ComponentRef<typeof OrbitControls>;
type ControlsRef = RefObject<Controls | null>;

const readView = (controls: Controls): CameraView => {
  const { position } = controls.object;
  const { target } = controls;
  return { position: [position.x, position.y, position.z], target: [target.x, target.y, target.z] };
};
/** controls의 카메라 자리·보는 곳을 view로 바꾼다 (update는 부르지 않는다). */
const writeView = (controls: Controls, view: CameraView) => {
  controls.object.position.set(...view.position);
  controls.target.set(...view.target);
};

/** 지금 카메라 상태를 알리는 report와, 카메라를 옮기고 다시 그리는 moveTo. */
function useCameraMove(
  controls: ControlsRef,
  start: CameraStart,
  limits: CameraLimits,
  onViewChange: (status: ViewStatus) => void,
) {
  const get = useThree((state) => state.get);
  const report = useCallback(() => {
    if (controls.current) onViewChange(viewStatus(readView(controls.current), start, limits));
  }, [controls, onViewChange, start, limits]);
  const moveTo = useCallback(
    (view: CameraView) => {
      const current = controls.current;
      if (!current) return;
      writeView(current, view);
      current.update();
      get().invalidate(); // frameloop demand라 직접 다시 그리게 한다
      report();
    },
    [controls, get, report],
  );
  return { report, moveTo };
}

/** 처음 자리에 두고, 화면 크기가 바뀌면 (사용자가 움직이지 않았을 때만) 다시 맞춘다. 버튼 명령도 연결한다. */
function useCameraStart(
  ref: Ref<CameraCommands>,
  controls: ControlsRef,
  isMoved: RefObject<boolean>,
  { start, limits }: { start: CameraStart; limits: CameraLimits },
  { report, moveTo }: ReturnType<typeof useCameraMove>,
) {
  const get = useThree((state) => state.get);
  // three.js 카메라는 바꿔 쓰는 객체라 effect 안에서 꺼내 고친다
  useLayoutEffect(() => {
    const { camera } = get();
    camera.near = start.near;
    camera.far = start.far;
    camera.updateProjectionMatrix();
    if (isMoved.current) report();
    else moveTo(start);
  }, [get, isMoved, start, moveTo, report]);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        isMoved.current = false;
        moveTo(start);
      },
      zoom: (direction) => {
        if (!controls.current) return;
        isMoved.current = true;
        moveTo(zoomView(readView(controls.current), direction, limits));
      },
    }),
    [controls, isMoved, start, limits, moveTo],
  );
}

/**
 * OrbitControls 처리기와 사용자가 움직였는지(isMoved). 누르는 동안 카메라가 바뀌어야 움직인 것이다
 * (가구를 누르기만 해서는 아니다). 이동으로 보는 곳이 바닥 밖으로 나가면 카메라째 바닥 안으로 당긴다.
 */
function useUserMove(controls: ControlsRef, floor: Floor, report: () => void) {
  const isMoved = useRef(false); // 사용자가 움직였으면 화면 크기가 바뀌어도 처음 자리로 되돌리지 않는다
  const isPressing = useRef(false);
  const onChange = useCallback(() => {
    const current = controls.current;
    if (!current) return;
    if (isPressing.current) isMoved.current = true;
    const view = readView(current);
    const kept = keepViewOnFloor(view, floor);
    if (kept !== view) writeView(current, kept);
    report();
  }, [controls, floor, report]);
  const onStart = useCallback(() => {
    isPressing.current = true;
  }, []);
  const onEnd = useCallback(() => {
    isPressing.current = false;
  }, []);
  const markMoved = useCallback(() => {
    isMoved.current = true;
  }, []);
  return { isMoved, markMoved, handlers: { onStart, onEnd, onChange } };
}

/**
 * 3D 미리보기 카메라. 처음에는 바닥 전체가 보이게 두고,
 * 끌기 회전 · 휠·두 손가락 줌 · 오른쪽 끌기·두 손가락 이동을 정해진 범위 안에서 받는다.
 * 찾은 가구·고른 가구가 생기면 그 가구 정면으로 옮겨 간다.
 */
export function PreviewCamera(props: PreviewCameraProps) {
  const { floor, ref, onViewChange, focus, shiftPx = 0 } = props;
  const controls = useRef<Controls>(null);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const start = useMemo(
    () => startCamera(floor, PREVIEW_FOV_DEG, width / height),
    [floor, width, height],
  );
  const limits = useMemo(() => cameraLimits(start), [start]);
  const move = useCameraMove(controls, start, limits, onViewChange);
  const { isMoved, markMoved, handlers } = useUserMove(controls, floor, move.report);
  useCameraStart(ref, controls, isMoved, { start, limits }, move);
  useFocusMove(focus, {
    read: () => (controls.current ? readView(controls.current) : null),
    moveTo: move.moveTo,
    markMoved,
    lens: { fovDeg: PREVIEW_FOV_DEG, aspect: width / height },
    limits,
  });
  useViewShift(shiftPx, { width, height });

  return (
    <OrbitControls
      ref={controls}
      enableDamping={false}
      screenSpacePanning={false}
      minDistance={limits.minDistance}
      maxDistance={limits.maxDistance}
      maxPolarAngle={limits.maxPolarAngle}
      {...handlers}
    />
  );
}
