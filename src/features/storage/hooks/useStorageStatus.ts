import { create } from "zustand";

/** 저장 안내 종류: 저장된 값을 읽지 못해 샘플로 시작함(broken), 저장하지 못함(saveFailed). */
export type StorageNoticeKind = "broken" | "saveFailed";

type StorageStatus = {
  notice: StorageNoticeKind | null; // 화면 아래 안내 (닫을 수 있다)
  saveFailed: boolean; // 마지막 저장이 실패했는지
  showBroken: () => void;
  reportSave: (isSaved: boolean) => void;
  dismiss: () => void;
};

/**
 * 저장 상태와 안내 (앱 데이터가 아니라 화면 안내라 저장 기능 안에 둔다). 저장이 성공에서 실패로 바뀔 때만
 * 안내를 띄워, 닫은 뒤 바뀔 때마다 다시 뜨지 않게 한다. 다시 저장되면 실패 표시는 풀린다.
 */
export const useStorageStatus = create<StorageStatus>()((set) => ({
  notice: null,
  saveFailed: false,
  showBroken: () => set({ notice: "broken" }),
  reportSave: (isSaved) =>
    set((state) => ({
      saveFailed: !isSaved,
      notice: !isSaved && !state.saveFailed ? "saveFailed" : state.notice,
    })),
  dismiss: () => set({ notice: null }),
}));
