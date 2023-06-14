import mysql from 'mysql2';
require('dotenv').config();

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

con.connect(err => {
  if (err) {
    throw err;
  }

  console.log('Database connected Successfully.');
});

con.query('USE seongsudongelice', (err, result) => {
  if (err) {
    throw err;
  }

  console.log('use seongsudongelice');
});

export default con;
