---
name: yogitta-design-tokens
description: 요깃따 화면에 색·글꼴·아이콘을 쓰거나 tokens.css를 고칠 때 읽는다. 보통 yogitta-design 목차에서 부른다.
---

# 요깃따 색·글꼴·아이콘

`yogitta-design` 스킬의 1~3장이다 (장 번호는 그대로 둔다). 목차와 늘 지킬 것은 `yogitta-design`에 있다.

## 1. 색 토큰

`src/styles/tokens.css`에 그대로 넣는다.

```css
:root {
  /* 바탕 */
  --yg-bg: #F4ECDF;          /* 전체 배경 */
  --yg-surface: #FFFAF3;     /* 카드, 패널, 검색창, 입력칸 */
  --yg-surface-2: #F8EFE3;   /* 칸 목록 행, 입력 필드 배경 */
  --yg-canvas: #FBF6EE;      /* 3D·2D 캔버스 영역 */
  --yg-chip: #F3E6D4;        /* 일반 칩, 세그먼트 바탕 */

  /* 글자 */
  --yg-text: #3B2F25;        /* 본문 */
  --yg-text-sub: #7A6450;    /* 라벨, 설명 (대비 5:1 이상) */

  /* 강조 */
  --yg-accent: #A8501B;      /* 주 버튼, 검색창 테두리, 찾은 물건 칩, 핀, "요깃따!" */
  --yg-accent-hover: #7C3A12;
  --yg-on-accent: #FFF8EF;   /* 강조색 위 글자 */
  --yg-found-bg: #F6D9BF;    /* 찾은 물건이 든 칸 배경 */
  --yg-found-text: #6B2F0C;  /* 찾은 칸 안 라벨 */

  /* 선 */
  --yg-border: #E6D6BF;
  --yg-border-soft: #EADCC7;
  --yg-dashed: #D9B48F;      /* "+ 추가" 점선 버튼 */

  /* 상태 */
  --yg-danger: #9B2C1F;      /* 삭제 글자 */
  --yg-danger-border: #E3B9AE;

  /* 버튼 상태 (컴포넌트 시안 06) — 올림·누름·비활성에서만 쓴다 */
  --yg-accent-press: #6B2F0C;      /* 주 버튼 누름 */
  --yg-add-hover: #FBF1E6;         /* 추가 버튼 올림 바탕 */
  --yg-danger-hover: #FBEAE5;      /* 삭제 버튼 올림 바탕 */
  --yg-danger-hover-border: #C97A6A;
  --yg-disabled-text: #8F7A66;     /* 비활성 버튼 글자 */
  --yg-disabled-icon: #B8A38C;     /* 비활성 아이콘 버튼 */

  /* 모양 */
  --yg-radius-pill: 999px;
  --yg-radius-card: 20px;
  --yg-radius-panel: 24px;
  --yg-radius-canvas: 28px;
  --yg-radius-row: 16px;
  --yg-radius-field: 14px;
  --yg-shadow-card: 0 8px 24px rgba(120, 80, 40, 0.14);
  --yg-shadow-panel: 0 10px 30px rgba(120, 80, 40, 0.12);
  --yg-shadow-pop: 0 18px 44px rgba(90, 60, 30, 0.24);
  --yg-shadow-chip: 0 2px 6px rgba(120, 80, 40, 0.15); /* 세그먼트 컨트롤의 고른 버튼 (컴포넌트 시안 06) */
}
```

## 2. 글꼴

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Jua&display=swap">
```

| 용도 | 글꼴 | 크기 |
|---|---|---|
| 로고, 화면 제목, 가구 이름(패널 제목), "요깃따!" | Jua | 22–32px |
| 본문, 버튼, 입력, 칩 | Gowun Dodum | 14–18px |
| 라벨, 보조 설명 | Gowun Dodum | 13px, `--yg-text-sub` |

- 최소 글자 크기 12px
- Jua는 굵기가 하나라 `font-weight`를 주지 않는다

## 3. 아이콘

- 선 아이콘(lucide-react), 굵기 2, 크기 16–22px
- 이모지 금지
- 아이콘만 있는 버튼은 반드시 `aria-label`
