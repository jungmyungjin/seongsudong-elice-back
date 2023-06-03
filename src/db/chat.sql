CREATE TABLE
    chat_messages (
        message_id INT PRIMARY KEY AUTO_INCREMENT,
        room_id INT NOT NULL,
        sender_email VARCHAR(255) NOT NULL,
        message TEXT,
        sentAt DATETIME NOT NULL,
        message_order INT NOT NULL,
        FOREIGN KEY (room_id) REFERENCES chat_rooms (room_id) ON DELETE CASCADE,
        FOREIGN KEY (sender_email) REFERENCES members (email)
    );