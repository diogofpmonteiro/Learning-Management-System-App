"use client";

import { sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DndContext,
  DragCancelEvent,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";

const CourseStructure = () => {
  const [items, setItems] = useState(["1", "2", "3"]);

  function SortableItem(props: { id: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {/* ... */}
      </div>
    );
  }

  const handleDragEnd = (event: DragCancelEvent) => {};

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  return (
    <div>
      <DndContext collisionDetection={rectIntersection} onDragCancel={handleDragEnd} sensors={sensors}>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between border-bottom border-border'>
            <CardTitle>Chapters</CardTitle>
          </CardHeader>

          <CardContent>
            <SortableContext strategy={verticalListSortingStrategy} items={items}>
              <SortableItem {...{ id: "1" }} />
            </SortableContext>
          </CardContent>
        </Card>
      </DndContext>
    </div>
  );
};

export default CourseStructure;
