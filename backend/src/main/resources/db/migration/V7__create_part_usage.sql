CREATE TABLE part_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    part_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_cost_at_usage DECIMAL(10, 2) NOT NULL,
    recorded_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pu_wo FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_pu_part FOREIGN KEY (part_id) REFERENCES parts(id),
    CONSTRAINT fk_pu_user FOREIGN KEY (recorded_by_user_id) REFERENCES users(id),
    INDEX idx_pu_wo (work_order_id),
    INDEX idx_pu_part (part_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
