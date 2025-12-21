-- Seeder: projects
-- Created at: 2025-12-21

INSERT INTO projects (name, project_key, base_url) VALUES
  ('Project A', 'project_a_key', 'https://project-a.example.com'),
  ('Project B', 'project_b_key', 'https://project-b.example.com')
ON DUPLICATE KEY UPDATE base_url = VALUES(base_url);
