import { useState } from "react";
import type { Space } from "@/shared/types";
import type { SpaceNameError } from "@/store/useAppStore";
import { spaceNameMessage } from "../logic/spaceNameMessage";
import { NameForm } from "./NameForm";

const FIELD = { label: "공간 이름" };

type SpaceRenameFormProps = {
  space: Space;
  onSave: (name: string) => SpaceNameError | null; // 틀리면 그 까닭
  onCancel: () => void;
};

/** 공간 전환 목록 줄 안의 공간 이름 바꾸기 입력칸. 틀린 이름은 안내하고, 고쳐 쓰면 안내를 지운다. */
export function SpaceRenameForm({ space, onSave, onCancel }: SpaceRenameFormProps) {
  const [value, setValue] = useState(space.name);
  const [error, setError] = useState<SpaceNameError | null>(null);
  return (
    <NameForm
      field={FIELD}
      value={value}
      error={error ? spaceNameMessage(error) : undefined}
      onChange={(next) => {
        setValue(next);
        setError(null);
      }}
      onSubmit={() => setError(onSave(value))}
      onCancel={onCancel}
    />
  );
}
