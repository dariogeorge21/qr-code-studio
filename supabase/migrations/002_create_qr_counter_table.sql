-- Create qr_stats table to track QR code generation and downloads
CREATE TABLE IF NOT EXISTS qr_stats (
  id BIGSERIAL PRIMARY KEY,
  metric_type VARCHAR(50) NOT NULL, -- 'generated' or 'downloaded'
  count BIGINT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create aggregated stats table for performance
CREATE TABLE IF NOT EXISTS qr_counter (
  id BIGSERIAL PRIMARY KEY,
  total_generated BIGINT DEFAULT 0,
  total_downloaded BIGINT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize counter with default values
INSERT INTO qr_counter (total_generated, total_downloaded) VALUES (0, 0)
  ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_qr_stats_metric_type ON qr_stats(metric_type);
CREATE INDEX IF NOT EXISTS idx_qr_stats_created_at ON qr_stats(created_at);

-- Enable RLS
ALTER TABLE qr_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_counter ENABLE ROW LEVEL SECURITY;

-- Allow public read access to counter (for displaying on landing page)
CREATE POLICY "Allow select qr_counter" ON qr_counter
  FOR SELECT
  USING (true);

-- Allow public insert/update to stats
CREATE POLICY "Allow insert qr_stats" ON qr_stats
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select qr_stats" ON qr_stats
  FOR SELECT
  USING (true);
