"use client";

import { arrayMove, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DndContext,
  DragEndEvent,
  DraggableSyntheticListeners,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ReactNode, useEffect, useState } from "react";
import { AdminCourseSingularType } from "@/app/data/admin/admin-get-course";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, FileTextIcon, GripVerticalIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { reorderChapters, reorderLessons } from "../actions";

interface ICourseStructureProps {
  data: AdminCourseSingularType;
}

interface ISortableItemProps {
  id: string;
  children: (listeners: DraggableSyntheticListeners) => ReactNode;
  className?: string;
  data?: {
    type: "chapter" | "lesson";
    chapterId?: string; // only relevant for dragging lessons
  };
}

const CourseStructure = ({ data: course }: ICourseStructureProps) => {
  const initialChapters =
    course.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.position,
      isOpen: true, // default chapters to open
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.position,
      })),
    })) || [];

  const [chapters, setChapters] = useState(initialChapters);

  useEffect(() => {
    setChapters((prev) => {
      const updatedChapters =
        course.chapters.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          order: chapter.position,
          isOpen: prev.find((item) => item.id === chapter.id)?.isOpen ?? true,
          lessons: chapter.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            order: lesson.position,
          })),
        })) || [];

      return updatedChapters;
    });
  }, [course]);

  function SortableItem({ children, id, className, data }: ISortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn("touch-none", className, isDragging ? "z-10" : "")}
        {...attributes}>
        {children(listeners)}
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id;
    const activeType = active.data.current?.type as "chapter" | "lesson";
    const overId = over.id;
    const overType = over.data.current?.type as "chapter" | "lesson";
    const courseId = course.id;

    if (activeType === "chapter") {
      let targetChapterId = null;

      if (overType === "chapter") {
        targetChapterId = overId;
      } else if (overType === "lesson") {
        targetChapterId = over.data.current?.chapterId ?? null;
      }

      if (!targetChapterId) {
        toast.error("Could not determine chapter for reordering");
      }

      const oldIndex = chapters.findIndex((chapter) => chapter.id === activeId);
      const newIndex = chapters.findIndex((chapter) => chapter.id === targetChapterId);

      if (oldIndex === -1 || newIndex === -1) {
        toast.error("Could not find chapter index for reordering");
        return;
      }

      const reorderedLocalChapters = arrayMove(chapters, oldIndex, newIndex);
      const updatedChapters = reorderedLocalChapters.map((chapter, index) => ({
        ...chapter,
        order: index + 1,
      }));

      const previousChapters = [...chapters];

      setChapters(updatedChapters);

      // update in db
      if (courseId) {
        const chaptersToUpdate = updatedChapters.map((chapter) => ({
          id: chapter.id,
          position: chapter.order,
        }));

        const reorderChaptersPromise = () => reorderChapters(courseId, chaptersToUpdate);

        toast.promise(reorderChaptersPromise(), {
          loading: "Reordering chapters..",
          success: (result) => {
            if (result.status === "success") return result.message;
            throw new Error(result.message);
          },
          error: () => {
            setChapters(previousChapters);
            return "Failed to reorder chapters";
          },
        });
      }

      return;
    }

    if (activeType === "lesson" && overType === "lesson") {
      const chapterId = active.data.current?.chapterId;
      const overChapterId = over.data.current?.chapterId;

      if (!chapterId || chapterId !== overChapterId) {
        toast.error("Lesson move between different chapters or invalid chapter id is not allowed. ");
        return;
      }

      const chapterIndex = chapters.findIndex((chapter) => chapter.id === chapterId);
      if (chapterIndex === -1) {
        toast.error("Could not find valid chapter");
        return;
      }

      const chapterToUpdate = chapters[chapterIndex];

      const oldLessonIndex = chapterToUpdate.lessons.findIndex((lesson) => lesson.id === active.id);
      const newLessonIndex = chapterToUpdate.lessons.findIndex((lesson) => lesson.id === over.id);

      if (oldLessonIndex === -1 || newLessonIndex === -1) {
        toast.error("Could not drag lesson");
        return;
      }

      const reorderedLessons = arrayMove(chapterToUpdate.lessons, oldLessonIndex, newLessonIndex);
      const updatedLessons = reorderedLessons.map((lesson, index) => ({
        ...lesson,
        order: index + 1,
      }));

      const updatedChaptersState = [...chapters];
      updatedChaptersState[chapterIndex] = {
        ...chapterToUpdate,
        lessons: updatedLessons,
      };

      const previousChapters = [...chapters];

      setChapters(updatedChaptersState);

      // update in db
      if (courseId) {
        const lessonsToUpdate = updatedLessons.map((lesson) => ({
          id: lesson.id,
          position: lesson.order,
        }));

        const reorderLessonsPromise = () => reorderLessons(chapterId, lessonsToUpdate, courseId);

        toast.promise(reorderLessonsPromise(), {
          loading: "Reordering lessons..",
          success: (result) => {
            if (result.status === "success") return result.message;
            throw new Error(result.message);
          },
          error: () => {
            setChapters(previousChapters);
            return "Failed to reorder lessons";
          },
        });
      }

      return;
    }
  };

  const toggleChapter = (chapterId: string) => {
    setChapters(
      chapters.map((chapter) => (chapter.id === chapterId ? { ...chapter, idOpen: !chapter.isOpen } : chapter))
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  return (
    <DndContext collisionDetection={rectIntersection} onDragEnd={handleDragEnd} sensors={sensors}>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between border-bottom border-border'>
          <CardTitle>Chapters</CardTitle>
        </CardHeader>

        <CardContent className='space-y-8'>
          <SortableContext strategy={verticalListSortingStrategy} items={chapters}>
            {chapters.map((chapter) => (
              <SortableItem key={chapter.id} data={{ type: "chapter" }} id={chapter.id}>
                {(chapterListeners) => (
                  <Card>
                    <Collapsible open={chapter.isOpen} onOpenChange={() => toggleChapter(chapter.id)}>
                      <div className='flex items-center justify-between p-3 border-b border-border'>
                        <div className='flex items-center gap-2'>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='cursor-grab opacity-60 hover:opacity-100'
                            {...chapterListeners}>
                            <GripVerticalIcon className='size-4' />
                          </Button>

                          <CollapsibleTrigger asChild>
                            <Button size='icon' variant='ghost' className='flex items-center'>
                              {chapter.isOpen ? (
                                <ChevronDown className='size-4' />
                              ) : (
                                <ChevronRight className='size-4' />
                              )}
                            </Button>
                          </CollapsibleTrigger>

                          <p className='cursor-pointer hover:text-primary pl-2'>{chapter.title}</p>
                        </div>
                        <Button size='icon' variant='outline'>
                          <Trash2 className='size-4' />
                        </Button>
                      </div>

                      <CollapsibleContent>
                        <div className='p-1'>
                          <SortableContext
                            items={chapter.lessons.map((lesson) => lesson.id)}
                            strategy={verticalListSortingStrategy}>
                            {chapter.lessons.map((lesson) => (
                              <SortableItem
                                key={lesson.id}
                                id={lesson.id}
                                data={{ type: "lesson", chapterId: chapter.id }}>
                                {(lessonListeners) => (
                                  <div className='flex items-center justify-between p-2 hover:bg-accent rounded-sm'>
                                    <div className='flex items-center gap-2'>
                                      <Button variant='ghost' size='icon' {...lessonListeners}>
                                        <GripVerticalIcon className='size-4' />
                                      </Button>
                                      <FileTextIcon className='size-4' />

                                      <Link href={`/admin/courses/${course.id}/${chapter.id}/${lesson.id}`}>
                                        {lesson.title}
                                      </Link>
                                    </div>

                                    <Button variant='outline' size='icon'>
                                      <Trash2 className='size-4' />
                                    </Button>
                                  </div>
                                )}
                              </SortableItem>
                            ))}
                          </SortableContext>
                          <div className='p-2'>
                            <Button variant='outline' className='w-full'>
                              Create New Lesson
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )}
              </SortableItem>
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </DndContext>
  );
};

export default CourseStructure;
