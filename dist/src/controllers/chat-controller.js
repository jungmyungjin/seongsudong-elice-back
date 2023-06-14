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
exports.getChatRoomList = void 0;
const connection_1 = __importDefault(require("../../connection"));
const getChatRoomList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const getChatRoomListQuery = `SELECT chat_rooms.room_id, members.email, members.name, members.generation, chat_messages.message, chat_messages.sentAt
  FROM chat_rooms
  JOIN members ON chat_rooms.member_email = members.email
  JOIN (
      SELECT room_id, MAX(sentAt) AS latest_message_date
      FROM chat_messages
      GROUP BY room_id
  ) AS latest_messages ON chat_rooms.room_id = latest_messages.room_id
  JOIN chat_messages ON latest_messages.room_id = chat_messages.room_id AND latest_messages.latest_message_date = chat_messages.sentAt ORDER BY chat_messages.sentAt DESC;
  `;
    const getChatRoomListResult = yield connection_1.default.promise().query(getChatRoomListQuery);
    return res.status(200).json(getChatRoomListResult[0]);
});
exports.getChatRoomList = getChatRoomList;
