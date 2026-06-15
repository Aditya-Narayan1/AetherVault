-- AetherVault table viewer queries for pgAdmin
-- Run these inside the aethervault database.

-- Roles
SELECT
    id,
    name,
    created_at
FROM roles
ORDER BY id;

-- Login/users table with role names
SELECT
    u.id,
    u.username,
    u.email,
    r.name AS role,
    u.created_at
FROM users u
JOIN roles r ON r.id = u.role_id
ORDER BY u.id;

-- Categories
SELECT
    id,
    name,
    description,
    created_at
FROM categories
ORDER BY id;

-- Uploaded documents with category and uploader
SELECT
    d.id,
    d.title,
    d.description,
    c.name AS category,
    d.file_path,
    u.username AS uploaded_by,
    d.upload_date
FROM documents d
LEFT JOIN categories c ON c.id = d.category_id
LEFT JOIN users u ON u.id = d.uploaded_by
ORDER BY d.id;

-- Count summary
SELECT 'roles' AS table_name, COUNT(*) AS total FROM roles
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'documents', COUNT(*) FROM documents;
