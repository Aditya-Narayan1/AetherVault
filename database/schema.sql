CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_role
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    uploaded_by BIGINT,
    category_id BIGINT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_document_user
    FOREIGN KEY (uploaded_by)
    REFERENCES users(id)
    ON DELETE SET NULL,

    CONSTRAINT fk_document_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE SET NULL
);

ALTER TABLE roles
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE documents
ADD COLUMN IF NOT EXISTS upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE roles
SET created_at = CURRENT_TIMESTAMP
WHERE created_at IS NULL;

UPDATE users
SET created_at = CURRENT_TIMESTAMP
WHERE created_at IS NULL;

UPDATE categories
SET created_at = CURRENT_TIMESTAMP
WHERE created_at IS NULL;

UPDATE documents
SET created_at = CURRENT_TIMESTAMP
WHERE created_at IS NULL;

UPDATE documents
SET upload_date = created_at
WHERE upload_date IS NULL;

INSERT INTO roles(name)
VALUES ('ADMIN')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles(name)
VALUES ('USER')
ON CONFLICT (name) DO NOTHING;

SELECT * FROM roles;

SELECT * FROM users;
SELECT * FROM categories;
SELECT * FROM documents;