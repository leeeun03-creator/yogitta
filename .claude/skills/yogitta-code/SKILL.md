---
name: yogitta-code
description: 요깃따 코드 작성 규칙. 폴더 구조, 의존 방향, 로직·상태·화면 분리, 이름·크기·타입 규칙, 작업 흐름(계획 → 작성 → 자가 점검 → npm run check → 커밋)과 정리 점검. 코드를 새로 쓰거나 고치기 전에 항상 먼저 읽는다.
---

# 요깃따 코드 작성 규칙

목표: 프로젝트가 커져도 **어디에 뭐가 있는지 바로 알고**, 한 기능을 고쳐도 **다른 기능이 안 깨지는** 코드.
기술 스택: Vite + React + TypeScript, React Three Fiber + drei, zustand, Vitest.

함께 쓰는 스킬
- 색·컴포넌트 모양 → `yogitta-design`
- 커밋 메시지·타이밍 → `commit-convention`

---

## 1. 폴더 구조

**기능(feature) 단위**로 나눈다. 파일 종류(utils, components)로 전체를 나누지 않는다.

```
src/
├─ main.tsx              앱 시작
├─ app/                  화면 조립, 모드 전환(메인 ↔ 편집), 전역 레이아웃
│  ├─ App.tsx
│  └─ screens/           MainScreen, EditScreen, EmptyScreen
├─ features/
│  ├─ spaces/            공간 만들기·전환·삭제, 공간 드롭다운
│  ├─ editor2d/          평면도 캔버스, 벽 도구, 스냅, 선택 핸들
│  ├─ scene3d/           3D 장면, 벽·바닥 메시, 카메라, 클릭 판정
│  ├─ furniture/         가구 8종 모양, 칸, 가구 위 가구, 속성 패널
│  ├─ items/             물건 등록·이동, 가구 상세 패널
│  ├─ search/            검색 매칭, 위치 문장, 결과 카드, 3D 위치 표시
│  └─ storage/           localStorage, 샘플 데이터, JSON 백업, 버전 변환
├─ store/                zustand store (앱 데이터 + 액션 + Undo)
├─ shared/
│  ├─ ui/                Button, Chip, SearchBar, Segmented, Panel …
│  ├─ lib/               도메인 없는 순수 함수 (은/는, 거리 계산, id 생성)
│  ├─ constants/         단위·크기·색 상수
│  └─ types/             Space, Wall, Box, Item, AppData
└─ styles/               tokens.css (yogitta-design 1장)
```

### feature 폴더 안 모양

```
features/search/
├─ index.ts              공개 창구 — 밖에서는 이것만 import
├─ components/           ResultCard.tsx, SearchBar 연결부 …
├─ logic/                matchItems.ts, buildLocationSentence.ts (순수 함수)
├─ logic/*.test.ts       순수 함수 테스트
└─ hooks/                useSearch.ts (store와 logic 연결)
```

- 필요 없는 하위 폴더는 만들지 않는다 (빈 폴더 금지)
- 새 feature가 필요하면 먼저 사용자에게 이름과 역할을 알리고 만든다

---

## 2. 의존 방향 (누가 누구를 import 해도 되나)

```
shared  ←  store  ←  features  ←  app
```

| 규칙 | 이유 |
|---|---|
| `shared`는 `store`·`features`·`app`을 import하지 않는다 | 공통 부품이 특정 기능에 묶이지 않게 |
| `features/A`는 `features/B`를 **`index.ts`로만** import (`features/search/logic/x` 직접 import 금지) | 내부를 바꿔도 다른 기능이 안 깨지게 |
| 순환 import 금지 (A → B → A) | 원인 찾기 힘든 오류 방지 |
| 3D·2D 컴포넌트는 store를 **읽고 그리기만**, 데이터 변경은 store 액션으로만 | 화면과 데이터가 엉키지 않게 |

공개 창구 예시:

```ts
// features/search/index.ts
export { ResultCard } from "./components/ResultCard";
export { useSearch } from "./hooks/useSearch";
export { buildLocationSentence } from "./logic/buildLocationSentence";
```

import 경로는 별칭 `@/`를 쓴다 (`@/features/search`, `@/shared/ui`). `../../../` 금지.

---

## 3. 로직 · 상태 · 화면 분리

| 종류 | 어디 | 규칙 |
|---|---|---|
| **순수 함수** | `shared/lib`, `features/*/logic` | 입력 → 출력만. React·store·DOM·localStorage 사용 금지. 테스트 대상 |
| **상태** | `store/` | 앱 데이터는 store 하나. 컴포넌트 안 `useState`는 열림/닫힘 같은 화면 전용 값만 |
| **훅** | `features/*/hooks` | store와 logic을 이어 컴포넌트에 넘겨줌 |
| **컴포넌트** | `components/` | 그리기 + 이벤트 연결만. 계산이 3줄 넘으면 logic으로 뺀다 |

