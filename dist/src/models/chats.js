"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatsTable = void 0;
const fs_1 = __importDefault(require("fs"));
const index_1 = require("../db/index");
const sqlFilePath = './src/db/chat.sql'; // SQL 파일의 경로
const chatsTableSchema = fs_1.default.readFileSync(sqlFilePath, 'utf-8');
const createChatsTable = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, index_1.executeQuery)(chatsTableSchema);
        console.log('Chats table created successfully');
    }
    catch (error) {
        console.error('Error creating Chats table:', error);
    }
});
exports.createChatsTable = createChatsTable;
