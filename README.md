# Quantix — Quantity Engineering & Cost Analysis

A full-stack construction quantity surveying, scheduling, and cost estimation platform for the Egyptian/MENA market. Built with Django REST Framework + React.

## Features

- **Project Management** — Create residential, commercial, or infrastructure projects with hierarchical Site/Floor breakdown
- **Quantity Takeoff** — Define structural elements (foundations, columns, beams, slabs, masonry, steel, etc.) and auto-compute concrete, rebar, formwork, and material quantities using specialized calculators (ACI rebar, AISC steel shapes, etc.)
- **CPM Scheduling** — Auto-generate construction activities from element quantities with productivity rates, run Critical Path Method engine for early/late start/finish, float, and critical path. Visual Gantt chart included.
- **Cost Estimation** — Maintain material prices and labor rates, auto-generate cost estimates from element quantities with markup %, produce priced BOQs
- **Reporting** — Generate professional PDF reports (Quantity Takeoff, Bending Schedule, CPM Schedule, BOQ) and Excel BOQ exports using ReportLab and OpenPyXL
- **Bilingual (Arabic/English)** — Full RTL support with Arabic and English translations
- **User Authentication** — Email/password login & registration, private per-user project isolation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.13, Django 5.1, Django REST Framework 3.15 |
| **Database** | SQLite (development) |
| **PDF Generation** | ReportLab |
| **Excel Export** | OpenPyXL |
| **Frontend** | React 19, TypeScript, Vite 8 |
| **Routing** | React Router 7 |
| **HTTP Client** | Axios |
| **Styling** | Tailwind CSS 4 |
| **Charts** | Chart.js + react-chartjs-2 |

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- npm

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8080
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server proxies `/api` requests to the backend (default: `http://127.0.0.1:8080`). Configure this in `vite.config.ts`.

### Default Test User

| Email | Password |
|-------|----------|
| `admin@test.com` | `admin123` |

## Project Structure

```
├── backend/
│   ├── config/           # Django settings, URLs, auth views/backends
│   ├── projects/         # Project, Site, Floor models & API
│   ├── quantities/       # Element models, calculators (ACI, AISC, etc.)
│   ├── scheduling/       # CPM engine, Activity models
│   ├── costing/          # Material prices, cost estimates
│   └── reports/          # PDF/Excel report generation
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios client with auth interceptor
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth, Currency providers
│   │   ├── i18n/         # English & Arabic translations
│   │   └── pages/        # Dashboard, ProjectDetail, Prices, Login, etc.
│   └── vite.config.ts
└── README.md
```

## License

MIT
