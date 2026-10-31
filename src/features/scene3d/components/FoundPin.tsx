import { Html, Line } from "@react-three/drei";
import { FOUND_COLORS } from "@/shared/constants/colors3d";
import { BOX_LABEL_Z_RANGE, PIN_RISE_CM } from "@/shared/constants/scene";
import type { FoundSpot } from "../logic/foundSpot";
import styles from "./BoxMeshes.module.css";

type Xyz = [number, number, number];
const LINE_PX = 2;

/**
 * 칸 위 핀 (yogitta-design 5장 위치 표시 4단계): 핀이 시작하는 점(anchor)에서 위로 강조색 선, 그 끝에 둥근 라벨
 * "여권 / 화장대 서랍장 · 2번째 서랍". 고른 결과는 강조색 바탕이고, 여러 곳을 찾으면 나머지는 옅은 바탕이다.
 */
export function FoundPin({ spot, anchor }: { spot: FoundSpot; anchor: Xyz }) {
  const [x, y, z] = anchor;
  const tip: Xyz = [x, y + PIN_RISE_CM, z];
  return (
    <>
      <Line points={[anchor, tip]} color={FOUND_COLORS.pin} lineWidth={LINE_PX} />
      <Html position={tip} center zIndexRange={BOX_LABEL_Z_RANGE} pointerEvents="none">
        <span data-testid="pin" data-picked={spot.isPicked || undefined} className={styles.pin}>
          <strong className={styles.pinName}>{spot.itemName}</strong>
          <span className={styles.pinPlace}>{spot.place}</span>
        </span>
      </Html>
    </>
  );
}
