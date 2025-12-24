-- ============================================
-- COMPREHENSIVE NRM2 RULES SEEDING
-- Based on Functional Specification Document
-- ============================================

-- This migration seeds detailed rules for all major work sections
-- following the hierarchical structure and measurement logic from NRM2

DO $$
DECLARE
  section_01_id UUID;
  section_02_id UUID;
  section_03_id UUID;
  section_05_id UUID;
  section_11_id UUID;
  section_14_id UUID;
  section_16_id UUID;
  section_17_id UUID;
  section_22_id UUID;
  section_27_id UUID;
  section_28_id UUID;
  section_35_id UUID;
  section_38_id UUID;
  section_39_id UUID;
  section_41_id UUID;
BEGIN
  -- Get section IDs
  SELECT id INTO section_01_id FROM nrm_sections WHERE code = '01';
  SELECT id INTO section_02_id FROM nrm_sections WHERE code = '02';
  SELECT id INTO section_03_id FROM nrm_sections WHERE code = '03';
  SELECT id INTO section_05_id FROM nrm_sections WHERE code = '05';
  SELECT id INTO section_11_id FROM nrm_sections WHERE code = '11';
  SELECT id INTO section_14_id FROM nrm_sections WHERE code = '14';
  SELECT id INTO section_16_id FROM nrm_sections WHERE code = '16';
  SELECT id INTO section_17_id FROM nrm_sections WHERE code = '17';
  SELECT id INTO section_22_id FROM nrm_sections WHERE code = '22';
  SELECT id INTO section_27_id FROM nrm_sections WHERE code = '27';
  SELECT id INTO section_28_id FROM nrm_sections WHERE code = '28';
  SELECT id INTO section_35_id FROM nrm_sections WHERE code = '35';
  SELECT id INTO section_38_id FROM nrm_sections WHERE code = '38';
  SELECT id INTO section_39_id FROM nrm_sections WHERE code = '39';
  SELECT id INTO section_41_id FROM nrm_sections WHERE code = '41';

  -- ============================================
  -- WORK SECTION 2: Off-site Manufactured Materials
  -- ============================================
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) 
  VALUES
  (section_02_id, '1', 1, 'Prefabricated structures', NULL, '["Fixing", "Service connections"]'::jsonb, 'Fixing is included; work not part of package measured elsewhere'),
  (section_02_id, '1.1', 2, 'Prefabricated structures; overall dimensions', 'nr', '["Fixing", "Service connections"]'::jsonb, 'Specify dimensions and fixing method'),
  (section_02_id, '1.2', 2, 'Building units; complete buildings', 'nr', '["Fixing", "Service connections", "Height above ground"]'::jsonb, 'Include height above ground and service connection details'),
  (section_02_id, '2', 1, 'Building units', NULL, '["Fixing"]'::jsonb, NULL),
  (section_02_id, '3', 1, 'Complete buildings', NULL, '["Fixing", "Service connections"]'::jsonb, NULL)
  ON CONFLICT (section_id, path) DO NOTHING;

  -- ============================================
  -- WORK SECTION 3: Demolitions
  -- ============================================
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) 
  VALUES
  (section_03_id, '1', 1, 'Structures', 'nr', '["Disconnection of services", "Sealing off"]'::jsonb, 'Whole structures measured as items'),
  (section_03_id, '1.1', 2, 'Structures; building description', 'nr', '["Disconnection of services", "Sealing off", "Lowest level of demolition"]'::jsonb, 'Specify building type and lowest level'),
  (section_03_id, '2', 1, 'Parts of structures', 'm2', '["Disconnection of services", "Sealing off"]'::jsonb, 'Screens and roofs measured in m²'),
  (section_03_id, '2.1', 2, 'Screens; roofs', 'm2', '["Disconnection of services"]'::jsonb, 'Measured as area'),
  (section_03_id, '3', 1, 'Temporary support', 'nr', '[]'::jsonb, 'Support during demolition'),
  (section_03_id, '4', 1, 'Disposal limitations', NULL, '["Materials for reuse"]'::jsonb, 'Specify disposal method and reuse potential')
  ON CONFLICT (section_id, path) DO NOTHING;

  -- ============================================
  -- WORK SECTION 5: Excavating and Filling (Enhanced)
  -- ============================================
  INSERT INTO nrm_rules (section_id, path, level, content, unit, measurement_logic, coverage_rules, notes) 
  VALUES
  -- Site Clearance
  (section_05_id, '1', 1, 'Site clearance and preparation', NULL, '[]'::jsonb, '[]'::jsonb, NULL),
  (section_05_id, '1.1', 2, 'Trees and stumps', 'nr', '{"girth_measurement_height": 1.0}'::jsonb, '[]'::jsonb, 'Girth measured 1.00m above ground'),
  (section_05_id, '1.1.1', 3, 'Trees; girth 500mm-1.5m', 'nr', '{"girth_measurement_height": 1.0, "girth_min": 0.5, "girth_max": 1.5}'::jsonb, '[]'::jsonb, 'Medium trees'),
  (section_05_id, '1.1.2', 3, 'Trees; girth 1.5m-3.0m', 'nr', '{"girth_measurement_height": 1.0, "girth_min": 1.5, "girth_max": 3.0}'::jsonb, '[]'::jsonb, 'Large trees'),
  (section_05_id, '1.1.3', 3, 'Trees; girth exceeding 3.0m', 'nr', '{"girth_measurement_height": 1.0, "girth_min": 3.0}'::jsonb, '[]'::jsonb, 'Very large trees'),
  (section_05_id, '1.2', 2, 'Surface clearance', 'm2', '[]'::jsonb, '[]'::jsonb, 'Bushes, scrub, undergrowth'),
  (section_05_id, '1.3', 2, 'Lifting turf', 'm2', '[]'::jsonb, '[]'::jsonb, 'Specify if retained on-site or removed'),
  (section_05_id, '1.4', 2, 'Removing topsoil', 'm2', '[]'::jsonb, '[]'::jsonb, 'Distinguish retained vs removed off-site'),
  
  -- Bulk Excavation with Depth Bands
  (section_05_id, '2', 1, 'Bulk excavation', 'm3', '{"depth_bands": true}'::jsonb, '["Working space"]'::jsonb, 'Reduced level digging, basements'),
  (section_05_id, '2.1', 2, 'Bulk excavation; depth not exceeding 2.00m', 'm3', '{"depth_max": 2.0, "depth_band": 1}'::jsonb, '["Working space 0.25m"]'::jsonb, 'Band 1: < 2.00m'),
  (section_05_id, '2.2', 2, 'Bulk excavation; depth 2.00m-4.00m', 'm3', '{"depth_min": 2.0, "depth_max": 4.0, "depth_band": 2}'::jsonb, '["Working space 0.25m"]'::jsonb, 'Band 2: 2.00m-4.00m'),
  (section_05_id, '2.3', 2, 'Bulk excavation; depth exceeding 4.00m', 'm3', '{"depth_min": 4.0, "depth_band": 3, "depth_increments": 2.0}'::jsonb, '["Working space 0.60m"]'::jsonb, 'Band 3+: Thereafter in 2.00m stages'),
  
  -- Foundation Excavation
  (section_05_id, '3', 1, 'Foundation excavation', 'm3', '{"depth_bands": true}'::jsonb, '["Working space"]'::jsonb, 'Strip footings, pile caps'),
  (section_05_id, '3.1', 2, 'Foundation trenches; depth not exceeding 0.25m', 'm3', '{"depth_max": 0.25}'::jsonb, '["Breaking out rock", "Earthwork support", "Compacting bottoms"]'::jsonb, 'Shallow trenches'),
  (section_05_id, '3.2', 2, 'Foundation trenches; depth 0.25m-1.00m', 'm3', '{"depth_min": 0.25, "depth_max": 1.0}'::jsonb, '["Breaking out rock", "Earthwork support", "Compacting bottoms"]'::jsonb, 'Standard depth'),
  (section_05_id, '3.3', 2, 'Foundation trenches; depth 1.00m-2.00m', 'm3', '{"depth_min": 1.0, "depth_max": 2.0}'::jsonb, '["Breaking out rock", "Earthwork support", "Compacting bottoms"]'::jsonb, 'Deep trenches'),
  (section_05_id, '3.4', 2, 'Foundation trenches; depth exceeding 2.00m', 'm3', '{"depth_min": 2.0}'::jsonb, '["Breaking out rock", "Earthwork support", "Compacting bottoms"]'::jsonb, 'Very deep trenches'),
  
  -- Trench Excavation
  (section_05_id, '4', 1, 'Trench excavation', 'm3', '{"depth_bands": true}'::jsonb, '["Working space"]'::jsonb, 'Service trenches'),
  (section_05_id, '4.1', 2, 'Service trenches; depth not exceeding 1.00m', 'm3', '{"depth_max": 1.0}'::jsonb, '["Breaking out rock"]'::jsonb, 'Shallow service trenches'),
  (section_05_id, '4.2', 2, 'Service trenches; depth exceeding 1.00m', 'm3', '{"depth_min": 1.0}'::jsonb, '["Breaking out rock", "Earthwork support"]'::jsonb, 'Deep service trenches'),
  
  -- Extra Over Items
  (section_05_id, '5', 1, 'Extra over excavation', 'm3', '{"extra_over": true}'::jsonb, '[]'::jsonb, 'Additional costs over base excavation'),
  (section_05_id, '5.1', 2, 'Breaking out rock', 'm3', '{"extra_over": true, "base_item_required": true}'::jsonb, '[]'::jsonb, 'EO item - shares quantity with base excavation'),
  (section_05_id, '5.2', 2, 'Breaking out concrete/masonry', 'm3', '{"extra_over": true, "base_item_required": true}'::jsonb, '[]'::jsonb, 'EO item'),
  (section_05_id, '5.3', 2, 'Excavating in hazardous material', 'm3', '{"extra_over": true, "base_item_required": true}'::jsonb, '[]'::jsonb, 'EO item - requires special handling'),
  (section_05_id, '5.4', 2, 'Excavating below groundwater level', 'm3', '{"extra_over": true, "base_item_required": true, "requires_water_disposal": true}'::jsonb, '[]'::jsonb, 'EO item - define post-contract water table level'),
  
  -- Earthwork Support
  (section_05_id, '6', 1, 'Earthwork support', 'm2', '{"measurement_basis": "face_area"}'::jsonb, '[]'::jsonb, 'Vertical surface area of excavation'),
  (section_05_id, '6.1', 2, 'Earthwork support; depth not exceeding 2.00m', 'm2', '{"depth_max": 2.0, "working_space": 0.25}'::jsonb, '[]'::jsonb, 'Shallow support'),
  (section_05_id, '6.2', 2, 'Earthwork support; depth exceeding 2.00m', 'm2', '{"depth_min": 2.0, "working_space": 0.60}'::jsonb, '[]'::jsonb, 'Deep support - 0.60m working space'),
  
  -- Disposal
  (section_05_id, '7', 1, 'Disposal of excavated material', 'm3', '{"mass_balance": true}'::jsonb, '[]'::jsonb, 'Total Excavated - Fill = Disposal'),
  (section_05_id, '7.1', 2, 'Disposal on-site', 'm3', '{"disposal_type": "on_site"}'::jsonb, '[]'::jsonb, 'Forming landscape bunds, etc.'),
  (section_05_id, '7.2', 2, 'Disposal off-site', 'm3', '{"disposal_type": "off_site"}'::jsonb, '[]'::jsonb, 'To tip or licensed disposal site')
  ON CONFLICT (section_id, path) DO UPDATE SET
    level = EXCLUDED.level,
    content = EXCLUDED.content,
    unit = EXCLUDED.unit,
    measurement_logic = EXCLUDED.measurement_logic,
    coverage_rules = EXCLUDED.coverage_rules,
    notes = EXCLUDED.notes;

  -- ============================================
  -- WORK SECTION 11: In-situ Concrete Works (Enhanced)
  -- ============================================
  INSERT INTO nrm_rules (section_id, path, level, content, unit, measurement_logic, coverage_rules, notes) 
  VALUES
  -- Foundations
  (section_11_id, '1', 1, 'Foundations', 'm3', '{"deduct_voids_min_volume": 0.05, "net_measurement": true}'::jsonb, '["No deduction for steel volume"]'::jsonb, 'Net volume - deduct voids > 0.05 m³'),
  (section_11_id, '1.1', 2, 'Foundations; mass concrete', 'm3', '{"deduct_voids_min_volume": 0.05, "concrete_type": "mass"}'::jsonb, '["No deduction for steel volume"]'::jsonb, 'Unreinforced'),
  (section_11_id, '1.2', 2, 'Foundations; reinforced concrete', 'm3', '{"deduct_voids_min_volume": 0.05, "concrete_type": "reinforced"}'::jsonb, '["No deduction for steel volume"]'::jsonb, 'Standard structural'),
  
  -- Slabs with Thickness Bands
  (section_11_id, '2', 1, 'Slabs', 'm3', '{"deduct_voids_min_volume": 0.05, "thickness_bands": true, "orientation": "horizontal"}'::jsonb, '["No deduction for steel volume"]'::jsonb, 'Horizontal work'),
  (section_11_id, '2.1', 2, 'Slabs; thickness not exceeding 150mm', 'm3', '{"thickness_max": 0.15, "thickness_band": 1, "orientation": "horizontal"}'::jsonb, '["No deduction for steel volume"]'::jsonb, 'Thin slabs - more labor-intensive per m³'),
  (section_11_id, '2.2', 2, 'Slabs; thickness 150mm-450mm', 'm3', '{"thickness_min": 0.15, "thickness_max": 0.45, "thickness_band": 2, "orientation": "horizontal"}'::jsonb, '["No deduction for steel volume"]'::jsonb, 'Standard thickness'),
  (section_11_id, '2.3', 2, 'Slabs; thickness exceeding 450mm', 'm3', '{"thickness_min": 0.45, "thickness_band": 3, "orientation": "horizontal"}'::jsonb, '["No deduction for steel volume"]'::jsonb, 'Thick slabs'),
  
  -- Walls
  (section_11_id, '3', 1, 'Walls', 'm3', '{"deduct_voids_min_volume": 0.05, "orientation": "vertical"}'::jsonb, '["No deduction for steel volume"]'::jsonb, 'Vertical work'),
  (section_11_id, '3.1', 2, 'Walls; mass concrete', 'm3', '{"concrete_type": "mass", "orientation": "vertical"}'::jsonb, '[]'::jsonb, 'Unreinforced walls'),
  (section_11_id, '3.2', 2, 'Walls; reinforced concrete', 'm3', '{"concrete_type": "reinforced", "orientation": "vertical"}'::jsonb, '["No deduction for steel volume"]'::jsonb, 'Reinforced walls'),
  
  -- Beams
  (section_11_id, '4', 1, 'Beams', 'm3', '{"deduct_voids_min_volume": 0.05, "orientation": "horizontal"}'::jsonb, '["No deduction for steel volume"]'::jsonb, 'Horizontal structural members'),
  (section_11_id, '4.1', 2, 'Beams; mass concrete', 'm3', '{"concrete_type": "mass"}'::jsonb, '[]'::jsonb, NULL),
  (section_11_id, '4.2', 2, 'Beams; reinforced concrete', 'm3', '{"concrete_type": "reinforced"}'::jsonb, '["No deduction for steel volume"]'::jsonb, NULL),
  
  -- Columns
  (section_11_id, '5', 1, 'Columns', 'm3', '{"deduct_voids_min_volume": 0.05}'::jsonb, '["No deduction for steel volume"]'::jsonb, 'Vertical structural members'),
  (section_11_id, '5.1', 2, 'Columns; isolated', 'm3', '{"column_type": "isolated"}'::jsonb, '["No deduction for steel volume"]'::jsonb, 'Standalone columns'),
  (section_11_id, '5.2', 2, 'Columns; attached', 'm3', '{"column_type": "attached"}'::jsonb, '["No deduction for steel volume"]'::jsonb, 'Columns attached to walls'),
  
  -- Staircases (Sloping Work)
  (section_11_id, '6', 1, 'Staircases and ramps', 'm3', '{"deduct_voids_min_volume": 0.05, "orientation": "sloping"}'::jsonb, '["No deduction for steel volume"]'::jsonb, 'Sloping work - different formwork techniques'),
  (section_11_id, '6.1', 2, 'Staircases; reinforced concrete', 'm3', '{"concrete_type": "reinforced", "orientation": "sloping"}'::jsonb, '["No deduction for steel volume"]'::jsonb, NULL),
  (section_11_id, '6.2', 2, 'Ramps; reinforced concrete', 'm3', '{"concrete_type": "reinforced", "orientation": "sloping"}'::jsonb, '["No deduction for steel volume"]'::jsonb, NULL),
  
  -- Formwork
  (section_11_id, '7', 1, 'Formwork', 'm2', '{"deduct_voids_min_area": 1.0, "measurement_basis": "net_contact_area"}'::jsonb, '[]'::jsonb, 'Net area of contact - voids < 1.00 m² not deducted'),
  (section_11_id, '7.1', 2, 'Formwork; basic finish', 'm2', '{"finish_type": "basic", "deduct_voids_min_area": 1.0}'::jsonb, '[]'::jsonb, 'For surfaces to be covered'),
  (section_11_id, '7.2', 2, 'Formwork; special finish', 'm2', '{"finish_type": "special", "deduct_voids_min_area": 1.0}'::jsonb, '[]'::jsonb, 'Exposed architectural concrete'),
  (section_11_id, '7.3', 2, 'Soffit formwork; height not exceeding 3.00m', 'm2', '{"height_max": 3.0, "height_band": 1}'::jsonb, '[]'::jsonb, 'Band 1: < 3.00m'),
  (section_11_id, '7.4', 2, 'Soffit formwork; height 3.00m-4.50m', 'm2', '{"height_min": 3.0, "height_max": 4.5, "height_band": 2}'::jsonb, '[]'::jsonb, 'Band 2: 3.00m-4.50m'),
  (section_11_id, '7.5', 2, 'Soffit formwork; height exceeding 4.50m', 'm2', '{"height_min": 4.5, "height_band": 3}'::jsonb, '[]'::jsonb, 'Band 3+: > 4.50m'),
  
  -- Reinforcement
  (section_11_id, '8', 1, 'Reinforcement', 't', '{"calculation": "length_x_density"}'::jsonb, '["Tying wire", "Spacers", "Chairs (unless designed)"]'::jsonb, 'Measured by weight - Length (m) x Density (kg/m)'),
  (section_11_id, '8.1', 2, 'Reinforcement; straight bars', 't', '{"bar_shape": "straight"}'::jsonb, '["Tying wire", "Spacers", "Chairs"]'::jsonb, 'Specify steel grade and diameter'),
  (section_11_id, '8.2', 2, 'Reinforcement; bent bars', 't', '{"bar_shape": "bent"}'::jsonb, '["Tying wire", "Spacers", "Chairs"]'::jsonb, NULL),
  (section_11_id, '8.3', 2, 'Reinforcement; links/stirrups', 't', '{"bar_shape": "links"}'::jsonb, '["Tying wire"]'::jsonb, NULL),
  (section_11_id, '8.4', 2, 'Fabric reinforcement', 'm2', '{"fabric": true}'::jsonb, '["Tying wire", "Spacers"]'::jsonb, 'Mesh reference (e.g., A142, A393)')
  ON CONFLICT (section_id, path) DO UPDATE SET
    level = EXCLUDED.level,
    content = EXCLUDED.content,
    unit = EXCLUDED.unit,
    measurement_logic = EXCLUDED.measurement_logic,
    coverage_rules = EXCLUDED.coverage_rules,
    notes = EXCLUDED.notes;

  -- ============================================
  -- WORK SECTION 16: Carpentry
  -- ============================================
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) 
  VALUES
  (section_16_id, '1', 1, 'Primary timbers', 'm', '["Joints", "Laps"]'::jsonb, 'Structural timber - First Fix'),
  (section_16_id, '1.1', 2, 'Joists', 'm', '["Joints", "Laps", "Sawn finish"]'::jsonb, 'Specify nominal cross-section (e.g., 47x225mm)'),
  (section_16_id, '1.2', 2, 'Rafters', 'm', '["Joints", "Laps", "Sawn finish"]'::jsonb, 'Specify nominal cross-section'),
  (section_16_id, '1.3', 2, 'Plates', 'm', '["Joints", "Laps", "Sawn finish"]'::jsonb, 'Wall plates, etc.'),
  (section_16_id, '2', 1, 'Wrot finish timbers', 'm', '["Joints", "Laps"]'::jsonb, 'Specify if wrot finish required')
  ON CONFLICT (section_id, path) DO NOTHING;

  -- ============================================
  -- WORK SECTION 17: Sheet Roofing
  -- ============================================
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) 
  VALUES
  (section_17_id, '1', 1, 'Coverings', 'm2', '["Laps", "Seams"]'::jsonb, 'Net finished surface - allowance for laps/seams deemed included'),
  (section_17_id, '1.1', 2, 'Sheet metal coverings', 'm2', '["Laps", "Seams"]'::jsonb, 'Specify metal type and gauge'),
  (section_17_id, '2', 1, 'Flashings', 'm', '["Laps"]'::jsonb, 'Linear items'),
  (section_17_id, '3', 1, 'Gutters', 'm', '["Fixing method"]'::jsonb, 'Linear items')
  ON CONFLICT (section_id, path) DO NOTHING;

  -- ============================================
  -- WORK SECTION 22: General Joinery
  -- ============================================
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) 
  VALUES
  (section_22_id, '1', 1, 'Skirtings', 'm', '["Mitres", "Short lengths"]'::jsonb, 'Specify cross-section size, material, finish'),
  (section_22_id, '1.1', 2, 'Skirtings; timber', 'm', '["Mitres", "Short lengths"]'::jsonb, 'Specify cross-section and finish'),
  (section_22_id, '2', 1, 'Architraves', 'm', '["Mitres", "Short lengths"]'::jsonb, 'Specify cross-section size, material, finish'),
  (section_22_id, '3', 1, 'Dado rails', 'm', '["Mitres", "Short lengths"]'::jsonb, NULL),
  (section_22_id, '4', 1, 'Fittings', 'nr', '[]'::jsonb, 'Enumerated items')
  ON CONFLICT (section_id, path) DO NOTHING;

  -- ============================================
  -- WORK SECTION 27: Glazing
  -- ============================================
  INSERT INTO nrm_rules (section_id, path, level, content, unit, measurement_logic, coverage_rules, notes) 
  VALUES
  (section_27_id, '1', 1, 'Glass panes', 'm2', '{"pane_size_categories": true}'::jsonb, '["Glazing compound", "Beads"]'::jsonb, 'Rate includes glazing compound/beads'),
  (section_27_id, '1.1', 2, 'Glass panes; area less than 0.15m²', 'nr', '{"pane_area_max": 0.15}'::jsonb, '["Glazing compound", "Beads"]'::jsonb, 'Small panes - measured as number'),
  (section_27_id, '1.2', 2, 'Glass panes; area 0.15m²-4.0m²', 'm2', '{"pane_area_min": 0.15, "pane_area_max": 4.0}'::jsonb, '["Glazing compound", "Beads"]'::jsonb, 'Standard panes - measured as area'),
  (section_27_id, '1.3', 2, 'Glass panes; area exceeding 4.0m²', 'm2', '{"pane_area_min": 4.0}'::jsonb, '["Glazing compound", "Beads"]'::jsonb, 'Large panes'),
  (section_27_id, '1.4', 2, 'Glass panes; float glass', 'm2', '{"glass_type": "float"}'::jsonb, '["Glazing compound", "Beads"]'::jsonb, NULL),
  (section_27_id, '1.5', 2, 'Glass panes; safety glass', 'm2', '{"glass_type": "safety"}'::jsonb, '["Glazing compound", "Beads"]'::jsonb, NULL),
  (section_27_id, '2', 1, 'Mirrors', 'm2', '[]'::jsonb, '["Glazing compound", "Beads"]'::jsonb, NULL)
  ON CONFLICT (section_id, path) DO UPDATE SET
    level = EXCLUDED.level,
    content = EXCLUDED.content,
    unit = EXCLUDED.unit,
    measurement_logic = EXCLUDED.measurement_logic,
    coverage_rules = EXCLUDED.coverage_rules,
    notes = EXCLUDED.notes;

  -- ============================================
  -- WORK SECTION 28: Floor, Wall, Ceiling Finishes
  -- ============================================
  INSERT INTO nrm_rules (section_id, path, level, content, unit, measurement_logic, coverage_rules, notes) 
  VALUES
  (section_28_id, '1', 1, 'Floor finishes', 'm2', '{"deduct_voids_min_area": 0.5, "segment_by_location": true}'::jsonb, '[]'::jsonb, 'Segment by room/location - deduct voids > 0.50 m²'),
  (section_28_id, '1.1', 2, 'Screeds', 'm2', '{"deduct_voids_min_area": 0.5, "thickness_required": true}'::jsonb, '[]'::jsonb, 'Specify thickness and mix/grade'),
  (section_28_id, '1.2', 2, 'Tiles', 'm2', '{"deduct_voids_min_area": 0.5}'::jsonb, '[]'::jsonb, 'Specify material and finish'),
  (section_28_id, '1.3', 2, 'Carpet', 'm2', '{"deduct_voids_min_area": 0.5}'::jsonb, '[]'::jsonb, NULL),
  (section_28_id, '1.4', 2, 'Divider strips', 'm', '[]'::jsonb, '[]'::jsonb, 'Perimeter items at door thresholds'),
  (section_28_id, '2', 1, 'Wall finishes', 'm2', '{"deduct_voids_min_area": 0.5, "height_bands": true, "segment_by_location": true}'::jsonb, '[]'::jsonb, 'Work > 3.5m high kept separate'),
  (section_28_id, '2.1', 2, 'Plaster', 'm2', '{"deduct_voids_min_area": 0.5, "height_bands": true}'::jsonb, '[]'::jsonb, 'Specify thickness, mix/grade, finish'),
  (section_28_id, '2.2', 2, 'Plaster; height not exceeding 3.5m', 'm2', '{"height_max": 3.5, "deduct_voids_min_area": 0.5}'::jsonb, '[]'::jsonb, 'Standard height'),
  (section_28_id, '2.3', 2, 'Plaster; height exceeding 3.5m', 'm2', '{"height_min": 3.5, "deduct_voids_min_area": 0.5}'::jsonb, '[]'::jsonb, 'High level - separate pricing'),
  (section_28_id, '2.4', 2, 'Tiles', 'm2', '{"deduct_voids_min_area": 0.5}'::jsonb, '[]'::jsonb, 'Specify material and finish'),
  (section_28_id, '3', 1, 'Ceiling finishes', 'm2', '{"void_depth_bands": true}'::jsonb, '[]'::jsonb, 'Suspension zone depth affects pricing'),
  (section_28_id, '3.1', 2, 'Ceilings; void depth less than 150mm', 'm2', '{"void_depth_max": 0.15, "void_depth_band": 1}'::jsonb, '[]'::jsonb, 'Zone 1: < 150mm'),
  (section_28_id, '3.2', 2, 'Ceilings; void depth 150mm-500mm', 'm2', '{"void_depth_min": 0.15, "void_depth_max": 0.5, "void_depth_band": 2}'::jsonb, '[]'::jsonb, 'Zone 2: 150-500mm'),
  (section_28_id, '3.3', 2, 'Ceilings; void depth exceeding 500mm', 'm2', '{"void_depth_min": 0.5, "void_depth_band": 3}'::jsonb, '[]'::jsonb, 'Zone 3: > 500mm')
  ON CONFLICT (section_id, path) DO UPDATE SET
    level = EXCLUDED.level,
    content = EXCLUDED.content,
    unit = EXCLUDED.unit,
    measurement_logic = EXCLUDED.measurement_logic,
    coverage_rules = EXCLUDED.coverage_rules,
    notes = EXCLUDED.notes;

  -- ============================================
  -- WORK SECTION 35: Site Works
  -- ============================================
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) 
  VALUES
  (section_35_id, '1', 1, 'Roads', 'm2', '[]'::jsonb, 'Excavation measured separately in WS 5'),
  (section_35_id, '1.1', 2, 'Asphalt roads', 'm2', '[]'::jsonb, 'Specify construction depth and material specification'),
  (section_35_id, '1.2', 2, 'Block paving', 'm2', '[]'::jsonb, 'Specify construction depth and material specification'),
  (section_35_id, '2', 1, 'Paving', 'm2', '[]'::jsonb, NULL),
  (section_35_id, '2.1', 2, 'Gravel paths', 'm2', '[]'::jsonb, 'Specify construction depth and material specification'),
  (section_35_id, '3', 1, 'Kerbs', 'm', '[]'::jsonb, 'Linear items')
  ON CONFLICT (section_id, path) DO NOTHING;

  -- ============================================
  -- WORK SECTION 38: Mechanical Services
  -- ============================================
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) 
  VALUES
  (section_38_id, '1', 1, 'Pipework', 'm', '[]'::jsonb, 'Detailed measurement - specify material, diameter, jointing method'),
  (section_38_id, '1.1', 2, 'Pipework; copper', 'm', '[]'::jsonb, 'Specify diameter and jointing method'),
  (section_38_id, '1.2', 2, 'Pipework; steel', 'm', '[]'::jsonb, 'Specify diameter and jointing method'),
  (section_38_id, '2', 1, 'Fittings', 'nr', '{"extra_over": true}'::jsonb, 'EO items - pipe measured through fitting'),
  (section_38_id, '2.1', 2, 'Bends', 'nr', '{"extra_over": true}'::jsonb, NULL),
  (section_38_id, '2.2', 2, 'Tees', 'nr', '{"extra_over": true}'::jsonb, NULL),
  (section_38_id, '2.3', 2, 'Reducers', 'nr', '{"extra_over": true}'::jsonb, NULL),
  (section_38_id, '3', 1, 'Equipment', 'nr', '[]'::jsonb, 'Boilers, AHUs, etc.')
  ON CONFLICT (section_id, path) DO NOTHING;

  -- ============================================
  -- WORK SECTION 39: Electrical Services
  -- ============================================
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) 
  VALUES
  (section_39_id, '1', 1, 'Cable', 'm', '[]'::jsonb, 'Specify type and size'),
  (section_39_id, '2', 1, 'Fittings', 'nr', '[]'::jsonb, 'Switches, sockets, etc.'),
  (section_39_id, '3', 1, 'Equipment', 'nr', '[]'::jsonb, 'Switchboards, distribution boards, etc.')
  ON CONFLICT (section_id, path) DO NOTHING;

  -- ============================================
  -- WORK SECTION 41: Builder's Work in Connection
  -- ============================================
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) 
  VALUES
  (section_41_id, '1', 1, 'Holes and chases', NULL, '[]'::jsonb, 'Interface between structure and services'),
  (section_41_id, '1.1', 2, 'Cutting holes through walls/floors', 'nr', '[]'::jsonb, 'Measured by number or length depending on size'),
  (section_41_id, '1.2', 2, 'Chases in walls', 'm', '[]'::jsonb, 'Linear measurement'),
  (section_41_id, '2', 1, 'Fire stopping', 'nr', '[]'::jsonb, 'Sealing penetrations'),
  (section_41_id, '3', 1, 'Plinths', NULL, '[]'::jsonb, 'Concrete bases for equipment'),
  (section_41_id, '3.1', 2, 'Plinths; concrete bases', 'm3', '[]'::jsonb, 'Measured in m³ or nr depending on specification')
  ON CONFLICT (section_id, path) DO UPDATE SET
    level = EXCLUDED.level,
    content = EXCLUDED.content,
    unit = EXCLUDED.unit,
    measurement_logic = EXCLUDED.measurement_logic,
    coverage_rules = EXCLUDED.coverage_rules,
    notes = EXCLUDED.notes;

  RAISE NOTICE 'Comprehensive NRM2 rules seeded successfully';
END $$;

-- Verify counts
SELECT 
  s.code,
  s.title,
  COUNT(r.id) as rule_count
FROM nrm_sections s
LEFT JOIN nrm_rules r ON r.section_id = s.id
GROUP BY s.code, s.title
ORDER BY s.code;

