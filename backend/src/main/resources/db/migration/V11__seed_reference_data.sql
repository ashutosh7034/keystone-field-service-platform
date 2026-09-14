-- V11: Seed Reference Data for Project KEYSTONE

-- Insert Customers
INSERT INTO customers (id, name, email, phone, address, city, state, postal_code, status, created_at, updated_at) VALUES
(1, 'Apex Commercial Towers', 'contact@apextowers.com', '+1-555-0101', '100 Financial Way', 'New York', 'NY', '10005', 'ACTIVE', NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 30 DAY),
(2, 'Metro Retail Outlets', 'facilities@metroretail.com', '+1-555-0102', '550 Shopping Blvd', 'Chicago', 'IL', '60611', 'ACTIVE', NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 25 DAY),
(3, 'Horizon Tech Campus', 'ops@horizontech.io', '+1-555-0103', '777 Silicon Parkway', 'Austin', 'TX', '78701', 'ACTIVE', NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY);

-- Insert Users (Password is 'password123' for all demo accounts)
-- BCrypt hash for 'password123': $2a$10$d8B6UeD5eL97r27qj5YqQ.G77r3wz6.6l96n6y/q94b4N7e2f5K2O -> standard spring bcrypt
-- Let's use valid bcrypt hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi (BCrypt for 'password123')
INSERT INTO users (id, email, password_hash, full_name, phone, role, customer_id, active, created_at, updated_at) VALUES
(1, 'manager@keystone.demo', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Eleanor Vance (Operations Director)', '+1-555-1001', 'ROLE_MANAGER', NULL, TRUE, NOW() - INTERVAL 30 DAY, NOW()),
(2, 'dispatcher@keystone.demo', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'David Ross (Head Dispatcher)', '+1-555-1002', 'ROLE_DISPATCHER', NULL, TRUE, NOW() - INTERVAL 30 DAY, NOW()),
(3, 'technician1@keystone.demo', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Alex Rivera (Lead HVAC Tech)', '+1-555-2001', 'ROLE_TECHNICIAN', NULL, TRUE, NOW() - INTERVAL 30 DAY, NOW()),
(4, 'technician2@keystone.demo', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Sarah Chen (Master Electrician)', '+1-555-2002', 'ROLE_TECHNICIAN', NULL, TRUE, NOW() - INTERVAL 30 DAY, NOW()),
(5, 'technician3@keystone.demo', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Marcus Vance (Commercial Plumber)', '+1-555-2003', 'ROLE_TECHNICIAN', NULL, TRUE, NOW() - INTERVAL 30 DAY, NOW()),
(6, 'customer1@keystone.demo', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'David Miller (Apex Facilities VP)', '+1-555-3001', 'ROLE_CUSTOMER', 1, TRUE, NOW() - INTERVAL 30 DAY, NOW()),
(7, 'customer2@keystone.demo', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Elena Rostova (Metro Mall Director)', '+1-555-3002', 'ROLE_CUSTOMER', 2, TRUE, NOW() - INTERVAL 25 DAY, NOW()),
(8, 'customer3@keystone.demo', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'James Wilson (Horizon IT Infrastructure)', '+1-555-3003', 'ROLE_CUSTOMER', 3, TRUE, NOW() - INTERVAL 20 DAY, NOW());

-- Insert Sites
INSERT INTO sites (id, customer_id, name, address, city, state, postal_code, contact_person, contact_phone, active, created_at, updated_at) VALUES
(1, 1, 'Apex Tower North (Headquarters)', '100 Financial Way, Tower A', 'New York', 'NY', '10005', 'David Miller', '+1-555-3001', TRUE, NOW() - INTERVAL 30 DAY, NOW()),
(2, 1, 'Apex Plaza South', '120 Financial Way, Plaza Level', 'New York', 'NY', '10005', 'Michael Scott', '+1-555-3004', TRUE, NOW() - INTERVAL 30 DAY, NOW()),
(3, 2, 'Metro Mall City Center', '550 Shopping Blvd', 'Chicago', 'IL', '60611', 'Elena Rostova', '+1-555-3002', TRUE, NOW() - INTERVAL 25 DAY, NOW()),
(4, 2, 'Metro Galleria West', '890 West Commerce St', 'Chicago', 'IL', '60607', 'Rachel Green', '+1-555-3005', TRUE, NOW() - INTERVAL 25 DAY, NOW()),
(5, 3, 'Horizon Tech Campus - Building A', '777 Silicon Parkway, Bldg A', 'Austin', 'TX', '78701', 'James Wilson', '+1-555-3003', TRUE, NOW() - INTERVAL 20 DAY, NOW()),
(6, 3, 'Horizon High-Density Data Center', '789 Server Row, Facility 2', 'Austin', 'TX', '78702', 'Linus Vance', '+1-555-3006', TRUE, NOW() - INTERVAL 20 DAY, NOW());

-- Insert Parts Inventory
INSERT INTO parts (id, sku, name, description, category, unit_cost, stock_quantity, lead_time_days, active, version, created_at, updated_at) VALUES
(1, 'HVAC-COMP-5T', 'HVAC Scroll Compressor 5-Ton', 'High-efficiency Copeland scroll compressor for commercial package units', 'HVAC', 850.00, 14, 3, TRUE, 0, NOW() - INTERVAL 30 DAY, NOW()),
(2, 'REF-R410A-25', 'R-410A Refrigerant 25lb Cylinder', 'EPA compliant non-ozone depleting virgin refrigerant cylinder', 'HVAC', 220.00, 26, 1, TRUE, 0, NOW() - INTERVAL 30 DAY, NOW()),
(3, 'ELEC-CONT-3P40', 'Industrial Contactor 3-Pole 40A', 'Definite purpose 120V coil magnetic contactor for motors and chillers', 'ELECTRICAL', 45.00, 48, 1, TRUE, 0, NOW() - INTERVAL 30 DAY, NOW()),
(4, 'HVAC-TXV-35', 'Thermostatic Expansion Valve 3.5-Ton', 'Danfoss adjustable TXV valve with external equalization', 'HVAC', 110.00, 19, 2, TRUE, 0, NOW() - INTERVAL 30 DAY, NOW()),
(5, 'PLMB-BV-2IN', '2-Inch Brass Ball Valve Full Port', 'Lead-free 600 WOG threaded commercial plumbing ball valve', 'PLUMBING', 65.00, 32, 1, TRUE, 0, NOW() - INTERVAL 30 DAY, NOW()),
(6, 'PLMB-WHE-4500', 'Commercial Water Heater Element 4500W', 'High watt density screw-in titanium heating element 240V', 'PLUMBING', 38.50, 38, 2, TRUE, 0, NOW() - INTERVAL 30 DAY, NOW()),
(7, 'HVAC-THERM-DIGI', 'Commercial Digital Thermostat 7-Day', 'BACnet capable touchscreen programmable dual-stage thermostat', 'HVAC', 140.00, 22, 2, TRUE, 0, NOW() - INTERVAL 30 DAY, NOW()),
(8, 'ELEC-CB-100A3P', '100A 3-Phase Molded Case Breaker', 'Square D 480Y/277V bolt-on high interrupting rating circuit breaker', 'ELECTRICAL', 185.00, 11, 4, TRUE, 0, NOW() - INTERVAL 30 DAY, NOW()),
(9, 'PLMB-PUMP-HD05', 'Heavy-Duty Submersible Sump Pump 0.5HP', 'Cast iron automatic sump/effluent pump with vertical float switch', 'PLUMBING', 320.00, 7, 3, TRUE, 0, NOW() - INTERVAL 30 DAY, NOW()),
(10, 'HVAC-FLT-MERV13', 'Air Filter MERV 13 (24x24x2 Box of 6)', 'Hospital & cleanroom commercial grade pleated particulate air filters', 'HVAC', 75.00, 58, 1, TRUE, 0, NOW() - INTERVAL 30 DAY, NOW());

-- Insert Work Orders
INSERT INTO work_orders (id, work_order_code, title, description, priority, status, customer_id, site_id, assigned_technician_id, created_by_user_id, sla_due_date, sla_status, internal_notes, cancellation_reason, completed_at, closed_at, cancelled_at, version, created_at, updated_at) VALUES
(1, 'WO-2026-000001', 'Emergency - Main Chiller Unit 2 Failure', 'Chiller 2 in penthouse mechanical room tripped circuit breaker and refrigerant pressure is low. Ambient temperature in floor 8-12 rising quickly.', 'HIGH', 'IN_PROGRESS', 1, 1, 3, 2, NOW() + INTERVAL 2 HOUR, 'AT_RISK', 'Priority customer escalation. Alex Rivera dispatched on-site with refrigerant recovery gear.', NULL, NULL, NULL, NULL, 1, NOW() - INTERVAL 10 HOUR, NOW()),
(2, 'WO-2026-000002', 'High - 3-Phase Distribution Panel Arcing', 'Buzzing noise and burning insulation odor detected from main electrical room panel MDP-3B.', 'HIGH', 'ASSIGNED', 2, 3, 4, 2, NOW() + INTERVAL 8 HOUR, 'ON_TRACK', 'Arc flash gear level 3 required. Sarah Chen assigned.', NULL, NULL, NULL, NULL, 0, NOW() - INTERVAL 4 HOUR, NOW()),
(3, 'WO-2026-000003', 'High - Server Room CRAC Unit 1 Offline', 'CRAC 1 in Horizon Data Center high temperature alarm triggered. Redundant unit CRAC 2 operating at 95% capacity.', 'HIGH', 'IN_PROGRESS', 3, 6, 3, 8, NOW() - INTERVAL 2 HOUR, 'BREACHED', 'SLA breach occurred due to delayed traffic access. Tech is currently replacing contactor.', NULL, NULL, NULL, NULL, 2, NOW() - INTERVAL 14 HOUR, NOW()),
(4, 'WO-2026-000004', 'Medium - 2nd Floor Restroom Water Main Leak', 'Pipe coupling under executive washroom sink ruptured, water shut off at isolation valve.', 'MEDIUM', 'COMPLETED', 1, 2, 5, 2, NOW() + INTERVAL 12 HOUR, 'ON_TRACK', 'Replaced ruptured valve and gasket. Verified 60 PSI without leaks.', NULL, NOW() - INTERVAL 1 HOUR, NULL, NULL, 2, NOW() - INTERVAL 12 HOUR, NOW()),
(5, 'WO-2026-000005', 'Low - Quarterly Air Filter Replacement', 'Routine scheduled maintenance: replace all MERV 13 filters across AHU-1 through AHU-4.', 'LOW', 'CLOSED', 1, 1, 3, 1, NOW() + INTERVAL 36 HOUR, 'ON_TRACK', 'All 4 AHUs completed. Manager signed off.', NULL, NOW() - INTERVAL 24 HOUR, NOW() - INTERVAL 18 HOUR, NULL, 3, NOW() - INTERVAL 48 HOUR, NOW()),
(6, 'WO-2026-000006', 'Medium - Loading Dock Overhead Lighting Fault', 'Four 400W metal halide fixtures flickering and ungrounded near freight bay 3.', 'MEDIUM', 'NEW', 2, 4, NULL, 7, NOW() + INTERVAL 20 HOUR, 'ON_TRACK', 'Awaiting dispatcher technician assignment.', NULL, NULL, NULL, NULL, 0, NOW() - INTERVAL 4 HOUR, NOW()),
(7, 'WO-2026-000007', 'HIGH', 'Emergency - Basement Sump Pump Failure During Storm', 'Groundwater entering lower electrical switchgear vault. Primary sump pump motor burnt.', 'HIGH', 'ON_HOLD', 3, 5, 5, 2, NOW() + INTERVAL 6 HOUR, 'ON_TRACK', 'Waiting on specialized heavy duty mounting bracket before installing replacement pump.', NULL, NULL, NULL, NULL, 2, NOW() - INTERVAL 6 HOUR, NOW()),
(8, 'WO-2026-000008', 'Low - Parking Garage Gate Motor Malfunction', 'Barrier gate 2 arm won''t lower on vehicle exit.', 'LOW', 'CANCELLED', 2, 3, NULL, 7, NOW() + INTERVAL 40 HOUR, 'ON_TRACK', 'Customer security team cleared jammed debris from sensor.', 'Resolved internally by building security', NULL, NULL, NOW() - INTERVAL 10 HOUR, 1, NOW() - INTERVAL 15 HOUR, NOW()),
(9, 'WO-2026-000009', 'High - Rooftop Exhaust Fan EF-4 Bearing Seized', 'Severe vibration and loud screeching from restaurant grease exhaust hood fan.', 'HIGH', 'NEW', 2, 3, NULL, 7, NOW() + INTERVAL 10 HOUR, 'ON_TRACK', 'New customer request via portal. Requires prompt inspection.', NULL, NULL, NULL, NULL, 0, NOW() - INTERVAL 2 HOUR, NOW());

-- Insert Status Histories (Immutable Append-only)
INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by_user_id, note, changed_at) VALUES
(1, 'NEW', 'ASSIGNED', 2, 'Dispatcher assigned Alex Rivera to emergency chiller issue.', NOW() - INTERVAL 9 HOUR),
(1, 'ASSIGNED', 'IN_PROGRESS', 3, 'Tech arrived on-site, isolated compressor power and connected manifold gauges.', NOW() - INTERVAL 8 HOUR),

(2, 'NEW', 'ASSIGNED', 2, 'Assigned Sarah Chen for high-priority electrical panel inspection.', NOW() - INTERVAL 3 HOUR),

(3, 'NEW', 'ASSIGNED', 2, 'Assigned Alex Rivera for data center CRAC unit alarm.', NOW() - INTERVAL 13 HOUR),
(3, 'ASSIGNED', 'IN_PROGRESS', 3, 'On site. Diagnosing control board and fan contactor.', NOW() - INTERVAL 11 HOUR),

(4, 'NEW', 'ASSIGNED', 2, 'Assigned Marcus Vance for water leak.', NOW() - INTERVAL 11 HOUR),
(4, 'ASSIGNED', 'IN_PROGRESS', 5, 'Plumber on site. Replacing damaged 2-inch ball valve.', NOW() - INTERVAL 8 HOUR),
(4, 'IN_PROGRESS', 'COMPLETED', 5, 'Installed new ball valve, pressure tested to 60 PSI, area cleaned.', NOW() - INTERVAL 1 HOUR),

(5, 'NEW', 'ASSIGNED', 2, 'Assigned Alex Rivera for quarterly filter swap.', NOW() - INTERVAL 47 HOUR),
(5, 'ASSIGNED', 'IN_PROGRESS', 3, 'Started filter replacements in AHU-1 to 4.', NOW() - INTERVAL 30 HOUR),
(5, 'IN_PROGRESS', 'COMPLETED', 3, 'All 24 filters replaced with new MERV 13 boxes.', NOW() - INTERVAL 24 HOUR),
(5, 'COMPLETED', 'CLOSED', 1, 'Manager inspection approved. Maintenance sign-off complete.', NOW() - INTERVAL 18 HOUR),

(7, 'NEW', 'ASSIGNED', 2, 'Assigned Marcus Vance for basement sump pump.', NOW() - INTERVAL 5 HOUR),
(7, 'ASSIGNED', 'IN_PROGRESS', 5, 'Removed damaged pump from vault pit.', NOW() - INTERVAL 4 HOUR),
(7, 'IN_PROGRESS', 'ON_HOLD', 5, 'Pit bracket rusted through. Placed on hold until bracket fabrication arrives.', NOW() - INTERVAL 3 HOUR),

(8, 'NEW', 'CANCELLED', 2, 'Customer reported issue resolved without technician dispatch.', NOW() - INTERVAL 10 HOUR);

-- Insert Part Usage
INSERT INTO part_usage (id, work_order_id, part_id, quantity, unit_cost_at_usage, recorded_by_user_id, created_at) VALUES
(1, 1, 2, 1, 220.00, 3, NOW() - INTERVAL 7 HOUR),
(2, 3, 3, 1, 45.00, 3, NOW() - INTERVAL 10 HOUR),
(3, 4, 5, 1, 65.00, 5, NOW() - INTERVAL 2 HOUR),
(4, 5, 10, 4, 75.00, 3, NOW() - INTERVAL 25 HOUR);

-- Insert Time Logs
INSERT INTO time_logs (id, work_order_id, technician_user_id, minutes, note, logged_at, created_at) VALUES
(1, 1, 3, 120, 'Initial diagnostic, leak detection on evaporator coil, and refrigerant recovery.', NOW() - INTERVAL 7 HOUR, NOW() - INTERVAL 7 HOUR),
(2, 3, 3, 180, 'Tracing electrical fault on CRAC unit control transformer and replacing contactor.', NOW() - INTERVAL 9 HOUR, NOW() - INTERVAL 9 HOUR),
(3, 4, 5, 90, 'Removed ruptured pipe section and soldered new 2-inch brass ball valve.', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 2 HOUR),
(4, 5, 3, 150, 'Replaced 24 MERV 13 filters across 4 rooftop air handling units.', NOW() - INTERVAL 25 HOUR, NOW() - INTERVAL 25 HOUR),
(5, 7, 5, 60, 'Pump extraction and vault water level assessment.', NOW() - INTERVAL 4 HOUR, NOW() - INTERVAL 4 HOUR);

-- Insert Sample Notifications
INSERT INTO notifications (id, recipient_user_id, title, message, type, is_read, work_order_id, created_at) VALUES
(1, 3, 'New Assignment: WO-2026-000001', 'You have been assigned to Emergency - Main Chiller Unit 2 Failure at Apex Tower North.', 'ASSIGNMENT', TRUE, 1, NOW() - INTERVAL 9 HOUR),
(2, 4, 'New Assignment: WO-2026-000002', 'You have been assigned to High - 3-Phase Distribution Panel Arcing at Metro Mall City Center.', 'ASSIGNMENT', FALSE, 2, NOW() - INTERVAL 3 HOUR),
(3, 1, 'SLA Breach Warning: WO-2026-000003', 'Work Order WO-2026-000003 (Server Room CRAC Unit 1 Offline) has breached its SLA resolution target.', 'SLA_BREACH', FALSE, 3, NOW() - INTERVAL 2 HOUR),
(4, 2, 'SLA At Risk: WO-2026-000001', 'Work Order WO-2026-000001 is approaching SLA due time within 2 hours.', 'SLA_AT_RISK', FALSE, 1, NOW() - INTERVAL 1 HOUR);
