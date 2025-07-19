import "server-only";
import { prisma } from "@/lib/db";

export async function getAllCourses() {
  const data = await prisma.course.findMany({
    where: {
      status: "Published",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      // description: true,
      smallDescription: true,
      category: true,
      duration: true,
      level: true,
      // status: true,
      price: true,
      fileKey: true,
      slug: true,
      // chapters: {
      //   select: {
      //     id: true,
      //     title: true,
      //     position: true,
      //     lessons: {
      //       select: {
      //         id: true,
      //         title: true,
      //         description: true,
      //         thumbnailKey: true,
      //         videoKey: true,
      //         position: true,
      //       },
      //     },
      //   },
      // },
    },
  });

  return data;
}

export type PublicCourseType = Awaited<ReturnType<typeof getAllCourses>>[0];
