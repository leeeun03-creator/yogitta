import { CM_PER_M } from "@/shared/constants/units";

const CM_PER_DECIMETER = 10;

/** cm를 m 글자로 바꾼다. 10cm 단위면 소수 한 자리("4.5"), 아니면 두 자리("4.55"). */
export function formatMeters(cm: number): string {
  const digits = cm % CM_PER_DECIMETER === 0 ? 1 : 2;
  return (cm / CM_PER_M).toFixed(digits);
}
