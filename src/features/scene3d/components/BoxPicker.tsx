import { useThree, type RootState } from "@react-three/fiber";
import { useEffect } from "react";
import { Raycaster, Vector2 } from "three";
import { TAP_MOVE_PX } from "@/shared/constants/floorPlan";
import { pickedBoxId } from "../logic/pickedBoxId";

type BoxPickerProps = {
  onPick: (id: string) => void; // 가구를 눌렀을 때
  onMiss?: () => void; // 가구가 아닌 곳(바닥·빈 곳·벽)을 눌렀을 때
};

type Press = { pointerId: number; x: number; y: number };
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
 * 3D에서 가구 누르기. 손가락·마우스를 누른 자리에서 TAP_MOVE_PX 안에서 떼면 누르기로 보고(더 움직이면 3D 돌리기),
 * 누른 자리를 지나는 첫 가구를 고른다. 이름 라벨을 눌렀으면 그 가구다. 두 번째 손가락이 닿으면(확대) 누르기가 아니다.
 * three.js 누르기 이벤트 대신 직접 재는 것은, 휴대폰에서 화면을 연 뒤 첫 터치가 눌리지 않아서다.
 */
export function BoxPicker({ onPick, onMiss }: BoxPickerProps) {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const connected = useThree((state) => state.events.connected);
  useEffect(() => {
    // 3D 그림과 이름 라벨(drei Html은 여기에 붙는다)을 함께 담은 곳
    const target = connected instanceof HTMLElement ? connected : null;
    if (!target) return;
    let press: Press | null = null;
    const down = (event: PointerEvent) => {
      const { pointerId, clientX: x, clientY: y } = event;
      press = event.isPrimary ? { pointerId, x, y } : null;
    };
    const up = (event: PointerEvent) => {
      const start = press;
      press = null;
      if (!start || start.pointerId !== event.pointerId) return;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_MOVE_PX) return;
      const id = labelBoxId(target, event) ?? boxAt(event, { gl, camera, scene });
      if (id) onPick(id);
      else onMiss?.();
    };
    target.addEventListener("pointerdown", down);
    target.addEventListener("pointerup", up);
    return () => {
      target.removeEventListener("pointerdown", down);
      target.removeEventListener("pointerup", up);
    };
  }, [gl, camera, scene, connected, onPick, onMiss]);
  return null;
}
