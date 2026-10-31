import { describe, expect, it } from "vitest";
import type { Box, FurnitureType, Item } from "@/shared/types";
import { buildLocationSentence } from "./buildLocationSentence";

const box = (type: FurnitureType, name: string, rows = 1, cols = 1): Box => ({
  id: "box_1",
  name,
  type,
  x: 0,
  z: 0,
  rotation: 0,
  w: 80,
  d: 45,
  h: 90,
  elevation: 0,
  rows,
  cols,
  items: [],
});
const sentence = (item: Item, at: Box, spaceName = "내 방") =>
  buildLocationSentence({ item, box: at, spaceName })
    .map((part) => part.text)
    .join("");

describe("buildLocationSentence", () => {
  it("PRD 인수 조건 문장: 여권은 내 방의 화장대 서랍장 위에서 2번째 서랍에 보관 중이에요.", () => {
    expect(sentence({ id: "i", name: "여권", slot: 1 }, box("drawer", "화장대 서랍장", 3))).toBe(
      "여권은 내 방의 화장대 서랍장 위에서 2번째 서랍에 보관 중이에요.",
    );
  });

  it("물건·공간·가구 이름은 굵게 보일 조각으로 나눈다", () => {
    const parts = buildLocationSentence({
      item: { id: "i", name: "여권", slot: 0 },
      box: box("box", "보관함"),
      spaceName: "형 방",
    });
    expect(parts.filter((part) => part.mark).map((part) => [part.mark, part.text])).toEqual([
      ["item", "여권"],
      ["space", "형 방"],
      ["box", "보관함"],
    ]);
  });

  it("가구 종류마다 칸 표현이 다르다", () => {
    const at = (type: FurnitureType, slot: number, rows = 4, cols = 1) =>
      sentence({ id: "i", name: "충전기", slot }, box(type, "가구", rows, cols));
    expect(at("shelf", 2)).toBe("충전기는 내 방의 가구 위에서 3번째 선반에 보관 중이에요.");
    expect(at("wall", 0, 2)).toBe("충전기는 내 방의 가구 위에서 1번째 칸에 보관 중이에요.");
    expect(at("cabinet", 1, 4, 2)).toBe(
      "충전기는 내 방의 가구 오른쪽 문 위에서 1번째 칸에 보관 중이에요.",
    );
    expect(at("cabinet", 4, 4, 2)).toBe(
      "충전기는 내 방의 가구 왼쪽 문 위에서 3번째 칸에 보관 중이에요.",
    );
    expect(at("desk", 0, 1)).toBe("충전기는 내 방의 가구 위에 보관 중이에요.");
    expect(at("table", 0, 1)).toBe("충전기는 내 방의 가구 위에 보관 중이에요.");
    expect(at("bed", 1, 2)).toBe("충전기는 내 방의 가구 밑에 보관 중이에요.");
    expect(at("box", 0, 1)).toBe("충전기는 내 방의 가구 안에 보관 중이에요.");
  });

  it("엣지: 칸 없음(또는 칸 수 밖)이면 가구 이름 뒤에 '안'", () => {
    expect(sentence({ id: "i", name: "선글라스" }, box("drawer", "화장대 서랍장", 3))).toBe(
      "선글라스는 내 방의 화장대 서랍장 안에 보관 중이에요.",
    );
    expect(sentence({ id: "i", name: "양말", slot: 5 }, box("drawer", "서랍장", 3))).toBe(
      "양말은 내 방의 서랍장 안에 보관 중이에요.",
    );
  });

  it("엣지: 은/는은 받침으로 고른다 (숫자·영어 끝도)", () => {
    const at = box("box", "보관함");
    expect(sentence({ id: "i", name: "가위" }, at)).toMatch(/^가위는 /);
    expect(sentence({ id: "i", name: "충전기 3" }, at)).toMatch(/^충전기 3은 /);
    expect(sentence({ id: "i", name: "USB" }, at)).toMatch(/^USB는 /);
  });
});
