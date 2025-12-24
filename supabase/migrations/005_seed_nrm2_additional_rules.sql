-- ============================================
-- SEED NRM2 RULES - Additional Key Sections
-- Section 05: Excavating and filling
-- Section 11: In-situ concrete works
-- Section 16: Carpentry
-- Section 39: Electrical services
-- ============================================

DO $$
DECLARE
  excavation_id UUID;
  concrete_id UUID;
  carpentry_id UUID;
  electrical_id UUID;
BEGIN
  -- Get section IDs
  SELECT id INTO excavation_id FROM nrm_sections WHERE code = '05';
  SELECT id INTO concrete_id FROM nrm_sections WHERE code = '11';
  SELECT id INTO carpentry_id FROM nrm_sections WHERE code = '16';
  SELECT id INTO electrical_id FROM nrm_sections WHERE code = '39';

  -- ========================================
  -- Section 05: Excavating and filling
  -- ========================================
  
  -- Level 1
  INSERT INTO nrm_rules (section_id, path, level, content) VALUES
  (excavation_id, '1', 1, 'Excavating'),
  (excavation_id, '2', 1, 'Filling'),
  (excavation_id, '3', 1, 'Disposal');

  -- Level 2 & 3: Excavating
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) VALUES
  (excavation_id, '1.1', 2, 'Excavating; foundation trenches', NULL, '[]'::jsonb, NULL),
  (excavation_id, '1.1.1', 3, 'Excavating; foundation trenches; maximum depth not exceeding 0.25m', 'm3',
   '["Breaking out rock", "Earthwork support", "Compacting bottoms"]'::jsonb,
   'Measured net volume excavated'),
  (excavation_id, '1.1.2', 3, 'Excavating; foundation trenches; maximum depth not exceeding 1.00m', 'm3',
   '["Breaking out rock", "Earthwork support", "Compacting bottoms"]'::jsonb,
   'Measured net volume excavated'),
  (excavation_id, '1.1.3', 3, 'Excavating; foundation trenches; maximum depth not exceeding 2.00m', 'm3',
   '["Breaking out rock", "Earthwork support", "Compacting bottoms"]'::jsonb,
   'Measured net volume excavated'),
  
  (excavation_id, '1.2', 2, 'Excavating; pits', NULL, '[]'::jsonb, NULL),
  (excavation_id, '1.2.1', 3, 'Excavating; pits; maximum depth not exceeding 0.25m', 'm3',
   '["Breaking out rock", "Earthwork support"]'::jsonb,
   'For isolated bases and similar');

  -- ========================================
  -- Section 11: In-situ concrete works
  -- ========================================
  
  -- Level 1
  INSERT INTO nrm_rules (section_id, path, level, content) VALUES
  (concrete_id, '1', 1, 'Formwork'),
  (concrete_id, '2', 1, 'Reinforcement'),
  (concrete_id, '3', 1, 'In-situ concrete');

  -- Level 2 & 3: In-situ concrete
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) VALUES
  (concrete_id, '3.1', 2, 'Foundations', NULL, '[]'::jsonb, NULL),
  (concrete_id, '3.1.1', 3, 'Foundations; strip footings; poured on or against earth; width not exceeding 300mm', 'm',
   '["Vibrating", "Levelling top surface", "Forming chamfers"]'::jsonb,
   'Measured center line length'),
  (concrete_id, '3.1.2', 3, 'Foundations; strip footings; poured on or against earth; width 300-500mm', 'm',
   '["Vibrating", "Levelling top surface", "Forming chamfers"]'::jsonb,
   'Measured center line length'),
  (concrete_id, '3.1.3', 3, 'Foundations; bases; poured on or against earth; thickness not exceeding 150mm', 'm2',
   '["Vibrating", "Levelling top surface"]'::jsonb,
   'Measured on plan area'),
  
  (concrete_id, '3.2', 2, 'Slabs', NULL, '[]'::jsonb, NULL),
  (concrete_id, '3.2.1', 3, 'Slabs; ground slabs; poured on or against earth; thickness 150mm', 'm2',
   '["Vibrating", "Levelling and finishing top surface", "Trowelling"]'::jsonb,
   'Measured on plan area. Reinforcement measured separately'),
  (concrete_id, '3.2.2', 3, 'Slabs; suspended slabs; horizontal; thickness 150-200mm', 'm2',
   '["Vibrating", "Levelling top surface", "Power floating"]'::jsonb,
   'Formwork measured separately'),
  
  (concrete_id, '3.3', 2, 'Walls', NULL, '[]'::jsonb, NULL),
  (concrete_id, '3.3.1', 3, 'Walls; retaining walls; vertical; thickness 200mm', 'm2',
   '["Vibrating", "Forming construction joints"]'::jsonb,
   'Measured on elevation. Formwork both sides measured separately');

  -- Level 2 & 3: Reinforcement
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) VALUES
  (concrete_id, '2.1', 2, 'Bar reinforcement', NULL, '[]'::jsonb, NULL),
  (concrete_id, '2.1.1', 3, 'Bar reinforcement; straight bars; 8mm diameter', 't',
   '["Laps", "Tying wire", "Spacers", "Chairs", "Cutting and waste"]'::jsonb,
   'Measured weight in tonnes'),
  (concrete_id, '2.1.2', 3, 'Bar reinforcement; straight bars; 12mm diameter', 't',
   '["Laps", "Tying wire", "Spacers", "Chairs", "Cutting and waste"]'::jsonb,
   'Measured weight in tonnes'),
  (concrete_id, '2.2', 2, 'Fabric reinforcement', NULL, '[]'::jsonb, NULL),
  (concrete_id, '2.2.1', 3, 'Fabric reinforcement; mesh fabric; A142 mesh', 'm2',
   '["Laps 150mm minimum", "Tying wire", "Chairs"]'::jsonb,
   'Measured area laid');

  -- ========================================
  -- Section 16: Carpentry
  -- ========================================
  
  -- Level 1
  INSERT INTO nrm_rules (section_id, path, level, content) VALUES
  (carpentry_id, '1', 1, 'First fixing carpentry'),
  (carpentry_id, '2', 1, 'Second fixing carpentry'),
  (carpentry_id, '3', 1, 'Timber treatment');

  -- Level 2 & 3: First fixing
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) VALUES
  (carpentry_id, '1.1', 2, 'Floor joists', NULL, '[]'::jsonb, NULL),
  (carpentry_id, '1.1.1', 3, 'Floor joists; sawn softwood; 50 x 150mm; 400mm centers', 'm2',
   '["Fixings", "Strutting", "Joist hangers measured separately"]'::jsonb,
   'Measured area of floor supported'),
  (carpentry_id, '1.1.2', 3, 'Floor joists; sawn softwood; 50 x 200mm; 400mm centers', 'm2',
   '["Fixings", "Strutting", "Joist hangers measured separately"]'::jsonb,
   'Measured area of floor supported'),
  
  (carpentry_id, '1.2', 2, 'Roof timbers', NULL, '[]'::jsonb, NULL),
  (carpentry_id, '1.2.1', 3, 'Roof rafters; sawn softwood; 50 x 100mm; 400mm centers', 'm2',
   '["Fixings", "Birdsmouth joints", "Ridge connections"]'::jsonb,
   'Measured area of roof covered'),
  (carpentry_id, '1.2.2', 3, 'Roof rafters; sawn softwood; 50 x 150mm; 600mm centers', 'm2',
   '["Fixings", "Birdsmouth joints", "Ridge connections"]'::jsonb,
   'Measured area of roof covered'),
  
  (carpentry_id, '1.3', 2, 'Studwork', NULL, '[]'::jsonb, NULL),
  (carpentry_id, '1.3.1', 3, 'Studwork partitions; softwood; 50 x 100mm studs; 400mm centers', 'm2',
   '["Top and bottom plates", "Noggings", "Fixings"]'::jsonb,
   'Measured area of partition');

  -- ========================================
  -- Section 39: Electrical services
  -- ========================================
  
  -- Level 1
  INSERT INTO nrm_rules (section_id, path, level, content) VALUES
  (electrical_id, '1', 1, 'Power supplies'),
  (electrical_id, '2', 1, 'Lighting'),
  (electrical_id, '3', 1, 'Emergency and standby systems'),
  (electrical_id, '4', 1, 'Small power distribution');

  -- Level 2 & 3: Power supplies
  INSERT INTO nrm_rules (section_id, path, level, content, unit, coverage_rules, notes) VALUES
  (electrical_id, '1.1', 2, 'Cables', NULL, '[]'::jsonb, NULL),
  (electrical_id, '1.1.1', 3, 'Cables; PVC insulated and sheathed; 2.5mm²; twin and earth', 'm',
   '["Fixings at 300mm centers", "Connections to terminals"]'::jsonb,
   'Ring main circuits'),
  (electrical_id, '1.1.2', 3, 'Cables; PVC insulated and sheathed; 6mm²; twin and earth', 'm',
   '["Fixings at 300mm centers", "Connections to terminals"]'::jsonb,
   'Cooker and shower circuits'),
  
  (electrical_id, '4.1', 2, 'Socket outlets', NULL, '[]'::jsonb, NULL),
  (electrical_id, '4.1.1', 3, 'Socket outlets; 13A single switched', 'nr',
   '["Back box", "Faceplate", "Connection to circuit"]'::jsonb,
   'Counted as number'),
  (electrical_id, '4.1.2', 3, 'Socket outlets; 13A double switched', 'nr',
   '["Back box", "Faceplate", "Connection to circuit"]'::jsonb,
   'Counted as number');

  RAISE NOTICE 'Seeded additional sections: Excavation (05), Concrete (11), Carpentry (16), Electrical (39)';
END $$;
