"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function toggleBookmark(itemId: string) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { error: "Ruxsat etilmagan" };
  }

  const userId = session.userId as string;

  try {
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return { success: true, bookmarked: false };
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          itemId,
        },
      });
      return { success: true, bookmarked: true };
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return { error: "Xatolik yuz berdi" };
  }
}
