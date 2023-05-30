CREATE TABLE
    posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        author_email VARCHAR(255) NOT NULL,
        category ENUM('공지게시판', '자유게시판'),
        title VARCHAR(255) NOT NULL,
        images TEXT,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        views INT DEFAULT 0,
        FOREIGN KEY (author_email) REFERENCES members (email)
    );