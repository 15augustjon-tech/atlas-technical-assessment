# Software Engineering Practice Test Application

## Overview

This is a SAT-style software engineering testing application that provides timed, multiple-choice assessments covering various software engineering topics. The application features a distraction-free testing environment with security measures, real-time progress tracking, and comprehensive result analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript as the primary UI framework
- Vite for development server and production builds
- Wouter for lightweight client-side routing (no React Router)
- TanStack Query (React Query) for server state management and data fetching

**Design System**
- Material Design approach emphasizing clarity and minimal distraction
- Shadcn UI component library with Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Inter font for body text, Roboto Mono for code snippets
- New York style variant of Shadcn components

**State Management**
- Local component state for UI interactions
- TanStack Query for server-synchronized state (questions, sessions, results)
- No global state management library (Redux, Zustand, etc.)

**Key UI Patterns**
- Card-based layout for questions with generous padding (p-8)
- Maximum content width of 4xl (max-w-4xl) for optimal reading
- Progressive disclosure with accordions for results review
- Fixed timer bar at top of viewport during tests
- Sheet/sidebar navigation for question grid access

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- Custom route registration system
- Session-based test state management
- RESTful API design

**Data Storage Strategy**
- In-memory storage implementation (MemStorage class)
- Interface-based storage abstraction (IStorage) allowing future database integration
- Pre-initialized question bank with 30 questions across 6 topics
- Session state stored in Map structures with Set for flagged questions

**API Design**
- `/api/questions` - Fetch all questions (without correct answers for security)
- `/api/session/*` - Session lifecycle management (start, get, update, complete)
- `/api/results/:sessionId` - Retrieve calculated test results
- All mutations use POST, reads use GET

**Security Measures**
- Fullscreen enforcement during tests
- Tab switch detection and logging
- Copy/paste disabled during active sessions
- Correct answers never sent to client until test completion
- Visibility change event monitoring

### Data Models

**Question Structure**
```typescript
{
  id: string
  text: string
  code?: string (optional code snippet)
  choices: string[] (4 options)
  correctAnswer: number (index)
  topic: string
  explanation: string
}
```

**Test Session**
- Unique session ID generation
- Start/end timestamps
- Current question tracking
- Answer map (questionIndex -> answerIndex)
- Flagged questions set
- Tab switch counter
- Completion status

**Test Results**
- Score calculation with percentage
- Per-question results with explanations
- Topic-based performance analytics
- Time taken tracking
- Question-level correctness indicators

### Testing Features

**Test Configuration**
- 30 questions covering 6 software engineering topics
- 45-minute timed duration (2700 seconds)
- Multiple choice with 4 options per question
- Question flagging for review
- Navigation grid showing answered/unanswered status

**Topics Covered**
- Algorithms
- Data Structures
- Object-Oriented Programming
- Design Patterns
- Software Architecture
- Testing & Quality Assurance

## External Dependencies

### UI Component Libraries
- **Radix UI** - Accessible component primitives (dialogs, sheets, radio groups, progress bars, accordions, etc.)
- **Shadcn UI** - Pre-styled component system built on Radix
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management
- **cmdk** - Command menu component

### Data & Forms
- **TanStack Query v5** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### Database (Configured but Not Currently Used)
- **Drizzle ORM** - TypeScript ORM with PostgreSQL dialect configured
- **@neondatabase/serverless** - Neon serverless PostgreSQL driver
- **drizzle-zod** - Zod schema generation from Drizzle schemas
- Database schema defined in `shared/schema.ts` with users table

**Note**: The application currently uses in-memory storage. The Drizzle configuration in `drizzle.config.ts` points to PostgreSQL via `DATABASE_URL` environment variable, indicating future migration path to persistent database storage.

### Utility Libraries
- **date-fns** - Date manipulation
- **clsx** & **tailwind-merge** - Conditional styling
- **nanoid** - Unique ID generation

### Development Tools
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **PostCSS** & **Autoprefixer** - CSS processing
- **ESBuild** - Production server bundling
- **tsx** - TypeScript execution for development

### Replit-Specific Plugins
- `@replit/vite-plugin-runtime-error-modal` - Development error overlay
- `@replit/vite-plugin-cartographer` - Code navigation
- `@replit/vite-plugin-dev-banner` - Development indicator