"use client";

import { arrayMove, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DndContext,
  DraggableSyntheticListeners,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ReactNode, useState } from "react";
import { AdminCourseSingularType } from "@/app/data/admin/admin-get-course";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, FileTextIcon, GripVerticalIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setChapters((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
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

        <CardContent>
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
