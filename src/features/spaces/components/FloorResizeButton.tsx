import { useState } from "react";
import { formatMeters } from "@/shared/lib/formatMeters";
import type { Floor } from "@/shared/types";
import { Button } from "@/shared/ui";
import styles from "./FloorResizeButton.module.css";
import { FloorResizeDialog } from "./FloorResizeDialog";

/** 2D 평면도 아래 [바닥 6.0 × 4.5 m] (시안 04). 누르면 바닥 크기 바꾸기 대화상자가 열린다. */
export function FloorResizeButton({ floor }: { floor: Floor }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <span className={styles.word}>바닥 </span>
        {formatMeters(floor.w)} × {formatMeters(floor.h)} m
      </Button>
      {isOpen && <FloorResizeDialog floor={floor} onClose={() => setOpen(false)} />}
    </>
  );
}
