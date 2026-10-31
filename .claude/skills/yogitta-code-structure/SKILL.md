---
name: yogitta-code-structure
description: 요깃따에서 새 파일을 어디에 둘지, 다른 feature·store를 import해도 되는지, 계산·상태·화면을 어디에 나눌지 정할 때 읽는다. 보통 yogitta-code 목차에서 부른다.
---

# 요깃따 코드 구조

`yogitta-code` 스킬의 1~3장이다 (장 번호는 그대로 둔다). 목차와 늘 지킬 것은 `yogitta-code`에 있다.

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
