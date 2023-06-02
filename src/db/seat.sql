CREATE TABLE
    seats (
        seat_number VARCHAR(255) PRIMARY KEY,
        seat_type VARCHAR(100),
        available_10to14 BOOLEAN NOT NULL DEFAULT true,
        available_14to18 BOOLEAN NOT NULL DEFAULT true,
        available_18to22 BOOLEAN NOT NULL DEFAULT true,
        UNIQUE (seat_number)
    );