# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # dev server at http://localhost:3000
npm run build    # production build
npm test         # run tests (Jest + React Testing Library)
npm test -- --testPathPattern=App  # run a single test file
```

## Project Overview

**TrueCell Electronics Trading LLC** — a mobile-first invoice generator PWA for internal salespersons. Designed as a phone-width (max 420px) single-page app. No backend; all state lives in `localStorage` and Zustand.

## Architecture

### Routing (`src/routes/AppRoutes.tsx`)
Three routes:
- `/` → `HomePage` — sales rep picker + "Create Invoice" entry point
- `/invoice/new` → `CreateInvoicePage` — invoice form
- `/invoice/preview` → `InvoicePreviewPage` — read-only invoice + PDF/share actions

Navigation is linear: Home → Create → Preview. The `"Make Sales Order"` button on Create navigates to Preview.

### State Management (`src/store/invoiceStore.ts`)
Zustand store with `persist` middleware (key: `invoice-store`). Holds:
- `selectedRepresentative` — persisted across reloads; gates the "Create New Invoice" button on HomePage
- `currentInvoice` — the last submitted `Invoice` object, read by InvoicePreviewPage

### Invoice Data Flow
1. `CreateInvoicePage` uses `react-hook-form` + `useFieldArray` for the items table.
2. On every keystroke, `watch()` auto-saves a draft to `localStorage` under key `invoice-draft`.
3. Totals are computed live via `useInvoiceCalculations` hook (pure `qty × price` sum, no tax).
4. On submit (`onMakeSalesOrder`): saves to Zustand store + writes `invoice-{number}` and `last-invoice` keys to localStorage, then navigates to `/invoice/preview`.
5. `InvoicePreviewPage` reads from the Zustand store first; falls back to `localStorage` via `last-invoice` key if the store is empty (e.g. after a page reload).

### PDF Generation (`src/utils/pdf.ts`)
Uses `html2canvas` to screenshot a rendered `InvoicePrintView` DOM node, then writes it into a `jsPDF` A4 page. The `CreateInvoicePage` renders a hidden `InvoicePrintView` off-screen (opacity 0, z-index -1) so it's available to `html2canvas` without a page transition.

### Share Flow
- **WhatsApp share** (from Create page): generates PDF blob → tries `navigator.share()` (Web Share API, works on Android Chrome) → falls back to opening the PDF in a new tab + opening `wa.me` with a text message.
- **Share** (from Preview page): same logic.

### Invoice Numbering (`src/utils/invoiceNumber.ts`)
Maintains a per-year counter in `localStorage` (`invoice-seq-{year}`). Format: `INV-{year}-{0001}`.

### Sales Reps (`src/api/salesRepApi.ts`)
Currently a mock with a 400ms delay returning a hardcoded list. Replace with a real API call here when a backend is added.

### Key Types (`src/types/invoice.ts`)
```ts
Invoice { invoiceNumber, customerName, salesRepresentative, invoiceDate, items[], subtotal, total, paymentStatus? }
InvoiceItem { id, model, qty?, price? }
```

### CSS Architecture
Single global stylesheet at `src/App.css`. All layout uses CSS custom properties defined in `:root`. The app is constrained to `max-width: 420px; margin: 0 auto` on screens ≥ 600px. Page layout uses `.page` (flex column, `height: 100vh`) with a fixed header, scrollable `main`, and a fixed footer.

### Path Aliases
`tsconfig.json` sets `"baseUrl": "src"`, so all imports resolve from `src/` (e.g. `import { useInvoiceStore } from 'store/invoiceStore'`).

## Design System
- Primary color: `#8e1f5c` (deep magenta)
- Accent: `#ff8a00` (orange — used for "paid" payment bar and WhatsApp button)
- All assets live in `src/assets/` (SVG + PNG pairs); PNG versions are what the components import
