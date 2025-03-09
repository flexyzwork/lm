'use client';

import Toolbar from '@/components/Toolbar';
import CourseCard from '@/components/CourseCard';
import { useGetUserEnrolledCoursesQuery } from '@/state/api';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

import { useState, useMemo } from 'react';
import Loading from '@/components/Loading';
import { useAuthStore } from '@/stores/authStore';

const Courses = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const {
    data: courses,
    isLoading,
    isError,
  } = useGetUserEnrolledCoursesQuery(user?.userId ?? '', {
    skip: !user,
  });

  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  const handleGoToCourse = (course: Course) => {
    console.log('Navigating to course:', course.courseId);
    console.log('Course details:', course);
    if (course?.sections && course?.sections?.length > 0 && course?.sections[0].chapters?.length > 0) {
      const firstChapter = course.sections[0].chapters[0];
      router.push(`/user/courses/${course.courseId}/chapters/${firstChapter.chapterId}`, {
        scroll: false,
      });
    } else {
      console.error('No sections or chapters found for the course:', course);
      router.push(`/user/courses/${course.courseId}`, {
        scroll: false,
      });
    }
  };

  if (isLoading) return <Loading />;
  if (!user) return <div>Please sign in to view your courses.</div>;
  if (isError || !courses || courses.length === 0) return <div>You are not enrolled in any courses yet.</div>;

  return (
    <div className="user-courses">
      <Header title="My Courses" subtitle="View your enrolled courses" />
      <Toolbar onSearch={setSearchTerm} onCategoryChange={setSelectedCategory} />
      <div className="user-courses__grid">
        {filteredCourses.map((course) => (
          <CourseCard key={course.courseId} course={course} onGoToCourse={handleGoToCourse} />
        ))}
      </div>
    </div>
  );
};

export default Courses;
