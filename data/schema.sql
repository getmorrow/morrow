PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS partner_leads (
  lead_id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  segment TEXT NOT NULL CHECK (segment IN ('Erlebnisanbieter', 'Ferienimmobilien')),
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  website_url TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_type TEXT NOT NULL,
  evidence_summary TEXT NOT NULL,
  fit_score INTEGER NOT NULL CHECK (fit_score BETWEEN 0 AND 100),
  priority TEXT NOT NULL CHECK (priority IN ('A', 'B', 'C', 'Hold')),
  status TEXT NOT NULL DEFAULT 'New',
  legal_contact_basis TEXT NOT NULL,
  outreach_channel TEXT NOT NULL,
  risk_flags TEXT DEFAULT '',
  last_verified_at TEXT NOT NULL,
  next_action TEXT NOT NULL,
  owner TEXT DEFAULT 'Head of Marketing Agent',
  notes TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS interactions (
  interaction_id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES partner_leads(lead_id) ON DELETE CASCADE,
  interaction_date TEXT NOT NULL,
  channel TEXT NOT NULL,
  message_theme TEXT NOT NULL,
  outcome TEXT NOT NULL,
  next_step TEXT NOT NULL,
  opt_out INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stays (
  stay_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  vibe TEXT NOT NULL,
  region TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  capacity_guests TEXT NOT NULL,
  price_from TEXT NOT NULL,
  source TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS experiences (
  experience_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  partner_lead_id TEXT REFERENCES partner_leads(lead_id),
  region TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  package_angle TEXT NOT NULL
);
