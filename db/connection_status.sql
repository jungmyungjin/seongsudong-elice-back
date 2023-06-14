CREATE TABLE
    connection_status (
        member_email VARCHAR(255) PRIMARY KEY,
        isActive BOOLEAN NOT NULL DEFAULT false,
        lastSeenAt DATETIME,
        FOREIGN KEY (member_email) REFERENCES members (email)
    );