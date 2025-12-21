-- Seeder: project_assignments
-- Created at: 2025-12-21

-- Assign sample users to projects with roles
-- This assumes users and projects above exist
-- Insert two assignment rows in a single statement to avoid multiple-statement execution issues
INSERT INTO project_assignments (user_id, project_id, role_id)
SELECT u.id, p.id, r.id
FROM users u
JOIN projects p ON p.project_key = 'project_a_key'
JOIN roles r ON r.name = 'admin'
WHERE u.email = 'alice@example.com'
UNION ALL
SELECT u2.id, p2.id, r2.id
FROM users u2
JOIN projects p2 ON p2.project_key = 'project_a_key'
JOIN roles r2 ON r2.name = 'member'
WHERE u2.email = 'budi@example.com'
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);
