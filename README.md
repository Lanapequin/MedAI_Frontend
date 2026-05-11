# MedAI Frontend

React/Next.js web interface for the MedAI clinical triage support system.

Connects to the [MedAI Backend](https://github.com/your-org/MedAI_Backend) via REST API.

## Features

- **Triage form** — 15 clinical variables (vital signs, demographics, chief complaint, comorbidities)
- **Results dashboard** — MTS urgency level, class probability distribution, SHAP feature contributions
- **Patient history** — local history of all classifications (/pacientes)
- **Statistics dashboard** — session stats by level (/informes)
- **Mock mode** — runs without a backend for UI demos

## Setup

### Prerequisites

- Node.js 18+
- npm 9+
- MedAI Backend running on port 8000 (or set `NEXT_PUBLIC_API_URL`)

### 1. Clone and install

```bash
git clone https://github.com/your-org/MedAI_Frontend.git
cd MedAI_Frontend

npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local if your backend URL differs from http://localhost:8000
```

### 3. Start dev server

```bash
npm run dev
# Frontend: http://localhost:3000
```

### 4. Production build

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |
| `NEXT_PUBLIC_USE_MOCK_API` | `false` | `true` = client-side simulation only |

Copy `.env.example` to `.env.local` — Next.js loads `.env.local` automatically.

## Docker

```bash
docker build -t medai-frontend \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  .
docker run -p 3000:3000 medai-frontend
```

For the full stack (backend + frontend + database), use `docker-compose.yml` in the **MedAI_Backend** repository.

## Project Structure

```
MedAI_Frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx             # Home — triage form
│   │   ├── pacientes/page.tsx   # Patient history
│   │   └── informes/page.tsx    # Statistics dashboard
│   ├── components/
│   │   ├── TriageFormNew.tsx    # Main triage form
│   │   └── results/
│   │       ├── ResultsViewNew.tsx  # Results dashboard with SHAP visualization
│   │       ├── ProbabilityChart.tsx
│   │       ├── SHAPChart.tsx
│   │       └── TriageLevelDisplay.tsx
│   ├── services/
│   │   └── triageApi.ts         # Backend API client
│   ├── types/
│   │   └── triage.ts            # TypeScript types (including real SHAP types)
│   └── lib/
│       ├── validations.ts       # Zod schemas
│       ├── triageStore.ts       # localStorage history management
│       └── vitalSigns.ts        # Vital sign helpers
├── .env.example                 # Environment template
├── Dockerfile
├── package.json
└── next.config.js
```

## API Contract

The frontend calls `POST /predict` on the backend. Expected response shape:

```json
{
  "nivel_codigo": 1,
  "nivel_triage": "Nivel 1 - Resucitación/Inmediato",
  "confianza": 95.4,
  "probabilidades": { "Nivel 1": 95.4, "Nivel 2": 3.7, ... },
  "shap_base_value": 0.0323,
  "shap_features": [
    { "feature": "spO2", "value": -1.8, "shap_value": 2.16, "direction": "aumenta" },
    ...
  ],
  "factores_riesgo": [ { "factor": "Hipoxia severa", "severidad": "alta", ... } ],
  "timestamp": "2025-12-08T12:00:00",
  "prediction_id": 42
}
```

See full API docs at `http://localhost:8000/docs` when the backend is running.

## Demo video:
https://youtu.be/3YQESG7gYVY
