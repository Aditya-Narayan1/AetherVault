ALTER TABLE roles
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE roles SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE categories SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE documents SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE documents SET upload_date = created_at WHERE upload_date IS NULL;

ALTER TABLE roles
    ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE documents
    ALTER COLUMN upload_date SET NOT NULL;

ALTER TABLE users
    ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE categories
    ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE documents
    ALTER COLUMN created_at SET NOT NULL;

INSERT INTO roles(name)
VALUES ('ADMIN'), ('USER')
ON CONFLICT (name) DO NOTHING;
