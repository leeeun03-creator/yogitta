import {
  Archive,
  BedDouble,
  DoorClosed,
  LampDesk,
  Library,
  MapPin,
  Package,
  PanelTop,
  Table2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type { SelectedBox } from "@/features/furniture";
import type { FurnitureType } from "@/shared/types";
import { IconButton } from "@/shared/ui";
import { slotRows } from "../logic/slotRows";
import styles from "./FurniturePanel.module.css";

const TILE_ICON_SIZE = 24;
const META_ICON_SIZE = 16;
const CLOSE_ICON_SIZE = 20;

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
 * 가구 하나의 칸별 물건 (시안 08 가구 상세 패널): 머리(아이콘 타일·이름·구역과 물건 수·닫기)와 칸마다 행.
 * 열리면 이름(제목)에 초점을 둬, 화면 읽기 프로그램이 어느 가구인지 먼저 읽게 한다.
 */
export function FurnitureDetail({ selection, onClose }: FurnitureDetailProps) {
  const { box, room } = selection;
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), [box.id]);
  const Icon = TYPE_ICONS[box.type];
  return (
    <>
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
      <SlotRowList box={box} />
    </>
  );
}

/** 칸마다 행: 칸 이름 + 물건 칩(넣은 순서), 빈 칸은 "비어 있어요". 칸 없음에 물건이 있으면 맨 아래 행. */
function SlotRowList({ box }: Pick<SelectedBox, "box">) {
  return (
    <ul className={styles.rows} aria-label="칸별 물건">
      {slotRows(box).map((row) => (
        <li key={row.key} className={styles.row}>
          <span className={styles.slotName}>{row.label}</span>
          {row.items.length === 0 ? (
            <span className={styles.empty}>비어 있어요</span>
          ) : (
            <ul className={styles.chips} aria-label={`${row.label} 물건`}>
              {row.items.map((item) => (
                <li key={item.id} className={styles.chip}>
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
