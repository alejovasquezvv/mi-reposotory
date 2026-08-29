/*
# AgroScan - Tablas principales

## Descripción
Crea las tablas para la app de campo AgroScan:
- `harvests`: Registros de cosecha por lote (kilos, cultivo, fecha, notas)
- `pest_reports`: Reportes de plagas con coordenadas GPS y URL de foto

## Tablas nuevas

### harvests
- `id` (uuid, clave primaria)
- `crop_type` (text): 'cafe' o 'aguacate_hass'
- `lot_name` (text): identificador de lote
- `kilos` (numeric): kilogramos cosechados
- `harvest_date` (date): fecha de cosecha
- `notes` (text, opcional): observaciones
- `created_at` (timestamp)

### pest_reports
- `id` (uuid, clave primaria)
- `crop_type` (text): 'cafe' o 'aguacate_hass'
- `lot_name` (text): identificador de lote
- `pest_name` (text): nombre de la plaga
- `severity` (text): 'baja', 'media', 'alta'
- `description` (text): descripcion detallada
- `photo_url` (text, opcional): URL de la foto
- `latitude` (numeric, opcional): latitud GPS
- `longitude` (numeric, opcional): longitud GPS
- `report_date` (date): fecha del reporte
- `created_at` (timestamp)

## Seguridad
- RLS habilitado en ambas tablas
- Acceso publico (anon + authenticated) porque es app de campo sin autenticacion
*/

CREATE TABLE IF NOT EXISTS harvests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type text NOT NULL CHECK (crop_type IN ('cafe', 'aguacate_hass')),
  lot_name text NOT NULL,
  kilos numeric NOT NULL CHECK (kilos > 0),
  harvest_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pest_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type text NOT NULL CHECK (crop_type IN ('cafe', 'aguacate_hass')),
  lot_name text NOT NULL,
  pest_name text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('baja', 'media', 'alta')),
  description text NOT NULL,
  photo_url text,
  latitude numeric,
  longitude numeric,
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_harvests" ON harvests;
CREATE POLICY "anon_select_harvests" ON harvests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_harvests" ON harvests;
CREATE POLICY "anon_insert_harvests" ON harvests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_harvests" ON harvests;
CREATE POLICY "anon_update_harvests" ON harvests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_harvests" ON harvests;
CREATE POLICY "anon_delete_harvests" ON harvests FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_pest_reports" ON pest_reports;
CREATE POLICY "anon_select_pest_reports" ON pest_reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pest_reports" ON pest_reports;
CREATE POLICY "anon_insert_pest_reports" ON pest_reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_pest_reports" ON pest_reports;
CREATE POLICY "anon_update_pest_reports" ON pest_reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pest_reports" ON pest_reports;
CREATE POLICY "anon_delete_pest_reports" ON pest_reports FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_harvests_crop_type ON harvests (crop_type);
CREATE INDEX IF NOT EXISTS idx_harvests_created_at ON harvests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pest_reports_crop_type ON pest_reports (crop_type);
CREATE INDEX IF NOT EXISTS idx_pest_reports_created_at ON pest_reports (created_at DESC);
