# Expenseo — Travel Expense Manager

<img src="assets/images/logo.png" alt="Expenseo logo"/>

A lightweight, mobile-first SPA for tracking shared travel expenses. Create trip groups, add members, log expenses, and see who owes what — no login required.

**Stack:** React + Vite + TypeScript · Tailwind CSS · Google Apps Script · Google Sheets

---

## Features

- Create trip groups and add members
- Log expenses with equal or custom splits
- Real-time sync via 15-second polling
- Balance summary and settlement suggestions
- Expense stats and charts
- No authentication required

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- A Google account (for the backend)

### 1. Clone the repo

```bash
git clone <repo-url>
cd expense-tracker-2026
npm install
```

### 2. Set up Google Sheets (Database)

1. Go to [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. Rename the first sheet tab to `Index` and add these headers in row 1:

   | A | B | C |
   |---|---|---|
   | GroupID | GroupName | CreatedDate |

3. Open **Extensions → Apps Script** from within that spreadsheet.
4. Delete any existing code in the editor.
5. Paste the entire contents of `script/GAS_script.js` from this repo.
6. Click **Deploy → New deployment**.
7. Set type to **Web App**.
8. Configure:
   - **Execute as:** Me
   - **Who has access:** Anyone
9. Click **Deploy** and authorize the permissions when prompted.
10. Copy the **Web App URL** — it looks like:
    `https://script.google.com/macros/s/<deployment-id>/exec`

> **Re-deploying after changes:** Go to **Deploy → Manage deployments**, click the pencil icon, select **New version**, then deploy.

### 4. Configure environment variables

Create a `.env` file in the project root:

```bash
cp .env.example .env   # if .env.example exists, otherwise create manually
```

Or create `.env` directly:

```env
VITE_GAS_API_URL=https://script.google.com/macros/s/<your-deployment-id>/exec
```

> The `VITE_` prefix is required — Vite only exposes env vars with this prefix to the browser.

### 5. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_GAS_API_URL` | Yes | The deployed Google Apps Script Web App URL |

> **Never commit your `.env` file.** Add `.env` to `.gitignore` to keep your GAS URL private.

---

## Build & Preview

```bash
# Type-check and build for production
npm run build

# Preview the production build locally
npm run preview
```

---

## Project Structure

```
expense-tracker-2026/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route-level page components
│   └── utils/
│       ├── api.ts         # All GAS API calls
│       └── groupSession.ts
├── script/
│   └── GAS_script.js      # Google Apps Script backend (deploy this to GAS)
├── docs/
│   ├── Architecture.md    # Detailed architecture spec
│   └── CodingStandards.md # Coding conventions
├── .env                   # Local env vars (not committed)
└── vite.config.ts
```

---

## Deployment

The frontend can be deployed to **Vercel** or **Netlify** (free tier).

When deploying, add `VITE_GAS_API_URL` as an environment variable in your hosting platform's dashboard — do not rely on the local `.env` file for production builds.

**Vercel:**
Project Settings → Environment Variables → add `VITE_GAS_API_URL`

**Netlify:**
Site Settings → Environment Variables → add `VITE_GAS_API_URL`

---

## Troubleshooting

**CORS errors in the browser**
- Ensure the GAS Web App is deployed with **"Anyone"** access.
- Use `Content-Type: text/plain` in fetch requests (already handled in `api.ts`) to avoid preflight OPTIONS requests that GAS cannot handle.

**Changes to GAS script not reflecting**
- You must create a **new version** in the GAS deployment manager each time you update the script.

**Data not updating**
- The app polls every 15 seconds. Manually refresh the page to force an immediate fetch.
- Check the browser console for API errors and verify your `VITE_GAS_API_URL` is correct.
