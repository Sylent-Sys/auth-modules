-- Audit logs table for tracking changes to Users and Roles
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('user', 'role') NOT NULL,
    entity_id INT NOT NULL,
    action ENUM('create', 'update', 'delete') NOT NULL,
    actor_id INT NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    changes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_actor (actor_id),
    INDEX idx_created_at (created_at)
);
