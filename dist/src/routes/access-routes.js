"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const access_controllers_1 = require("../controllers/access-controllers");
const accessRouter = express_1.default.Router();
accessRouter.post('/login', access_controllers_1.setUserAccess);
accessRouter.delete('/logout', access_controllers_1.setUserExit);
exports.default = accessRouter;
