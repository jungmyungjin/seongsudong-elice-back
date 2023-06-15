CREATE TABLE
    reservations (
        reservation_id VARCHAR(50) PRIMARY KEY NOT NULL DEFAULT '',
        generation VARCHAR(50) NOT NULL,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        reservation_date VARCHAR(50) NOT NULL,
        start_time VARCHAR(50) NOT NULL,
        end_time VARCHAR(50) NOT NULL,
        visitors VARCHAR(255) DEFAULT '',
        seat_type VARCHAR(255) NOT NULL,
        seat_number VARCHAR(255) NOT NULL,
        status ENUM('예약완료', '예약취소') NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (
            member_generation,
            member_name,
            member_email
        ) REFERENCES members (generation, name, email),
        FOREIGN KEY (seat_number) REFERENCES seats (seat_number),
        INDEX (member_email) -- 빠른 예약조회를 위해 인덱스 정렬
    );
