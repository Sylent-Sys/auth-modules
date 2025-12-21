-- Seeder: roles
-- Created at: 2025-12-21

INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Full system access'),
  ('admin', 'Project administrator'),
  ('editor', 'Can edit content'),
  ('member', 'Default project member')
ON DUPLICATE KEY UPDATE description = VALUES(description);
