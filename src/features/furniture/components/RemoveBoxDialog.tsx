import { useState } from "react";
import { josa } from "@/shared/lib/josa";
import type { Box } from "@/shared/types";
import { ConfirmDialog, SelectField } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";

/**
 * 물건이 든 가구를 지우려 할 때 묻는 삭제 확인 (PRD 인수 조건 "가구 삭제"). [같이 지우기]는 물건까지 지우고,
 * 같은 공간에 다른 가구가 있으면 옮길 가구를 골라 [옮기고 지우기]로 그 가구의 칸 없음에 옮긴 뒤 지운다.
 */
export function RemoveBoxDialog() {
  const space = useAppStore((state) =>
    state.data.spaces.find((candidate) => candidate.id === state.data.currentSpaceId),
  );
  const askId = useAppStore((state) => state.ui.removeAsk);
  const box = space?.boxes.find((candidate) => candidate.id === askId);
  if (!space || !box) return null;
  const others = space.boxes.filter((candidate) => candidate !== box);
  return <RemoveBoxConfirm key={box.id} box={box} others={others} />;
}

/** 지울 가구(box)와 옮길 수 있는 가구(others)로 묻는다. 옮길 가구는 처음에 맨 앞 가구다. */
function RemoveBoxConfirm({ box, others }: { box: Box; others: readonly Box[] }) {
  const removeBox = useAppStore((state) => state.removeBox);
  const cancelRemoveBox = useAppStore((state) => state.cancelRemoveBox);
  const [moveTo, setMoveTo] = useState(others[0]?.id ?? "");
  const count = box.items.length;
  const alternative = others.length > 0 && {
    field: (
      <SelectField
        label="옮길 가구"
        value={moveTo}
        options={others.map((other) => ({ value: other.id, label: other.name }))}
        onChange={setMoveTo}
      />
    ),
    label: "옮기고 지우기",
    onConfirm: () => removeBox(box.id, moveTo),
  };
  return (
    <ConfirmDialog
      title={`${box.name}${josa(box.name, "을/를")} 지울까요?`}
      message={
        alternative
          ? `물건 ${count}개가 들어 있어요. 다른 가구의 칸 없음으로 옮기거나 같이 지울 수 있어요`
          : `물건 ${count}개가 들어 있어요. 가구를 지우면 물건도 같이 지워져요`
      }
      confirmLabel="같이 지우기"
      onConfirm={() => removeBox(box.id)}
      onCancel={cancelRemoveBox}
      alternative={alternative || undefined}
    />
  );
}
