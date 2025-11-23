# FocusFlow Architecture Documentation

## 📐 System Architecture

FocusFlow follows a modern full-stack architecture using Next.js 16's App Router with React Server Components (RSC) and Server Actions.

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
├─────────────────────────────────────────────────────────────┤
│  React Server Components (RSC)    │  Client Components      │
│  - Dashboard (page.tsx)            │  - CheckInWidget       │
│  - New Cycle (page.tsx)            │  - NewCycleForm        │
│  - Insights (page.tsx)             │  - Navigation          │
│  - Layout (layout.tsx)             │                        │
└──────────────┬──────────────────────┴──────────┬────────────┘
               │                                  │
               │ RSC Protocol                     │ Server Actions
               │                                  │
┌──────────────▼──────────────────────────────────▼────────────┐
│                    Next.js Server (Edge)                      │
├───────────────────────────────────────────────────────────────┤
│                     Server Actions (lib/actions.ts)           │
│  - createCycle()      - checkInToday()                        │
│  - getAllCycles()     - getAnalytics()                        │
│  - getCycleById()     - Helper functions                      │
└─────────────────────────────┬─────────────────────────────────┘
                              │
                              │ Prisma Client
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                       Database Layer                          │
├───────────────────────────────────────────────────────────────┤
│  Prisma ORM (lib/db.ts)                                       │
│  └─ Singleton pattern for connection pooling                 │
└─────────────────────────────┬─────────────────────────────────┘
                              │
                              │ SQLite Driver
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                   SQLite Database (dev.db)                    │
│  Tables: Cycle, CheckIn                                       │
└───────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Patterns

### 1. Read Pattern (Server Component)

```typescript
// app/page.tsx (Server Component)
export default async function Home() {
  const cycles = await getAllCycles() // Direct server action call
  return <div>{/* Render cycles */}</div>
}
```

**Flow:**
1. Request hits `/` route
2. Next.js executes Server Component on server
3. Server Component calls `getAllCycles()` server action
4. Prisma queries SQLite database
5. Data returns to component
6. HTML rendered and streamed to client
7. Client hydrates minimal JavaScript

**Benefits:**
- No client-side data fetching needed
- Automatic loading states
- SEO-friendly (server-rendered HTML)
- Reduced JavaScript bundle

### 2. Write Pattern (Client Component → Server Action)

```typescript
// components/CheckInWidget.tsx (Client Component)
'use client'

export default function CheckInWidget({ cycleId }) {
  const [isPending, startTransition] = useTransition()

  const handleCheckIn = () => {
    startTransition(async () => {
      const result = await checkInToday(cycleId)
      // Handle result
    })
  }

  return <button onClick={handleCheckIn}>Check In</button>
}
```

**Flow:**
1. User clicks "Check In" button
2. Client component calls `checkInToday()` via `useTransition`
3. Request sent to Next.js server (POST with cycleId)
4. Server action validates and creates CheckIn record
5. Prisma inserts into SQLite
6. Server calls `revalidatePath('/')` to invalidate cache
7. Response sent back to client
8. Client shows success/error state
9. Next navigation to `/` will fetch fresh data

**Benefits:**
- Type-safe client-to-server communication
- Automatic request deduplication
- Progressive enhancement (works without JS)
- Built-in loading states via `useTransition`

## 🗂️ File Structure Deep Dive

### `/app` Directory (Pages & Routes)

```
app/
├── layout.tsx          # Root layout (wraps all pages)
│   ├── Metadata config
│   ├── Global Navigation
│   └── <main> wrapper
│
├── page.tsx           # Dashboard (/) - RSC
│   ├── Fetches all cycles
│   ├── Empty state handling
│   └── Grid of CycleCard components
│
├── new/
│   └── page.tsx       # Create cycle (/new) - RSC
│       └── Wraps NewCycleForm client component
│
└── insights/
    └── page.tsx       # Analytics (/insights) - RSC
        ├── Fetches analytics data
        ├── Stats grid (4 metrics)
        ├── InsightsChart component
        └── Best cycle highlight
```

### `/components` Directory (Reusable UI)

```
components/
├── Navigation.tsx        # Client component (uses usePathname)
│   └── Responsive nav with active states
│
├── CycleCard.tsx        # Server component
│   ├── Displays cycle info
│   ├── ProgressBar child
│   └── CheckInWidget child
│
├── ProgressBar.tsx      # Pure component (no state)
│   └── Visual progress indicator
│
├── CheckInWidget.tsx    # Client component (interactive)
│   ├── Check-in button
│   ├── Loading states (useTransition)
│   ├── Error/success handling
│   └── Streak display
│
├── NewCycleForm.tsx     # Client component (form handling)
│   ├── Form validation
│   ├── Emoji selector
│   ├── Submit handler with server action
│   └── Navigation after success
│
└── InsightsChart.tsx    # Pure component (SVG rendering)
    └── Custom bar chart with 7-day data
```

### `/lib` Directory (Business Logic)

```
lib/
├── db.ts              # Prisma client singleton
│   ├── Global caching for dev hot-reload
│   └── Production optimization
│
└── actions.ts         # Server actions (data layer)
    ├── Cycle CRUD
    │   ├── createCycle(formData)
    │   ├── getAllCycles()
    │   └── getCycleById(id)
    │
    ├── Check-in logic
    │   └── checkInToday(cycleId)
    │       ├── Date validation
    │       ├── Duplicate prevention
    │       └── Path revalidation
    │
    ├── Analytics
    │   └── getAnalytics()
    │       ├── Aggregation queries
    │       ├── Score calculations
    │       └── Chart data formatting
    │
    └── Helper functions
        ├── calculateStreak(checkIns)
        └── hasCheckedInToday(checkIns)
```

