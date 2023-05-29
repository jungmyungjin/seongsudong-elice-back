CREATE TABLE
    connections (
        id INT PRIMARY KEY AUTO_INCREMENT,
        memberEmail VARCHAR(255),
        FOREIGN KEY (memberEmail) REFERENCES members(email),
        isConnected BOOLEAN NOT NULL,
        connectedAt DATETIME NOT NULL
    );