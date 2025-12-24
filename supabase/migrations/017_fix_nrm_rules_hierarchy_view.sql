-- Fix nrm_rules_hierarchy view
-- Cast ltree paths to text for proper JSON serialization

-- Drop the existing view first (cannot change column types directly)
DROP VIEW IF EXISTS nrm_rules_hierarchy;

-- Recreate the view with proper text casting
CREATE VIEW nrm_rules_hierarchy AS
SELECT 
  r.id,
  r.section_id,
  s.code as section_code,
  s.title as section_title,
  r.path::text as path,
  r.level,
  r.content,
  r.unit,
  r.measurement_logic,
  r.coverage_rules,
  r.examples,
  r.notes,
  nlevel(r.path) as depth,
  CASE 
    WHEN nlevel(r.path) > 1 THEN subpath(r.path, 0, nlevel(r.path) - 1)::text
    ELSE NULL
  END as parent_path,
  (SELECT COUNT(*) FROM nrm_rules WHERE path <@ r.path AND path != r.path) as child_count
FROM nrm_rules r
JOIN nrm_sections s ON r.section_id = s.id
ORDER BY s.sort_order, r.path;

-- Grant access to the view
GRANT SELECT ON nrm_rules_hierarchy TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

COMMENT ON VIEW nrm_rules_hierarchy IS 'NRM2 rules with hierarchy information, paths cast to text for JSON serialization';

