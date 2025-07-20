"use client";

import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";
import { useTransition } from "react";
import { enrollInCourse } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const EnrollmentButton = ({ courseId }: { courseId: string }) => {
  const [isPending, startTransition] = useTransition();

  const onSubmit = async () => {
    startTransition(async () => {
      const { result, error } = await tryCatch(enrollInCourse(courseId));

      if (error) {
        toast.error("Unexpected error occurred, please try again.");
      }

      if (result?.status === "success") {
        toast.success(result.message);
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  };

  return (
    <Button className='w-full' onClick={onSubmit} disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className='size-4 animate-spin' />
          Loading...
        </>
      ) : (
        "Enroll Now!"
      )}
    </Button>
  );
};

export default EnrollmentButton;
