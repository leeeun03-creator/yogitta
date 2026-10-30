import { describe, expect, it } from "vitest";
import type { AppData } from "@/shared/types";
import { readSavedData } from "./readSavedData";

/** 벽·구역 선·구역·가구·물건이 다 든 공간 하나짜리 저장 데이터. */
const SAVED: AppData = {
  version: 1,
  currentSpaceId: "space_1",
  spaces: [
    {
      id: "space_1",
      name: "내 방",
      floor: { w: 600, h: 450 },
      rooms: ["침실"],
      roomLines: [
        {
          id: "roomLine_1",
          points: [
            { x: 300, y: 0 },
            { x: 300, y: 450 },
          ],
        },
      ],
      roomAnchors: { 침실: { x: 100, y: 100 } },
      walls: [
        {
          id: "wall_1",
          tool: "line",
          points: [
            { x: 0, y: 0 },
            { x: 600, y: 0 },
          ],
          closed: false,
        },
      ],
      boxes: [
        {
          id: "box_1",
          name: "서랍장 1",
          type: "drawer",
          x: 100,
          z: 100,
          rotation: 0,
          w: 80,
          d: 45,
          h: 90,
          elevation: 0,
          rows: 3,
          cols: 1,
          rowHeights: [30, 30, 30],
          items: [
            { id: "item_1", name: "여권", slot: 1, memo: "파란 파우치" },
            { id: "item_2", name: "양말" },
          ],
        },
      ],
    },
  ],
};

describe("readSavedData", () => {
  it("저장된 값을 그대로 읽는다", () => {
    expect(readSavedData(JSON.stringify(SAVED))).toEqual({ kind: "ok", data: SAVED });
  });

  it("엣지: 저장된 값이 없으면 none", () => {
    expect(readSavedData(null)).toEqual({ kind: "none" });
  });

  it("엣지: 공간이 없는 저장 값도 읽는다 (첫 실행 화면)", () => {
    const empty = { version: 1, spaces: [], currentSpaceId: null };
    expect(readSavedData(JSON.stringify(empty))).toEqual({ kind: "ok", data: empty });
  });

  it("엣지: 지금 공간이 목록에 없으면 맨 앞 공간으로 연다", () => {
    const lost = { ...SAVED, currentSpaceId: "space_9" };
    const result = readSavedData(JSON.stringify(lost));
    expect(result.kind === "ok" && result.data.currentSpaceId).toBe("space_1");
  });

  it("엣지: JSON이 아니거나 빈 글자면 broken", () => {
    expect(readSavedData("{여권")).toEqual({ kind: "broken" });
    expect(readSavedData("")).toEqual({ kind: "broken" });
  });
});
