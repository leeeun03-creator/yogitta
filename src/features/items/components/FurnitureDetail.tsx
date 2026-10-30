import {
  Archive,
  BedDouble,
  DoorClosed,
  LampDesk,
  Library,
  MapPin,
  Package,
  Plus,
  PanelTop,
  Table2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { SelectedBox } from "@/features/furniture";
import type { FurnitureType } from "@/shared/types";
import { Button, IconButton } from "@/shared/ui";
import { ItemAddForm } from "./ItemAddForm";
import { ItemBar } from "./ItemBar";
import styles from "./FurniturePanel.module.css";
import { SlotRowList } from "./SlotRowList";

const TILE_ICON_SIZE = 24;
const META_ICON_SIZE = 16;
const CLOSE_ICON_SIZE = 20;
const ADD_ICON_SIZE = 18;

/** 가구 종류마다 머리 아이콘 타일에 넣는 선 아이콘. */
const TYPE_ICONS: Record<FurnitureType, LucideIcon> = {
  cabinet: DoorClosed,
  drawer: Archive,
  shelf: Library,
  wall: PanelTop,
  desk: LampDesk,
  table: Table2,
  bed: BedDouble,
  box: Package,
};

type FurnitureDetailProps = { selection: SelectedBox; onClose: () => void };

/**
 * 가구 하나의 칸별 물건 (시안 08 가구 상세 패널): 머리(아이콘 타일·이름·구역과 물건 수·닫기)와 칸마다 행,
 * 누른 물건의 자세한 내용([빼기]), [+ 물건 넣기] 입력. 열리면 이름(제목)에 초점을 둬 어느 가구인지 먼저 읽게 한다.
 */
export function FurnitureDetail({ selection, onClose }: FurnitureDetailProps) {
  const { box } = selection;
  const [adding, setAdding] = useState<{ slot?: number } | null>(null); // 열린 물건 넣기 입력
  const [pickedId, setPickedId] = useState<string | null>(null);
  const picked = box.items.find((item) => item.id === pickedId);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), [box.id]);
  return (
    <>
      <DetailHead selection={selection} titleRef={titleRef} onClose={onClose} />
      <SlotRowList
        box={box}
        pickedId={pickedId}
        onPick={setPickedId}
        onAdd={(slot) => setAdding({ slot })}
      />
      {picked && <ItemBar box={box} item={picked} onClose={() => setPickedId(null)} />}
      {adding ? (
        <ItemAddForm box={box} slot={adding.slot} onClose={() => setAdding(null)} />
      ) : (
        <Button
          variant="primary"
          icon={<Plus size={ADD_ICON_SIZE} aria-hidden="true" />}
          onClick={() => setAdding({})}
        >
          물건 넣기
        </Button>
      )}
    </>
  );
}

type DetailHeadProps = Pick<FurnitureDetailProps, "selection" | "onClose"> & {
  titleRef: RefObject<HTMLHeadingElement | null>;
};

/** 머리: 종류 아이콘 타일 · 가구 이름 · 위치 핀 + "구역 안방 · 물건 3개" · 닫기 (시안 08). */
function DetailHead({ selection, titleRef, onClose }: DetailHeadProps) {
  const { box, room } = selection;
  const Icon = TYPE_ICONS[box.type];
  return (
    <header className={styles.head}>
      <span className={styles.tile} aria-hidden="true">
        <Icon size={TILE_ICON_SIZE} />
      </span>
      <div className={styles.headText}>
        <h2 ref={titleRef} tabIndex={-1} className={styles.title}>
          {box.name}
        </h2>
        <p className={styles.meta}>
          <MapPin size={META_ICON_SIZE} aria-hidden="true" />
          {room === null ? "구역 없음" : `구역 ${room}`} · 물건 {box.items.length}개
        </p>
      </div>
      <IconButton label="닫기" icon={<X size={CLOSE_ICON_SIZE} />} onClick={onClose} />
    </header>
  );
}
