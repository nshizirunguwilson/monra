# Monra

A personal finance tracker built with Next.js and Express. Track accounts, transactions, budgets, and savings goals with a clean, responsive UI.

## Tech Stack

**Frontend** — `/client`
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- Zustand (state management), Framer Motion (animations)
- Sonner (toast notifications), Lucide (icons)

**Backend** — `/server`
- Express 5, TypeScript, Prisma ORM, PostgreSQL
- JWT authentication (access + refresh tokens)
- Zod request validation, Swagger/OpenAPI docs

## Features

- **Accounts** — Bank, Cash, Crypto, Savings, Credit Card, Investment with balance tracking
- **Transactions** — Income/Expense with categories, search, filters, table/card view toggle
- **Budgets** — Monthly budgets per category with spending progress
- **Savings Goals** — Target tracking with contributions and progress bars
- **Categories** — 14 default categories with subcategories + custom categories
- **Settings** — Profile editing, theme toggle, currency/timezone preferences
- **Auth** — Register, login, JWT access/refresh token rotation, HTTP-only cookies
- **Theming** — Light/dark mode with custom design system (Outfit font, squircle borders)

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Clone and install dependencies

```bash
cd monra

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure environment

Create `server/.env`:

```env
DATABASE_URL="postgresql://your_user@localhost:5432/monra?schema=public"
JWT_SECRET="your-secure-random-secret"
JWT_REFRESH_SECRET="your-secure-random-refresh-secret"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
PORT=4000
NODE_ENV=development
CLIENT_URL="http://localhost:3000"
```

Generate secure secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Set up the database

```bash
cd server

# Create the database
createdb monra

# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed default categories
npm run db:seed
```

### 4. Run the app

```bash
# Terminal 1 — Start the server
cd server && npm run dev

# Terminal 2 — Start the client
cd client && npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- API Docs (Swagger): http://localhost:4000/api/docs
- Health Check: http://localhost:4000/api/health

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |

### Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounts` | List all accounts |
| POST | `/api/accounts` | Create account |
| GET | `/api/accounts/:id` | Get account |
| PUT | `/api/accounts/:id` | Update account |
| DELETE | `/api/accounts/:id` | Delete account |
| PATCH | `/api/accounts/:id/archive` | Toggle archive |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List (with filters, pagination, search) |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/:id` | Get transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all (default + custom) |
| POST | `/api/categories` | Create custom category |
| PUT | `/api/categories/:id` | Update custom category |
| DELETE | `/api/categories/:id` | Delete custom category |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | List budgets with spending data |
| POST | `/api/budgets` | Create/update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | List savings goals |
| POST | `/api/goals` | Create goal |
| GET | `/api/goals/:id` | Get goal details |
| PUT | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |
| POST | `/api/goals/:id/contribute` | Add contribution |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update profile |

## Project Structure

```
monra/
├── client/                     # Next.js frontend
│   └── src/
│       ├── app/                # Pages (App Router)
│       │   ├── (auth)/         # Login, Register, Forgot Password
│       │   ├── (dashboard)/    # Dashboard, Accounts, Transactions, Goals, Budgets, Settings
│       │   └── page.tsx        # Public landing page
│       ├── components/
│       │   ├── ui/             # Button, Card, Input, Modal
│       │   ├── layout/         # Sidebar, TopNav, MobileNav
│       │   └── shared/         # AuthGuard, EmptyState
│       ├── stores/             # Zustand (auth, theme, sidebar)
│       └── lib/                # API client, utils
│
├── server/                     # Express backend
│   └── src/
│       ├── config/             # DB, env, swagger
│       ├── middleware/         # Auth, validation, error handler
│       ├── routes/             # All route definitions
│       ├── controllers/        # Auth handlers
│       ├── services/           # Auth business logic
│       ├── validators/         # Zod schemas
│       └── utils/              # JWT helpers
│   └── prisma/
│       ├── schema.prisma       # 14 models
│       └── seed.ts             # Default categories
```

## Database Models

User, Account, Transaction, TransactionSplit, TransactionTag, Tag, Category, RecurringTransaction, Transfer, SavingsGoal, GoalContribution, Budget, Achievement, RefreshToken

## Scripts

### Server

| Script | Command |
|--------|---------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled build |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed default categories |
| `npm run db:studio` | Open Prisma Studio |

### Client

| Script | Command |
|--------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Run production build |

## License

ISC
