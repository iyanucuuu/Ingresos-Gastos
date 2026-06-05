-- ============================================================
--  MIGRACIÓN SUPABASE — FinanzasApp (Ingresos & Gastos)
--  Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ---- TABLA: categorias ----
CREATE TABLE IF NOT EXISTS categorias (
    id         BIGSERIAL PRIMARY KEY,
    nombre     VARCHAR(100)  NOT NULL,
    tipo       VARCHAR(10)   NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
    icono      VARCHAR(50),
    color      VARCHAR(20),
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ---- TABLA: ingresos ----
CREATE TABLE IF NOT EXISTS ingresos (
    id           BIGSERIAL PRIMARY KEY,
    concepto     VARCHAR(200)   NOT NULL,
    importe      NUMERIC(12, 2) NOT NULL CHECK (importe > 0),
    fecha        DATE           NOT NULL,
    categoria_id BIGINT         REFERENCES categorias(id) ON DELETE SET NULL,
    periodicidad VARCHAR(20)    NOT NULL DEFAULT 'puntual'
                                CHECK (periodicidad IN ('puntual','mensual','trimestral','anual')),
    notas        TEXT,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ---- TABLA: gastos ----
CREATE TABLE IF NOT EXISTS gastos (
    id           BIGSERIAL PRIMARY KEY,
    concepto     VARCHAR(200)   NOT NULL,
    importe      NUMERIC(12, 2) NOT NULL CHECK (importe > 0),
    fecha        DATE           NOT NULL,
    categoria_id BIGINT         REFERENCES categorias(id) ON DELETE SET NULL,
    periodicidad VARCHAR(20)    NOT NULL DEFAULT 'puntual'
                                CHECK (periodicidad IN ('puntual','mensual','trimestral','anual')),
    notas        TEXT,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ---- ÍNDICES ----
CREATE INDEX IF NOT EXISTS idx_ingresos_fecha        ON ingresos(fecha);
CREATE INDEX IF NOT EXISTS idx_ingresos_categoria_id ON ingresos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha          ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria_id   ON gastos(categoria_id);

-- ---- TRIGGER: actualizar updated_at automáticamente ----
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ingresos_updated_at ON ingresos;
CREATE TRIGGER trg_ingresos_updated_at
    BEFORE UPDATE ON ingresos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_gastos_updated_at ON gastos;
CREATE TRIGGER trg_gastos_updated_at
    BEFORE UPDATE ON gastos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---- DATOS INICIALES: categorías ----
INSERT INTO categorias (nombre, tipo, icono, color) VALUES
    ('Nómina',        'ingreso', 'work',          '#639922'),
    ('Freelance',     'ingreso', 'computer',       '#3B6D11'),
    ('Inversiones',   'ingreso', 'trending_up',    '#185FA5'),
    ('Otros ingresos','ingreso', 'attach_money',   '#854F0B'),
    ('Vivienda',      'gasto',   'home',            '#A32D2D'),
    ('Alimentación',  'gasto',   'restaurant',      '#E24B4A'),
    ('Transporte',    'gasto',   'directions_car',  '#854F0B'),
    ('Ocio',          'gasto',   'sports_esports',  '#534AB7'),
    ('Salud',         'gasto',   'local_hospital',  '#0F6E56'),
    ('Otros gastos',  'gasto',   'more_horiz',      '#5F5E5A')
ON CONFLICT DO NOTHING;
