-- Apply after schema.sql for existing installations. New installations receive
-- the same columns from schema.sql.
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS visitor_token_hash TEXT UNIQUE;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS consented_at TIMESTAMPTZ;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS handoff_reason TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_customer_message_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS conversations_anonymous_queue_idx
  ON conversations(status, updated_at DESC)
  WHERE user_id IS NULL;
