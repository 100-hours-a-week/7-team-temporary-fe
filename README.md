# 7 Team Temporary FE

## 기술 스택

- **런타임**: Node.js >= 22.13.0
- **언어**: TypeScript 5.8.2
- **코어**: React 19.0.0, Next.js 15.1.3
- **스타일링**: Tailwind CSS 4.1.4, Emotion 11.11.4
- **아키텍처**: FSD (Feature-Sliced Design)
- **서버 상태 관리**: Tanstack Query 5.74.3
- **상태 관리**: Zustand 5.0.3
- **빌드**: Babel 7.26.4, Turbopack, Webpack 5.94.0
- **패키지 매니저**: pnpm 9.15.1
- **CSS 처리**: PostCSS 8.4.49, Autoprefixer 10.4.20
- **유틸**: clsx 2.1.1, tailwind-merge 2.5.4, canvas-confetti 1.9.3
- **기타**: ESLint 9.25.1, Prettier 3.5.3, es-toolkit 1.36.0

## 시작하기

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

### 빌드

```bash
pnpm build
```

### 프로덕션 실행

```bash
pnpm start
```

## 프로젝트 구조 (FSD)

```
src/
├── app/          # Next.js App Router
├── pages/        # Pages Router (선택적)
├── shared/       # 공유 모듈 (UI Kit, 유틸리티 등)
├── entities/     # 비즈니스 엔티티
├── features/     # 기능 단위
└── widgets/      # 복합 UI 블록
```

## 스크립트

- `pnpm dev` - 개발 서버 실행 (Turbopack 사용)
- `pnpm build` - 프로덕션 빌드
- `pnpm start` - 프로덕션 서버 실행
- `pnpm lint` - ESLint 실행
- `pnpm format` - Prettier로 코드 포맷팅
- `pnpm format:check` - Prettier 포맷팅 체크

