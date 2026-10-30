import {
  BOX_LABEL_MIN_PX,
  BOX_LABEL_PADDING_PX,
  DIMENSION_FONT_PX,
  HANGUL_CHAR_EM,
  LENGTH_LABEL_CHAR_EM,
  SPACE_CHAR_EM,
} from "@/shared/constants/floorPlan";

const HANGUL = /[가-힣]/;

/** 글자 폭 어림 (글자 크기 배수). DOM을 재지 않는 순수 함수라서 글자 종류로 어림한다. */
function textWidthEm(text: string): number {
  return [...text].reduce((sum, char) => {
    if (HANGUL.test(char)) return sum + HANGUL_CHAR_EM;
    return sum + (char === " " ? SPACE_CHAR_EM : LENGTH_LABEL_CHAR_EM);
  }, 0);
}

type LabelSpan = { along: number; across: number }; // 이름이 놓이는 방향 길이·그 옆 방향 길이 (cm)

/**
 * 가구 이름 글자 크기(cm). 화면에서 14px이 기본이고, 가구 안에 안 들어가면 줄이되
 * 12px(최소 글자 크기)보다 작아져야 들어가면 null(이름을 숨긴다).
 */
export function boxLabelFont(name: string, span: LabelSpan, cmPerPx: number): number | null {
  const padding = BOX_LABEL_PADDING_PX * cmPerPx;
  const fit = Math.min((span.along - padding * 2) / textWidthEm(name), span.across - padding * 2);
  const size = Math.min(fit, DIMENSION_FONT_PX * cmPerPx);
  return size >= BOX_LABEL_MIN_PX * cmPerPx ? size : null;
}
