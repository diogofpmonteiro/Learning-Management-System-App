import { adminGetLesson } from "@/app/data/admin/admin-get-lesson";
import LessonForm from "./_components/LessonForm";

type Params = Promise<{
  courseId: string;
  chapterId: string;
  lessonId: string;
}>;

const LessonIndexPage = async ({ params }: { params: Params }) => {
  const { courseId, chapterId, lessonId } = await params;

  const lesson = await adminGetLesson(lessonId);

  return (
    <div>
      <LessonForm data={lesson} chapterId={chapterId} courseId={courseId} />
    </div>
  );
};

export default LessonIndexPage;
