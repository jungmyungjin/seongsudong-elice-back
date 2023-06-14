"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const con = mysql2_1.default.createConnection({
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
exports.default = con;
