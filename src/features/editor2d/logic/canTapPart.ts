import type { DrawingTool } from "@/store/useAppStore";

/** 구획을 눌러 구역을 만들 수 있는 도구: 선택, 그리고 구역 선을 긋자마자 바로 누를 수 있게 구역 선. */
export function canTapPart(tool: DrawingTool): boolean {
  return tool === "select" || tool === "roomLine";
}
