---
name: yogitta-design-components
description: 요깃따에서 버튼·검색창·칩·검색 결과 카드·가구 상세 패널·공간 드롭다운·편집 모드 화면·입력칸을 만들거나 고칠 때 읽는다. 보통 yogitta-design 목차에서 부른다.
---

# 요깃따 컴포넌트 규격

`yogitta-design` 스킬의 4장이다 (장 번호는 그대로 둔다). 목차와 늘 지킬 것은 `yogitta-design`에 있다.

## 4. 컴포넌트

컴포넌트를 만들 때는 아래 규격과 함께 **컴포넌트 시안(06~08)** 을 연다. 상태(기본·올림·누름·비활성·포커스·오류)는 시안에 있는 것을 모두 구현한다. 화면 시안(01~05)과 다르면 컴포넌트 시안이 우선이다.

| 컴포넌트 | 시안 |
|---|---|
| Button (primary · secondary · add · danger), IconButton, Segmented, Toggle, TextField, Stepper | `06-components-actions` |
| SearchBar, ItemChip, ResultCard (1곳 · 여러 곳 · 결과 없음), 위치 문장 | `07-components-search` |
| SlotRow, FurniturePanel 머리, SpaceSwitcher, ToolButton, FurnitureTypePicker | `08-components-panels` |

### 버튼
| 종류 | 모양 |
|---|---|
| 주 버튼 | `--yg-accent` 바탕, `--yg-on-accent` 글자, 알약형, 높이 48px |
| 보조 버튼 | `--yg-surface` 바탕, 1px `--yg-border`, 알약형, 높이 44px |
| 아이콘 버튼 | 44×44 원형, 보조 버튼과 같은 색 |
| 추가 버튼 | 투명 바탕, 2px 점선 `--yg-dashed`, 글자 `--yg-accent`, 내용 "+ 새 공간 만들기" 등 |
| 삭제 버튼 | 투명 바탕, 1px `--yg-danger-border`, 글자 `--yg-danger` |

### 검색창
- 알약형, 높이 56–60px, 최대 폭 640px, 가운데 정렬
- 2px `--yg-accent` 테두리 + `--yg-shadow-card`
- 왼쪽 돋보기 아이콘(강조색), placeholder "무엇을 찾고 있나요?"
- 화면에 안 보이는 `<label>`("물건 검색")을 반드시 연결

### 칩 (물건 이름)
- 알약형, 패딩 5px 12px, 15px
- 기본: `--yg-surface` (칸 행 안) 또는 `--yg-chip` (카드 안)
- 찾은 물건: `--yg-accent` 바탕 + `--yg-on-accent` 글자

### 검색 결과 카드
순서를 바꾸지 않는다.
1. **"요깃따!"** — Jua 30px, `--yg-accent` + 옆에 "'여권' 1곳 찾음" (13px, sub)
2. 위치 문장 — 17px, 줄간격 1.65. 물건·공간은 굵게, 가구 이름은 굵게 + 강조색
3. 메모 — 메모 아이콘 + 14px sub
4. 같은 칸 물건 — "같은 칸에 있는 물건" 라벨 + 칩 (최대 4개 + "외 n개")
5. 다른 공간 링크 — "다른 공간에도 있어요: 형 방 1곳 ›" (강조색 링크)

카드: `--yg-surface`, `--yg-radius-card`, `--yg-shadow-card`, 패딩 18px 20px, 최대 폭 460px

### 가구 상세 패널
- `--yg-surface`, `--yg-radius-panel`, `--yg-shadow-panel`, 패딩 22px, 폭 320–400px
- 머리: 48px 아이콘 타일(`--yg-found-bg` 바탕, 강조색 아이콘) + 가구 이름(Jua 24) + 위치 핀 아이콘 + "내 방 · 침대 옆 · 물건 5개"(14px sub) + 닫기 버튼
- 칸 행: `--yg-surface-2`, `--yg-radius-row`, 패딩 12px 14px, 왼쪽 칸 이름(13px sub, 폭 40px) + 칩
- 찾은 칸 행: `--yg-found-bg` 바탕, 칸 이름 `--yg-found-text`
- 빈 칸: "비어 있어요" (14px sub)
- 맨 아래 주 버튼 "물건 넣기"

### 공간 전환 드롭다운
- 버튼: 알약형, 2px 강조 테두리, "공간" 라벨(13px sub) + 공간 이름 + 화살표
- 목록: `--yg-surface`, 22px 모서리, `--yg-shadow-pop`, 폭 340px
- 항목: 76×56 미니 3D 썸네일 + 이름(16) + "6.0 × 4.5 m · 가구 6 · 물건 23"(13 sub), 선택된 항목은 `--yg-found-bg` 바탕 + 체크 아이콘
- 맨 아래 점선 추가 버튼 "+ 새 공간 만들기"

### 편집 모드
- 상단 바: 주 버튼 "‹ 완료", 제목 "편집 모드"(Jua 22), "자동 저장됨"(13 sub), 세그먼트 [2D 평면도 | 3D 미리보기], 되돌리기·다시하기 아이콘 버튼
- 왼쪽 그리기 도구 막대: `--yg-surface`, 22px 모서리, 버튼 64×60(아이콘 + 12px 라벨). 선택된 도구는 강조색 바탕
  - 순서: 선택, 직선, 연속선, 사각형, 가구, 지우개
- 오른쪽 속성 패널: 가구 이름 입력 → 종류(4열 그리드 8개) → 놓인 곳 세그먼트(바닥 / 가구 위 / 벽에 걸기) → 크기(가로·깊이·높이 cm) → 칸 수 스테퍼 + 칸별 높이 입력 + 왼쪽 칸 비율 미리보기 + "합계 90 / 전체 높이 90" → 회전·삭제 버튼 → 안내 문구
- 하단: "구역" 칩 목록 + "+ 구역 추가" 점선 칩, 격자 스냅 토글, "바닥 6.0 × 4.5 m" 버튼

### 세그먼트 컨트롤
- `--yg-chip` 바탕의 알약 안에 버튼들, 선택된 것만 `--yg-surface` + 작은 그림자

### 입력칸
- `--yg-surface-2` 바탕, 1px `--yg-border`, `--yg-radius-field`, 높이 44–48px
- 강조할 칸(예: 찾은 칸의 높이)은 2px 강조 테두리 + `--yg-surface`
