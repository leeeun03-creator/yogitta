import { FACE_SHADE } from "@/shared/constants/colors3d";
import { shadeColor } from "@/shared/lib/shadeColor";

/**
 * 박스 6면의 색을 three.js 박스 면 순서(+x, -x, +y, -y, +z, -z)로 만든다.
 * 박스의 로컬 x가 긴 방향이므로 ±x는 끝면(옆면), ±z는 긴 면(앞면), +y는 윗면이다.
 * 아랫면은 바닥에 가려 보이지 않아 옆면과 같게 둔다.
 */
export function boxFaceColors(base: string): string[] {
  const top = shadeColor(base, FACE_SHADE.top);
  const front = shadeColor(base, FACE_SHADE.front);
  const side = shadeColor(base, FACE_SHADE.side);
  return [side, side, top, side, front, front];
}
