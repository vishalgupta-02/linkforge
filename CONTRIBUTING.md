# Contributing to LinkForge

Thank you for your interest in contributing to **LinkForge**! We are committed to fostering an open, welcoming, and productive community.

This document outlines the guidelines and workflow for contributing to the project.

---

## 📜 Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all members with respect and empathy.

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: `v20.x` or `v24.x` (LTS)
- **pnpm**: `v11.21.0` or later (`corepack enable && corepack prepare pnpm@11.21.0 --activate`)
- **Docker & Docker Compose**: For running PostgreSQL and Redis services
- **Git**: For version control

### Workflow

1. **Fork the Repository**: Create a fork of [linkforge](https://github.com/vishalgupta-02/linkforge) on your GitHub account.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/linkforge.git
   cd linkforge
   ```
3. **Install Dependencies**:
   ```bash
   pnpm install
   ```
4. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   cp apps/api/example.env apps/api/.env
   ```
5. **Start Infrastructure Services**:
   ```bash
   pnpm dev:infra
   ```
6. **Initialize Database**:
   ```bash
   pnpm --filter api exec prisma generate
   pnpm --filter api exec prisma db push
   ```
7. **Start Development Server**:
   ```bash
   pnpm dev
   ```

---

## 🌿 Branching Strategy

- Create a feature branch from `main`:
  ```bash
  git checkout -b feat/your-feature-name
  # or for fixes:
  git checkout -b fix/issue-description
  ```

---

## ✍️ Commit Conventions

We strictly enforce the **Conventional Commits** specification using `commitlint` and `husky`.

### Format
```text
<type>(<scope>): <subject>
```

### Allowed Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (formatting, missing semicolons, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### Examples
- `feat(api): add social media link tracking endpoint`
- `fix(web): resolve mobile touch issue on drag handle`
- `docs: update deployment environment variables table`

---

## 🧪 Quality & Verification Checks

Before pushing your branch and opening a pull request, ensure all local checks pass:

```bash
# 1. Run ESLint checks
pnpm lint

# 2. Run TypeScript compiler checks
pnpm --filter api exec tsc --noEmit
pnpm --filter web exec tsc --noEmit

# 3. Run automated tests
pnpm --filter api test:links
pnpm --filter api test:socials
pnpm --filter api test:redirect

# 4. Verify build succeeds
pnpm build
```

---

## 🚀 Submitting a Pull Request (PR)

1. Push your branch to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request against the `main` branch of `vishalgupta-02/linkforge`.
3. Fill out the provided Pull Request template completely.
4. Ensure all CI checks (linting, tests, builds) pass on GitHub Actions.
5. Address any review feedback promptly.

Thank you for helping make LinkForge better!
