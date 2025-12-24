# Phase 2: NRM2 Logic Engine

## Overview
Build the hierarchical rule system based on RICS NRM2 standards. This phase creates the database structure and UI for browsing and selecting NRM2 rules.

## What We'll Build

### 1. Database Schema (Migrations)
- Enable PostgreSQL `ltree` extension for hierarchical data
- Create `nrm_sections` table (41 work sections)
- Create `nrm_rules` table with ltree paths
- Seed with NRM2 standard data

### 2. NRM2 Hierarchy Structure
```
Level 0: Work Section (e.g., "14 Masonry")
  ├─ Level 1: Category (e.g., "Brick Walling")
  │   ├─ Level 2: Sub-Category (e.g., "Common bricks")
  │   │   └─ Level 3: Detail (e.g., "Thickness 102.5mm")
  │   │       └─ Unit: m² (square meters)
```

### 3. UI Components
- **RuleSelector Component**: 4-column cascading dropdown
- **Rule Display**: Show selected rule with unit and coverage rules
- **Search/Filter**: Quick search for rules

## Technical Details

### ltree Extension
PostgreSQL's ltree allows efficient querying of hierarchical data:
```sql
-- Example path: 14.1.2.1
-- Means: Section 14 > Level 1 > Level 2 > Level 3
```

### Key NRM2 Work Sections (41 total)
1. Preliminaries
2. Off-site manufactured materials
3. Demolitions
4. Alterations, repairs and conservation
5. Excavating and filling
6. Ground remediation and soil stabilization
7. Piling
8. Underpinning
9. Diaphragm walls and embedded retaining walls
10. Crib walls, gabions and reinforced earth
11. In-situ concrete works
12. Precast/composite concrete
13. Precast concrete
14. **Masonry** (we'll focus on this for demo)
15. Structural metalwork
... (and 26 more)

## Implementation Steps

### Step 1: Database Migration
Create the ltree extension and tables with proper indexing for performance.

### Step 2: Data Seeding
Populate with NRM2 standard data. We'll start with 5 key sections fully populated.

### Step 3: API Routes
Server-side API to fetch rules based on:
- Parent path (for cascading)
- Search term
- Section filter

### Step 4: Rule Selector Component
Client-side React component with:
- 4 cascading columns
- Loading states
- Unit display
- Coverage rules tooltip

## Acceptance Criteria
- [ ] ltree extension enabled in Supabase
- [ ] All 41 sections seeded
- [ ] At least 5 sections with full rule hierarchy
- [ ] Rule selector shows 4 columns
- [ ] Selecting level 1 loads level 2 options
- [ ] Final selection shows unit and coverage rules
- [ ] Component is mobile-responsive

## Next Steps After Phase 2
- Phase 3: Project Management (create projects, BQ structure)
- Phase 4: Digital Taking Off (dimension entry)
- Phase 5: Excel export and reporting

