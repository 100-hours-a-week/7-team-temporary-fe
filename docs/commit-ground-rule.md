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

---

## semantic-release

<aside>
🧑‍🏫 tips
semantic-release를 사용하면 자동으로 커밋 규칙 관리돼요!
</aside>

### 1. semantic-release 설치

```bash
npm install --save-dev semantic-release
```

### 2. package.json 수정

`private`은 npm package로 배포할 건지의 여부에 따라 설정하는 것이며, 프로젝트이므로 `false`로 설정한다.

```json
{
  "...": "",
  "private": false
}
```

### 3. 플러그인 설치

```bash
npm i -D @semantic-release/commit-analyzer @semantic-release/release-notes-generator @semantic-release/npm @semantic-release/github
```

```bash
npm install @semantic-release/git @semantic-release/changelog -D
```

### 4. ./.releaserc.json 추가

```json
{
  "branches": ["develop", "next"],
  "plugins": [
    [
      "@semantic-release/commit-analyzer",
      {
        "preset": "conventionalcommits",
        "releaseRules": [
          { "type": "breaking", "release": "major" },
          { "type": "no-release", "release": false },
          { "type": "build", "release": false },
          { "type": "chore", "release": false },
          { "type": "content", "release": "patch" },
          { "type": "docs", "release": "patch" },
          { "type": "feat", "release": "minor" },
          { "type": "fix", "release": "patch" },
          { "type": "refactor", "release": "patch" },
          { "type": "style", "release": "patch" },
          { "type": "test", "release": false },
          { "type": "deploy", "release": "patch" }
        ],
        "parserOpts": {
          "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES"]
        }
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        "preset": "conventionalcommits",
        "presetConfig": {
          "types": [
            { "type": "build", "section": "⚙️ SYSTEM BUILD & EXTERNAL PACKAGES", "hidden": true },
            { "type": "chore", "section": "📦 CHORES", "hidden": true },
            { "type": "content", "section": "📝 CONTENT UPDATES", "hidden": false },
            { "type": "docs", "section": "📚 DOCUMENTATION", "hidden": false },
            { "type": "feat", "section": "🚀 NEW FEATURES", "hidden": false },
            { "type": "fix", "section": "🐛 BUG FIXES", "hidden": false },
            { "type": "refactor", "section": "♻️ REFACTORING", "hidden": false },
            { "type": "style", "section": "🎨 STYLES", "hidden": false },
            { "type": "test", "section": "✅ TESTING", "hidden": true },
            { "type": "deploy", "section": "🚀 DEPLOYMENTS", "hidden": false }
          ]
        },
        "parserOpts": {
          "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES"]
        },
        "writerOpts": {
          "commitsSort": ["subject", "scope"]
        }
      }
    ],
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "CHANGELOG.md",
        "changelogTitle": "# CHANGELOG"
      }
    ],
    [
      "@semantic-release/npm",
      {
        "pkgRoot": ".",
        "tarball": "dist"
      }
    ],
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        "assets": ["package.json", "package-lock.json", "CHANGELOG.md"],
        "message": "chore: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}
```

### 5. github action workflow 추가

`semetic.yml` (예시)

```yaml
name: Develop Branch Semantic Release

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop

jobs:
  semantic-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "lts/*"
          registry-url: "https://npm.pkg.github.com/"
      - run: npm install
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