## 🗄️ Database Design

### Schema Relationships

```
Cycle (1) ───< (N) CheckIn
  │                   │
  │                   │
  └─ onDelete: Cascade

Cycle:
- id: Primary Key (cuid)
- name: String (required)
- description: String? (optional)
- emoji: String (default "🎯")
- timestamps: createdAt, updatedAt

CheckIn:
- id: Primary Key (cuid)
- cycleId: Foreign Key → Cycle.id
- date: DateTime (indexed)
- createdAt: DateTime
- UNIQUE(cycleId, date) ← Prevents double check-ins
```

### Key Queries & Performance

**1. Get All Cycles with Check-ins**
```typescript
await prisma.cycle.findMany({
  include: { checkIns: { orderBy: { date: 'desc' } } },
  orderBy: { createdAt: 'desc' }
})
```
- **Performance**: O(n) cycles + O(m) check-ins
- **Optimization**: Indexed foreign key on `checkIns.cycleId`

**2. Check-in Today (with duplicate prevention)**
```typescript
await prisma.checkIn.create({
  data: { cycleId, date: todayMidnight }
})
```
- **Performance**: O(1) insert + unique constraint check
- **Optimization**: Composite unique index `@@unique([cycleId, date])`

**3. Analytics Aggregation**
```typescript
const cycles = await prisma.cycle.findMany({
  include: { checkIns: true }
})
// Compute stats in-memory (JavaScript)
```
- **Performance**: O(n*m) for n cycles with m check-ins
- **Trade-off**: Simple SQLite vs. complex SQL aggregations
- **Improvement**: Could use Prisma's aggregation API for large datasets

## 🔐 Security Considerations

### Current Security Measures
1. **SQL Injection**: Protected by Prisma's parameterized queries
2. **XSS**: React's automatic escaping
3. **CSRF**: Next.js built-in CSRF protection for Server Actions
4. **Type Safety**: TypeScript prevents many runtime errors

### What's Missing (Production TODO)
- ❌ Authentication (no user isolation)
- ❌ Rate limiting (prevent spam check-ins)
- ❌ Input sanitization (emoji selection)
- ❌ Authorization checks (who can modify cycles)

## 🎯 Performance Optimizations

### Current Optimizations
1. **React Server Components**
   - Zero JavaScript for static content
   - Server-side data fetching

2. **Streaming SSR**
   - Progressive HTML rendering
   - Faster Time to First Byte (TTFB)

3. **Automatic Code Splitting**
   - Client components lazy-loaded
   - Route-based splitting

4. **Database Indexes**
   - `cycleId` index on CheckIn
   - `date` index on CheckIn
   - Unique constraint doubles as index

### Potential Improvements
1. **Database Query Optimization**
   ```typescript
   // Current: N+1 query problem
   cycles.map(cycle => calculateStreak(cycle.checkIns))

   // Better: Single aggregation query
   await prisma.$queryRaw`
     SELECT cycleId, COUNT(*) as streak
     FROM CheckIn
     GROUP BY cycleId
   `
   ```

2. **Caching Strategy**
   - Add React `cache()` for deduplication
   - Redis for session storage (multi-user)
   - CDN for static assets

3. **Lazy Loading**
   - Paginate cycles list
   - Virtual scrolling for large lists
   - Defer analytics calculations

## 🧪 Testing Strategy (Not Implemented)

### Recommended Tests

**Unit Tests (Vitest)**
```typescript
// lib/actions.test.ts
describe('calculateStreak', () => {
  it('returns 0 for empty check-ins', () => {
    expect(calculateStreak([])).toBe(0)
  })

  it('counts consecutive days from today', () => {
    const checkIns = [
      { date: new Date() },
      { date: subDays(new Date(), 1) }
    ]
    expect(calculateStreak(checkIns)).toBe(2)
  })
})
```

**Integration Tests (Playwright)**
```typescript
// e2e/cycle-creation.spec.ts
test('creates a new cycle', async ({ page }) => {
  await page.goto('/new')
  await page.fill('[name="name"]', 'Morning Run')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/')
  await expect(page.getByText('Morning Run')).toBeVisible()
})
```

## 🔄 State Management

### Current Approach: Server-Driven State
- **No Redux/Zustand needed**
- State lives in the database
- Server Actions handle mutations
- `revalidatePath()` invalidates React cache

### When State is Needed
```typescript
// Client-side ephemeral state (useTransition, useState)
const [isPending, startTransition] = useTransition() // Loading state
const [error, setError] = useState<string | null>(null) // Error state
```

### Why This Works
1. Most state is persistent (database-backed)
2. Server Actions revalidate automatically
3. No cache synchronization bugs
4. Simple mental model

## 🚀 Deployment Considerations

### Environment Variables
```bash
# .env (not committed)
DATABASE_URL="file:./dev.db"

# Production
DATABASE_URL="postgresql://user:pass@host:5432/focusflow"
```

### Database Migration
```bash
# Development
npx prisma db push

# Production
npx prisma migrate deploy
```

### Build Process
```bash
npm run build     # Next.js build + Prisma generate
npm run start     # Production server
```

### Platform-Specific Notes

**Vercel:**
- Change SQLite → PostgreSQL/PlanetScale
- Add `@vercel/postgres` or Prisma Data Proxy

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]
```

## 📚 Further Reading

- [Next.js 16 Docs](https://nextjs.org/docs)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
