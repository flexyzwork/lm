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
exports.calculateOverallProgress = exports.mergeChapters = exports.mergeSections = exports.handleAdvancedVideoUpload = exports.getContentType = exports.validateUploadedFiles = exports.updateCourseVideoInfo = void 0;
var path_1 = require("path");
var updateCourseVideoInfo = function (course, sectionId, chapterId, videoUrl) {
    var _a, _b;
    var section = (_a = course.sections) === null || _a === void 0 ? void 0 : _a.find(function (s) { return s.sectionId === sectionId; });
    if (!section) {
        throw new Error("Section not found: ".concat(sectionId));
    }
    var chapter = (_b = section.chapters) === null || _b === void 0 ? void 0 : _b.find(function (c) { return c.chapterId === chapterId; });
    if (!chapter) {
        throw new Error("Chapter not found: ".concat(chapterId));
    }
    chapter.video = videoUrl;
    chapter.type = "Video";
};
exports.updateCourseVideoInfo = updateCourseVideoInfo;
var validateUploadedFiles = function (files) {
    var allowedExtensions = [".mp4", ".m3u8", ".mpd", ".ts", ".m4s"];
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var ext = path_1.default.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            throw new Error("Unsupported file type: ".concat(ext));
        }
    }
};
exports.validateUploadedFiles = validateUploadedFiles;
var getContentType = function (filename) {
    var ext = path_1.default.extname(filename).toLowerCase();
    switch (ext) {
        case ".mp4":
            return "video/mp4";
        case ".m3u8":
            return "application/vnd.apple.mpegurl";
        case ".mpd":
            return "application/dash+xml";
        case ".ts":
            return "video/MP2T";
        case ".m4s":
            return "video/iso.segment";
        default:
            return "application/octet-stream";
    }
};
exports.getContentType = getContentType;
// Preserved HLS/DASH upload logic for future use
var handleAdvancedVideoUpload = function (s3, files, uniqueId, bucketName) { return __awaiter(void 0, void 0, void 0, function () {
    var isHLSOrDASH, uploadPromises, manifestFile, manifestFileName, videoType;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isHLSOrDASH = files.some(function (file) {
                    return file.originalname.endsWith(".m3u8") || file.originalname.endsWith(".mpd");
                });
                if (!isHLSOrDASH) return [3 /*break*/, 2];
                uploadPromises = files.map(function (file) {
                    var s3Key = "videos/".concat(uniqueId, "/").concat(file.originalname);
                    return s3
                        .upload({
                        Bucket: bucketName,
                        Key: s3Key,
                        Body: file.buffer,
                        ContentType: (0, exports.getContentType)(file.originalname),
                    })
                        .promise();
                });
                return [4 /*yield*/, Promise.all(uploadPromises)];
            case 1:
                _a.sent();
                manifestFile = files.find(function (file) {
                    return file.originalname.endsWith(".m3u8") ||
                        file.originalname.endsWith(".mpd");
                });
                manifestFileName = (manifestFile === null || manifestFile === void 0 ? void 0 : manifestFile.originalname) || "";
                videoType = manifestFileName.endsWith(".m3u8") ? "hls" : "dash";
                return [2 /*return*/, {
                        videoUrl: "".concat(process.env.CLOUDFRONT_DOMAIN, "/videos/").concat(uniqueId, "/").concat(manifestFileName),
                        videoType: videoType,
                    }];
            case 2: return [2 /*return*/, null]; // Return null if not HLS/DASH to handle regular upload
        }
    });
}); };
exports.handleAdvancedVideoUpload = handleAdvancedVideoUpload;
var mergeSections = function (existingSections, newSections) {
    var existingSectionsMap = new Map();
    for (var _i = 0, existingSections_1 = existingSections; _i < existingSections_1.length; _i++) {
        var existingSection = existingSections_1[_i];
        existingSectionsMap.set(existingSection.sectionId, existingSection);
    }
    for (var _a = 0, newSections_1 = newSections; _a < newSections_1.length; _a++) {
        var newSection = newSections_1[_a];
        var section = existingSectionsMap.get(newSection.sectionId);
        if (!section) {
            // Add new section
            existingSectionsMap.set(newSection.sectionId, newSection);
        }
        else {
            // Merge chapters within the existing section
            section.chapters = (0, exports.mergeChapters)(section.chapters, newSection.chapters);
            existingSectionsMap.set(newSection.sectionId, section);
        }
    }
    return Array.from(existingSectionsMap.values());
};
exports.mergeSections = mergeSections;
var mergeChapters = function (existingChapters, newChapters) {
    var existingChaptersMap = new Map();
    for (var _i = 0, existingChapters_1 = existingChapters; _i < existingChapters_1.length; _i++) {
        var existingChapter = existingChapters_1[_i];
        existingChaptersMap.set(existingChapter.chapterId, existingChapter);
    }
    for (var _a = 0, newChapters_1 = newChapters; _a < newChapters_1.length; _a++) {
        var newChapter = newChapters_1[_a];
        existingChaptersMap.set(newChapter.chapterId, __assign(__assign({}, (existingChaptersMap.get(newChapter.chapterId) || {})), newChapter));
    }
    return Array.from(existingChaptersMap.values());
};
exports.mergeChapters = mergeChapters;
var calculateOverallProgress = function (sections) {
    var totalChapters = sections.reduce(function (acc, section) { return acc + section.chapters.length; }, 0);
    var completedChapters = sections.reduce(function (acc, section) {
        return acc + section.chapters.filter(function (chapter) { return chapter.completed; }).length;
    }, 0);
    return totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
};
exports.calculateOverallProgress = calculateOverallProgress;
