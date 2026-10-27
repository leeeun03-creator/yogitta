import type { DATA_VERSION } from "@/shared/constants/storage";
import type { Space } from "./space";

/** 저장되는 전체 데이터. 구조가 바뀌면 version을 올리고 변환 함수로 옛 데이터를 살린다. */
export type AppData = {
  version: typeof DATA_VERSION;
  spaces: Space[];
  currentSpaceId: string | null; // 공간이 하나도 없으면 null (첫 실행 화면)
};
