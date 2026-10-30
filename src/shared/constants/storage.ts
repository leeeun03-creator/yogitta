/** 데이터 버전. 저장 구조가 바뀌면 올리고 변환 함수를 추가한다. */
export const DATA_VERSION = 1;

/** localStorage 키. 같은 github.io 계정의 다른 앱과 겹치지 않게 앱 이름을 붙인다. */
export const STORAGE_KEY = "yogitta:v1";

/** 읽지 못한(깨진·다른 버전) 저장 값을 덮어쓰지 않고 옮겨 두는 키. */
export const BROKEN_BACKUP_KEY = "yogitta:v1:broken";
