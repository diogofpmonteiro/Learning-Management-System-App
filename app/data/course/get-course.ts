import "server-only";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getCourseBySlug(slug: string) {
  const data = await prisma.course.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      title: true,
      description: true,
      smallDescription: true,
      category: true,
      duration: true,
      level: true,
      // status: true,
      price: true,
      fileKey: true,
      slug: true,
      //   position: true,
      chapters: {
        select: {
          id: true,
          title: true,
          //   position: true,
          lessons: {
            select: {
              id: true,
              title: true,
              //   description: true,
              //   thumbnailKey: true,
              //   videoKey: true,
              //   position: true,
            },
            orderBy: { position: "asc" },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!data) {
    return notFound();
  }

  return data;
}

export type PublicCourseType = Awaited<ReturnType<typeof getCourseBySlug>>;
