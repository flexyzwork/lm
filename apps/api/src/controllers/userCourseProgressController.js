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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserCourseProgress = exports.getUserCourseProgress = exports.getUserEnrolledCourses = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var utils_1 = require("../utils/utils");
var utils_2 = require("../utils/utils");
var getUserEnrolledCourses = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, auth, enrolledCourses, courseIds, courses, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.params.userId;
                auth = req.user;
                if (!auth || auth.userId !== userId) {
                    res.status(403).json({ message: 'Access denied' });
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, prisma.userCourseProgress.findMany({
                        where: { userId: userId },
                        select: { courseId: true },
                    })];
            case 2:
                enrolledCourses = _a.sent();
                courseIds = enrolledCourses.map(function (item) { return item.courseId; });
                return [4 /*yield*/, prisma.course.findMany({
                        where: { courseId: { in: courseIds } },
                        include: {
                            sections: {
                                include: {
                                    chapters: true,
                                },
                            },
                        },
                    })];
            case 3:
                courses = _a.sent();
                res.json({
                    message: 'Enrolled courses retrieved successfully',
                    data: courses,
                });
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                res.status(500).json({ message: 'Error retrieving enrolled courses', error: error_1 });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getUserEnrolledCourses = getUserEnrolledCourses;
var getUserCourseProgress = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, courseId, progress, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, userId = _a.userId, courseId = _a.courseId;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.userCourseProgress.findUnique({
                        where: { userId_courseId: { userId: userId, courseId: courseId } },
                    })];
            case 2:
                progress = _b.sent();
                if (!progress) {
                    res.status(404).json({ message: 'Course progress not found for this user' });
                    return [2 /*return*/];
                }
                res.json({
                    message: 'Course progress retrieved successfully',
                    data: progress,
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                res.status(500).json({ message: 'Error retrieving user course progress', error: error_2 });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getUserCourseProgress = getUserCourseProgress;
var updateUserCourseProgress = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, courseId, progressData, existingProgress, mergedSections, overallProgress, progress, error_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.params, userId = _a.userId, courseId = _a.courseId;
                progressData = req.body;
                _c.label = 1;
            case 1:
                _c.trys.push([1, 4, , 5]);
                return [4 /*yield*/, prisma.userCourseProgress.findUnique({
                        where: { userId_courseId: { userId: userId, courseId: courseId } },
                    })];
            case 2:
                existingProgress = _c.sent();
                mergedSections = existingProgress
                    ? (0, utils_2.mergeSections)((_b = existingProgress.sections) !== null && _b !== void 0 ? _b : [], progressData.sections || [])
                    : progressData.sections || [];
                overallProgress = existingProgress
                    ? (0, utils_1.calculateOverallProgress)(mergedSections)
                    : 0;
                return [4 /*yield*/, prisma.userCourseProgress.upsert({
                        where: { userId_courseId: { userId: userId, courseId: courseId } },
                        update: {
                            sections: mergedSections,
                            lastAccessedTimestamp: new Date(),
                            overallProgress: overallProgress,
                        },
                        create: {
                            userId: userId,
                            courseId: courseId,
                            enrollmentDate: new Date(),
                            overallProgress: overallProgress,
                            sections: progressData.sections || [],
                            lastAccessedTimestamp: new Date(),
                        },
                    })];
            case 3:
                progress = _c.sent();
                res.json({
                    message: 'User course progress updated successfully',
                    data: progress,
                });
                return [3 /*break*/, 5];
            case 4:
                error_3 = _c.sent();
                console.error('Error updating progress:', error_3);
                res.status(500).json({
                    message: 'Error updating user course progress',
                    error: error_3,
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.updateUserCourseProgress = updateUserCourseProgress;
