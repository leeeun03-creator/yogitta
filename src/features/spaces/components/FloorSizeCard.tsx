import type { Ref } from "react";
import { Button, TextField } from "@/shared/ui";
import { useFloorSizeForm } from "../hooks/useFloorSizeForm";
import type { MetersError } from "../logic/parseMeters";
import type { NameError } from "../logic/validateNewSpace";
import { FloorPresets } from "./FloorPresets";
import styles from "./FloorSizeCard.module.css";

const NAME_MESSAGES: Record<NameError, string> = {
  empty: "공간 이름을 적어 주세요",
  duplicate: "이미 같은 이름의 공간이 있어요",
};
const METERS_MESSAGES: Record<MetersError, string> = {
  empty: "크기를 적어 주세요",
  notNumber: "숫자로 적어 주세요 (예: 6.0)",
  tooSmall: "1m 이상으로 적어 주세요",
  tooLarge: "30m 이하로 적어 주세요",
};

type FloorSizeCardProps = { nameInputRef?: Ref<HTMLInputElement> };

/** 새 공간의 이름과 바닥 크기를 정하는 카드 (시안 03 오른쪽). */
export function FloorSizeCard({ nameInputRef }: FloorSizeCardProps) {
  const { fields, setters, errors, canSubmit, selectFloor, submit } = useFloorSizeForm();

  return (
    <section className={styles.card} aria-labelledby="floor-size-title">
      <form className={styles.form} onSubmit={submit} noValidate>
        <CardHeading />
        <TextField
          ref={nameInputRef}
          label="공간 이름"
          value={fields.name}
          onChange={setters.setName}
          error={errors.name && NAME_MESSAGES[errors.name]}
        />
        <div className={styles.sizeRow}>
          <TextField
            label="가로 (m)"
            inputMode="decimal"
            value={fields.width}
            onChange={setters.setWidth}
            error={errors.width && METERS_MESSAGES[errors.width]}
          />
          <TextField
            label="세로 (m)"
            inputMode="decimal"
            value={fields.depth}
            onChange={setters.setDepth}
            error={errors.depth && METERS_MESSAGES[errors.depth]}
          />
        </div>
        <FloorPresets width={fields.width} depth={fields.depth} onSelect={selectFloor} />
        <Button type="submit" variant="primary" className={styles.submit} disabled={!canSubmit}>
          벽 그리러 가기
        </Button>
      </form>
    </section>
  );
}

function CardHeading() {
  return (
    <div className={styles.heading}>
      <span className={styles.step}>1단계 / 새 공간</span>
      <h2 id="floor-size-title" className={styles.title}>
        바닥 크기를 정해요
      </h2>
      <p className={styles.description}>이 크기가 그대로 3D 바닥이 돼요. 나중에 바꿀 수 있어요.</p>
    </div>
  );
}
