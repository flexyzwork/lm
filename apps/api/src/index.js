"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var dotenv_1 = require("dotenv");
var body_parser_1 = require("body-parser");
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var morgan_1 = require("morgan");
/* ROUTE IMPORTS */
var courseRoutes_1 = require("./routes/courseRoutes");
var transactionRoutes_1 = require("./routes/transactionRoutes");
var userCourseProgressRoutes_1 = require("./routes/userCourseProgressRoutes");
var authMiddleware_1 = require("./middleware/authMiddleware");
/* CONFIGURATIONS */
dotenv_1.default.config();
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use((0, morgan_1.default)('common'));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
/* ROUTES */
app.use('/courses', courseRoutes_1.default);
app.use('/transactions', authMiddleware_1.verifyToken, transactionRoutes_1.default);
app.use('/users/course-progress', authMiddleware_1.verifyToken, userCourseProgressRoutes_1.default);
/* SERVER */
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server running on port ".concat(port));
});
