# English Course Planner

Interactive English course from A1 to B2+ built with Astro + React.

## Tech Stack

- **Astro 6** — static site generation
- **React 19** — interactive islands (quizzes, flashcards, writing)
- **Pure CSS** — OKLCH design tokens, light/dark theme
- **nanostores** — client-side state (progress, theme, language)
- **GitHub Actions** — CI/CD with automated deploys

## Structure

```
src/
├── components/
│   ├── interactive/     # Quiz, FlashcardDeck, WritingExercise
│   ├── dynamics/        # ProgressOverview
│   └── layout/          # Header, Footer, ThemeToggle
├── layouts/             # BaseLayout (SEO, CSP, meta tags)
├── pages/               # index, level/[level]
├── stores/              # progress, theme, lang
├── styles/              # global.css (OKLCH tokens + utilities)
└── content.config.ts    # Zod schemas for MDX/JSON collections
```

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Build to dist/
npm run preview   # Preview production build
npm run audit     # Security audit
```

## Levels

| Level | Hours | Focus |
|-------|-------|-------|
| A1 | 8h | Fundamentals |
| A2 | 10h | Building |
| B1 | 12h | Expansion |
| B1+ | 12h | Consolidation |
| B2 | 14h | Mastery |
| B2+ | 14h | Precision |

## Skills

10 UI design skills available in `~/.agents/skills/` — load with `skill()`:
`frontend-design`, `design-taste-frontend`, `make-interfaces-feel-better`,
`baseline-ui`, `emil-design-eng`, `interaction-design`, `oklch-skill`,
`wcag-audit-patterns`, `web-quality-audit`, `12-principles-of-animation`

18 Claude skills in `Skill Claude/` for polish, translation, and tutoring.
