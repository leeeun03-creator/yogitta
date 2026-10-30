import { useThree, type RootState } from "@react-three/fiber";
import { useEffect } from "react";
import { Raycaster, Vector2 } from "three";
import { pickedBoxId } from "../logic/pickedBoxId";
import { tapTracker } from "../logic/tapTracker";

/** 메인 화면 3D 공간의 가구 고르기: 고른 가구와, 누르면 부를 함수(가구가 아닌 곳(바닥·빈 곳·벽)은 null). */
export type BoxPicking = { selectedId: string | null; onPick: (id: string | null) => void };

type BoxPickerProps = {
  onPick: (id: string | null) => void;
  onHover: (id: string | null) => void; // 마우스를 올린 가구 (없거나 끄는 중이면 null)
};

type Three = Pick<RootState, "gl" | "camera" | "scene">;

/** 화면 자리(event)를 지나는 첫 가구의 id. 다시 그리기 전에도 맞게 카메라 행렬을 먼저 맞춘다. */
function boxAt(event: PointerEvent, { gl, camera, scene }: Three): string | null {
  const rect = gl.domElement.getBoundingClientRect();
  const pointer = new Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  const raycaster = new Raycaster();
  camera.updateMatrixWorld();
  raycaster.setFromCamera(pointer, camera);
  return pickedBoxId(raycaster.intersectObjects(scene.children, true).map((hit) => hit.object));
}

/**
 * 누른 자리(clientX·Y)에 있는 이름 라벨의 가구 id. 라벨은 위에서 끌어도 3D가 돌게 누르기를 받지 않으므로
 * (pointer-events: none) 라벨 사각형 안인지 직접 잰다.
 */
function labelBoxId(target: HTMLElement, { clientX: x, clientY: y }: PointerEvent): string | null {
  for (const label of target.querySelectorAll("[data-box-id]")) {
    const rect = label.getBoundingClientRect();
    const isInside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    if (isInside) return label.getAttribute("data-box-id");
  }
  return null;
}

/**
 * 3D에서 가구 누르기. 누르기(끌기·확대가 아님, tapTracker)면 누른 자리를 지나는 첫 가구를 고른다(없으면 null).
 * 이름 라벨을 눌렀으면 그 가구다. 보기 버튼은 이 3D 영역 밖에 있어 누르기로 치지 않는다.
 * three.js 누르기 이벤트 대신 직접 재는 것은, 휴대폰에서 화면을 연 뒤 첫 터치가 눌리지 않아서다.
 */
export function BoxPicker({ onPick, onHover }: BoxPickerProps) {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const connected = useThree((state) => state.events.connected);
  useEffect(() => {
    // 3D 그림과 이름 라벨(drei Html은 여기에 붙는다)을 함께 담은 곳
    const target = connected instanceof HTMLElement ? connected : null;
    if (!target) return;
    const boxUnder = (event: PointerEvent) =>
      labelBoxId(target, event) ?? boxAt(event, { gl, camera, scene });
    const tracker = tapTracker((event: PointerEvent) => onPick(boxUnder(event)));
    // 마우스만 올리기가 있다. 끄는(돌리는) 중에는 올린 가구가 없다
    const hover = (event: PointerEvent) => {
      if (event.pointerType === "mouse") onHover(event.buttons === 0 ? boxUnder(event) : null);
    };
    const listeners = [
      ["pointerdown", tracker.pointerdown],
      ["pointermove", tracker.pointermove],
      ["pointerup", tracker.pointerup],
      ["pointermove", hover],
      ["pointerleave", () => onHover(null)],
    ] as const;
    for (const [type, listener] of listeners) target.addEventListener(type, listener);
    return () => {
      for (const [type, listener] of listeners) target.removeEventListener(type, listener);
    };
  }, [gl, camera, scene, connected, onPick, onHover]);
  return null;
}
