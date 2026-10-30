import { DATA_VERSION } from "@/shared/constants/storage";
import { FURNITURE_TYPES, WALL_TOOLS, type AppData } from "@/shared/types";

type Fields = Record<string, unknown>;

const isRecord = (value: unknown): value is Fields =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isNumber = (value: unknown) => typeof value === "number" && Number.isFinite(value);
const isString = (value: unknown) => typeof value === "string";
const isListOf = (value: unknown, check: (each: unknown) => boolean) =>
  Array.isArray(value) && value.every(check);
const isOptional = (value: unknown, check: (each: unknown) => boolean) =>
  value === undefined || check(value);
const hasNumbers = (value: Fields, keys: readonly string[]) =>
  keys.every((key) => isNumber(value[key]));

const BOX_NUMBERS = ["x", "z", "rotation", "w", "d", "h", "elevation", "rows", "cols"] as const;

const isPoint = (value: unknown) => isRecord(value) && hasNumbers(value, ["x", "y"]);

const isItem = (value: unknown) =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.name) &&
  isOptional(value.slot, isNumber) &&
  isOptional(value.memo, isString);

const isBox = (value: unknown) =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.name) &&
  FURNITURE_TYPES.some((type) => type === value.type) &&
  hasNumbers(value, BOX_NUMBERS) &&
  isOptional(value.parentId, isString) &&
  isOptional(value.rowHeights, (heights) => isListOf(heights, isNumber)) &&
  isListOf(value.items, isItem);

const isWall = (value: unknown) =>
  isRecord(value) &&
  isString(value.id) &&
  WALL_TOOLS.some((tool) => tool === value.tool) &&
  isListOf(value.points, isPoint) &&
  typeof value.closed === "boolean";

const isRoomLine = (value: unknown) =>
  isRecord(value) && isString(value.id) && isListOf(value.points, isPoint);

const isAnchors = (value: unknown) => isRecord(value) && Object.values(value).every(isPoint);

const isSpace = (value: unknown) =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.name) &&
  isRecord(value.floor) &&
  hasNumbers(value.floor, ["w", "h"]) &&
  isListOf(value.rooms, isString) &&
  isOptional(value.roomLines, (lines) => isListOf(lines, isRoomLine)) &&
  isOptional(value.roomAnchors, isAnchors) &&
  isListOf(value.walls, isWall) &&
  isListOf(value.boxes, isBox);

/**
 * localStorage에서 읽은 값이 이 앱의 저장 데이터 모양(PRD 부록 B)인지 본다. 버전이 지금과 같아야 하고,
 * 공간·벽·구역 선·가구·물건의 필드 타입을 모두 검사한다. 통과해야 AppData로 쓴다.
 */
export function isAppData(value: unknown): value is AppData {
  return (
    isRecord(value) &&
    value.version === DATA_VERSION &&
    isListOf(value.spaces, isSpace) &&
    (value.currentSpaceId === null || isString(value.currentSpaceId))
  );
}
