# Notice2Action

Turn long, formal notices (from colleges, universities, or government offices) into a clean,
structured action plan — deadlines, eligibility, required documents, and a tickable checklist —
in seconds. Paste the text or upload a PDF; Google Gemini extracts the structure; you get a plan
you can actually act on.

A full MERN stack app: **React (Vite) + Tailwind** on the frontend, **Node/Express + MongoDB** on
the backend, **Cloudinary** for file storage, and **Google Gemini** (free tier) for the AI extraction.

---

## ✨ Features

**Core (from spec):**
- Paste notice text or drag-and-drop a PDF/image
- PDF text extraction (`pdf-parse`) before sending to AI
- Single Gemini call returns strict JSON: summary, deadlines, eligibility, required documents,
  instructions, action checklist, and a "don't miss this" warning
- Automatic **Lost & Found** detection with its own card style and status pill
- Deadline status badges: `upcoming` / `due soon` (within 3 days) / `passed`
- Tickable action checklist with progress bar, persisted per notice in MongoDB
- Per-user Notice History with the original source text always viewable
- Shareable read-only plan via a public link (`/share/:id`)
- JWT auth (register/login) — lightweight, no OAuth needed

**Extra free features added on top (no paid APIs, no extra cost):**
- 📅 **Add to Calendar** — one-click download of a `.ics` file with all deadlines (and a
  built-in 1-day-before reminder), works with Google Calendar / Apple Calendar / Outlook
- ⬇️ **Export as PDF** — the whole action plan, generated entirely client-side with `jsPDF`
- 🔔 **Browser deadline reminders** — uses the native Notification API to alert you when a
  deadline is "due soon", with zero backend or push-service cost
- 🌙 **Dark mode** — toggle in the navbar, persisted across visits
- 🔎 **Search** in Notice History
- 🔗 **QR code** shown alongside every share link, for scanning on another device
- "Try a sample notice" buttons on the home page for an instant, zero-setup demo

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (free tier) + Mongoose |
| File storage | Cloudinary (free tier) |
| AI extraction | Google Gemini API (`gemini-2.0-flash`, free tier) |
| PDF parsing | `pdf-parse` |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Extras | `jspdf` (PDF export), `qrcode.react` (QR codes) |

---

## 📁 Project Structure

```
notice2action/
├── client/                  # React (Vite) app
│   ├── src/
│   │   ├── components/      # Navbar, UploadBox, HighlightCard, DeadlineBadge, ChecklistItem, etc.
│   │   ├── pages/           # Home, Result, History, Login, Register, SharedPlan
│   │   ├── context/         # AuthContext, ThemeContext (dark mode)
│   │   ├── api/             # axios instance + typed API calls
│   │   └── utils/           # date helpers, pdf export, calendar/reminder helpers
│   └── .env.example
├── server/
│   ├── models/               # User.js, Notice.js
│   ├── routes/                # authRoutes.js, noticeRoutes.js
│   ├── controllers/           # authController.js, noticeController.js
│   ├── services/               # geminiService.js, cloudinaryService.js, pdfService.js, icsService.js
│   ├── middleware/             # auth.js, errorHandler.js
│   ├── seed/                    # sample notice text for instant demoing
│   ├── server.js
│   └── .env.example
└── README.md
```

---

## 🚀 Local Setup

### 1. Clone and install

```bash
git clone <your-fork-url> notice2action
cd notice2action

# install backend deps
cd server
npm install

# install frontend deps
cd ../client
npm install
```

### 2. Get your free API keys (see next section) and fill in the `.env` files

```bash
# from the server/ folder
cp .env.example .env
# then edit server/.env with your real values

# from the client/ folder
cp .env.example .env
# then edit client/.env if your backend runs somewhere other than localhost:5000
```

### 3. Run both dev servers

```bash
# terminal 1 — backend
cd server
npm run dev        # runs on http://localhost:5000

# terminal 2 — frontend
cd client
npm run dev        # runs on http://localhost:5173
```

Open `http://localhost:5173`, register an account, and click **"Try a sample general notice"**
(or the lost & found one) on the Home page to demo it instantly — no real notice needed.

### 4. Build for production

```bash
cd client
npm run build       # outputs static files to client/dist

cd ../server
npm start            # runs the Express server with NODE_ENV=production
```

---

## 🔑 How to Get Every Free API Key / Service

Everything below is free — no credit card required anywhere.

