# ESLint 설정 요약

아래는 현재 프로젝트에 적용된 ESLint 설정을 사람이 읽기 쉬운 형태로 정리한 문서다.
실제 설정은 `.eslintrc.json`을 기준으로 한다.

## 기본 프리셋

- `next/core-web-vitals`
- `next/typescript`
- `plugin:@typescript-eslint/recommended`
- `plugin:prettier/recommended` (Prettier 충돌 규칙 off + 포맷 검사)

## 파서/언어 옵션

- TypeScript 파서 사용: `@typescript-eslint/parser`
- ECMAScript 2022, JSX 활성화
- 모듈 기준: `module`

## 플러그인

- `@typescript-eslint`
- `react-hooks`
- `import`
- `unused-imports`
- `storybook`
- `boundaries` (FSD 레이어 의존성 규칙)

## 환경

- 브라우저/Node 전역 허용

## 무시 경로

- `node_modules/*`, `dist/`, `.vite/`, `.next/`

## Import 정렬 규칙 (`import/order`)

- 그룹 순서: `builtin → external → internal → parent → sibling → index → object → type`
- 그룹 간 빈 줄 강제
- 그룹 내 알파벳 정렬
- `@/**`는 internal로 분류
- `.css/.scss`는 마지막 그룹으로 배치

## FSD 레이어 규칙 (`boundaries`)

- 레이어 매핑: `shared / entities / features / widgets / pages / app`
- 상위 레이어를 하위 레이어에서 참조 금지
- slice public API 강제: 각 slice는 `index.ts(x)`를 통해서만 외부 접근 허용

## 핵심 규칙

- `@typescript-eslint/no-unused-vars`: warn (인자 `_`는 허용)
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/consistent-type-imports`: warn
- `unused-imports/no-unused-imports`: error
- `react-hooks/exhaustive-deps`: warn
- `import/order`: error
- `boundaries/element-types`: error
- `boundaries/entry-point`: error

