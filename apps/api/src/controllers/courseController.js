"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.getUploadVideoUrl = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourse = exports.listCourses = void 0;
var client_1 = require("@prisma/client");
var uuid_1 = require("uuid");
var prisma = new client_1.PrismaClient();
/**
 * 🔹 강의 목록 조회
 */
var listCourses = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var category, courses, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                category = req.query.category;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.course.findMany({
                        where: category && category !== 'all' ? { category: String(category) } : undefined,
                        include: {
                            sections: {
                                include: {
                                    chapters: true,
                                },
                            },
                        },
                    })];
            case 2:
                courses = _a.sent();
                res.json({ message: 'Courses retrieved successfully', data: courses });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('❌ Error retrieving courses:', error_1);
                res.status(500).json({ message: 'Error retrieving courses', error: error_1 });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.listCourses = listCourses;
/**
 * 🔹 특정 강의 조회
 */
var getCourse = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var courseId, course, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                courseId = req.params.courseId;
                console.log("\uD83D\uDD0D Fetching course with ID: ".concat(courseId));
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.course.findUnique({
                        where: { courseId: courseId },
                        include: {
                            sections: {
                                include: { chapters: true },
                            },
                        },
                    })];
            case 2:
                course = _a.sent();
                console.log("\uD83D\uDCCC Course Data:", course); // 🔥 확인용 로그 추가
                if (!course) {
                    console.warn("\u26A0\uFE0F Course not found: ".concat(courseId));
                    res.status(404).json({ message: 'Course not found', data: null });
                    return [2 /*return*/];
                }
                course.sections = course.sections || []; // 🔥 undefined 방지
                res.json({ message: 'Course retrieved successfully', data: course });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error("\u274C Error retrieving course(".concat(courseId, "):"), error_2);
                res.status(500).json({ message: 'Error retrieving course', error: error_2 });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getCourse = getCourse;
/**
 * 🔹 강의 생성
 */
var createCourse = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, teacherId, teacherName, newCourse, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, teacherId = _a.teacherId, teacherName = _a.teacherName;
                if (!teacherId || !teacherName) {
                    res.status(400).json({ message: 'Teacher Id and name are required' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.course.create({
                        data: {
                            courseId: (0, uuid_1.v4)(),
                            teacherId: teacherId,
                            teacherName: teacherName,
                            title: 'Untitled Course',
                            description: '',
                            category: 'Uncategorized',
                            image: '',
                            price: 0,
                            level: 'Beginner',
                            status: 'Draft',
                        },
                    })];
            case 1:
                newCourse = _b.sent();
                res.json({ message: 'Course created successfully', data: newCourse });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _b.sent();
                res.status(500).json({ message: 'Error creating course', error: error_3 });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.createCourse = createCourse;
/**
 * 🔹 강의 업데이트 (Prisma 트랜잭션 적용)
 */
var updateCourse = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var courseId, updateData, userId, existingCourse, price, updatedSections_1, updatedCourse, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                courseId = req.params.courseId;
                updateData = __assign({}, req.body);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, , 6]);
                return [4 /*yield*/, prisma.course.findUnique({
                        where: { courseId: courseId },
                        include: {
                            sections: { include: { chapters: true } },
                        },
                    })];
            case 2:
                existingCourse = _b.sent();
                if (!existingCourse) {
                    res.status(404).json({ message: 'Course not found' });
                    return [2 /*return*/];
                }
                if (existingCourse.teacherId !== userId) {
                    res.status(403).json({ message: 'Not authorized to update this course' });
                    return [2 /*return*/];
                }
                if (updateData.price) {
                    price = parseInt(updateData.price);
                    if (isNaN(price)) {
                        res.status(400).json({ message: 'Invalid price format' });
                        return [2 /*return*/];
                    }
                    updateData.price = price * 100;
                }
                // 🔥 `sections`가 문자열이면 JSON으로 변환
                if (typeof updateData.sections === 'string') {
                    try {
                        updateData.sections = JSON.parse(updateData.sections);
                    }
                    catch (error) {
                        console.error("\u274C Invalid JSON format for sections:", updateData.sections);
                        res.status(400).json({ message: 'Invalid sections format' });
                        return [2 /*return*/];
                    }
                }
                updatedSections_1 = Array.isArray(updateData.sections)
                    ? updateData.sections.map(function (section) { return ({
                        sectionId: section.sectionId || (0, uuid_1.v4)(),
                        sectionTitle: section.sectionTitle,
                        sectionDescription: section.sectionDescription,
                        chapters: Array.isArray(section.chapters)
                            ? section.chapters.map(function (chapter) { return ({
                                chapterId: chapter.chapterId || (0, uuid_1.v4)(),
                                type: chapter.type,
                                title: chapter.title,
                                content: chapter.content,
                            }); })
                            : [],
                    }); })
                    : [];
                return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var _i, updatedSections_2, section, _a, _b, chapter;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: 
                                // ✅ 코스 정보 업데이트 (제목, 설명, 가격 등)
                                return [4 /*yield*/, tx.course.update({
                                        where: { courseId: courseId },
                                        data: {
                                            title: updateData.title,
                                            description: updateData.description,
                                            category: updateData.category,
                                            price: updateData.price,
                                            status: updateData.status,
                                        },
                                    })];
                                case 1:
                                    // ✅ 코스 정보 업데이트 (제목, 설명, 가격 등)
                                    _c.sent();
                                    _i = 0, updatedSections_2 = updatedSections_1;
                                    _c.label = 2;
                                case 2:
                                    if (!(_i < updatedSections_2.length)) return [3 /*break*/, 8];
                                    section = updatedSections_2[_i];
                                    return [4 /*yield*/, tx.section.upsert({
                                            where: { sectionId: section.sectionId },
                                            update: {
                                                sectionTitle: section.sectionTitle,
                                                sectionDescription: section.sectionDescription,
                                            },
                                            create: {
                                                sectionId: section.sectionId,
                                                courseId: courseId,
                                                sectionTitle: section.sectionTitle,
                                                sectionDescription: section.sectionDescription,
                                            },
                                        })];
                                case 3:
                                    _c.sent();
                                    _a = 0, _b = section.chapters;
                                    _c.label = 4;
                                case 4:
                                    if (!(_a < _b.length)) return [3 /*break*/, 7];
                                    chapter = _b[_a];
                                    return [4 /*yield*/, tx.chapter.upsert({
                                            where: { chapterId: chapter.chapterId },
                                            update: {
                                                type: chapter.type,
                                                title: chapter.title,
                                                content: chapter.content,
                                            },
                                            create: {
                                                chapterId: chapter.chapterId,
                                                sectionId: section.sectionId,
                                                type: chapter.type,
                                                title: chapter.title,
                                                content: chapter.content,
                                            },
                                        })];
                                case 5:
                                    _c.sent();
                                    _c.label = 6;
                                case 6:
                                    _a++;
                                    return [3 /*break*/, 4];
                                case 7:
                                    _i++;
                                    return [3 /*break*/, 2];
                                case 8: return [2 /*return*/];
                            }
                        });
                    }); })];
            case 3:
                _b.sent();
                return [4 /*yield*/, prisma.course.findUnique({
                        where: { courseId: courseId },
                        include: { sections: { include: { chapters: true } } },
                    })];
            case 4:
                updatedCourse = _b.sent();
                res.json({ message: 'Course updated successfully', data: updatedCourse });
                return [3 /*break*/, 6];
            case 5:
                error_4 = _b.sent();
                console.error("\u274C Error updating course(".concat(courseId, "):"), error_4);
                res.status(500).json({ message: 'Error updating course', error: error_4 });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.updateCourse = updateCourse;
