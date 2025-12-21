-- Seeder: users
-- Created at: 2025-12-21

-- NOTE: Replace the password value with a real hashed password (bcrypt/argon2).
INSERT INTO users (name, email, password) VALUES
  ('Budi Santoso', 'budi@example.com', '$argon2id$v=19$m=65536,t=2,p=1$8lUMO2AmAj6t+rVlmImHWzehCYgy4zlVa+WnscC4Kdc$f1X+qtwv58Z/Fwm4gt24ev0gHVYSYu+z/32VMP2iq34'),
  ('Alice Admin', 'alice@example.com', '$argon2id$v=19$m=65536,t=2,p=1$8lUMO2AmAj6t+rVlmImHWzehCYgy4zlVa+WnscC4Kdc$f1X+qtwv58Z/Fwm4gt24ev0gHVYSYu+z/32VMP2iq34')
ON DUPLICATE KEY UPDATE name = VALUES(name);
