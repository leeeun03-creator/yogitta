# 요깃따 (Yogitta)

내 방을 2D로 그려 3D로 세우고, 물건을 검색하면 그 칸이 열리며 "요깃따!" 하고 위치를 보여주는 브라우저 앱.
기획: `docs/기획서.md`, PRD: `docs/PRD.md`, 디자인 레퍼런스: `yogitta-design` 스킬의 `references/`, Todo 리스트: `docs/TODO.md`

## 항상 지킬 것

- 코드를 쓰거나 고치기 전에 `yogitta-code` 스킬을 읽는다
- 화면·스타일·3D 색을 다룰 때는 `yogitta-design` 스킬을 읽는다
- 세부 Todo 계획을 세울 때와 커밋 전에 `yogitta-test` 스킬을 읽는다. 테스트(엣지 케이스 포함)를 모두 통과해야 완료이고, 통과해야 다음 작업으로 넘어간다
- 커밋 전에 `npm run check`와 `npm run test:e2e`를 통과시키고, `commit-convention` 스킬대로 커밋한다
- 작업 단위는 세부 Todo(Tn-n) 하나
- 주석, README, 커밋 메시지, 문서는 `.claude/skills/yogitta-code/glossary.md`의 용어만 쓴다. 같은 것을 다른 단어로 부르지 않는다
