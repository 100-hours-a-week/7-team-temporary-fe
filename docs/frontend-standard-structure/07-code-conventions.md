# 코드 컨벤션

## 네이밍 규칙

- 컴포넌트: PascalCase
- 훅: `use` 접두어
- 파일명: kebab-case 또는 기준 합의에 따름

## 컴포넌트 및 함수 설계 기준

- 단일 책임 원칙을 우선한다.
- props는 최소화하고 명확한 타입을 제공한다.
- 복잡한 로직은 분리해 테스트 가능하도록 한다.

## TypeScript 사용 규칙

- `any` 사용을 금지하고 명시적 타입을 사용한다.
- 타입은 `shared/types` 또는 도메인 내부에 정의한다.

## Import 규칙

- 레이어 규칙을 위반하는 import는 금지한다.
- 절대 경로 사용을 권장한다.

## 참고

- 위키: 프론트엔드 개발 표준 구조 설계
  - https://github.com/100-hours-a-week/7-team-temporary-wiki/wiki/%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C-%ED%91%9C%EC%A4%80-%EA%B5%AC%EC%A1%B0-%EC%84%A4%EA%B3%84

