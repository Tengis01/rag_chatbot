-- Store the reason a document's ingestion pipeline failed, so clients can
-- show it instead of a silent 'failed' status. (See ERR-027 / Priority B.)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS error_message TEXT;
