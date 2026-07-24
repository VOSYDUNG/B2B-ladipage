# Test report

Date: 2026-07-24

## Completed in this environment

- Unit tests: **7/7 passed**
  - seven unique products
  - five eligible sample products
  - all tier boundary values
  - active reward weights total 100
  - pending prizes excluded from weighted selection
  - cart totals and 5% immediate discount
  - Lao phone normalization
- TypeScript syntax parse: **32 TS/TSX files, 0 syntax errors**
- Source scan:
  - no `dangerouslySetInnerHTML`
  - no inline `onclick`
  - no global `/public/script.js`
  - no customer-facing `<100K`
  - no fake winner/value claims

## Environment blocker

A full `npm install`, Vite build and Playwright run could not be completed in the execution container because its internal npm gateway returned HTTP 503 while downloading `yargs-parser`.

This is an infrastructure/package-registry failure, not a code test failure. Run the following in Antigravity or a normal development machine:

```bash
npm install
npm run verify
npm run test:e2e
```

The included E2E smoke test checks:

- 1440×900 desktop horizontal overflow
- 390×844 mobile horizontal overflow
- desktop hero height cap
- CTA opens the funnel dialog
- registration advances to policy step