### store 규칙 (zustand)

```ts
// store/useAppStore.ts
type AppState = {
  data: AppData;                 // 저장 대상 (spaces, currentSpaceId)
  ui: { selectedBoxId?: string; mode: "main" | "edit" };  // 저장 안 함
  // 액션: 동사로 시작, 데이터 변경은 여기서만
  addBox: (box: Box) => void;
  moveItem: (itemId: string, toBoxId: string, slot?: number) => void;
  undo: () => void;
  redo: () => void;
};
```

- 데이터 변경은 **불변 방식**(새 객체 반환). 직접 `push`·대입 금지
- `data`가 바뀌면 storage feature가 저장 (컴포넌트가 직접 localStorage 호출 금지)
- Undo/Redo는 `data` 스냅샷 기록 방식, 최대 50단계
- 컴포넌트에서는 필요한 값만 골라 구독: `useAppStore(s => s.ui.selectedBoxId)`

---

## 4. 이름 규칙

| 대상 | 형식 | 예 |
|---|---|---|
| 컴포넌트 파일·이름 | PascalCase | `ResultCard.tsx`, `FurniturePanel` |
| 훅 | `use` + PascalCase | `useSearch`, `useSelectedBox` |
| 함수 | camelCase, 동사로 시작 | `buildLocationSentence`, `segmentToWall` |
| 불리언 | `is` / `has` / `can` | `isOpen`, `hasItems` |
| 상수 | UPPER_SNAKE_CASE | `WALL_HEIGHT_CM` |
| 타입 | PascalCase, 접두사 없음 | `Box`, `FurnitureType` (`IBox` 금지) |
| 이벤트 핸들러 | `handle` + 이벤트 / props는 `on` + 이벤트 | `handleClick`, `onSelect` |
| 테스트 | 원본 이름 + `.test.ts` | `josa.test.ts` |

- 파일 이름 = 그 파일이 export하는 대표 이름
- 축약 금지 (`btn`, `itm`, `calc` ✗ → `button`, `item`, `calculate`)

---

## 5. 크기 규칙

| 대상 | 기준 | 넘으면 |
|---|---|---|
| 파일 | 200줄 | 하위 컴포넌트 / logic으로 분리 |
| 함수 | 40줄 | 단계별 작은 함수로 분리 |
| 컴포넌트 props | 7개 | 객체로 묶거나 컴포넌트를 나눔 |
| JSX 중첩 | 4단계 | 안쪽을 컴포넌트로 |
| 한 파일 export | 대표 1개 (+ 타입) | 파일 분리 |

---

## 6. 타입 규칙

- `tsconfig`는 `strict: true`, `noUncheckedIndexedAccess: true`
- `any` 금지. 정말 모르면 `unknown` 후 좁히기
- 앱 데이터 타입은 `shared/types`에만 정의 (기획서·PRD 부록 B와 같게)
- 단위가 있는 숫자는 이름이나 주석에 단위: `widthCm` 또는 `w: number; // cm`
- 가구 종류처럼 정해진 값은 문자열 유니온 + 상수 배열

```ts
export const FURNITURE_TYPES = ["cabinet", "drawer", "shelf", "wall", "desk", "table", "bed", "box"] as const;
export type FurnitureType = (typeof FURNITURE_TYPES)[number];
```

- `as` 강제 변환 금지 (외부 JSON 불러올 때만, 검증 함수 뒤에서)

---

## 7. 상수 · 매직넘버

코드 중간에 의미 있는 숫자를 직접 쓰지 않는다. `shared/constants/`에 이름을 붙여 둔다.

```ts
// shared/constants/scene.ts
export const WALL_HEIGHT_CM = 110;        // 컷어웨이 벽 높이
export const WALL_THICKNESS_CM = 12;
export const GRID_SNAP_CM = 10;
export const CIRCLE_SEGMENTS = 32;
export const FACE_SHADE = { top: 1, front: 0.86, side: 0.74 } as const;
export const DRAWER_OPEN_CM = 26;
export const UNDO_LIMIT = 50;
export const STORAGE_KEY = "yogitta:v1";
```

- 색은 CSS에서는 `var(--yg-…)`, 3D에서는 `shared/constants/colors3d.ts` 한 곳에서만
- 0, 1, -1, 2(절반) 같은 자명한 숫자는 예외

---

## 8. 주석 · 문서

### 용어 통일 (가장 중요)

주석, README, 커밋 메시지, 기획서 모두 **같은 개념은 같은 단어**로 쓴다. 기준은 같은 폴더의 `glossary.md`.

