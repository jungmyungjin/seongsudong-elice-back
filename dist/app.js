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
exports.io = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const comment_routes_1 = __importDefault(require("./src/routes/comment-routes"));
const member_routes_1 = __importDefault(require("./src/routes/member-routes"));
//import authRouter from './src/routes/auth-routes'
const admin_routes_1 = __importDefault(require("./src/routes/admin-routes"));
const post_routes_1 = __importDefault(require("./src/routes/post-routes"));
const reservaton_routes_1 = __importDefault(require("./src/routes/reservaton-routes"));
const chat_routes_1 = __importDefault(require("./src/routes/chat-routes"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
// import {
//   googleCallback,
//   googleCallbackRedirect,
//   googleStrategy,
// } from './src/controllers/members-controllers';
const chat_utils_1 = require("./src/utils/chat-utils");
const connection_1 = __importDefault(require("./connection"));
// import { googleCallback, googleLogin } from './src/controllers/member2_controller';
const cookieParser = require('cookie-parser');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(cookieParser());
app.use((0, cors_1.default)({
    // origin: true,
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    exposedHeaders: ['set-cookie'],
}));
app.use((0, express_session_1.default)({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //   secure: false, // HTTPS가 아닌 경우 false로 설정
    //   maxAge: 1000 * 60 * 60, // 세션 유효 기간 (예: 1시간)
    // },
}));
const server = http_1.default.createServer(app);
// app.use(function (req, res, next) {
//   // res.header('Access-Control-Allow-Origin', req.headers.origin);
//   res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept',
//   );
//   res.header('Access-Control-Allow-Credentials', 'true');
//   next();
// });
// socket.io 서버 생성 및 옵션 설정
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: true,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    },
});
// cors
// app.use(
//   cors({
//     origin: true,
//     methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//     maxAge: 86400,
//     optionsSuccessStatus: 200,
//     preflightContinue: true,
//   }),
// );
// app.use(passport.initialize());
// app.use(passport.session());
// app.get('/', (req: Request, res: Response, next: NextFunction) => {
//   res.sendFile(__dirname + '/index.html');
// });
app.use('/uploads', express_1.default.static('uploads'));
app.listen(8000, () => {
    console.log('server on!');
});
// socket.io 서버
server.listen(3002, () => {
    console.log(`Socket server on!!`);
});
//app.post('/auth/google', googleStrategy);
// app.post('/auth/google', googleLogin);
// app.get('/auth/google/callback', googleCallback);
app.use('/api/members', member_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/comments', comment_routes_1.default);
app.use('/api/posts', post_routes_1.default);
app.use('/api/reservations', reservaton_routes_1.default);
//app.use('/', authRouter);
app.use('/api/chat', chat_routes_1.default);
// socket.io 연결
exports.io.on('connect', socket => {
    console.log('connected!!!');
    // 채팅방 생성 이벤트
    socket.on('createChatRoom', (email, messages) => __awaiter(void 0, void 0, void 0, function* () {
        // email에 해당하는 메세지 찾기
        const checkChatRoomQuery = `SELECT * FROM chat_messages WHERE sender_email = ? LIMIT 1;`;
        const checkResult = yield connection_1.default.promise().query(checkChatRoomQuery, [email]);
        console.log(checkResult[0]);
        let roomId;
        if (checkResult[0].length > 0) {
            // 첫 메세지가 아닐 경우, 결과에서 roomId 가져오기
            roomId = checkResult[0].room_id;
            console.log("It's first msg!");
        }
        else {
            // 첫 메세지일 경우, 채팅방 생성
            const createChatRoomQuery = `INSERT INTO chat_rooms (member_email) VALUES (?);`;
            const [result] = yield connection_1.default.promise().query(createChatRoomQuery, [email]);
            const newRoomId = result.insertId;
            roomId = newRoomId;
            console.log('ChatRoom created!');
        }
        // 메세지 db 저장
        yield (0, chat_utils_1.saveMessages)(roomId, email, messages);
        console.log('Messages saved!');
        // 해당 채팅방의 모든 메세지 전달
        socket.emit('chatMessages', (0, chat_utils_1.getAllMessages)(roomId));
        console.log('Messages sent!');
    }));
});
