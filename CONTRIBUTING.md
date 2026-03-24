# Contributing to Lumina

Thanks for your interest in contributing! Here's how to get started.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/lumina.git`
3. **Install** dependencies: `npm install`
4. **Create a branch**: `git checkout -b feature/your-feature`
5. **Start dev server**: `npm run dev`

## Development

- Dev server runs at `http://localhost:4321` with hot reload
- Run `npm run build` before submitting to verify the build passes
- Run `npm run check` to validate TypeScript types

## Code Style

- **Components**: React + TypeScript in `src/components/`
- **Styling**: Tailwind CSS v4 utility classes — no separate CSS files per component
- **Animations**: Framer Motion for JS-driven animations, CSS `@keyframes` in `global.css` for simple loops
- **Data**: All content in `src/lib/data.ts` — keep components data-free
- **Astro directives**: Use `client:visible` for below-fold sections, `client:load` for above-fold, `client:idle` for non-critical

## Pull Requests

1. Keep PRs focused — one feature or fix per PR
2. Write a clear description of what changed and why
3. Ensure the build passes: `npm run build`
4. Test responsiveness across mobile (320px+) and desktop

## Reporting Issues

- Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) for bugs
- Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) for ideas
- Include browser, OS, and screen size when reporting visual issues

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
