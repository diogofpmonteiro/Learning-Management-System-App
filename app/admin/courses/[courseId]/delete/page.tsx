"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tryCatch } from "@/hooks/try-catch";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteCourse } from "./actions";
import { useParams, useRouter } from "next/navigation";

export default function DeleteCoursePage() {
  const [isPending, startTransition] = useTransition();
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const onSubmit = () => {
    startTransition(async () => {
      const { result, error } = await tryCatch(deleteCourse(courseId));

      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result.status === "success") {
        toast.success(result.message);
        router.push("/admin/courses");
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className='max-w-xl mx-auto w-full'>
      <Card className='mt-[50%]'>
        <CardHeader>
          <CardTitle>Are you sure you want to delete this course?</CardTitle>
          <CardDescription>This action cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent className='space-x-4'>
          <Link
            href={`/admin/courses`}
            className={buttonVariants({
              variant: "outline",
            })}>
            Cancel
          </Link>
          <Button variant='destructive' onClick={onSubmit} disabled={isPending}>
            {isPending ? "Deleting.." : "Delete"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
