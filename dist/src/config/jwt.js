"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secretKey = process.env.JWT_SECRET_KEY;
const expiresIn = '1h';
const generateToken = (userInfo) => {
    const payload = {
        email: userInfo.email,
        name: userInfo.name,
        generation: userInfo.generation,
        isAdmin: userInfo.isAdmin,
    };
    if (!secretKey) {
        throw new Error('JWT secret key is not configured');
    }
    return jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        if (!secretKey) {
            throw new Error('JWT secret key is not configured');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        return decoded;
    }
    catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
};
exports.verifyToken = verifyToken;
const refreshToken = (token) => {
    try {
        const decoded = (0, exports.verifyToken)(token);
        if (decoded) {
            return (0, exports.generateToken)(decoded);
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
};
exports.refreshToken = refreshToken;
