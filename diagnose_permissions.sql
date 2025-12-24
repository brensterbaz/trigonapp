-- ============================================
-- DIAGNOSE: Check user permissions
-- Run this while logged in to see if your profile exists
-- ============================================

-- Check 1: Are you authenticated?
SELECT 
    'Authentication check' as test,
    auth.uid() as your_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ NOT AUTHENTICATED'
        ELSE '✅ AUTHENTICATED'
    END as status;

-- Check 2: Do you have a profile?
SELECT 
    'Profile check' as test,
    id,
    user_id,
    organization_id,
    full_name,
    CASE 
        WHEN organization_id IS NULL THEN '❌ NO ORGANIZATION'
        ELSE '✅ HAS ORGANIZATION'
    END as status
FROM profiles 
WHERE user_id = auth.uid();

-- Check 3: Can you see your projects?
SELECT 
    'Projects check' as test,
    p.id,
    p.name,
    p.organization_id
FROM projects p
INNER JOIN profiles pr ON pr.organization_id = p.organization_id
WHERE pr.user_id = auth.uid()
LIMIT 5;

-- Check 4: Test the RLS policy logic
SELECT 
    'RLS Policy Test' as test,
    EXISTS (
        SELECT 1 FROM projects WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
    ) as can_see_projects;

