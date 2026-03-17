# Mimi Site v2

Retro System 7 / developer-kit landing for Mimi AI. React + Vite.

## Assets

Place required PNGs in `public/assets/mimi-pixel-fal/` (see `DESIGN_LOCK.md` and source spec). `mimi_infinity_3.png` is currently aliased from hero art until the infinity logo asset ships.

## Develop

```bash
npm install
npm run dev
```

## Deploy

Netlify: connect repo, build `npm run build`, publish `dist`.

## Waitlist / Stripe

Form posts to `https://usemimiai.com/api/create-checkout` with `contact_email`, `business_name`, `plan` (`starter` | `pro`). Configure `VITE_API_ORIGIN` if testing against another origin.
