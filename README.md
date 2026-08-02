# Scam Shield

A web app that checks SMS messages and links for common fraud patterns
(fake bKash/Nagad requests, phishing links, lottery scams) and shows a
Red / Yellow / Green risk signal with a plain-language explanation.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase (Auth + Postgres database + Edge Functions)
- Google Safe Browsing API (via a Supabase Edge Function, so the key
  never reaches the browser)

## 1. Install dependencies

```bash
npm install
```

## 2. Set up Supabase

1. Create a free project at https://supabase.com
2. In the SQL editor, run the contents of `supabase/migrations/0001_init.sql`
   — this creates the `checks` and `reports` tables with row-level
   security so users can only see their own data.
3. Copy `.env.example` to `.env` and fill in your project URL and anon key
   (Project settings → API):

```bash
cp .env.example .env
```

## 3. (Optional) Set up Google Safe Browsing

This step is optional — the app works fully without it, just with less
accurate link checks.

1. Get a free API key: https://developers.google.com/safe-browsing/v4/get-started
2. Deploy the edge function and set the secret:

```bash
supabase functions deploy check-url
supabase secrets set SAFE_BROWSING_API_KEY=your_key_here
```

If you skip this, the app still works — it just relies on the
client-side keyword/pattern engine only.

## 4. Run locally

```bash
npm run dev
```

## 5. Build for production

```bash
npm run build
```

Deploy the `dist` folder to Vercel, Netlify, or any static host.

## Project structure

```
src/
├── lib/
│   ├── detectionEngine.ts   → keyword/pattern scoring logic (the core)
│   ├── safeBrowsing.ts      → calls the Supabase edge function
│   └── supabaseClient.ts
├── context/
│   ├── AuthContext.tsx      → login state
│   └── LanguageContext.tsx  → EN/বাংলা toggle
├── components/
│   ├── Navbar.tsx
│   ├── ResultCard.tsx       → the Red/Yellow/Green result UI
│   └── LoadingCard.tsx
└── pages/
    ├── Checker.tsx          → main page
    ├── History.tsx
    ├── Report.tsx
    ├── Login.tsx
    └── Signup.tsx

supabase/
├── migrations/0001_init.sql → database schema
└── functions/check-url/     → Safe Browsing edge function
```

## How the detection engine works

`src/lib/detectionEngine.ts` scores a message on these signals:

| Signal | Points |
|---|---|
| Urgency language ("জরুরি", "act now") | +20 |
| Asks for OTP/PIN/password | +30 |
| Impersonates bKash/Nagad/Rocket agent | +15 |
| Lottery/prize bait | +20 |
| Threatens to block your account | +15 |
| Shortened link (bit.ly, etc.) | +15 |
| Look-alike domain (e.g. bkash-verify.xyz) | +30 |
| Flagged by Google Safe Browsing | +40 |

Score ≥ 66 → Red · 31–65 → Yellow · ≤ 30 → Green

Adjust weights or add keywords directly in `URGENCY_WORDS`,
`SECRET_CODE_WORDS`, etc. at the top of that file.