### MongoDB Atlas (database)
1. Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and sign up.
2. Create a new **free (M0) cluster**.
3. Under **Database Access**, create a database user with a username/password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) for development.
5. Click **Connect → Drivers**, copy the connection string, and paste it into `server/.env` as
   `MONGO_URI`, replacing `<username>`, `<password>`, and the database name (e.g. `notice2action`).

### Cloudinary (file storage)
1. Go to [cloudinary.com](https://cloudinary.com/) and sign up for the free tier.
2. On your Dashboard, copy the **Cloud Name**, **API Key**, and **API Secret**.
3. Paste them into `server/.env` as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   `CLOUDINARY_API_SECRET`.

### Google Gemini API (AI extraction)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with a Google account and click **Create API key** (no billing needed for the free tier).
3. Paste it into `server/.env` as `GEMINI_API_KEY`.
4. `GEMINI_MODEL` defaults to `gemini-2.0-flash`, which is fast and fully within the free tier.

### JWT Secret
Just a long random string used to sign tokens — no external service needed. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output into `server/.env` as `JWT_SECRET`.

---

## 🔐 Environment Variables

### `server/.env`
See `server/.env.example` for the full commented list — includes `PORT`, `MONGO_URI`, `JWT_SECRET`,
`JWT_EXPIRES_IN`, `CLOUDINARY_CLOUD_NAME`/`API_KEY`/`API_SECRET`, `GEMINI_API_KEY`, `GEMINI_MODEL`,
and `CLIENT_URL` (used for CORS and building share links).

### `client/.env`
See `client/.env.example` — just `VITE_API_URL`, pointing at your backend's `/api` base URL.

**Never commit real `.env` files.** Both `client/.gitignore` and `server/.gitignore` already
exclude `.env` — double check it stays that way before pushing.

---

## ☁️ Deployment (all free tiers)

### Database — MongoDB Atlas
Already hosted once you create the cluster above. Nothing else to deploy.

### Backend — Render or Railway
1. Push this repo to GitHub.
2. On [Render](https://render.com) (or [Railway](https://railway.app)), create a new **Web Service**
   pointing at the `server/` directory (set the root directory to `server` if asked).
3. Build command: `npm install`. Start command: `npm start`.
4. Add all the variables from `server/.env` in the service's environment settings.
5. Set `CLIENT_URL` to your deployed frontend URL (e.g. `https://notice2action.vercel.app`) so CORS
   and share links work correctly.

### Frontend — Vercel
1. Import the repo into [Vercel](https://vercel.com).
2. Set the root directory to `client/`.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Add environment variable `VITE_API_URL` pointing at your deployed backend, e.g.
   `https://notice2action-api.onrender.com/api`.
5. Deploy.

---

## 🛠 Troubleshooting

**CORS errors in the browser console**
Make sure `CLIENT_URL` in `server/.env` exactly matches the URL your frontend is served from
(including `https://` and no trailing slash), then restart the backend.

**Gemini returns invalid JSON / "Could not extract structured data"**
The service already retries once automatically. If it still fails, the notice text may be very
unusual in structure — try again, or check that `GEMINI_API_KEY` is valid and hasn't hit a rate
limit (the free tier has generous but finite per-minute limits).

**Cloudinary upload errors**
Double-check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are copied
exactly from your Cloudinary dashboard (no extra spaces). Also confirm the file is under 10MB.

**"No text could be extracted from this PDF"**
This means the PDF is a scanned image with no real text layer (no OCR is configured, to keep the
whole stack free). Paste the notice text directly instead, or upload a text-based PDF.

**Image uploads ask for pasted text too**
There's no free OCR service wired in, so image uploads (JPG/PNG) require you to also paste the
notice text alongside the image — the image is still stored and viewable as the "source", but the
AI extraction runs on the pasted text.

**MongoDB connection refused / timeout**
Check that your IP is allowed under Atlas **Network Access** (use `0.0.0.0/0` for development),
and that the username/password in `MONGO_URI` don't contain unescaped special characters.

---

## 📋 Demo Notices

Two ready-to-use sample notices are built in:
- Click **"Try a sample general notice"** on the Home page — a university re-evaluation notice
  with deadlines, eligibility, and required documents.
- Click **"Try a sample lost & found notice"** — a found-item notice that triggers the Lost &
  Found card UI.

The raw text for both also lives in `server/seed/sampleNotices.js`, and you can print them to your
terminal with `npm run seed` inside `server/` (via `server/seed/printSamples.js`).
