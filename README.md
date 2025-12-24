# NRM2 Tender Reporting Application

A high-fidelity, cloud-native web application for Quantity Surveyors (QS) and Cost Managers to create detailed Tender Reports and Bills of Quantities (BQ) strictly adhering to the RICS New Rules of Measurement 2 (NRM2): Detailed Measurement for Building Works.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query (to be added in future phases)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (sign up at https://supabase.com)

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Supabase Project**
   - Go to https://app.supabase.com
   - Create a new project
   - Note your project URL and anon key from Settings > API

3. **Configure Environment Variables**
   - Copy `.env.local.example` to `.env.local` (or create it manually)
   - Fill in your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```

4. **Run Database Migrations**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/migrations/001_organizations_and_profiles.sql`
   - Execute the migration

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open the Application**
   - Navigate to http://localhost:3000
   - Sign up for a new account
   - You'll be automatically assigned to a new organization

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   │   ├── sign-in/       # Sign in page
│   │   └── sign-up/       # Sign up page
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── layout.tsx     # Dashboard layout with sidebar
│   │   └── page.tsx       # Dashboard home page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Root page (redirects)
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/         # Dashboard components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
├── supabase/
│   └── migrations/       # Database migrations
├── types/                 # TypeScript type definitions
└── utils/
    └── supabase/         # Supabase client utilities
```

## Features (Phase 1 - Completed)

- ✅ Multi-tenant authentication with organization isolation
- ✅ User sign-up and sign-in
- ✅ Automatic organization creation on sign-up
- ✅ Row Level Security (RLS) policies for data isolation
- ✅ Responsive dashboard layout with sidebar navigation
- ✅ Protected routes with middleware

## Next Steps (Future Phases)

- Phase 2: NRM2 Logic Engine (hierarchical rule system)
- Phase 3: Project Management & Breakdown Structure
- Phase 4: Digital Taking Off (dimension entry)
- Phase 5: Reporting & Export (Excel generation)
- Phase 6: Quality Assurance & Performance Optimization

## Development Guidelines

See `.cursorrules` for coding standards and conventions.

## License

Proprietary - All rights reserved

