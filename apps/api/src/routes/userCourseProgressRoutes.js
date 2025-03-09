"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var userCourseProgressController_1 = require("../controllers/userCourseProgressController");
var router = express_1.default.Router();
router.get("/:userId/enrolled-courses", userCourseProgressController_1.getUserEnrolledCourses);
router.get("/:userId/courses/:courseId", userCourseProgressController_1.getUserCourseProgress);
router.put("/:userId/courses/:courseId", userCourseProgressController_1.updateUserCourseProgress);
exports.default = router;
