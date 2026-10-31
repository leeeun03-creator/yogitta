import { useState } from "react";
import { isStackedOn } from "@/shared/lib/isStackedOn";
import { josa } from "@/shared/lib/josa";
import type { Box } from "@/shared/types";
import { ConfirmDialog, Segmented, SelectField } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import { removeBoxMessage } from "../logic/removeBoxMessage";
import styles from "./RemoveBoxDialog.module.css";

type StackedChoice = "lower" | "remove"; // 가구 위 가구를 바닥으로 내림 · 같이 지움
const STACKED_OPTIONS = [
  { value: "lower", label: "바닥으로 내리기" },
  { value: "remove", label: "위 가구도 지우기" },
] as const;

/**
 * 물건이 들었거나 위에 가구를 올린 가구를 지우려 할 때 묻는 삭제 확인 (PRD 인수 조건 "가구 삭제").
 * [같이 지우기]는 물건까지 지우고, 같은 공간에 다른 가구가 있으면 옮길 가구를 골라 [옮기고 지우기]로
 * 그 가구의 칸 없음에 옮긴 뒤 지운다. 가구 위 가구는 바닥으로 내릴지 같이 지울지 함께 고른다 (T29-4).
 */
export function RemoveBoxDialog() {
  const space = useAppStore((state) =>
    state.data.spaces.find((candidate) => candidate.id === state.data.currentSpaceId),
  );
  const askId = useAppStore((state) => state.ui.removeAsk);
  const box = space?.boxes.find((candidate) => candidate.id === askId);
  if (!space || !box) return null;
  return <RemoveBoxConfirm key={box.id} box={box} boxes={space.boxes} />;
}

type StackedFieldProps = {
  count: number;
  value: StackedChoice;
  onChange: (value: StackedChoice) => void;
};

/** 가구 위 가구를 어떻게 할지 고르기: 보이는 이름("가구 위 가구 2개") + [바닥으로 내리기 | 위 가구도 지우기]. */
function StackedField({ count, value, onChange }: StackedFieldProps) {
  const label = `가구 위 가구 ${count}개`;
  return (
    <div className={styles.stacked}>
      <span className={styles.stackedLabel} aria-hidden="true">
        {label}
      </span>
      <Segmented label={label} options={STACKED_OPTIONS} value={value} onChange={onChange} />
    </div>
  );
}

/** 지울 가구(box)와 현재 공간 가구들(boxes)로 묻는다. 옮길 가구는 처음에 맨 앞 가구이고, 같이 지울 가구 위 가구는 빠진다. */
function RemoveBoxConfirm({ box, boxes }: { box: Box; boxes: readonly Box[] }) {
  const removeBox = useAppStore((state) => state.removeBox);
  const cancelRemoveBox = useAppStore((state) => state.cancelRemoveBox);
  const isOnTop = (other: Box) => isStackedOn(boxes, other.id, box.id);
  const stackedCount = boxes.filter(isOnTop).length;
  const [choice, setChoice] = useState<StackedChoice>("lower");
  const withStacked = choice === "remove";
  const others = boxes.filter((other) => other !== box && !(withStacked && isOnTop(other)));
  const [picked, setPicked] = useState(others[0]?.id ?? "");
  const moveTo = others.some((other) => other.id === picked) ? picked : (others[0]?.id ?? "");
  const count = box.items.length;
  const alternative = count > 0 &&
    others.length > 0 && {
      field: (
        <SelectField
          label="옮길 가구"
          value={moveTo}
          options={others.map((other) => ({ value: other.id, label: other.name }))}
          onChange={setPicked}
        />
      ),
      label: "옮기고 지우기",
      onConfirm: () => removeBox(box.id, moveTo, withStacked),
    };
  return (
    <ConfirmDialog
      title={`${box.name}${josa(box.name, "을/를")} 지울까요?`}
      message={removeBoxMessage({ itemCount: count, stackedCount, canMove: Boolean(alternative) })}
      choice={
        stackedCount > 0 && (
          <StackedField count={stackedCount} value={choice} onChange={setChoice} />
        )
      }
      confirmLabel={count > 0 ? "같이 지우기" : "지우기"}
      onConfirm={() => removeBox(box.id, undefined, withStacked)}
      onCancel={cancelRemoveBox}
      alternative={alternative || undefined}
    />
  );
}
