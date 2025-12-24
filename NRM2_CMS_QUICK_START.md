# 🚀 NRM2 CMS - QUICK START

## ⚡ 3-Step Setup

### 1️⃣ Run Migration (1 min)
```sql
-- Supabase SQL Editor:
-- Copy/paste: supabase/migrations/015_nrm2_cms.sql
-- Click "Run"
```

### 2️⃣ Make Yourself Admin (30 sec)
```sql
-- Find your user ID:
SELECT user_id, email FROM profiles;

-- Make yourself admin (replace YOUR_USER_ID):
UPDATE profiles 
SET is_admin = TRUE 
WHERE user_id = 'YOUR_USER_ID';
```

### 3️⃣ Access CMS
Navigate to: **`/dashboard/admin/nrm2`**

---

## 📝 Quick Usage

### Add Subcategory (Level 2)
1. Select section (e.g., "2.6 - Windows")
2. Click "Add Top-Level Rule"
3. Code: `2.6.3`
4. Content: `Balcony door shutters`
5. Unit: `nr`
6. Save

### Add Detail (Level 3)
1. Click **+** next to parent rule
2. Code: `1` (becomes `2.6.3.1`)
3. Content: `Aluminium sliding shutters`
4. Unit: `nr`
5. Save

---

## 🎯 Example: Complete Section 2.6

```
2.6 - Windows and external doors
├─ 2.6.1 - External windows
│  ├─ 2.6.1.1 - Single glazed
│  ├─ 2.6.1.2 - Double glazed
│  └─ 2.6.1.3 - Triple glazed
├─ 2.6.2 - External doors
│  ├─ 2.6.2.1 - Single doors
│  ├─ 2.6.2.2 - Double doors
│  └─ 2.6.2.3 - Sliding doors
└─ 2.6.3 - Balcony door shutters (NEW)
   ├─ 2.6.3.1 - Aluminium (NEW)
   └─ 2.6.3.2 - Timber (NEW)
```

---

## 🎨 UI Actions

| Button | Action |
|--------|--------|
| **+ (on rule)** | Add child under this rule |
| **✏️** | Edit rule |
| **🗑️** | Delete rule + children |
| **▶/▼** | Expand/collapse |

---

## 📋 Path System

- **Level 1**: `2` (main section)
- **Level 2**: `2.6` (subcategory)
- **Level 3**: `2.6.1` (detail)

Paths auto-calculate based on parent!

---

**Full Guide**: See `NRM2_CMS_GUIDE.md`
