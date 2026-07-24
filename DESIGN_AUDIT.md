# UI/UX and source audit

## Critical source issues in the uploaded package

| Issue | Evidence in uploaded source | Result |
|---|---|---|
| React used only as an HTML wrapper | `App.tsx` returned one large `dangerouslySetInnerHTML` string | React could not manage component state or accessibility correctly |
| Global script injection | `useEffect` appended `/script.js` to `document.body` | Development StrictMode could inject/run it twice |
| Duplicate business runtime | `public/script.js` and `src/mainLogic.js` were both about 2,000 lines | High drift and bug risk |
| CSS cascade conflict | `src/index.css` was over 4,600 lines with repeated hero/mobile overrides | Hero fixes were overwritten by later selectors |
| DOM-driven flow | business logic depended on IDs and `setFlowState()` globals | Steps broke when markup moved or was hidden |
| Unverified marketing claims | fake live ticker, 1,000+ prizes and 500M KIP claim | Operational and reputation risk |
| Mixed UAT/production language | page said rewards were recorded/confirmed while allocation was client-side | Users could misunderstand preview results |
| Missing real PDF | package had only `page-1.png` | Policy download/SEO could not be finalized |
| Firebase config embedded as dummy values | `src/firebase.ts` used a demo API key | Runtime behavior depended on manual source edits |

## UX corrections

### Hero

- SEO H1 focuses on accumulation and partner benefit.
- Wheel is part of the approved image only; no interactive wheel overlays the hero.
- Hero height is viewport-aware and capped.
- Copy is confined to a safe column.
- CTA labels describe the next action.

### Funnel

- One dialog contains one explicit step at a time.
- Progress is visible and keyboard accessible.
- Registration collects only necessary fields.
- Policy acknowledgement happens before spin.
- UAT reward language is explicit.
- Cart remains a draft; WhatsApp is the confirmation handoff.

### Content

- Product cards use neutral product data only.
- Removed unsupported efficacy/sales claims from the old product descriptions.
- Removed `<100K` from customer-facing sample-gift wording.
- Special prizes show `pending` rather than implying a chance to win.
