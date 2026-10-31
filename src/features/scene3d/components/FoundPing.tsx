import { Line } from "@react-three/drei";
import { FOUND_COLORS } from "@/shared/constants/colors3d";
import { PING, FOUND_LINE_PX } from "@/shared/constants/scene";
import { circlePoints } from "../logic/circlePoints";

/** 찾은 가구 바닥의 점선 원 2개 (위치 표시 3단계): 가구를 두르는 안쪽 원은 진하게, 바깥 원은 반투명. */
export function FoundPing({ radius, floorY }: { radius: number; floorY: number }) {
  const circles = [
    { r: radius, opacity: 1 },
    { r: radius + PING.gap, opacity: PING.outerOpacity },
  ];
  return circles.map(({ r, opacity }) => (
    <Line
      key={r}
      points={circlePoints(r, floorY)}
      color={FOUND_COLORS.pin}
      lineWidth={FOUND_LINE_PX}
      dashed
      dashSize={PING.dash}
      gapSize={PING.space}
      transparent={opacity < 1}
      opacity={opacity}
    />
  ));
}
