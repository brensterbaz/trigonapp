-- ============================================
-- PART 2: Update Existing Projects
-- Run this AFTER Part 1 has been committed
-- ============================================

-- Update any existing 'active' projects to 'in_progress' for consistency
UPDATE projects SET status = 'in_progress' WHERE status = 'active';

-- Update any existing 'tendered' projects to 'done' for consistency
UPDATE projects SET status = 'done' WHERE status = 'tendered';

-- Show what statuses are now in use
SELECT status, COUNT(*) as count
FROM projects
GROUP BY status
ORDER BY status;

