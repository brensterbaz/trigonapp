# Running NRM2 Database Migrations

## Step 1: Run the migrations in Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/mnhyqthohhklzhlopjry/sql/new

Run each migration in order:

### Migration 1: Create tables and enable ltree
File: `supabase/migrations/002_nrm2_logic_engine.sql`
- Creates nrm_sections and nrm_rules tables
- Enables ltree extension
- Sets up RLS policies

### Migration 2: Seed 41 work sections
File: `supabase/migrations/003_seed_nrm2_sections.sql`
- Inserts all 41 NRM2 work sections

### Migration 3: Seed Masonry rules (Section 14)
File: `supabase/migrations/004_seed_nrm2_masonry_rules.sql`
- Full hierarchy for Masonry section
- Demonstrates ltree paths

### Migration 4: Seed additional sections
File: `supabase/migrations/005_seed_nrm2_additional_rules.sql`
- Section 05: Excavating and filling
- Section 11: In-situ concrete works
- Section 16: Carpentry
- Section 39: Electrical services

## Step 2: Verify the data

After running all migrations, verify in Supabase Table Editor:
- `nrm_sections`: Should have 41 rows
- `nrm_rules`: Should have ~60+ rows

## Step 3: Test queries

Try these queries in SQL Editor to verify:

```sql
-- Get all sections
SELECT * FROM nrm_sections ORDER BY sort_order;

-- Get top-level rules for Masonry
SELECT * FROM nrm_rules 
WHERE section_id = (SELECT id FROM nrm_sections WHERE code = '14')
AND level = 1;

-- Get all brick walling rules (using ltree)
SELECT * FROM nrm_rules 
WHERE section_id = (SELECT id FROM nrm_sections WHERE code = '14')
AND path <@ '1'::ltree
ORDER BY path;
```

## Next: Build the UI
Once migrations are complete, we'll build the RuleSelector component!

