import { describe, expect, it } from "vitest";
import { DATA_VERSION } from "@/shared/constants/storage";
import type { AppData } from "@/shared/types";
import { addSpace } from "./addSpace";

const EMPTY: AppData = { version: DATA_VERSION, spaces: [], currentSpaceId: null };
const FLOOR = { w: 600, h: 450 };

/** 테스트 중 원본이 바뀌면 바로 에러가 나도록 깊게 얼린다. */
function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

function addOrThrow(data: AppData, id: string, name: string): AppData {
  const result = addSpace(data, { id, name, floor: FLOOR });
  if (!result.ok) throw new Error(result.reason);
  return result.data;
}

describe("addSpace", () => {
  it("빈 데이터에 추가하면 그 공간이 현재 공간이 된다", () => {
    const data = addOrThrow(EMPTY, "space_1", "내 방");

    expect(data.spaces).toHaveLength(1);
    expect(data.spaces[0]).toEqual({
      id: "space_1",
      name: "내 방",
      floor: FLOOR,
      rooms: [],
      walls: [],
      boxes: [],
    });
    expect(data.currentSpaceId).toBe("space_1");
  });

  it("두 번째 공간을 추가하면 현재 공간이 새 공간으로 바뀐다", () => {
    const data = addOrThrow(addOrThrow(EMPTY, "space_1", "내 방"), "space_2", "형 방");

    expect(data.spaces.map((space) => space.name)).toEqual(["내 방", "형 방"]);
    expect(data.currentSpaceId).toBe("space_2");
  });

  it("이름 앞뒤 공백은 지우고 저장한다", () => {
    const data = addOrThrow(EMPTY, "space_1", "  내 방  ");
    expect(data.spaces[0]?.name).toBe("내 방");
  });

  it("같은 이름은 거부한다 (앞뒤 공백 무시)", () => {
    const data = addOrThrow(EMPTY, "space_1", "내 방");
    expect(addSpace(data, { id: "space_2", name: " 내 방 ", floor: FLOOR })).toEqual({
      ok: false,
      reason: "duplicateName",
    });
  });

  it("빈 이름과 공백만 있는 이름은 거부한다", () => {
    for (const name of ["", "   "]) {
      expect(addSpace(EMPTY, { id: "space_1", name, floor: FLOOR })).toEqual({
        ok: false,
        reason: "emptyName",
      });
    }
  });

  it("원본 데이터와 입력한 바닥 객체를 바꾸지 않는다", () => {
    const original = deepFreeze(addOrThrow(EMPTY, "space_1", "내 방"));
    const floor = deepFreeze({ w: 900, h: 600 });

    const result = addSpace(original, { id: "space_2", name: "형 방", floor });

    expect(result.ok).toBe(true);
    expect(original.spaces).toHaveLength(1);
    expect(original.currentSpaceId).toBe("space_1");
    if (result.ok) expect(result.data.spaces[1]?.floor).not.toBe(floor);
  });
});
