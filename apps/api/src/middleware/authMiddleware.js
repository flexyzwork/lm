"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // JWT 서명 키
var verifyToken = function (req, res, next) {
    var authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized - No Token Provided' });
        return; // ✅ `return` 추가
    }
    var token = authHeader.split(' ')[1];
    try {
        var decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log('decoded', decoded);
        req.user = decoded; // ✅ 타입 오류 해결
        next(); // ✅ 다음 미들웨어로 이동
    }
    catch (error) {
        res.status(403).json({ message: 'Forbidden - Invalid Token' });
        return; // ✅ `return` 추가
    }
};
exports.verifyToken = verifyToken;
