-- ============================================
-- PHASE 4: DIGITAL TAKING OFF (DIMENSION SHEETS)
-- ============================================

-- 1. Create Dimension Sheets Table
CREATE TABLE dimension_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bq_item_id UUID NOT NULL REFERENCES bill_of_quantities(id) ON DELETE CASCADE,
  
  -- Row description (e.g., "Grid A-B", "Room 101")
  description TEXT,
  
  -- Measurement inputs
  timesing NUMERIC(10, 2) DEFAULT 1.00,  -- Multiplier
  dim_a NUMERIC(15, 4),                  -- Length
  dim_b NUMERIC(15, 4),                  -- Width
  dim_c NUMERIC(15, 4),                  -- Depth/Height
  waste NUMERIC(5, 2) DEFAULT 0.00,      -- Percentage waste (e.g., 5.00 for 5%)
  
  -- Result
  calculated_value NUMERIC(15, 4) NOT NULL DEFAULT 0,
  is_deduction BOOLEAN NOT NULL DEFAULT false,
  
  -- Ordering
  sort_order INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX dims_bq_item_id_idx ON dimension_sheets(bq_item_id);
CREATE INDEX dims_sort_order_idx ON dimension_sheets(bq_item_id, sort_order);

-- 2. RLS Policies
ALTER TABLE dimension_sheets ENABLE ROW LEVEL SECURITY;

-- Users can view dimensions for projects in their organization
CREATE POLICY "Users can view dimensions in own organization"
  ON dimension_sheets FOR SELECT
  USING (
    bq_item_id IN (
      SELECT id FROM bill_of_quantities WHERE project_id IN (
        SELECT id FROM projects WHERE organization_id IN (
          SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Users can insert dimensions into their organization's projects
CREATE POLICY "Users can create dimensions in own organization"
  ON dimension_sheets FOR INSERT
  WITH CHECK (
    bq_item_id IN (
      SELECT id FROM bill_of_quantities WHERE project_id IN (
        SELECT id FROM projects WHERE organization_id IN (
          SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Users can update dimensions in their organization's projects
CREATE POLICY "Users can update dimensions in own organization"
  ON dimension_sheets FOR UPDATE
  USING (
    bq_item_id IN (
      SELECT id FROM bill_of_quantities WHERE project_id IN (
        SELECT id FROM projects WHERE organization_id IN (
          SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Users can delete dimensions from their organization's projects
CREATE POLICY "Users can delete dimensions from own organization"
  ON dimension_sheets FOR DELETE
  USING (
    bq_item_id IN (
      SELECT id FROM bill_of_quantities WHERE project_id IN (
        SELECT id FROM projects WHERE organization_id IN (
          SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

-- 3. Triggers

-- A) Update updated_at timestamp
CREATE TRIGGER dimension_sheets_updated_at
  BEFORE UPDATE ON dimension_sheets
  FOR EACH ROW
  EXECUTE FUNCTION update_bq_updated_at(); -- Reusing the function from migration 006

-- B) Automatic Calculation Trigger (Row Level)
-- Calculates the row value before saving: (Timesing * A * B * C) * (1 + Waste/100)
CREATE OR REPLACE FUNCTION calculate_dimension_row()
RETURNS TRIGGER AS $$
DECLARE
  v_timesing NUMERIC := COALESCE(NEW.timesing, 1.0);
  v_a NUMERIC := COALESCE(NEW.dim_a, 1.0); -- Default to 1 if null (so 10 * null * null = 10)
  -- Logic: If A is present but B is null, we assume linear. If A & B present, Area. etc.
  -- Actually, standard taking off treats empty columns as 1 for multiplication purposes, 
  -- BUT only if at least one dimension exists.
  
  v_b NUMERIC := COALESCE(NEW.dim_b, 1.0);
  v_c NUMERIC := COALESCE(NEW.dim_c, 1.0);
  v_waste_mult NUMERIC := 1 + (COALESCE(NEW.waste, 0) / 100.0);
  v_raw_calc NUMERIC;
BEGIN
  -- If no dimensions are entered, value is 0
  IF NEW.dim_a IS NULL AND NEW.dim_b IS NULL AND NEW.dim_c IS NULL THEN
    NEW.calculated_value := 0;
    RETURN NEW;
  END IF;

  -- Calculate base volume/area/length
  -- Note: We use the COALESCE values (1.0) for multiplication
  v_raw_calc := v_timesing * v_a * v_b * v_c;
  
  -- Apply waste
  NEW.calculated_value := v_raw_calc * v_waste_mult;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calc_dimension_row_trigger
  BEFORE INSERT OR UPDATE ON dimension_sheets
  FOR EACH ROW
  EXECUTE FUNCTION calculate_dimension_row();

-- C) Aggregation Trigger (Parent Level)
-- Updates the parent BQ item's total quantity whenever a dimension row changes
CREATE OR REPLACE FUNCTION update_bq_item_quantity()
RETURNS TRIGGER AS $$
DECLARE
  v_bq_item_id UUID;
  v_total_quantity NUMERIC;
BEGIN
  -- Determine the BQ item ID (handle DELETE case)
  IF (TG_OP = 'DELETE') THEN
    v_bq_item_id := OLD.bq_item_id;
  ELSE
    v_bq_item_id := NEW.bq_item_id;
  END IF;

  -- Sum all dimension rows for this item
  -- Deductions are subtracted, Additions are added
  SELECT COALESCE(SUM(
    CASE 
      WHEN is_deduction THEN -calculated_value 
      ELSE calculated_value 
    END
  ), 0)
  INTO v_total_quantity
  FROM dimension_sheets
  WHERE bq_item_id = v_bq_item_id;

  -- Update the parent BQ item
  UPDATE bill_of_quantities
  SET quantity = v_total_quantity,
      updated_at = NOW()
  WHERE id = v_bq_item_id;

  RETURN NULL; -- Result is ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bq_quantity_trigger
  AFTER INSERT OR UPDATE OR DELETE ON dimension_sheets
  FOR EACH ROW
  EXECUTE FUNCTION update_bq_item_quantity();


