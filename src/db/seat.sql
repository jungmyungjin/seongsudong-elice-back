CREATE TABLE
    seats (
        seat_number VARCHAR(255) PRIMARY KEY,
        available BOOLEAN NOT NULL DEFAULT true,
        reservation_date DATE,
        start_time TIME,
        end_time TIME,
        UNIQUE (seat_number)
    );