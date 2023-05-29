CREATE TABLE
    comments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        post_id INT NOT NULL,
        author_email VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_email) REFERENCES members (email),
        FOREIGN KEY (post_id) REFERENCES posts (id)
    );