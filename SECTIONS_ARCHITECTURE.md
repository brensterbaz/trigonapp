# Project Sections - Architecture Diagram

## 📊 Data Model

```
┌─────────────────────────────────────────────────────────────────┐
│                         organizations                            │
│  - id                                                            │
│  - name                                                          │
│  - subscription_tier                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ (1:N)
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                           projects                               │
│  - id                                                            │
│  - organization_id  FK → organizations                           │
│  - name                                                          │
│  - code                                                          │
│  - status                                                        │
│  - ...                                                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
            ┌────────┴────────┐
            │ (1:N)           │ (1:N)
            │                 │
┌───────────▼──────────┐  ┌───▼──────────────────────────────────┐
│  project_sections    │  │   bill_of_quantities                 │
│  - id                │  │   - id                               │
│  - project_id   FK ──┼──┼──▶project_id                         │
│  - name              │  │   - section_id   FK ────────┐        │
│  - code              │  │   - nrm_rule_id             │        │
│  - description       │  │   - quantity                │        │
│  - color_hex         │  │   - rate                    │        │
│  - sort_order        │  │   - amount                  │        │
│  - created_at        │  │   - ...                     │        │
│  - updated_at        │  └──────────────────────────────────────┘
└──────────────────────┘           │
         │                         │
         └─────────────────────────┘
                   (N:1)
```

---

## 🔄 Request Flow

### Creating a Section

```
User Interface
    │
    │ 1. Click "Add Section"
    │
    ▼
┌─────────────────────┐
│  SectionManager     │
│  Component          │
└──────────┬──────────┘
           │
           │ 2. POST /api/sections
           │    { projectId, name, code, colorHex }
           │
           ▼
┌─────────────────────┐
│  /api/sections      │
│  route.ts           │
└──────────┬──────────┘
           │
           │ 3. Verify user & org
           │ 4. Calculate sort_order
           │ 5. Insert into DB
           │
           ▼
┌─────────────────────┐
│  Supabase           │
│  project_sections   │
└──────────┬──────────┘
           │
           │ 6. Return new section
           │
           ▼
     UI Updates & Refreshes
```

### Adding BQ Item to Section

```
User Interface
    │
    │ 1. Open "Add Item" Dialog
    │
    ▼
┌─────────────────────────┐
│  AddBQItemDialog        │
│  - Fetches sections     │
│  - Shows section picker │
└──────────┬──────────────┘
           │
           │ 2. Select section
           │ 3. Fill measurement data
           │ 4. POST /api/bq-items
           │    { ..., section_id }
           │
           ▼
┌─────────────────────┐
│  /api/bq-items      │
│  route.ts           │
└──────────┬──────────┘
           │
           │ 5. Validate section
           │ 6. Insert BQ item
           │
           ▼
┌─────────────────────┐
│  Supabase           │
│  bill_of_quantities │
└─────────────────────┘
```

### Viewing Section Summaries

```
User Interface
    │
    │ 1. Page loads
    │
    ▼
┌────────────────────────┐
│  SectionSummaryView    │
│  Component             │
└──────────┬─────────────┘
           │
           │ 2. GET /api/sections/summaries
           │    ?projectId={uuid}
           │
           ▼
┌─────────────────────────────┐
│  /api/sections/summaries    │
│  route.ts                   │
└──────────┬──────────────────┘
           │
           │ 3. Query view:
           │    project_section_summaries
           │
           ▼
┌────────────────────────────────┐
│  Supabase View                 │
│  project_section_summaries     │
│  - Aggregates BQ items         │
│  - Calculates section totals   │
└──────────┬─────────────────────┘
           │
           │ 4. Return summaries
           │    { summaries, unsectioned }
           │
           ▼
     Display Section Breakdown
     with totals & progress bars
```

---

## 🎯 Component Hierarchy

