# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@SPEC.md

## Project Overview

This is a Next.js 16.2.3 application named "vibe-meeting-room", built with:
- React 19.2.4
- TypeScript 5
- Tailwind CSS v4 (with PostCSS plugin)
- App Router architecture
- ESLint 9 (flat config format)

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build production bundle
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Architecture

### Next.js App Router
This project uses Next.js App Router with the `app/` directory structure:
- `app/layout.tsx` - Root layout with Geist fonts (sans & mono) and global styles
- `app/page.tsx` - Homepage component
- `app/globals.css` - Global styles with Tailwind CSS v4, CSS variables for theming

### Styling
- **Tailwind CSS v4** via `@tailwindcss/postcss` plugin
- Theme system uses CSS variables: `--background`, `--foreground`, `--font-sans`, `--font-mono`
- Dark mode support via `@media (prefers-color-scheme: dark)`
- Custom fonts: Geist Sans and Geist Mono loaded via `next/font/google`

### TypeScript Configuration
- Path alias: `@/*` maps to project root
- Target: ES2017
- Module resolution: bundler
- Strict mode enabled

### Linting
- Uses ESLint v9 flat config format (`eslint.config.mjs`)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Important Notes

- **Next.js Version**: This uses Next.js 16.2.3 which may have breaking changes from earlier versions. Consult `node_modules/next/dist/docs/` for current API documentation.
- **Tailwind CSS v4**: This is a major version with significant changes. Uses the new `@import "tailwindcss"` syntax and `@theme inline` directive instead of traditional `tailwind.config.js`.
