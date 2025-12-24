-- ============================================
-- SEED NRM2 RULES - Section 14: Masonry (Full Example)
-- This demonstrates the hierarchical structure
-- ============================================

-- Get the section ID for Masonry
DO $$
DECLARE
  masonry_section_id UUID;
BEGIN
  SELECT id INTO masonry_section_id FROM nrm_sections WHERE code = '14';
  
  -- Level 1: Main categories
  INSERT INTO nrm_rules (section_id, path, level, content, coverage_rules) VALUES
  (masonry_section_id, '1', 1, 'Brick/block walling', '["Mortar", "Cutting", "Waste"]'::jsonb),
  (masonry_section_id, '2', 1, 'Accessories/sundry items for brick/block walling', '[]'::jsonb),
  (masonry_section_id, '3', 1, 'Damp-proof courses', '["Laps", "Cutting"]'::jsonb),
  (masonry_section_id, '4', 1, 'Reinforcement for brick/block walling', '["Laps", "Tying wire"]'::jsonb);

  -- Level 2: Brick walling sub-categories
  INSERT INTO nrm_rules (section_id, path, level, content, coverage_rules) VALUES
  (masonry_section_id, '1.1', 2, 'Walls', '["Mortar", "Cutting", "Waste"]'::jsonb),
  (masonry_section_id, '1.2', 2, 'Isolated piers', '["Mortar", "Cutting", "Waste"]'::jsonb),
  (masonry_section_id, '1.3', 2, 'Isolated casings', '["Mortar", "Cutting", "Waste"]'::jsonb),
  (masonry_section_id, '1.4', 2, 'Chimney stacks', '["Mortar", "Cutting", "Waste"]'::jsonb);

  -- Level 3: Walls - detailed specifications with units
  INSERT INTO nrm_rules (section_id, path, level, content, unit, measurement_logic, coverage_rules, notes) VALUES
  -- Common bricks
  (masonry_section_id, '1.1.1', 3, 'Walls; common bricks; stretcher bond; vertical; thickness 102.5mm', 'm2', 
   '{"deduct_voids_min_area": 0.5, "measurement_basis": "face_area"}'::jsonb,
   '["Mortar in joints", "Cutting and waste", "Fair pointing one side", "Bonding to adjacent work"]'::jsonb,
   'Measured as the area of face. Openings < 0.5m² not deducted.'),
  
  (masonry_section_id, '1.1.2', 3, 'Walls; common bricks; stretcher bond; vertical; thickness 215mm', 'm2',
   '{"deduct_voids_min_area": 0.5, "measurement_basis": "face_area"}'::jsonb,
   '["Mortar in joints", "Cutting and waste", "Fair pointing both sides", "Bonding to adjacent work"]'::jsonb,
   'One brick wall. Openings < 0.5m² not deducted.'),
  
  (masonry_section_id, '1.1.3', 3, 'Walls; common bricks; English bond; vertical; thickness 215mm', 'm2',
   '{"deduct_voids_min_area": 0.5, "measurement_basis": "face_area"}'::jsonb,
   '["Mortar in joints", "Cutting and waste", "Fair pointing both sides", "Snap headers"]'::jsonb,
   'Traditional bond requiring snap headers.'),
  
  -- Facing bricks
  (masonry_section_id, '1.1.4', 3, 'Walls; facing bricks; stretcher bond; vertical; thickness 102.5mm', 'm2',
   '{"deduct_voids_min_area": 0.5, "measurement_basis": "face_area"}'::jsonb,
   '["Mortar in joints", "Cutting and waste", "Facework one side", "Bonding to adjacent work"]'::jsonb,
   'Facing quality bricks. Specify brick type separately.'),
  
  -- Concrete blocks
  (masonry_section_id, '1.1.5', 3, 'Walls; concrete blocks; stretcher bond; vertical; thickness 100mm', 'm2',
   '{"deduct_voids_min_area": 1.0, "measurement_basis": "face_area"}'::jsonb,
   '["Mortar in joints", "Cutting and waste", "Bonding to adjacent work"]'::jsonb,
   'Standard concrete blocks. Openings < 1.0m² not deducted.'),
  
  (masonry_section_id, '1.1.6', 3, 'Walls; concrete blocks; stretcher bond; vertical; thickness 215mm', 'm2',
   '{"deduct_voids_min_area": 1.0, "measurement_basis": "face_area"}'::jsonb,
   '["Mortar in joints", "Cutting and waste", "Bonding to adjacent work"]'::jsonb,
   'Heavy duty block wall.'),
  
  -- Cavity walls
  (masonry_section_id, '1.1.7', 3, 'Cavity walls; facing bricks outer leaf, concrete block inner leaf; 50mm cavity; total thickness 255mm', 'm2',
   '{"deduct_voids_min_area": 0.5, "measurement_basis": "face_area"}'::jsonb,
   '["Mortar in joints", "Cutting and waste", "Wall ties", "Cavity insulation measured separately"]'::jsonb,
   'Standard cavity wall construction. Ties measured as extra over.');

  -- Level 2 & 3: Damp proof courses
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) VALUES
  (masonry_section_id, '3.1', 2, 'Horizontal damp-proof courses', NULL, '["Laps", "Cutting"]'::jsonb, NULL),
  (masonry_section_id, '3.1.1', 3, 'Damp-proof course; width 102.5mm; horizontal', 'm',
   '["Laps 150mm", "Turning up at ends", "Bedding in mortar"]'::jsonb,
   'Measured linear meters on face.'),
  (masonry_section_id, '3.1.2', 3, 'Damp-proof course; width 215mm; horizontal', 'm',
   '["Laps 150mm", "Turning up at ends", "Bedding in mortar"]'::jsonb,
   'For one brick walls.'),
  (masonry_section_id, '3.1.3', 3, 'Damp-proof course; width exceeding 225mm; horizontal', 'm2',
   '["Laps 150mm", "Turning up at edges", "Bedding in mortar"]'::jsonb,
   'Wide DPCs measured in square meters.');

  RAISE NOTICE 'Seeded Masonry section (14) with full rule hierarchy';
END $$;
