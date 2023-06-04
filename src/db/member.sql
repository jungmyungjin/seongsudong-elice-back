CREATE TABLE
    members (
        email VARCHAR(255) PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        generation VARCHAR(50) NOT NULL,
        isAdmin BOOLEAN NOT NULL DEFAULT false,
        createdAt DATETIME NOT NULL,
        INDEX member_index (generation, name, email)
    );