- 쓰기 전에 `glossary.md`를 읽는다
- "쓰지 않는 말"에 있는 단어를 쓰지 않는다 (예: "방" ✗ → "공간" 또는 "구역", "슬롯"·"단" ✗ → "칸", "아이템" ✗ → "물건")
- 용어집에 없는 새 개념은 **먼저 `glossary.md`에 추가**하고 쓴다 (`docs: 용어집에 ○○ 추가` 커밋)
- 코드 이름과 한국어 용어가 1:1로 맞게 짓는다 (`Space` = 공간, `slot` = 칸)
- 주석·README는 "~한다"체, 화면 문구만 "~해요"체

### 주석 쓰는 법

- 주석은 **한국어**, "무엇을"보다 **"왜"**
- export하는 함수·컴포넌트 위에 한 줄 설명

```ts
/** 2D 선분(cm)을 3D 벽 박스의 위치·길이·회전으로 바꾼다. 2D y = 3D z. */
export function segmentToWall(a: Point, b: Point): WallTransform { … }
```

- 주석 처리한 옛 코드는 남기지 않는다 (git에 있음)
- `TODO` 주석은 세부 Todo 번호와 함께: `// TODO(T18-1): 모서리 기둥`

---

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

---

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
| Vitest | 순수 함수만 |

### 반드시 테스트할 순수 함수

| 함수 | 확인할 것 |
|---|---|
| 은/는 선택 | 받침 있음·없음·영어·숫자 |
| 검색 매칭 | 부분 일치, 띄어쓰기 무시, 메모 검색, 결과 없음 |
| 위치 문장 | 가구 종류별 칸 표현, 칸 없음, 가구 위 가구 |
| 선분 → 벽 | 길이·회전·중점, y → z |
| 칸 높이 | 균등 분배, 합계 초과 감지 |
| 저장 데이터 검증·버전 변환 | 정상, 깨짐, 옛 버전 |

---

## 11. 작업 흐름 (매번 이 순서)

```
① 계획 → ② 작성 → ③ 자가 점검 → ④ npm run check → ⑤ 커밋
```

### ① 계획 — 코드 쓰기 전에 사용자에게 짧게 보여준다

```
T10-2 계획
- 새 파일: features/search/logic/josa.ts, josa.test.ts
- 수정: features/search/logic/buildLocationSentence.ts (josa 사용)
- 영향: ResultCard 문구만 바뀜, 다른 feature 영향 없음
```

### ② 작성

1~10장 규칙대로. 한 번에 세부 Todo 하나만.

### ③ 자가 점검 체크리스트

- [ ] 파일이 맞는 feature 폴더에 있다
- [ ] 다른 feature는 `index.ts`로만 import했다, `@/` 경로를 썼다
- [ ] 계산 로직은 logic/lib의 순수 함수로 뺐다
- [ ] 데이터 변경은 store 액션으로만 했다
- [ ] 파일 200줄, 함수 40줄 이하다
- [ ] `any`, 매직넘버, 주석 처리된 옛 코드가 없다
- [ ] 빈 상태·오류 상태를 처리했다
- [ ] 새 순수 함수에 테스트를 붙였다
- [ ] 화면 요소는 `yogitta-design` 규칙대로다
- [ ] 주석·문구의 용어가 `glossary.md`와 같다 ("쓰지 않는 말"이 없다)

### ④ 자동 검사

`npm run check` 통과. 실패하면 고치고 다시. 통과 전에는 커밋하지 않는다.

### ⑤ 커밋

`commit-convention` 스킬대로 (`Tn-n: 작업 내용`, 고친 건 `Tn-n 버그수정[영역]: …`).

### 보고

작업이 끝나면 사용자에게 3줄 이내로: 한 일 / 바뀐 파일 / 다음 세부 Todo.

---

## 12. 정리 점검 (큰 Todo 하나 끝날 때마다)

큰 Todo(Tn)의 마지막 세부 Todo를 커밋한 뒤, 다음 Todo로 가기 전에 한 번 훑는다.

1. 200줄 넘은 파일, 40줄 넘은 함수 → 분리
2. 비슷한 코드가 두 군데 이상 → `shared`나 feature logic으로 합치기
3. 안 쓰는 파일·export·의존성 → 삭제
4. `index.ts` 공개 창구가 실제로 쓰는 것만 내보내는지
5. 상수가 흩어져 있지 않은지

고친 게 있으면 `chore: T3 정리 — 벽 도구 파일 분리` 처럼 따로 커밋한다. 동작이 바뀌면 안 된다 (`npm run check` 통과 + 화면 확인).

---

## 13. 하지 말 것

- 한 커밋·한 작업에 여러 세부 Todo 섞기
- feature 내부 파일 직접 import, 순환 import
- 컴포넌트에서 localStorage·JSON.parse 직접 호출
- store 데이터 직접 수정(대입·push)
- `any`, `// @ts-ignore`, `eslint-disable` (꼭 필요하면 이유 주석 + 사용자에게 알림)
- 사용자에게 묻지 않고 새 라이브러리 설치
- 규칙을 어겨야 할 것 같으면 혼자 판단하지 말고 이유를 말하고 물어본다
