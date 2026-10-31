---
name: yogitta-code-safety
description: 요깃따에서 빈 상태·저장 실패·깨진 데이터·입력 범위를 처리하거나, npm 스크립트·ESLint·Vitest·Playwright 설정을 다룰 때 읽는다. 보통 yogitta-code 목차에서 부른다.
---

# 요깃따 엣지 케이스와 확인 장치

`yogitta-code` 스킬의 9~10장이다 (장 번호는 그대로 둔다). 목차와 늘 지킬 것은 `yogitta-code`에 있다.

## 9. 엣지 케이스 · 에러 처리

기능을 만들 때 아래를 **같이** 처리한다. 나중으로 미루지 않는다.

| 상황 | 처리 |
|---|---|
| 빈 상태 | 공간 없음, 가구 없음, 칸 비어 있음, 검색 결과 없음 → 안내 문구 (`yogitta-design` 8장) |
| 저장 실패 | localStorage 용량 초과·비활성 → 앱은 계속 동작 + 안내 |
| 깨진 데이터 | 불러온 JSON 검증 실패 → 샘플로 시작 + 안내, 원본은 덮어쓰지 않음 |
| 삭제 | 물건 든 가구·칸 줄이기 → 확인 후 처리 (PRD 7장) |
| 사용자 입력 | 크기·높이는 범위 검사 (0 이하, 바닥보다 큼 등) |

- `try/catch`는 localStorage, JSON.parse, 파일 불러오기에만
- 에러를 조용히 삼키지 않는다: 최소 `console.warn` + 사용자 안내

## 10. 확인 장치

`package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run",
    "check": "npm run typecheck && npm run lint && npm run test && npm run build"
  }
}
```

| 도구 | 설정 |
|---|---|
| ESLint | typescript-eslint 권장, react-hooks, `no-explicit-any: error`, `import/no-cycle`, feature 내부 직접 import 금지(`no-restricted-imports`로 `@/features/*/*` 막기) |
| Prettier | 세미콜론, 큰따옴표, 폭 100, trailing comma |
| Vitest | 순수 함수만 (코드 테스트) |
| Playwright | 브라우저 실제 테스트 (로컬은 바뀐 기능 spec만, 전체는 CI), 규칙은 `yogitta-test` |

### 반드시 테스트할 순수 함수

| 함수 | 확인할 것 |
|---|---|
| 은/는 선택 | 받침 있음·없음·영어·숫자 |
| 검색 매칭 | 부분 일치, 띄어쓰기 무시, 메모 검색, 결과 없음 |
| 위치 문장 | 가구 종류별 칸 표현, 칸 없음, 가구 위 가구 |
| 선분 → 벽 | 길이·회전·중점, y → z |
| 칸 높이 | 균등 분배, 합계 초과 감지 |
| 저장 데이터 검증·버전 변환 | 정상, 깨짐, 옛 버전 |
