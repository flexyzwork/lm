import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetCourseQuery, useGetUserCourseProgressQuery, useUpdateUserCourseProgressMutation } from '@/state/api';

import { useAuthStore } from '@/stores/authStore';

export const useCourseProgressData = () => {
  const { courseId, chapterId } = useParams();
  const { user } = useAuthStore();
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  const [updateProgress] = useUpdateUserCourseProgressMutation();

  const { data: course, isLoading: courseLoading } = useGetCourseQuery((courseId as string) ?? '', {
    skip: !courseId,
  });

  const { data: userProgress, isLoading: progressLoading } = useGetUserCourseProgressQuery(
    {
      userId: user?.userId ?? '',
      courseId: (courseId as string) ?? '',
    },
    {
      skip: !user || !courseId,
    }
  );

  const isLoading = courseLoading || progressLoading;

  const currentSection = course?.sections.find((s) => s.chapters.some((c) => c.chapterId === chapterId));

  const currentChapter = currentSection?.chapters.find((c) => c.chapterId === chapterId);

  const isChapterCompleted = () => {
    if (!currentSection || !currentChapter || !userProgress?.sections) return false;

    const section = userProgress.sections.find((s) => s.sectionId === currentSection.sectionId);
    return section?.chapters.some((c) => c.chapterId === currentChapter.chapterId && c.completed) ?? false;
  };

  const updateChapterProgress = (sectionId: string, chapterId: string, completed: boolean) => {
    if (!user) return;

    const updatedSections = [
      {
        sectionId,
        chapters: [
          {
            chapterId,
            completed,
          },
        ],
      },
    ];

    updateProgress({
      userId: user.userId,
      courseId: (courseId as string) ?? '',
      progressData: {
        sections: updatedSections,
      },
    });
  };

  return {
    user,
    courseId,
    chapterId,
    course,
    userProgress,
    currentSection,
    currentChapter,
    isLoading,
    isChapterCompleted,
    updateChapterProgress,
    hasMarkedComplete,
    setHasMarkedComplete,
  };
};
