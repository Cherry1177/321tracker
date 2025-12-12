# 321 Tracker - Habit Tracker App

A full-featured habit tracker application where users complete at least 3 goals per day to earn a "strike" (streak). Built with Next.js, TypeScript, Prisma, and NextAuth.

## Features

### 🎯 Goal Management
- Create and manage multiple goals
- Mark goals as complete (with or without photos)
- Track daily progress toward the 3-goal requirement
- Visual indicators for completed goals

### 🔥 Streak Tracking
- Earn a "strike" by completing 3+ goals in a day
- Track your current streak
- Calendar view showing your progress over time
- Color-coded calendar (green = strike earned, yellow = partial completion)

### 📸 Photo Sharing
- Upload photos when completing goals
- Share achievements in your gallery
- Add captions to your achievements

### 👥 Friends & Accountability
- Add friends by email
- Send and receive friend requests
- View friends' progress (coming soon)
- Share your streak like Instagram stories

### 📅 Calendar Functions
- Interactive calendar view
- See your streak history
- Click on dates to view details
- Visual representation of your progress

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (via Prisma)
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **Calendar**: react-calendar

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd 321tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Create a `.env` file (if not already created):
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
321tracker/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── goals/        # Goal management
│   │   ├── achievements/ # Achievement sharing
│   │   ├── friends/      # Friends system
│   │   ├── streaks/      # Streak tracking
│   │   └── upload/       # Photo uploads
│   ├── dashboard/        # Main dashboard page
│   ├── login/           # Login page
│   ├── register/        # Registration page
│   └── page.tsx         # Landing page
├── components/           # React components
│   ├── DashboardClient.tsx
│   ├── GoalList.tsx
│   ├── AddGoalDialog.tsx
│   ├── FriendsPanel.tsx
│   ├── StreakCalendar.tsx
│   ├── AchievementGallery.tsx
│   └── ShareStoryDialog.tsx
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   └── prisma.ts        # Prisma client
├── prisma/
│   └── schema.prisma    # Database schema
└── public/
    └── uploads/         # Uploaded photos
```

## Usage

1. **Register/Login**: Create an account or log in with existing credentials
2. **Add Goals**: Click "Add Goal" to create new goals you want to track
3. **Complete Goals**: Mark goals as complete each day (with optional photos)
4. **Earn Strikes**: Complete 3+ goals in a day to earn a strike and maintain your streak
5. **View Calendar**: Check the calendar tab to see your progress over time
6. **Add Friends**: Send friend requests to build accountability
7. **Share Achievements**: Upload photos and share your progress
8. **Share Streak**: Use the "Share Streak Story" feature to share your progress

## Database Schema

- **User**: User accounts with authentication
- **Goal**: Individual goals users want to track
- **Completion**: Daily completions of goals (with optional photos)
- **Achievement**: Shared achievement photos
- **Friendship**: Friend relationships
- **FriendRequest**: Pending friend requests
- **Streak**: Daily streak data (goals completed per day)

## Future Enhancements

- [ ] View friends' streaks and progress
- [ ] Push notifications for reminders
- [ ] Goal categories and tags
- [ ] Statistics and analytics
- [ ] Export data functionality
- [ ] Mobile app version

## License

MIT
# 321tracker
