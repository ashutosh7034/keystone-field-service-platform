CREATE TABLE time_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    technician_user_id BIGINT NOT NULL,
    minutes INT NOT NULL,
    note TEXT,
    logged_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tl_wo FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_tl_technician FOREIGN KEY (technician_user_id) REFERENCES users(id),
    INDEX idx_tl_wo (work_order_id),
    INDEX idx_tl_tech (technician_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