/**
 * 🔹 강의 삭제
 */
var deleteCourse = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var courseId, userId, course, error_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                courseId = req.params.courseId;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, prisma.course.findUnique({ where: { courseId: courseId } })];
            case 2:
                course = _b.sent();
                if (!course) {
                    res.status(404).json({ message: 'Course not found' });
                    return [2 /*return*/];
                }
                if (course.teacherId !== userId) {
                    res.status(403).json({ message: 'Not authorized to delete this course' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.course.delete({ where: { courseId: courseId } })];
            case 3:
                _b.sent();
                res.json({ message: 'Course deleted successfully' });
                return [3 /*break*/, 5];
            case 4:
                error_5 = _b.sent();
                res.status(500).json({ message: 'Error deleting course', error: error_5 });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.deleteCourse = deleteCourse;
var getUploadVideoUrl = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, fileName, fileType, uniqueId, s3Key, s3Params, uploadUrl, videoUrl;
    return __generator(this, function (_b) {
        _a = req.body, fileName = _a.fileName, fileType = _a.fileType;
        if (!fileName || !fileType) {
            res.status(400).json({ message: 'File name and type are required' });
            return [2 /*return*/];
        }
        try {
            uniqueId = (0, uuid_1.v4)();
            s3Key = "videos/".concat(uniqueId, "/").concat(fileName);
            s3Params = {
                Bucket: process.env.S3_BUCKET_NAME || '',
                Key: s3Key,
                // Expires: 60,
                // ContentType: fileType,
                Expires: 300, // URL 만료 시간 (초)
                ACL: 'public-read',
            };
            uploadUrl = "s3.getSignedUrl('putObject', s3Params)";
            videoUrl = "".concat(process.env.CLOUDFRONT_DOMAIN, "/videos/").concat(uniqueId, "/").concat(fileName);
            res.json({
                message: 'Upload URL generated successfully',
                data: { uploadUrl: uploadUrl, videoUrl: videoUrl },
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error generating upload URL', error: error });
        }
        return [2 /*return*/];
    });
}); };
exports.getUploadVideoUrl = getUploadVideoUrl;
