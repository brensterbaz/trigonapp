# Quick Start: Project Sections

## 🚀 Getting Started in 3 Steps

### Step 1: Run the Migration
```bash
# Option A: Using Supabase CLI
supabase db push

# Option B: Manual via Supabase Dashboard
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Create new query
# 3. Copy & paste contents from: supabase/migrations/012_project_sections.sql
# 4. Run the query
```

### Step 2: Verify Installation
After running the migration, check that these exist in your database:
- ✅ Table: `project_sections`
- ✅ Column: `bill_of_quantities.section_id`
- ✅ View: `project_section_summaries`
- ✅ View: `project_totals_by_section`

### Step 3: Start Using Sections!
1. Open any project in your app
2. You'll see a new "Project Sections" card
3. Click "Add Section" to create your first section
4. When adding BQ items, select a section from the dropdown

---

## 💡 Example Workflow

### Scenario: Pricing a House Renovation

**1. Create Sections**
```
Bathroom (Blue, BTH-01)
Master Bedroom (Purple, BED-01)
Kitchen (Green, KIT-01)
Living Room (Orange, LIV-01)
```

**2. Add BQ Items to Sections**
- Demolition work → Bathroom
- Plumbing fixtures → Bathroom
- Tiling → Bathroom
- Flooring → Master Bedroom
- Kitchen fitout → Kitchen
- etc.

**3. View Results**
The app automatically shows:
- Bathroom: £12,500 (8 items)
- Master Bedroom: £6,200 (5 items)
- Kitchen: £18,900 (12 items)
- Living Room: £8,100 (6 items)
- **Total: £45,700**

---

## 🎨 UI Features

### Section Manager
- Create/delete sections
- Choose from 8 colors
- Add codes and descriptions
- Visual color indicators

### Section Summary
- Cost breakdown by section
- Progress bars showing %
- Item counts per section
- Unsectioned items shown separately

### BQ Item Dialog
- Section dropdown when adding items
- Optional: leave items unsectioned
- Color-coded section display

---

## 🔧 API Endpoints

```javascript
// Get all sections for a project
GET /api/sections?projectId={uuid}

// Create a new section
POST /api/sections
Body: {
  projectId: string,
  name: string,
  code?: string,
  description?: string,
  colorHex?: string
}

// Update a section
PATCH /api/sections
Body: {
  sectionId: string,
  name?: string,
  code?: string,
  description?: string,
  colorHex?: string
}

// Delete a section
DELETE /api/sections?sectionId={uuid}

// Get section summaries with totals
GET /api/sections/summaries?projectId={uuid}
```

---

## ❓ FAQ

**Q: What happens to BQ items when I delete a section?**
A: Items become "unsectioned" but are NOT deleted. They remain in the project.

**Q: Can I move items between sections?**
A: Yes! Edit the BQ item and change its section (feature to be added in BQ table).

**Q: Are sections required?**
A: No! Sections are optional. Items without sections work perfectly fine.

**Q: Can I export by section?**
A: The current export includes all items. Section-specific export is a future enhancement.

**Q: How many sections can I create?**
A: Unlimited! But we recommend 3-10 sections per project for clarity.

---

## 🎯 Best Practices

1. **Use Clear Names**: "Ground Floor Bathroom" vs "Bathroom 1"
2. **Consistent Codes**: Use a naming convention (BTH-01, BED-01, KIT-01)
3. **Color Strategy**: Use same colors across projects for similar areas
4. **Keep it Simple**: Don't over-section; group related areas together
5. **Review Regularly**: Check section totals as you add items

---

## 🐛 Troubleshooting

**Problem**: Migration fails
- Check Supabase connection
- Verify you have admin permissions
- Look for conflicting table names

**Problem**: Sections not showing
- Refresh the page
- Check browser console for errors
- Verify migration ran successfully

**Problem**: Can't add items to sections
- Ensure section belongs to the same project
- Check that section wasn't deleted
- Verify API connection

---

## 📊 Database Schema

```sql
CREATE TABLE project_sections (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  color_hex TEXT DEFAULT '#3B82F6',
  sort_order INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- bill_of_quantities now has:
ALTER TABLE bill_of_quantities 
  ADD COLUMN section_id UUID REFERENCES project_sections(id);
```

---

**Need Help?** Check the full documentation in `SECTIONS_FEATURE.md`

