# 🎯 FocusFlow

**FocusFlow** is a habit-shaping and behavior-insight application that helps you build consistency through 7-day habit cycles. Track your daily progress, maintain streaks, and gain insights into your behavior patterns.

## ✨ Features

### 🔄 Habit Cycles
- Create custom 7-day habit cycles with names, descriptions, and emojis
- Track progress with visual progress bars
- View all active cycles in a clean dashboard

### ✅ Daily Check-ins
- One-click daily check-ins for each cycle
- Automatic streak calculation
- Protection against double check-ins on the same day
- Real-time progress updates

### 📊 Insights & Analytics
- **Consistency Score**: Average progress across all cycles
- **Completion Rate**: Overall check-in success rate
- **Total Check-ins**: Lifetime achievement tracking
- **Best Performing Cycle**: Identify your strongest habits
- **Visual Charts**: 7-day check-in trends with custom SVG charts
- **Motivational Messages**: Contextual encouragement based on performance

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 16 with App Router + React Server Components
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM + SQLite
- **Language**: TypeScript

### Project Structure

```
focusflow/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Dashboard (home page)
│   ├── new/
│   │   └── page.tsx         # Create new cycle page
│   └── insights/
│       └── page.tsx         # Analytics page
├── components/              # React components
│   ├── Navigation.tsx       # Top navigation bar
│   ├── CycleCard.tsx       # Individual cycle display
│   ├── CheckInWidget.tsx   # Daily check-in button (client component)
│   ├── ProgressBar.tsx     # Progress visualization
│   ├── NewCycleForm.tsx    # Cycle creation form (client component)
│   └── InsightsChart.tsx   # SVG chart component
├── lib/
│   ├── db.ts               # Prisma client singleton
│   └── actions.ts          # Server actions (data layer)
└── prisma/
    └── schema.prisma       # Database schema
```

## 📦 Database Schema

```prisma
model Cycle {
  id          String     @id @default(cuid())
  name        String
  description String?
  emoji       String     @default("🎯")
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  checkIns    CheckIn[]
}

model CheckIn {
  id        String   @id @default(cuid())
  cycleId   String
  cycle     Cycle    @relation(fields: [cycleId], references: [id], onDelete: Cascade)
  date      DateTime @default(now())
  createdAt DateTime @default(now())

  @@unique([cycleId, date])
}
```

**Key Design Decisions:**
- `@@unique([cycleId, date])`: Prevents duplicate check-ins on the same day
- `onDelete: Cascade`: Automatically deletes check-ins when a cycle is deleted
- `cuid()`: Collision-resistant unique IDs for distributed systems
- `date` indexed for fast queries

## 🔄 Data Flow

### Server-Side (Server Components & Actions)
```
Page (RSC) → Server Action → Prisma → SQLite → Response
     ↓
  Render with data
```

### Client-Side (Interactive Components)
```
User Action → Client Component → Server Action → Database Update → revalidatePath() → Re-render
```

**Example: Check-in Flow**
1. User clicks "Mark Today as Completed" in `CheckInWidget` (client component)
2. Component calls `checkInToday(cycleId)` server action via `startTransition`
3. Server action validates and creates `CheckIn` record
4. `revalidatePath('/')` invalidates cache
5. Dashboard automatically shows updated progress
6. Streak recalculates based on new data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone and navigate to the project:**
```bash
cd focusflow
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up the database:**
```bash
# Generate Prisma Client
npx prisma generate

# Create the SQLite database and tables
npx prisma db push
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

### Database Management

**View/Edit Database:**
```bash
npx prisma studio
```

**Reset Database:**
```bash
rm prisma/dev.db
npx prisma db push
```

**Generate Client (after schema changes):**
```bash
npx prisma generate
```

## 🎨 Design Choices

### 1. **Server Components by Default**
- Pages are React Server Components for optimal performance
- Only interactive components (forms, buttons) are client components
- Reduces JavaScript bundle size and improves load times

### 2. **Server Actions for Data Mutations**
- Type-safe, no API route boilerplate
- Automatic revalidation with `revalidatePath()`
- Progressive enhancement support

### 3. **SQLite for Simplicity**
- Zero configuration required
- Perfect for local development and demos
- Easy migration to PostgreSQL/MySQL if needed

### 4. **No External Chart Libraries**
- Custom SVG charts keep bundle size minimal
- Full control over styling and animations
- No dependency management overhead

### 5. **Tailwind CSS for Styling**
- Utility-first approach for rapid development
- Dark mode support built-in
- Consistent design system

### 6. **7-Day Cycle Limitation**
- Focuses on building short-term consistency
- Prevents overwhelming users with long commitments
- Based on research showing 7-day cycles build habits effectively

## ⚖️ Trade-offs

### What's Included
✅ Full-stack functionality with zero external services
✅ Type-safe end-to-end with TypeScript
✅ Responsive design (mobile + desktop)
✅ Dark mode support
✅ Real-time updates via Server Actions
✅ Optimistic UI updates

### What's Not Included
❌ **Authentication**: Focused on demo simplicity; add NextAuth.js for multi-user support
❌ **Cycle Editing/Deletion**: Can be added with additional server actions
❌ **Notifications**: Could integrate browser notifications or email reminders
❌ **Cycle History**: Currently shows only active cycles
❌ **Export Data**: Could add CSV/JSON export functionality
❌ **Advanced Analytics**: Could add month-over-month trends, correlation analysis

## 🔮 Possible Improvements

1. **Authentication & Multi-user Support**
   - Add NextAuth.js or Clerk
   - Associate cycles with user IDs
   - Social sharing features

2. **Enhanced Analytics**
   - Monthly/yearly views
   - Habit correlation analysis
   - Predictive insights using patterns

3. **Cycle Management**
   - Edit cycle details
   - Archive completed cycles
   - Cycle templates library

4. **Notifications**
   - Daily check-in reminders
   - Streak milestone celebrations
   - Browser push notifications

5. **Data Export**
   - CSV/JSON export
   - Print-friendly reports
   - API for third-party integrations

6. **Gamification**
   - Achievement badges
   - Streak leaderboards
   - Point system

7. **Customization**
   - Variable cycle lengths (not just 7 days)
   - Custom themes
   - Personalized emoji picker

## 📝 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## 🐛 Troubleshooting

**"Module not found" errors:**
```bash
npm install
npx prisma generate
```

**Database issues:**
```bash
rm prisma/dev.db
npx prisma db push
```

**Type errors:**
```bash
npx prisma generate
npm run dev
```

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built with Next.js 16, Prisma, and Tailwind CSS. Designed to help people build better habits through consistent daily action.
