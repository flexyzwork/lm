import express from "express";
import multer from "multer";
import {
  createCourse,
  deleteCourse,
  getCourse,
  listCourses,
  updateCourse,
  getUploadVideoUrl,
} from "../controllers/courseController";
// import { requireAuth } from "@clerk/express";
import { verifyToken } from "../middleware/authMiddleware"; // 👈 JWT 검증 미들웨어 적용

// router.post("/", verifyToken, createCourse);
// router.put("/:courseId", verifyToken, upload.single("image"), updateCourse);

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", listCourses);
router.post("/", verifyToken, createCourse);

router.get("/:courseId", getCourse);
router.put("/:courseId", verifyToken, upload.single("image"), updateCourse);
router.delete("/:courseId", verifyToken, deleteCourse);

router.post(
  "/:courseId/sections/:sectionId/chapters/:chapterId/get-upload-url",
  verifyToken,
  getUploadVideoUrl
);

export default router;
