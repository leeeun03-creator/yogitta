import { Minus, Plus, RotateCcw } from "lucide-react";
import { IconButton } from "@/shared/ui";
import type { RefObject } from "react";
import type { ViewStatus } from "../logic/cameraView";
import type { CameraCommands } from "./PreviewCamera";
import styles from "./ViewButtons.module.css";

const ICON_SIZE = 18;

type ViewButtonsProps = {
  status: ViewStatus;
  camera: RefObject<CameraCommands | null>; // 처음 보기·확대·축소 명령을 받는 카메라
};

/** 3D 미리보기 왼쪽 아래의 처음 보기·확대·축소 버튼 (시안 01). 휠·두 손가락 없이도 줌할 수 있다. */
export function ViewButtons({ status, camera }: ViewButtonsProps) {
  return (
    <div className={styles.buttons} role="group" aria-label="3D 보기">
      <IconButton
        variant="outline"
        label="처음 보기"
        icon={<RotateCcw size={ICON_SIZE} />}
        disabled={status.isStart}
        onClick={() => camera.current?.reset()}
      />
      <IconButton
        variant="outline"
        label="확대"
        icon={<Plus size={ICON_SIZE} />}
        disabled={!status.canZoomIn}
        onClick={() => camera.current?.zoom("in")}
      />
      <IconButton
        variant="outline"
        label="축소"
        icon={<Minus size={ICON_SIZE} />}
        disabled={!status.canZoomOut}
        onClick={() => camera.current?.zoom("out")}
      />
    </div>
  );
}
