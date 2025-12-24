# 🎯 NRM2 CMS - Admin Management System

## ✅ What's Been Built

A complete Content Management System for admin users to manage NRM2 rules, allowing you to:

- ✅ **Browse NRM2 hierarchy** - View all 41 sections and their rules
- ✅ **Add new subcategories** - Create level 2 rules under main categories
- ✅ **Add detail sections** - Create level 3 rules with specific measurements
- ✅ **Edit existing rules** - Update content, units, examples, and notes
- ✅ **Delete rules** - Remove rules (and their children)
- ✅ **Admin-only access** - Protected by RLS policies

---

## 🚀 SETUP (3 Steps)

### Step 1: Run Migration
```sql
-- In Supabase SQL Editor:
supabase/migrations/015_nrm2_cms.sql
```

This adds:
- `is_admin` column to profiles
- Admin RLS policies for INSERT/UPDATE/DELETE
- Hierarchy view for easier browsing

### Step 2: Make Yourself Admin
```sql
-- In Supabase SQL Editor, replace YOUR_USER_ID:
UPDATE profiles 
SET is_admin = TRUE 
WHERE user_id = 'YOUR_USER_ID';
```

To find your user ID:
```sql
SELECT user_id, email FROM profiles;
```

### Step 3: Access the CMS
Navigate to: `/dashboard/admin/nrm2`

---

## 📊 HOW TO USE

### Example: Complete Section 2.6 (Windows and External Doors)

Currently, section 2.6 might look like this:
```
2.6 - Windows and external doors
  2.6.1 - External windows
  2.6.2 - External doors
```

Let's add more detail like section 14:

#### Step 1: Select Section
1. Go to `/dashboard/admin/nrm2`
2. Select "2.6 - Windows and external doors" from dropdown

#### Step 2: Add Subcategory (Level 2)
1. Click "Add Top-Level Rule" (or click + on existing rule)
2. Fill in:
   - **Code**: `2.6.3`
   - **Content**: `Balcony door shutters`
   - **Unit**: `nr` (number)
   - **Examples**: `Sliding shutters, folding shutters`
3. Click "Create Rule"

#### Step 3: Add Detail Section (Level 3)
1. Click the **+** button next to `2.6.3`
2. Fill in:
   - **Code**: `1` (will become `2.6.3.1`)
   - **Content**: `Aluminium sliding shutters`
   - **Unit**: `nr`
   - **Examples**: `Single track, double track`
   - **Notes**: `Measure per unit installed`
3. Click "Create Rule"

#### Step 4: Add More Details
Repeat step 3 to add:
- `2.6.3.2` - Timber folding shutters
- `2.6.3.3` - PVC roller shutters
- etc.

---

## 🎨 UI FEATURES

### Tree View
- **Expand/Collapse**: Click chevron to show/hide children
- **Indentation**: Visual hierarchy (Level 1, 2, 3)
- **Badges**: Shows path, level, unit, child count

### Actions
- **+ (Plus)**: Add child rule under this rule
- **✏️ (Edit)**: Edit rule content, unit, examples, notes
- **🗑️ (Delete)**: Delete rule and all children

### Path System
- Level 1: `2.6` (main category)
- Level 2: `2.6.1` (subcategory)
- Level 3: `2.6.1.1` (detail)

Paths are automatically calculated based on parent.

---

## 📋 EXAMPLE: Replicating Section 14 Structure

Section 14 (Masonry) has this structure:

```
14 - Masonry
  14.1 - Brick/block walling
    14.1.1 - Walls
    14.1.2 - Isolated piers
    14.1.3 - Chimney stacks
  14.2 - Stone walling
    14.2.1 - Walls
    14.2.2 - Isolated piers
  14.3 - Accessories/sundry items for brick/block/stone walling
    14.3.1 - Damp-proof courses
    14.3.2 - Forming cavities
```

To replicate for Section 2.6:

1. **Add Level 2 Rules** (Subcategories):
   ```
   2.6.1 - External windows (already exists)
   2.6.2 - External doors (already exists)
   2.6.3 - Balcony door shutters (NEW)
   2.6.4 - Window accessories (NEW)
   ```

2. **Add Level 3 Rules** under 2.6.1:
   ```
   2.6.1.1 - Single glazed windows
   2.6.1.2 - Double glazed windows
   2.6.1.3 - Triple glazed windows
   2.6.1.4 - Bay windows
   ```

3. **Add Level 3 Rules** under 2.6.2:
   ```
   2.6.2.1 - Single doors
   2.6.2.2 - Double doors
   2.6.2.3 - Sliding doors
   2.6.2.4 - French doors
   ```

4. **Add Level 3 Rules** under 2.6.4:
   ```
   2.6.4.1 - Window sills
   2.6.4.2 - Window boards
   2.6.4.3 - Lintels
   ```

---

## 🔐 SECURITY

### Admin-Only Access
- Only users with `is_admin = TRUE` can:
  - Create new rules
  - Edit existing rules
  - Delete rules
- Regular users can only view (SELECT) rules

### RLS Policies
All admin operations are protected by Row Level Security:
```sql
-- Example policy:
CREATE POLICY "Admins can insert NRM2 rules"
  ON nrm_rules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND is_admin = TRUE
    )
  );
```

---

## 📁 FILES CREATED

### Database
- ✅ `supabase/migrations/015_nrm2_cms.sql`
  - Admin column in profiles
  - Admin RLS policies
  - Hierarchy view

### API
- ✅ `app/api/admin/nrm-rules/route.ts`
  - GET: Fetch rules with hierarchy
  - POST: Create new rule
  - PATCH: Update rule
  - DELETE: Delete rule

### UI
- ✅ `components/admin/nrm2-cms-manager.tsx`
  - Tree view with expand/collapse
  - Add/Edit/Delete dialogs
  - Section selector
- ✅ `app/dashboard/admin/nrm2/page.tsx`
  - Admin CMS page

---

## 🎯 WORKFLOW SUMMARY

```
1. SELECT SECTION
   ↓
2. VIEW EXISTING RULES (Tree View)
   ↓
3. ADD NEW RULE
   - Click "Add Top-Level" OR
   - Click "+" on parent rule
   ↓
4. FILL FORM
   - Code (e.g., "1", "2.3", "4")
   - Content (description)
   - Unit (m², nr, m, etc.)
   - Examples (optional)
   - Notes (optional)
   ↓
5. SAVE
   - Path auto-calculated
   - Rule appears in tree
   ↓
6. REPEAT for all subcategories/details
```

---

## ✅ VERIFICATION

After setup, verify:

- [ ] Can access `/dashboard/admin/nrm2`
- [ ] Can see section dropdown
- [ ] Can view existing rules
- [ ] Can add top-level rule
- [ ] Can add child rule
- [ ] Can edit rule
- [ ] Can delete rule
- [ ] Non-admin users get "Access Denied"

---

## 🚀 READY!

You can now fill in all missing NRM2 categories and subcategories!

**Next Steps:**
1. Run migration
2. Make yourself admin
3. Start adding rules to incomplete sections
4. Build out the full NRM2 hierarchy
