CREATE TABLE
    reservations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        member_generation VARCHAR(50) NOT NULL,
        member_name VARCHAR(255) NOT NULL,
        member_email VARCHAR(255) NOT NULL,
        reservation_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        num_of_guests INT NOT NULL,
        seat_number VARCHAR(255) NOT NULL,
        status ENUM('예약완료', '예약취소') NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (
            member_generation,
            member_name,
            member_email
        ) REFERENCES members (generation, name, email),
        FOREIGN KEY (seat_number) REFERENCES seats (seat_number),
        INDEX (member_email)
    );