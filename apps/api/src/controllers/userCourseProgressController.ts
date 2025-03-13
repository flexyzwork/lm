import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateOverallProgress } from '../utils/utils';
import { mergeSections } from '../utils/utils';

const prisma = new PrismaClient();

export const getUserEnrolledCourses = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const auth = req.user;

  if (!auth || auth.userId !== userId) {
    res.status(403).json({ message: 'Access denied' });
    return;
  }

  try {
    const enrolledCourses = await prisma.userCourseProgress.findMany({
      where: { userId },
      select: { courseId: true },
    });
    const courseIds = enrolledCourses.map((item) => item.courseId);
    const courses = await prisma.course.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        sections: {
          include: {
            chapters: true,
          },
        },
      },
    });
    res.json({
      message: 'Enrolled courses retrieved successfully',
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving enrolled courses', error });
  }
};

export const getUserCourseProgress = async (req: Request, res: Response): Promise<void> => {
  const { userId, courseId } = req.params;

  try {
    const progress = await prisma.userCourseProgress.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!progress) {
      res.status(404).json({ message: 'Course progress not found for this user' });
      return;
    }
    res.json({
      message: 'Course progress retrieved successfully',
      data: progress,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user course progress', error });
  }
};

export const updateUserCourseProgress = async (req: Request, res: Response): Promise<void> => {
  const { userId, courseId } = req.params;
  const progressData = req.body;

  try {
    const existingProgress = await prisma.userCourseProgress.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    const mergedSections = existingProgress
      ? mergeSections((existingProgress.sections as any[]) ?? [], progressData.sections || [])
      : progressData.sections || [];

    const overallProgress = existingProgress
      ? calculateOverallProgress(mergedSections)
      : 0;

    const progress = await prisma.userCourseProgress.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {
        sections: mergedSections,
        lastAccessedTimestamp: new Date(),
        overallProgress,
      },
      create: {
        userId,
        courseId,
        enrollmentDate: new Date(),
        overallProgress,
        sections: progressData.sections || [],
        lastAccessedTimestamp: new Date(),
      },
    });

    res.json({
      message: 'User course progress updated successfully',
      data: progress,
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      message: 'Error updating user course progress',
      error,
    });
  }
};
