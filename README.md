# CrossTax Pro

A cross-border tax filing system for US-Canada individuals. Built with CPA-level accuracy for residency determination and tax calculations.

## Features

- **Residency Determination**
  - US Substantial Presence Test (IRC 7701(b))
  - Canada Significant Residential Ties
  - Factual and Deemed Resident calculations

- **Tax Calculations**
  - US Federal Tax Brackets (2025)
  - Canada Federal + Provincial Tax Brackets (ON, BC)
  - Foreign Tax Credit optimization
  - Treaty benefits calculations

- **Full Filing Flow**
  - Dashboard with progress tracking
  - Residency wizard
  - Income entry with live tax estimates
  - Deductions (Standard + Custom)
  - Document upload
  - Filing submission

## Tech Stack

- **Frontend:** React 18, React Router, Zustand
- **Backend:** Express.js, Node.js
- **Database:** PostgreSQL (schema included)
- **Tax Engine:** Custom CPA-level rules

## Quick Start

### Prerequisites
- Node.js 18+
- Docker (optional)

### Running Locally

```bash
# Install frontend dependencies
cd frontend
npm install

# Start frontend
npm start
# App runs at http://localhost:3005

# In another terminal, start backend
cd ../backend
npm install
npm start
# API runs at http://localhost:4000
```

### Running with Docker

```bash
docker-compose up -d
```

## Project Structure

```
cross-border-tax/
├── frontend/          # React application
│   ├── src/
│   │   ├── pages/    # Dashboard, Residency, Income, etc.
│   │   ├── context/  # Auth & Tax state
│   │   ├── services/ # API & Tax engine
│   │   └── components/
│   └── public/
├── backend/          # Express API
│   └── src/
│       ├── routes/   # API endpoints
│       ├── tax-engine/ # CPA-level calculations
│       └── middleware/
├── docker-compose.yml
├── init.sql          # Database schema
└── SPEC.md           # Product specification
```

## Tax Rules Implemented

### US Residency
- Green Card Test
- Substantial Presence Test (183-day weighted calculation)
- Closer Connections Exception

### Canada Residency
- 183-Day Rule
- Significant Residential Ties Test
- Part-Year Resident rules
- Departure Tax

### Tax Brackets
- US Federal (Single & Married Filing Jointly)
- Canada Federal
- Canada Provincial (Ontario, British Columbia)

## Environment Variables

```env
# Backend
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/crosstax
JWT_SECRET=your-secret
ENCRYPTION_KEY=your-key

# Frontend
REACT_APP_API_URL=http://localhost:4000
```

## License

MIT
