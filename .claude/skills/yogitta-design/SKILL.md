---
name: yogitta-design
description: 요깃따 화면·컴포넌트·스타일·3D 색을 만들거나 고칠 때 항상 먼저 읽는다. 시안 이미지(references) 목록과 디자인 규칙의 목차가 여기 있다.
---

# 요깃따 디자인 규칙 (B안 · 미니어처 하우스, 목차)

요깃따의 모든 화면은 이 문서를 따른다. 우드톤 디오라마 같은 3D, 완전히 둥근 버튼, 부드러운 그림자로 **아늑한 미니어처 집** 느낌을 낸다.
레퍼런스는 이 스킬의 `references/` 폴더에 있다. 화면을 만들기 전에 **해당 이미지를 열어** 모양을 맞추고, 수치(색·크기·모서리)는 이 문서를 기준으로 한다.

---

## 목차 — 하는 일에 맞는 작은 스킬을 부른다

이 스킬은 목차다. 아래에서 지금 하는 일에 맞는 작은 스킬을 **Skill 도구로 불러** 읽고 따른다.
다른 스킬에 있는 "`yogitta-design` N장" 같은 참조도 이 표에서 장 번호로 찾는다.

| 장 | 다루는 것 | 부를 스킬 |
|---|---|---|
| 1~3장 | 색 토큰, 글꼴, 아이콘 | `yogitta-design-tokens` |
| 4장 | 버튼·검색창·칩·결과 카드·패널·드롭다운·편집 모드·입력칸 | `yogitta-design-components` |
| 5~6장 | 3D 색·위치 표시·가구 누르기, 2D 평면도 | `yogitta-design-scene` |
| 7~10장 | 화면 배치, 문구 톤, 접근성, 파일 위치 | `yogitta-design-layout` |
| 0·11장 | 이 스킬에 그대로 있다 (아래) | — |

---

## 레퍼런스

| 만들 화면 | 열어볼 이미지 | 수치 확인용 원본 HTML |
|---|---|---|
| 메인 화면 (공간 전환 목록, 검색창, 검색 결과 카드, 3D 위치 표시, 가구 상세 패널) | `references/01-main.png` | `references/boards/01-main.dc.html` |
| 모바일 메인 화면 (하단 시트) | `references/02-mobile.png` | `references/boards/02-mobile.dc.html` |
| 첫 실행 화면 (점선 `+` 카드, 바닥 크기 카드, 빠른 선택) | `references/03-empty.png` | `references/boards/03-empty.dc.html` |
| 편집 모드 (그리기 도구, 2D 평면도, 속성 패널, 구역 목록) | `references/04-edit.png` | `references/boards/04-edit.dc.html` |
| 색·글꼴·버튼·칩 (스타일 타일) | `references/05-style.png` | `references/boards/05-style.dc.html` |
| 컴포넌트 · 버튼 · 입력 (상태별) | `references/06-components-actions.png` | `references/boards/06-components-actions.dc.html` |
| 컴포넌트 · 검색창 · 칩 · 검색 결과 카드 · 위치 문장 규칙 | `references/07-components-search.png` | `references/boards/07-components-search.dc.html` |
| 컴포넌트 · 칸 행 · 가구 상세 패널 · 공간 전환 목록 · 그리기 도구 · 가구 종류 선택 | `references/08-components-panels.png` | `references/boards/08-components-panels.dc.html` |

- 시안 문구 중 용어집과 다른 것(집 → 공간, 상자 → 보관함, 방 → 구역, 1단 → 1번째 칸 등)은 `references/README.md`의 "시안과 용어집이 다른 부분" 표대로 바꿔서 쓴다
- 이미지의 글꼴은 대체 글꼴로 캡처됐다. 실제 앱은 Jua·Gowun Dodum
- 실제 테스트 스크린샷(`yogitta-test` 5장)은 이 이미지와 눈으로 비교한다

---

## 0. 작업 전 체크

1. 만들 화면의 레퍼런스 이미지를 연다 (위 표)
2. 새 색을 만들지 말고 아래 토큰만 쓴다 (`var(--yg-…)`)
3. 글꼴은 제목 Jua, 본문 Gowun Dodum 두 개뿐
4. 버튼·검색창·칩은 알약형, 카드·패널은 둥근 모서리 + 부드러운 그림자
5. 3D에서 강조색은 "찾은 가구" 하나에만 쓴다
6. 끝나면 "11. 하지 말 것"을 다시 확인한다

---

## 11. 하지 말 것

- 토큰에 없는 색, 그라데이션 배경, 네온·보라 계열
- 각진 버튼(4px 이하 모서리), 진한 그림자
- 3D에 텍스처·사실적인 재질·여러 강조색
- 이모지 아이콘
- "요깃따!"를 찾지 못한 상황이나 다른 곳에 쓰는 것 (찾았을 때만)
