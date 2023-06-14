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
exports.getAllMessages = exports.saveMessages = void 0;
//import express, { Request, Response, NextFunction } from 'express';
//import { RowDataPacket } from 'mysql2';
const connection_1 = __importDefault(require("../../connection"));
// 메세지 db 저장 함수
const saveMessages = (roomId, email, messages) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        /* 현재 시간 한국시간으로 변환 로직 구현해야 함!(for sendAt) */
        const sentAt = new Date();
        const saveMessagesQuery = `INSERT INTO chat_messages (room_id, sender_email, message, sentAt) VALUES (?, ?, ?, ?);`;
        const saveMessagesResult = yield connection_1.default
            .promise()
            .query(saveMessagesQuery, [roomId, email, messages, sentAt]);
        return saveMessagesResult;
    }
    catch (err) {
        console.error('saveMessages 실행 중 에러 발생:', err);
    }
});
exports.saveMessages = saveMessages;
// 모든 메세지 조회 함수
const getAllMessages = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const getAllMessagesQuery = `SELECT message_id, room_id, sender_email, message, sentAt, name, generation FROM chat_messages LEFT JOIN members ON chat_messages.sender_email = members.email WHERE room_id = ? ORDER BY sentAt DESC;`;
    const getAllMessagesResult = yield connection_1.default
        .promise()
        .query(getAllMessagesQuery, [roomId]);
    return getAllMessagesResult[0];
});
exports.getAllMessages = getAllMessages;
