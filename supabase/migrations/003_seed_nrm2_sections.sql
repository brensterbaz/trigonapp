-- ============================================
-- SEED NRM2 WORK SECTIONS (All 41 sections)
-- ============================================

INSERT INTO nrm_sections (code, title, description, sort_order) VALUES
('01', 'Preliminaries', 'Project/contract particulars and preliminaries', 1),
('02', 'Off-site manufactured materials', 'Off-site manufactured materials, components and buildings', 2),
('03', 'Demolitions', 'Demolition and alteration works', 3),
('04', 'Alterations, repairs and conservation', 'Alteration, renovation and conservation works', 4),
('05', 'Excavating and filling', 'Excavation and earthwork operations', 5),
('06', 'Ground remediation and soil stabilization', 'Ground remediation and stabilization works', 6),
('07', 'Piling', 'Piling works', 7),
('08', 'Underpinning', 'Underpinning works', 8),
('09', 'Diaphragm walls and embedded retaining walls', 'Diaphragm walls and embedded retaining walls', 9),
('10', 'Crib walls, gabions and reinforced earth', 'Crib walls, gabion walls and reinforced earth structures', 10),
('11', 'In-situ concrete works', 'In-situ concrete and large precast concrete', 11),
('12', 'Precast/composite concrete', 'Precast and composite concrete', 12),
('13', 'Precast concrete', 'Precast concrete structural components', 13),
('14', 'Masonry', 'Masonry works including brickwork and blockwork', 14),
('15', 'Structural metalwork', 'Structural steel and metalwork', 15),
('16', 'Carpentry', 'Carpentry and joinery works', 16),
('17', 'Sheet roof coverings', 'Sheet metal roof coverings', 17),
('18', 'Tile and slate roof and wall coverings', 'Tile and slate roof and wall coverings', 18),
('19', 'Waterproofing', 'Waterproofing systems', 19),
('20', 'Proprietary linings and partitions', 'Proprietary wall and ceiling linings and partitions', 20),
('21', 'Cladding and covering', 'External cladding and covering systems', 21),
('22', 'General joinery', 'General joinery works', 22),
('23', 'Windows, screens and lights', 'Windows, screens and lights', 23),
('24', 'Doors, shutters and hatches', 'Doors, shutters and hatches', 24),
('25', 'Stairs, walkways and balustrades', 'Stairs, walkways and balustrades', 25),
('26', 'Metalwork', 'Metalwork components', 26),
('27', 'Glazing', 'Glazing works', 27),
('28', 'Floor, wall, ceiling and roof finishings', 'Floor, wall, ceiling and roof finishings', 28),
('29', 'Decoration', 'Decoration and protective coatings', 29),
('30', 'Suspended ceilings', 'Suspended ceiling systems', 30),
('31', 'Insulation, fire stopping and fire protection', 'Insulation and fire protection systems', 31),
('32', 'Furniture, fittings and equipment', 'Furniture, fittings and equipment', 32),
('33', 'Drainage above ground', 'Above ground drainage systems', 33),
('34', 'Drainage below ground', 'Below ground drainage systems', 34),
('35', 'Site works', 'External site works', 35),
('36', 'Fencing', 'Fencing and gates', 36),
('37', 'Soft landscaping', 'Soft landscaping works', 37),
('38', 'Mechanical services', 'Mechanical services installations', 38),
('39', 'Electrical services', 'Electrical services installations', 39),
('40', 'Transportation', 'Transportation systems (lifts, escalators)', 40),
('41', 'Builder''s work in connection', 'Builder''s work in connection with services', 41);

-- Verify the seed
DO $$
DECLARE
  section_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO section_count FROM nrm_sections;
  RAISE NOTICE 'Seeded % NRM2 work sections', section_count;
END $$;

