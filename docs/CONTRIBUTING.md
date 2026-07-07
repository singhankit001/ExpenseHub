# Contributing to ExpenseFlow

Thank you for your interest in contributing! ExpenseFlow welcomes contributions of all kinds — bug reports, feature requests, documentation improvements, and code changes.

Please take a moment to read this guide before opening a pull request.

---

## Code of Conduct

This project follows a simple rule: **treat everyone with respect**. Harassment, discrimination, or toxic behavior of any kind will not be tolerated.

---

## Ways to Contribute

| Type | How |
|------|-----|
| 🐛 Bug Report | Open an issue with the **bug** label |
| 💡 Feature Request | Open an issue with the **enhancement** label |
| 📝 Documentation | Submit a PR editing files in `docs/` or `README.md` |
| 🔧 Code Fix | Fork → branch → PR |
| ✅ Tests | Add test coverage for existing or new features |
| 🎨 Design | Submit UI improvements via PR with before/after screenshots |

---

## Development Setup

```bash
# Fork and clone your fork
git clone https://github.com/<your-username>/ExpenseHub.git
cd ExpenseHub

# Setup backend
cd backend && npm install && cp .env.example .env
# Fill in your .env values

# Setup frontend
cd ../frontend && npm install && cp .env.example .env

# Start both servers
cd backend && npm run dev   # :5001
cd frontend && npm run dev  # :5173
```

---

## Branch Naming

Use descriptive branch names following this convention:

```
feat/add-csv-export
fix/modal-dark-theme
docs/update-api-reference
chore/upgrade-prisma-v6
refactor/split-auth-service
test/add-expense-service-tests
```

---

## Commit Convention

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `chore` | Build system, configs, dependencies |
| `refactor` | Code restructure with no behavior change |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `style` | Formatting, whitespace (no logic change) |

### Scopes (Examples)

`auth`, `expenses`, `dashboard`, `ui`, `api`, `db`, `frontend`, `backend`, `docs`

### Examples

```bash
git commit -m "feat(expenses): add CSV export to reports page"
git commit -m "fix(auth): correct token field name in useAuth hook"
git commit -m "docs(api): document new /expenses/stats endpoints"
git commit -m "chore(deps): upgrade Prisma from 5.x to 6.x"
```

---

## Pull Request Process

1. **Fork** the repository and create your branch from `main`
2. **Write** your changes following the code style guidelines below
3. **Test** your changes thoroughly
4. **Update** relevant documentation if your change affects public behavior
5. **Open** a pull request with the template below

### PR Title Format

```
feat(scope): short description of change
fix(scope): what was broken and how it's fixed
```

### PR Description Template

```markdown
## What does this PR do?
Clear description of the change.

## Why is this change needed?
Link to the issue this fixes or a rationale.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test this? What scenarios did you verify?

## Screenshots (if UI change)
Before | After
```

---

## Code Style Guidelines

### TypeScript (Frontend)

- **Strict mode** — `strict: true` in tsconfig. No `any` unless documented.
- **Named exports** — `export const MyComponent` not `export default`
- **Functional components** only — no class components
- **Interface over type** for object shapes
- **Avoid barrel files** (`index.ts`) unless the directory truly exports a unified API

### JavaScript (Backend)

- Use **CommonJS** (`require`, `module.exports`) — the backend uses CJS
- Always wrap async route handlers with `catchAsync()`
- Always throw `AppError` for operational errors — never `new Error()`
- Never directly access `req.body` in service functions — pass already-validated values
- All business logic must live in service files — controllers are thin HTTP adapters

### General

- **No console.log** in production code (use a logger or `process.env.NODE_ENV` guard)
- **No magic strings** — define constants for repeated string values
- **Descriptive variable names** — `userExpenses` not `data`
- **Comment the why, not the what**

---

## Reporting Bugs

Open a GitHub issue with:

1. **Description** — What went wrong?
2. **Steps to Reproduce** — Numbered steps to recreate
3. **Expected Behavior** — What should have happened?
4. **Actual Behavior** — What happened instead?
5. **Environment** — OS, Node version, browser
6. **Error Output** — Paste any error messages or stack traces

---

## Suggesting Features

Open a GitHub issue with:

1. **Problem Statement** — What problem does this solve?
2. **Proposed Solution** — How would you implement it?
3. **Alternatives Considered** — Other approaches you thought about
4. **Mockup** — Optional wireframe or design sketch

---

## Questions?

- Open a [GitHub Discussion](https://github.com/singhankit001/ExpenseHub/discussions)
- Or reach out directly to the maintainer: [@singhankit001](https://github.com/singhankit001)
