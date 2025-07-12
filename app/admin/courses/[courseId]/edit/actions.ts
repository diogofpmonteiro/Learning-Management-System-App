"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchema";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    })
  );

export async function EditCourse(data: CourseSchemaType, courseId: string): Promise<ApiResponse> {
  const session = await requireAdmin();

  try {
    // const req = await request();
    // const decision = await aj.protect(req, { fingerprint: session.user.id });

    // if (decision.isDenied()) {
    //   if (decision.reason.isRateLimit()) {
    //     return { message: "You've been block due to rate limiting", status: "error" };
    //   } else {
    //     return { message: "Decision denied", status: "error" };
    //   }
    // }

    const result = courseSchema.safeParse(data);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    await prisma.course.update({
      where: { id: courseId, userId: session.user.id },
      data: { ...result.data },
    });

    return {
      status: "success",
      message: "Course edited successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to edit course",
    };
  }
}
