# Comprehensive NRM2 Rules Migration - Migration 011

This migration seeds detailed NRM2 rules for all major work sections based on the Functional Specification Document.

## What's Included

### **Work Sections Seeded:**

1. **WS 02: Off-site Manufactured Materials**
   - Prefabricated structures
   - Building units
   - Complete buildings

2. **WS 03: Demolitions**
   - Structures (nr)
   - Parts of structures (m²)
   - Temporary support
   - Disposal limitations

3. **WS 05: Excavating and Filling** (Enhanced)
   - Site clearance (trees by girth, surface clearance)
   - Bulk excavation with **depth bands** (<2m, 2-4m, >4m)
   - Foundation excavation with depth stratification
   - Trench excavation
   - **Extra Over items** (rock, concrete, hazardous material, below groundwater)
   - Earthwork support with depth bands
   - Disposal (on-site vs off-site)

4. **WS 11: In-situ Concrete** (Enhanced)
   - Foundations (mass vs reinforced)
   - Slabs with **thickness bands** (≤150mm, 150-450mm, >450mm)
   - Walls (vertical work)
   - Beams (horizontal work)
   - Columns (isolated vs attached)
   - Staircases/ramps (sloping work)
   - **Formwork** with height bands and finish types
   - **Reinforcement** by shape (straight, bent, links) and fabric

5. **WS 16: Carpentry**
   - Primary timbers (joists, rafters, plates)
   - Wrot finish timbers

6. **WS 17: Sheet Roofing**
   - Coverings (m²)
   - Flashings (m)
   - Gutters (m)

7. **WS 22: General Joinery**
   - Skirtings (m)
   - Architraves (m)
   - Dado rails (m)
   - Fittings (nr)

8. **WS 27: Glazing**
   - Glass panes by **size categories** (<0.15m², 0.15-4.0m², >4.0m²)
   - Glass types (float, safety)
   - Mirrors

9. **WS 28: Floor, Wall, Ceiling Finishes**
   - Floor finishes (screeds, tiles, carpet) with void deductions
   - Wall finishes with **height bands** (>3.5m separate)
   - Ceiling finishes with **void depth bands** (<150mm, 150-500mm, >500mm)

10. **WS 35: Site Works**
    - Roads (asphalt, block paving)
    - Paving (gravel paths)
    - Kerbs (m)

11. **WS 38: Mechanical Services**
    - Pipework (copper, steel)
    - Fittings as **Extra Over items**
    - Equipment

12. **WS 39: Electrical Services**
    - Cable (m)
    - Fittings (nr)
    - Equipment (nr)

13. **WS 41: Builder's Work in Connection**
    - Holes and chases
    - Fire stopping
    - Plinths

---

## Key Features Implemented

### **1. Measurement Logic**
- ✅ **Net measurement** rules
- ✅ **Minimum deduction thresholds** (varies by section: 0.05 m³ for concrete, 0.5 m² for masonry, 1.0 m² for formwork)
- ✅ **Depth band stratification** (excavation, formwork)
- ✅ **Thickness bands** (concrete slabs)
- ✅ **Height bands** (formwork, wall finishes)
- ✅ **Size categories** (glazing panes)

### **2. Extra Over (EO) Logic**
- ✅ Breaking out rock
- ✅ Breaking out concrete/masonry
- ✅ Hazardous material
- ✅ Below groundwater level
- ✅ Service fittings (bends, tees, reducers)

### **3. Coverage Rules**
- ✅ "Deemed included" items properly tagged
- ✅ Waste and cutting allowances
- ✅ Laps and joints
- ✅ Tying wire, spacers, chairs for reinforcement

### **4. Unit Types**
- ✅ Linear (m)
- ✅ Area (m²)
- ✅ Volume (m³)
- ✅ Mass (t)
- ✅ Number (nr)

---

## How to Run

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/mnhyqthohhklzhlopjry/sql/new

2. **Copy the entire SQL from:**
   `supabase/migrations/011_seed_comprehensive_nrm2_rules.sql`

3. **Click "Run"**

4. **Verify:**
   The migration will output a summary table showing rule counts per section.

---

## What This Adds

- **~150+ new rules** across 13 major work sections
- **Proper hierarchical structure** (Level 1 → Level 2 → Level 3)
- **Measurement logic** stored as JSONB for programmatic use
- **Coverage rules** to prevent double-counting
- **Band stratification** for accurate pricing

---

## Next Steps

After running this migration:

1. ✅ **Test the Rule Selector** - Navigate through sections to see the new rules
2. ✅ **Create a project** - Add BQ items using the new rules
3. ✅ **Verify measurement logic** - Check that deduction thresholds work correctly

---

## Notes

- This migration **adds to** existing rules (doesn't delete anything)
- If a rule already exists, you may get a duplicate key error - that's OK, just means it was already seeded
- The migration uses `DO $$` blocks to handle section ID lookups safely

---

**Ready to run!** This will give you a comprehensive NRM2 rule set to work with. 🚀

