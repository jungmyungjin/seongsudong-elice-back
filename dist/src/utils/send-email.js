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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// 이메일 전송 함수 정의
const sendEmail = (to, subject, text) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 이메일 전송을 위한 transporter 생성
        const transporter = nodemailer_1.default.createTransport({
            service: 'Gmail',
            port: 587,
            auth: {
                user: 'seongsudong.elice',
                pass: 'scepqtnhcksahfse' // 이메일 계정 비밀번호
            }
        });
        // 이메일 옵션 설정
        const mailOptions = {
            from: 'seongsudong.elice@gmail.com',
            to: to,
            subject: subject,
            text: text // 이메일 본문
        };
        // 이메일 전송
        const result = yield transporter.sendMail(mailOptions);
        console.log('Email sent:', result);
    }
    catch (error) {
        console.error('Error sending email:', error);
    }
});
exports.sendEmail = sendEmail;