```
ProjectDetailPage (Server Component)
│
├─ ProjectSectionsWrapper (Client Component)
│  │
│  ├─ SectionManager
│  │  │
│  │  ├─ Dialog (Create Section)
│  │  │  ├─ Input (Name)
│  │  │  ├─ Input (Code)
│  │  │  ├─ Textarea (Description)
│  │  │  └─ Color Picker
│  │  │
│  │  └─ Section List
│  │     └─ Section Items
│  │        ├─ Color Badge
│  │        ├─ Name & Code
│  │        └─ Delete Button
│  │
│  └─ SectionSummaryView
│     │
│     ├─ Project Total Header
│     │
│     └─ Section Items
│        ├─ Color Badge
│        ├─ Section Details
│        ├─ Cost & Item Count
│        └─ Progress Bar
│
└─ BQ Table
   │
   └─ AddBQItemDialog
      │
      ├─ NRM Rule Selector
      ├─ Section Selector ← NEW!
      ├─ Quantity Input
      ├─ Rate Input
      └─ Submit Button
```

---

## 🔐 Security Flow

```
User Request
    │
    ▼
┌──────────────────────┐
│  Authentication      │
│  Check               │
└──────────┬───────────┘
           │
           │ Verify auth.uid()
           │
           ▼
┌──────────────────────┐
│  Get User Profile    │
│  & Organization ID   │
└──────────┬───────────┘
           │
           │ organization_id
           │
           ▼
┌──────────────────────┐
│  Verify Project      │
│  Ownership           │
└──────────┬───────────┘
           │
           │ project.org_id == user.org_id?
           │
           ├─ YES ──▶ Allow Operation
           │
           └─ NO ──▶ 403 Forbidden
```

### RLS Policies (Applied at DB Level)

```sql
-- Users can only see sections in their org's projects
CREATE POLICY "Users can view sections in own organization projects"
  ON project_sections FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );
```

---

## 💾 Database Views

### project_section_summaries
```sql
SELECT 
  ps.id as section_id,
  ps.project_id,
  ps.name as section_name,
  ps.code as section_code,
  ps.color_hex,
  COUNT(bq.id) as item_count,
  SUM(bq.amount) as section_total
FROM project_sections ps
LEFT JOIN bill_of_quantities bq ON ps.id = bq.section_id
GROUP BY ps.id;
```

**Purpose**: Quick access to section totals without manual aggregation

### project_totals_by_section
```sql
SELECT 
  p.id as project_id,
  COUNT(DISTINCT ps.id) as section_count,
  COUNT(bq.id) as total_items,
  SUM(bq.amount) as project_total,
  -- Unsectioned items
  COUNT(bq.id) FILTER (WHERE bq.section_id IS NULL) as unsectioned_items
FROM projects p
LEFT JOIN project_sections ps ON p.id = ps.project_id
LEFT JOIN bill_of_quantities bq ON p.id = bq.project_id
GROUP BY p.id;
```

**Purpose**: Project-level reporting with section counts

---

## 📱 UI State Management

```
┌─────────────────────────────────────────┐
│  ProjectSectionsWrapper                 │
│  ┌───────────────────────────────────┐  │
│  │  Local State                      │  │
│  │  - sections: ProjectSection[]     │  │
│  │  - refreshKey: number             │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │  Methods                          │  │
│  │  - handleSectionsChange()         │  │
│  │    → Refetch sections             │  │
│  │    → Update state                 │  │
│  │    → Increment refreshKey         │  │
│  └───────────────────────────────────┘  │
│                                          │
│  Passes down:                            │
│  - sections to SectionManager           │
│  - projectId to both children           │
│  - onSectionsChange callback            │
└─────────────────────────────────────────┘
```

---

## 🔄 Data Synchronization

```
Action: Create Section
    │
    ▼
DB Updated
    │
    ▼
onSectionsChange() called
    │
    ▼
Refetch sections from API
    │
    ▼
Update local state
    │
    ▼
Increment refreshKey
    │
    ▼
SectionSummaryView re-fetches
    │
    ▼
UI shows updated data
```

---

## 🎨 Color System

```javascript
const colorOptions = [
  { name: 'Blue',   value: '#3B82F6' },  // Default
  { name: 'Green',  value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Pink',   value: '#EC4899' },
  { name: 'Red',    value: '#EF4444' },
  { name: 'Teal',   value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' },
]
```

**Used in**:
- Section badges
- Section list items
- Progress bars
- Section selector dropdown

---

This architecture ensures:
- ✅ Type safety throughout the stack
- ✅ Proper multi-tenant security
- ✅ Efficient data aggregation
- ✅ Real-time UI updates
- ✅ Scalable database design

