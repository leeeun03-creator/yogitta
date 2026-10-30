import { describe, expect, it } from "vitest";
import { isAppData } from "./isAppData";
import { SAMPLE_DATA } from "./sampleData";

const [space, ...otherSpaces] = SAMPLE_DATA.spaces;
const [box, ...otherBoxes] = space?.boxes ?? [];
const [wall] = space?.walls ?? [];
const [item] = box?.items ?? [];

/** 샘플 데이터에서 첫 공간의 필드만 바꾼 값. */
const withSpace = (patch: Record<string, unknown>): unknown => ({
  ...SAMPLE_DATA,
  spaces: [{ ...space, ...patch }, ...otherSpaces],
});
/** 샘플 데이터에서 첫 가구의 필드만 바꾼 값. */
const withBox = (patch: Record<string, unknown>) =>
  withSpace({ boxes: [{ ...box, ...patch }, ...otherBoxes] });

describe("isAppData", () => {
  it("이 앱의 저장 데이터면 true (JSON으로 오가도)", () => {
    expect(isAppData(JSON.parse(JSON.stringify(SAMPLE_DATA)))).toBe(true);
  });

  it("엣지: 객체가 아니면(null·배열·글자·숫자) false", () => {
    for (const value of [null, [], "여권", 1, undefined]) expect(isAppData(value)).toBe(false);
  });

  it("엣지: 버전이 다르면(옛 버전·새 버전·글자) false", () => {
    for (const version of [0, 2, "1"]) expect(isAppData({ ...SAMPLE_DATA, version })).toBe(false);
  });

  it("엣지: 필드가 빠지거나 타입이 틀리면 false", () => {
    const cases = [
      { ...SAMPLE_DATA, spaces: undefined },
      { ...SAMPLE_DATA, currentSpaceId: 3 },
      withSpace({ floor: undefined }),
      withSpace({ rooms: "침실" }),
      withSpace({ walls: [{ ...wall, tool: "pen" }] }),
      withSpace({ roomAnchors: { 침실: { x: "1", y: 2 } } }),
      withBox({ type: "sofa" }),
      withBox({ w: "110" }),
      withBox({ h: Number.NaN }),
      withBox({ items: null }),
      withBox({ items: [{ ...item, slot: "1" }] }),
    ];
    for (const value of cases) expect(isAppData(value)).toBe(false);
  });
});
