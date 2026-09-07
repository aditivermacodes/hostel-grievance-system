-- Flyway Migration V2: Seed Initial Hostels, Categories, and Default Admin

-- 1. Initial Hostels
INSERT INTO hostels (name, code, active, created_at)
VALUES 
    ('Old Hostel', 'OH', TRUE, CURRENT_TIMESTAMP),
    ('New Hostel', 'NH', TRUE, CURRENT_TIMESTAMP);

-- 2. Initial Categories
INSERT INTO categories (name, description, active, created_at)
VALUES
    ('Plumbing', 'Water leaks, taps, flush valves, pipelines, drainage, washroom fixtures', TRUE, CURRENT_TIMESTAMP),
    ('Electrical', 'Lighting, fans, switchboards, wiring, geysers, power sockets', TRUE, CURRENT_TIMESTAMP),
    ('Civil / Carpentry', 'Doors, window panes, locks, study tables, chairs, beds, almirahs', TRUE, CURRENT_TIMESTAMP),
    ('Cleaning / Hygiene', 'Corridor hygiene, washroom sanitation, waste disposal, pest control', TRUE, CURRENT_TIMESTAMP),
    ('Other', 'Any other general maintenance or infrastructure issues', TRUE, CURRENT_TIMESTAMP);

-- 3. Default Admin User (username: admin, password: Admin@Hgs2026!)
INSERT INTO admin_users (username, password_hash, email, full_name, created_at)
VALUES
    ('admin', '$2a$10$kfxhWxYGen68hsI.VCIi7ucOF1l6d5uJsT9.FWj2Drd9YAgVVIXHW', 'admin@hgs.internal', 'Chief Hostel Warden', CURRENT_TIMESTAMP);
