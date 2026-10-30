import { describe, expect, it } from "vitest";
import { createBoxTestData } from "./boxFixtures";
import { renameBox } from "./renameBox";
import { deepFreeze } from "./spaceFixtures";

describe("renameBox", () => {
  it("그 가구 이름을 앞뒤 공백을 지워 바꾼다", () => {
    const result = renameBox(createBoxTestData([{}, {}]), "box_2", "  화장대 서랍장 ");
    if (!result.ok) throw new Error("이름이 바뀌어야 한다");
    expect(result.data.spaces[0]?.boxes.map((box) => box.name)).toEqual([
      "보관함 1",
      "화장대 서랍장",
    ]);
  });

  it("같은 공간의 다른 가구와 같은 이름(띄어쓰기만 다른 것 포함)은 막는다", () => {
    const original = createBoxTestData([{ name: "화장대 서랍장" }, {}]);
    expect(renameBox(original, "box_2", "화장대서랍장")).toEqual({
      ok: false,
      reason: "duplicateName",
    });
  });

  it("엣지: 빈 이름·너무 긴 이름은 막는다", () => {
    const original = createBoxTestData([{}]);
    expect(renameBox(original, "box_1", "  ")).toEqual({ ok: false, reason: "emptyName" });
    expect(renameBox(original, "box_1", "가".repeat(16))).toEqual({
      ok: false,
      reason: "tooLong",
    });
  });

  it("엣지: 자기 이름 그대로·없는 가구면 원본 그대로다 (되돌리기 기록이 안 남는다)", () => {
    const original = createBoxTestData([{}]);
    const same = renameBox(original, "box_1", " 보관함 1 ");
    const missing = renameBox(original, "box_9", "책상");
    expect(same.ok && same.data).toBe(original);
    expect(missing.ok && missing.data).toBe(original);
  });

  it("엣지: 다른 공간에 같은 이름이 있어도 된다", () => {
    const base = createBoxTestData([{}]);
    const [mine, other] = base.spaces;
    const first = mine?.boxes[0];
    if (!mine || !other || !first) throw new Error("테스트 공간이 없다");
    const original = { ...base, spaces: [mine, { ...other, boxes: [{ ...first, name: "책상" }] }] };
    expect(renameBox(original, "box_1", "책상").ok).toBe(true);
  });

  it("원본 데이터를 바꾸지 않는다", () => {
    const original = deepFreeze(createBoxTestData([{}]));
    const result = renameBox(original, "box_1", "책상");
    expect(result.ok && result.data.spaces[0]?.boxes[0]?.name).toBe("책상");
  });
});
