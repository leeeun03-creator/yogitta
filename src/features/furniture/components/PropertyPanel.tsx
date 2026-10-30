import { MapPin, RotateCw, Trash2 } from "lucide-react";
import { useId, useRef } from "react";
import { FURNITURE_DEFAULTS } from "@/shared/constants/furniture";
import { formatSize } from "@/shared/lib/formatSize";
import { rotatedBox, type RotateBlock } from "@/shared/lib/rotatedBox";
import { Button } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import { useSelectedBox, type SelectedBox } from "../hooks/useSelectedBox";
import { FurnitureTypePicker } from "./FurnitureTypePicker";
import styles from "./PropertyPanel.module.css";

const ICON_SIZE = 18;
const ROOM_ICON_SIZE = 16;
const ROTATE_BLOCK_MESSAGES: Record<RotateBlock, string> = {
  tooLong: "바닥보다 길어서 돌릴 수 없어요",
  blocked: "벽이나 다른 가구에 걸려서 돌릴 수 없어요",
};

/**
 * 속성 패널 (시안 04). 고른 가구의 이름·놓인 구역·종류·크기와 [90° 회전]·[삭제]를 보인다 (이름·크기 바꾸기는 T7-3·T26).
 * 데스크톱은 2D 평면도 오른쪽에 늘 있어(고른 가구가 없으면 안내) 가구를 골라도 2D 평면도 크기가 그대로이고,
 * 휴대폰은 2D 평면도에서 고른 가구가 있을 때만 화면 아래에 겹쳐 뜬다 (3D 미리보기의 보기 버튼을 가리지 않게).
 */
export function PropertyPanel() {
  const selection = useSelectedBox();
  const isPreview = useAppStore((state) => state.ui.view === "preview");
  const panelRef = useRef<HTMLElement>(null);
  const classNames = [styles.panel, !selection && styles.empty, isPreview && styles.onPreview];
  return (
    <aside
      ref={panelRef}
      tabIndex={-1} // 지운 뒤 초점을 둘 곳 (가구 버튼이 사라져서)
      className={classNames.filter(Boolean).join(" ")}
      aria-label="속성 패널"
    >
      {selection ? (
        <BoxProperties {...selection} onRemoved={() => panelRef.current?.focus()} />
      ) : (
        <p className={styles.guide}>가구를 누르면 여기서 종류를 바꾸거나 돌리고 지울 수 있어요</p>
      )}
    </aside>
  );
}

type BoxPropertiesProps = SelectedBox & { onRemoved: () => void };

/** 고른 가구 하나의 속성: 이름·놓인 구역·종류·크기와 돌리기·지우기. */
function BoxProperties(props: BoxPropertiesProps) {
  const { box, room, isOverlapping } = props;
  const changeBoxType = useAppStore((state) => state.changeBoxType);
  return (
    <>
      <div className={styles.field}>
        <p className={styles.label}>가구 이름</p>
        <h2 className={styles.name}>{box.name}</h2>
        <p className={styles.room}>
          <MapPin size={ROOM_ICON_SIZE} aria-hidden="true" />
          {room === null ? "구역 없음" : `구역 ${room}`}
        </p>
      </div>
      <FurnitureTypePicker value={box.type} onChange={(type) => changeBoxType(box.id, type)} />
      <BoxSize box={box} />
      {isOverlapping && <p className={styles.warning}>벽이나 다른 가구와 겹쳐 있어요</p>}
      <BoxActionButtons {...props} />
      <p className={styles.hint}>2D 평면도에서 R 키로 돌리고, Delete 키로 지울 수 있어요</p>
    </>
  );
}

/** 크기. 높이가 그 종류의 기본 높이와 다르면 기본 높이로 바꾸는 버튼을 단다 (종류를 바꿔도 크기는 그대로라서). */
function BoxSize({ box }: Pick<SelectedBox, "box">) {
  const applyTypeHeight = useAppStore((state) => state.applyTypeHeight);
  const typeHeight = FURNITURE_DEFAULTS[box.type].h;
  return (
    <div className={styles.field}>
      <p className={styles.label}>크기 (cm)</p>
      <div className={styles.sizeRow}>
        <p className={styles.value}>{formatSize(box.w, box.d, box.h)}</p>
        {box.h !== typeHeight && (
          <Button className={styles.typeHeight} onClick={() => applyTypeHeight(box.id)}>
            기본 높이 {typeHeight}cm로
          </Button>
        )}
      </div>
    </div>
  );
}

/** [90° 회전]·[삭제]. 돌린 모양이 바닥보다 길거나 벽·다른 가구에 걸리면 [90° 회전]을 막고 까닭을 알린다. */
function BoxActionButtons({ box, space, onRemoved }: BoxPropertiesProps) {
  const rotateBox = useAppStore((state) => state.rotateBox);
  const removeBox = useAppStore((state) => state.removeBox);
  const noticeId = useId();
  const rotation = rotatedBox(box, space);
  const canRotate = rotation.ok;
  return (
    <>
      <div className={styles.actions}>
        <Button
          icon={<RotateCw size={ICON_SIZE} aria-hidden="true" />}
          disabled={!canRotate}
          aria-describedby={canRotate ? undefined : noticeId}
          onClick={() => rotateBox(box.id)}
        >
          90° 회전
        </Button>
        <Button
          variant="danger"
          icon={<Trash2 size={ICON_SIZE} aria-hidden="true" />}
          onClick={() => {
            removeBox(box.id);
            onRemoved();
          }}
        >
          삭제
        </Button>
      </div>
      {!rotation.ok && (
        <p id={noticeId} className={styles.notice}>
          {ROTATE_BLOCK_MESSAGES[rotation.reason]}
        </p>
      )}
    </>
  );
}
