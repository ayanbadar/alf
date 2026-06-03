# ALF — AI WhatsApp Employee (Real Estate MVP)

Multi-tenant SaaS for Pakistani real-estate agencies: instant Urdu/English WhatsApp replies powered by RAG, lead capture, appointments, and human handover.

## Stack

- **Backend:** FastAPI, SQLAlchemy, PostgreSQL + pgvector, ARQ (Redis)
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS 4
- **WhatsApp:** Meta WhatsApp Cloud API (Graph API)
- **AI:** OpenAI `gpt-4o-mini` + `text-embedding-3-small`

## Quick start

### 1. Infrastructure

```bash
cd alf
docker compose up -d postgres redis
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: SECRET_KEY, ENCRYPTION_KEY, OPENAI_API_KEY, META_* vars

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

In another terminal:

```bash
cd backend
arq app.workers.settings.WorkerSettings
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — register your agency, then configure WhatsApp in **Settings**.

### 4. Meta WhatsApp webhook

1. Create a Meta Business app with WhatsApp product
2. Set webhook callback: `https://YOUR_DOMAIN/api/v1/webhooks/whatsapp`
3. Verify token: same as `META_WEBHOOK_VERIFY_TOKEN` in `.env`
4. Subscribe to `messages`
5. Paste **Phone Number ID** and **Permanent Access Token** in dashboard Settings

For local dev, use [ngrok](https://ngrok.com/): `ngrok http 8000`

## Test scripts (Urdu + English)

| Customer message | Expected behavior |
|------------------|-------------------|
| DHA 5 marla plot price? | Answer from uploaded PDF (RAG) |
| Send details | Brochure via Send brochure button or AI `send_brochure` extraction |
| Site visit kal 11 baje | Appointment row created |
| Unknown project XYZ | “Sales team will contact you” — no hallucination |
| /agent | Human mode; AI pauses |

## API overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/register` | Create org + owner |
| `GET/POST /api/v1/webhooks/whatsapp` | Meta webhook |
| `PUT /api/v1/settings/whatsapp` | Connect Meta credentials |
| `GET /api/v1/conversations` | Chat threads |
| `POST /api/v1/documents` | Upload knowledge base |
| `GET /api/v1/dashboard/stats` | Overview metrics |

## Project structure

```
alf/
├── backend/app/       # FastAPI application
├── frontend/src/      # React dashboard
├── docker/            # Postgres init (pgvector)
└── docker-compose.yml
```

## Environment variables

See [backend/.env.example](backend/.env.example).

Generate keys:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

## License

Proprietary — pilot use.
