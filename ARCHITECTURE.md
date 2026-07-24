# Architecture

## Design goals

1. Keep the landing page fast and visually stable.
2. Make each campaign step an explicit state rather than a hidden DOM card.
3. Separate marketing configuration from rendering and persistence.
4. Allow Firestore, Cloud Functions or a different backend to be swapped without rewriting UI components.
5. Prevent one campaign from reintroducing platform-wide CSS and state coupling.

## Reference repositories reviewed

- `alan2207/bulletproof-react`: feature boundaries, API/service separation, project standards.
- `feature-sliced/documentation`: organize code by scope and business feature.
- `shadcn-ui/ui`: accessible, composable UI primitives; used as a design-reference only, not installed.

This project intentionally uses a smaller subset of those ideas because it is one campaign page, not a large product application.

## Layers

### `app/`

Composition root, global design tokens and page-level rendering.

### `features/campaign/model/`

Pure business configuration and calculations:

- product catalog
- accumulation tiers
- reward status and weights
- cart calculations
- flow reducer
- translations
- session persistence

No Firebase or DOM code belongs here.

### `features/campaign/components/`

Campaign-specific UI. Components receive data and callbacks through props. They do not query the DOM or mutate global variables.

### `features/campaign/services/`

Persistence boundary.

```ts
interface CampaignRepository {
  saveRegistration(...): Promise<void>
  savePolicyAcknowledgement(...): Promise<void>
  saveSpinPreview(...): Promise<void>
  saveCartDraft(...): Promise<void>
  saveCompletion(...): Promise<void>
}
```

The UI uses `createCampaignRepository()` and does not know whether the implementation is local, Firestore or a Cloud Function.

### `shared/`

Reusable primitives and infrastructure:

- accessible dialog
- button and section primitives
- Firebase initialization
- WhatsApp message builder

## Campaign state machine

```text
browse
  ↓
register
  ↓
policy
  ↓
spin
  ↓
cart
  ↓
complete
```

State is owned by `useReducer`. Session persistence stores only the current participant data, selected tier, preview reward and cart lines.

## Hero sizing rule

The old implementation forced `aspect-ratio: 16/9`, causing a 1440px viewport to create a hero around 810px tall before the header. It also had multiple hero selectors later in one 4,600-line CSS file, so new overrides fought previous rules.

The refactor uses:

```css
min-height: clamp(600px, calc(100svh - var(--header-height)), 780px);
```

The image is an absolutely positioned art-directed background. Text is constrained to the left 42% grid column, while the wheel remains inside the image on the right. Mobile uses the dedicated 9:16 source and a top-to-bottom overlay.

## Firestore strategy

For UAT, the client can write only to three campaign-scoped collections:

- `nnc_b2b_campaign_leads`
- `nnc_b2b_campaign_events`
- `nnc_b2b_campaign_cart_drafts`

Public users cannot read, update or delete those documents.

For production rewards, replace `saveSpinPreview` with a callable Cloud Function. Client-side random selection must not become the source of truth for real prizes.
