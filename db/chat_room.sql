CREATE TABLE
    chat_rooms (
        room_id INT PRIMARY KEY AUTO_INCREMENT,
        admin_email VARCHAR(255) NOT NULL,
        member_email VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL,
        FOREIGN KEY (admin_email) REFERENCES members (email),
        FOREIGN KEY (member_email) REFERENCES members (email),
        UNIQUE KEY (admin_email, member_email),
        CHECK (admin_email <> member_email)
    );