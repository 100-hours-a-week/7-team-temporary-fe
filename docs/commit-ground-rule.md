## commit ground rule

<aside>
🧑‍🏫 Git flow branching strategy를 사용하는 것을 전제로 룰을 가이드합니다.
</aside>

1. 절대로 `main`, `develop` branch에서 ‘직접' 수정을 하지 않는다.
2. 앱이 정상적으로 실행되지 않는 브랜치는 push, merge하지 않는다.
3. PR에 다른 사람들이 `approve` 하기 전까지 merge를 하지 않는다.
4. 팀원이 담당한 부분을 수정해야 하는 경우 변경사항을 사전에 전달한다.
5. merge된 브랜치는 삭제한다.

---

## FE 혹은 EXPRESS 기반일 경우

## pre-commit hook

- husky를 이용하여 커밋을 관리한다.
  - https://typicode.github.io/husky/#/ 는 ‘git hook을 설정하여 커밋 및 푸시 전에 자동화된 작업을 설정할 수 있는 도구’를 의미함.

### 설치

```
npx husky-init && npm install
```

### 세팅

```
npx husky add .husky/pre-commit "npm run format"
npx husky add .husky/pre-push "npm run lint"
```

---

## commitlint로 commit-message 관리하기

```bash
npm install --dev @commitlint/config-conventional @commitlint/cli
```

```bash
npx husky add .husky/commit-msg "npx commitlint --edit "$1""
```

### ./commitlint.config.cjs

```jsx
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [
      2,
      "always",
      ["sentence-case", "start-case", "pascal-case", "upper-case", "lower-case"],
    ],
    "type-enum": [
      2,
      "always",
      ["build", "chore", "content", "docs", "feat", "fix", "refactor", "style", "test", "deploy"],
    ],
    "type-case": [2, "always", "lower-case"],
    "subject-full-stop": [2, "never", "."],
    "subject-min-length": [2, "always", 5],
    "header-max-length": [2, "always", 72],
  },
};
```
