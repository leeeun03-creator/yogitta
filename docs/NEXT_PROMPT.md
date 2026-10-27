---
title: VS Code Claude Code 이어가기 프롬프트
updated: 2026-10-27
usage: 아래 "프롬프트" 블록 전체를 VS Code의 Claude Code 첫 메시지로 붙여넣는다
---

# 이어가기 프롬프트

## 프롬프트

```
요깃따(Yogitta) 프로젝트를 이어서 진행해줘. 바이브 코딩 수업 중간고사 과제고, 1주 안에 브라우저에서 실행되는 앱을 만들어 GitHub Public 저장소에 Todo 단위로 커밋·푸시해야 해.

## 맨 처음: 스킬 폴더 옮기기
스킬 파일이 아직 `_skills/` 폴더에 있어. 다른 일 하기 전에 `_skills/` 안의 세 폴더(yogitta-code, yogitta-design, commit-convention)를 그대로 `.claude/skills/` 아래로 옮기고 `_skills/`는 지워줘. 옮긴 뒤 `.claude/skills/*/SKILL.md` 3개가 있는지 확인해줘.

## 먼저 읽을 것 (이 순서로)
1. CLAUDE.md
2. .claude/skills/yogitta-code/SKILL.md 와 glossary.md (코드 규칙, 용어집)
3. .claude/skills/commit-convention/SKILL.md (커밋 규칙)
4. .claude/skills/yogitta-design/SKILL.md (디자인 규칙)
5. docs/PRD.md, docs/기획서.md (무엇을 만드는지, Todo T1~T30)
6. .claude/skills/yogitta-design/references/README.md 와 이미지 01~05 (화면 레퍼런스)

다 읽었으면 코드 쓰기 전에 3줄로 요약해서 보여줘: 앱 한 줄 설명 / 오늘 할 일 / 지킬 규칙 핵심.

## 오늘 할 일 (순서대로, 하나 끝날 때마다 나한테 보고)

### 0단계: 문서 정리 (코드 전에)
- docs/기획서.md 와 docs/PRD.md, yogitta-design 스킬의 문구를 glossary.md 용어로 통일해줘 (예: 상자 배치 → 가구 배치, 정면도 → 가구 상세 패널, 방(공간 뜻) → 공간, 단 → 칸). 바꾼 목록을 보여주고 내가 확인하면 반영.
- docs/기획서.md 8장 "사용할 스킬"을 실제 만든 3개(yogitta-code, yogitta-design, commit-convention)로 고쳐줘.
- 1일차 Todo인 T1, T2를 세부 Todo(T1-1, T1-2 …)로 쪼개서 README.md의 Todo 리스트에 체크박스로 적어줘. 각 세부 Todo는 30분~2시간 크기.

### 1단계: 저장소 만들기 (T1)
- git init, .gitignore(node_modules, dist, .env), GitHub에 Public 저장소 yogitta 생성 방법을 알려주고 내가 만들면 remote 연결
- Vite + React + TypeScript 세팅, 경로 별칭 @/, ESLint·Prettier·Vitest, package.json에 check 스크립트 (yogitta-code 10장 그대로)
- 폴더 구조는 yogitta-code 1장 그대로 (빈 폴더는 만들지 말고 필요한 것만)
- styles/tokens.css 는 yogitta-design 1장 토큰 그대로, Jua·Gowun Dodum 폰트 연결
- vite.config base를 /yogitta/로, GitHub Pages 배포(GitHub Actions)까지 → 배포 주소에서 빈 화면이라도 뜨는지 확인

### 2단계: T2 바닥 크기 입력 + 2D 격자
- shared/types에 PRD 부록 B 데이터 모델 정의
- store(zustand) 기본 틀
- 첫 실행 화면(시안 03) → 바닥 크기 입력 → 편집 모드의 2D 평면도에 격자 표시(줌·이동)

## 작업 방식 (매번)
- 세부 Todo 하나씩: 계획(만들/고칠 파일 목록) 먼저 보여주기 → 작성 → 자가 점검 체크리스트 → npm run check 통과 → commit-convention대로 커밋·푸시 → 3줄 보고
- 커밋 메시지: "T1-2: Vite React TypeScript 프로젝트 세팅", 고친 건 "T1-3 오류수정[빌드]: …"
- 주석·README·커밋은 glossary.md 용어만, 주석·문서는 "~한다"체
- 새 라이브러리 설치, 규칙 예외, 폴더 추가는 먼저 물어보기
- Todo가 바뀌면(추가·삭제·우선순위) todo: 커밋으로 따로 남기기
```

## 참고

- 각 단계가 끝날 때마다 Claude Code가 멈추고 보고하게 했으니, 확인하고 "다음"이라고 하면 이어간다.
- 세션이 바뀌어도 `CLAUDE.md`가 자동으로 읽혀서 규칙은 유지된다. 이어서 할 때는 "docs/TODO.md에서 다음 세부 Todo부터 이어서 해줘"라고 하면 된다.
